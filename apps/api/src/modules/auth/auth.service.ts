import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { config } from '../../config';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessExp: number;
  refreshExp: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth');

  constructor(private readonly prisma: PrismaService) {}

  async register(input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    region?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictException('email_in_use');

    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName || null,
        lastName: input.lastName || null,
        phone: input.phone || null,
        defaultRegion: input.region ?? 'GB',
        defaultCurrency: regionToCurrency(input.region ?? 'GB'),
      },
    });

    return this.buildAuthPayload(user.id);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('invalid_credentials');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('invalid_credentials');
    if (user.status !== 'active') throw new UnauthorizedException('account_not_active');
    return this.buildAuthPayload(user.id);
  }

  async refresh(rawRefresh: string, meta: { userAgent?: string; ip?: string }) {
    const hash = sha256(rawRefresh);
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash } });

    if (!row || row.revokedAt || row.expiresAt < new Date()) {
      // Reuse detection: invalidate whole family if token was already rotated.
      if (row?.familyId) {
        await this.prisma.refreshToken.updateMany({
          where: { familyId: row.familyId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('refresh_invalid');
    }

    // Rotate
    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.buildAuthPayload(row.userId, {
      familyId: row.familyId,
      userAgent: meta.userAgent,
      ip: meta.ip,
    });

    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { replacedBy: tokens.refreshMeta.id },
    });

    return tokens;
  }

  async logout(rawRefresh?: string) {
    if (!rawRefresh) return;
    const hash = sha256(rawRefresh);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async buildAuthPayload(
    userId: string,
    opts?: { familyId?: string; userAgent?: string; ip?: string },
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        staffRole: true,
        memberships: { include: { business: true }, take: 1 },
      },
    });

    const membership = user.memberships[0];
    const claims: AuthUser = {
      sub: user.id,
      email: user.email,
      staffRole: user.staffRole?.role,
      region: user.defaultRegion,
      currency: user.defaultCurrency,
      businessId: membership?.businessId,
      businessRole: membership?.role,
    };

    const now = Math.floor(Date.now() / 1000);
    const accessExp = now + config.jwt.accessTtlSec;
    const refreshExp = now + config.jwt.refreshTtlSec;

    const accessToken = jwt.sign(claims, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessTtlSec,
    });
    const rawRefresh = crypto.randomBytes(48).toString('base64url');
    const familyId = opts?.familyId ?? crypto.randomUUID();

    const inserted = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(rawRefresh),
        familyId,
        expiresAt: new Date(refreshExp * 1000),
        userAgent: opts?.userAgent,
        ip: opts?.ip,
      },
    });

    const tokens: IssuedTokens = {
      accessToken,
      refreshToken: rawRefresh,
      accessExp,
      refreshExp,
    };
    return { ...tokens, user: claims, refreshMeta: { id: inserted.id } };
  }
}

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function regionToCurrency(region: string): string {
  switch (region) {
    case 'GB': return 'GBP';
    case 'IN': return 'INR';
    case 'AE': return 'AED';
    case 'SA': return 'SAR';
    case 'US': return 'USD';
    case 'EU': return 'EUR';
    default:   return 'USD';
  }
}
