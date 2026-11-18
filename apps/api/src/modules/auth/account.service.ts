import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import type { EmailTokenPurpose } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService, emailLayout, escapeHtml } from '../mail/mail.service';
import { config } from '../../config';

const TTL_MS: Record<EmailTokenPurpose, number> = {
  verify_email: 24 * 60 * 60 * 1000,
  reset_password: 60 * 60 * 1000,
};

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export const PASSWORD_RULE = { min: 8, message: 'Password must be at least 8 characters and include a letter and a number.' };
export function passwordOk(pw: string) {
  return pw.length >= PASSWORD_RULE.min && pw.length <= 128 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
}

const DISPOSABLE = new Set([
  'mailinator.com', '10minutemail.com', 'tempmail.com', 'trashmail.com', 'guerrillamail.com', 'yopmail.com',
  'throwawaymail.com', 'getnada.com', 'sharklasers.com', 'maildrop.cc', 'temp-mail.org', 'dispostable.com', 'fakeinbox.com',
]);
export const isDisposable = (email: string) => DISPOSABLE.has(email.split('@')[1]?.toLowerCase() ?? '');

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService, private readonly mail: MailService) {}

  private async issue(userId: string, purpose: EmailTokenPurpose) {
    const plain = crypto.randomBytes(32).toString('base64url');
    await this.prisma.emailToken.deleteMany({ where: { userId, purpose, usedAt: null } });
    await this.prisma.emailToken.create({
      data: { userId, purpose, tokenHash: sha256(plain), expiresAt: new Date(Date.now() + TTL_MS[purpose]) },
    });
    return plain;
  }

  private async consume(plain: string, purpose: EmailTokenPurpose) {
    const row = await this.prisma.emailToken.findUnique({ where: { tokenHash: sha256(plain) } });
    if (!row || row.purpose !== purpose) throw new BadRequestException('token_invalid');
    if (row.usedAt) throw new BadRequestException('token_used');
    if (row.expiresAt < new Date()) throw new BadRequestException('token_expired');
    await this.prisma.emailToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    return row.userId;
  }

  async sendVerification(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.emailVerifiedAt) return { alreadyVerified: true };
    const token = await this.issue(userId, 'verify_email');
    const link = `${config.siteUrl}/verify-email?token=${encodeURIComponent(token)}`;
    await this.mail.send({
      to: user.email,
      subject: 'Confirm your email — GNS Spices',
      html: emailLayout(
        `Welcome${user.firstName ? `, ${user.firstName}` : ''}`,
        `<p style="font-size:14px;line-height:1.6">Please confirm your email address to finish setting up your GNS Spices account.</p>
         <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#F59E0B;color:#451A03;font-weight:bold;padding:12px 20px;border-radius:8px;text-decoration:none">Confirm email</a></p>
         <p style="font-size:12px;color:#7A5A4E">This link works for 24 hours. If you didn't create an account, ignore this email.</p>`,
      ),
    });
    return { sent: true };
  }

  async verifyEmail(token: string) {
    const userId = await this.consume(token, 'verify_email');
    await this.prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
    return { ok: true };
  }

  /** Always succeeds, so the form can't be used to find out who has an account. */
  /** `scope: 'admin'` (admin login page) only emails staff accounts, and links to the admin reset page. */
  async requestPasswordReset(email: string, scope?: 'admin') {
    const user = await this.prisma.user.findUnique({ where: { email }, include: { staffRole: true } });
    if (!user || user.deletedAt || user.status !== 'active') return { ok: true };
    if (scope === 'admin' && !user.staffRole) return { ok: true };
    const token = await this.issue(user.id, 'reset_password');
    const path = scope === 'admin' ? '/admin/reset-password' : '/reset-password';
    const link = `${config.siteUrl}${path}?token=${encodeURIComponent(token)}`;
    await this.mail.send({
      to: user.email,
      subject: scope === 'admin' ? 'Reset your GNS Spices admin password' : 'Reset your GNS Spices password',
      html: emailLayout(
        'Reset your password',
        `<p style="font-size:14px;line-height:1.6">We received a request to reset the password for this email address.</p>
         <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#F59E0B;color:#451A03;font-weight:bold;padding:12px 20px;border-radius:8px;text-decoration:none">Choose a new password</a></p>
         <p style="font-size:12px;color:#7A5A4E">This link works for 1 hour and can be used once. If you didn't ask for it, you can ignore this email.</p>`,
      ),
    });
    return { ok: true };
  }

  async resetPassword(token: string, password: string) {
    if (!passwordOk(password)) throw new BadRequestException('weak_password');
    const userId = await this.consume(token, 'reset_password');
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        // Clicking the emailed link also proves the address belongs to them.
        data: { passwordHash: await argon2.hash(password, { type: argon2.argon2id }), emailVerifiedAt: new Date() },
      }),
      // Sign out every other session.
      this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return { ok: true };
  }

  async profile(userId: string) {
    const u = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true, emailVerifiedAt: true, defaultRegion: true, createdAt: true,
        staffRole: { select: { role: true } },
        addresses: { where: { isDefaultShip: true }, take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    const { staffRole, addresses, ...rest } = u;
    return { ...rest, emailVerified: !!u.emailVerifiedAt, staffRole: staffRole?.role ?? null, defaultShipping: addresses[0] ?? null };
  }

  async updateProfile(userId: string, data: { firstName?: string | null; lastName?: string | null; phone?: string | null }) {
    await this.prisma.user.update({ where: { id: userId }, data });
    return this.profile(userId);
  }

  async changePassword(userId: string, current: string, next: string) {
    if (!passwordOk(next)) throw new BadRequestException('weak_password');
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.passwordHash || !(await argon2.verify(user.passwordHash, current))) throw new BadRequestException('current_password_wrong');
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await argon2.hash(next, { type: argon2.argon2id }) } });
    return { ok: true };
  }
}
