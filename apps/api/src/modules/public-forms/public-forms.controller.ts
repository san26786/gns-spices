import { Body, Controller, HttpCode, HttpException, Module, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { randomInt } from 'crypto';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService, detailsTable, emailLayout, escapeHtml } from '../mail/mail.service';
import { Public } from '../../common/decorators/public.decorator';

// ── tiny in-memory rate limiter (per IP + route) ────────────────────────
const hits = new Map<string, number[]>();
function rateLimit(req: Request, key: string, max = 8, windowMs = 10 * 60_000) {
  const id = `${key}:${req.ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) throw new HttpException('too_many_requests', 429);
  recent.push(now);
  hits.set(id, recent);
}

const str = (max: number) => z.string().trim().max(max);
const optStr = (max: number) => str(max).optional().transform((v) => (v ? v : undefined));

const EnquiryDto = z.object({
  type: z.enum(['b2b_application', 'quote_request', 'private_label', 'contact']),
  name: str(120).min(2),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: optStr(32),
  company: optStr(160),
  country: optStr(80),
  city: optStr(80),
  message: optStr(4000),
  details: z
    .object({
      businessType: optStr(60),
      brandName: optStr(120),
      productType: optStr(120),
      quantity: optStr(60),
      topic: optStr(80),
      products: optStr(1000),
    })
    .partial()
    .default({}),
  /** Honeypot: real people never fill this in. */
  website: z.string().optional(),
});

const TYPE_META = {
  b2b_application: { prefix: 'B2B', label: 'B2B account application', reply: 'Our trade team reviews applications within 1–2 business days.' },
  quote_request: { prefix: 'QT', label: 'Quote request', reply: 'We usually send quotes within one business day.' },
  private_label: { prefix: 'PL', label: 'Private label enquiry', reply: 'A project manager will be in touch within 48 hours.' },
  contact: { prefix: 'CT', label: 'Contact message', reply: 'We reply to every message within one business day.' },
} as const;

const DETAIL_LABELS: Record<string, string> = {
  businessType: 'Business type', brandName: 'Brand name', productType: 'Product type',
  quantity: 'Estimated quantity', topic: 'Topic', products: 'Products',
};

@Controller()
export class PublicFormsController {
  constructor(private readonly prisma: PrismaService, private readonly mail: MailService) {}

  @Public()
  @Post('enquiries')
  @HttpCode(201)
  async createEnquiry(@Body() body: unknown, @Req() req: Request) {
    const dto = EnquiryDto.parse(body);
    if (dto.website) return { ok: true, reference: 'RECEIVED' }; // silently drop bots
    rateLimit(req, 'enquiry');

    const meta = TYPE_META[dto.type];
    const d = new Date();
    const reference = `${meta.prefix}-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${randomInt(1000, 9999)}`;
    const details = Object.fromEntries(Object.entries(dto.details).filter(([, v]) => v));

    const enquiry = await this.prisma.enquiry.create({
      data: {
        reference, type: dto.type, name: dto.name, email: dto.email, phone: dto.phone,
        company: dto.company, country: dto.country, city: dto.city, message: dto.message,
        details: details as Prisma.InputJsonValue,
      },
    });

    const rows: Array<[string, unknown]> = [
      ['Reference', reference], ['Name', dto.name], ['Email', dto.email], ['Phone', dto.phone],
      ['Company', dto.company], ['City', dto.city], ['Country', dto.country],
      ...Object.entries(details).map(([k, v]) => [DETAIL_LABELS[k] ?? k, v] as [string, unknown]),
      ['Message', dto.message],
    ];

    if (this.mail.adminAddress) {
      await this.mail.send({
        to: this.mail.adminAddress,
        replyTo: dto.email,
        subject: `New ${meta.label.toLowerCase()} — ${dto.company ?? dto.name} (${reference})`,
        html: emailLayout(`New ${meta.label.toLowerCase()}`, detailsTable(rows)),
      });
    }
    await this.mail.send({
      to: dto.email,
      subject: `We've received your ${meta.label.toLowerCase()} — GNS Spices`,
      html: emailLayout(
        `Thank you, ${dto.name.split(' ')[0]}`,
        `<p style="font-size:14px;line-height:1.6">We've received your ${escapeHtml(meta.label.toLowerCase())}. ${escapeHtml(meta.reply)}</p>
         <p style="font-size:14px">Your reference is <b>${escapeHtml(reference)}</b>.</p>${detailsTable(rows.slice(1))}`,
      ),
    });

    return { ok: true, reference: enquiry.reference };
  }

  @Public()
  @Post('newsletter')
  @HttpCode(201)
  async subscribe(@Body() body: unknown, @Req() req: Request) {
    const dto = z.object({ email: z.string().trim().toLowerCase().email().max(200), source: optStr(40), website: z.string().optional() }).parse(body);
    if (dto.website) return { ok: true };
    rateLimit(req, 'newsletter', 5);
    await this.prisma.newsletterSubscriber.upsert({
      where: { email: dto.email },
      create: { email: dto.email, source: dto.source ?? 'website' },
      update: { unsubscribedAt: null },
    });
    return { ok: true };
  }

  /** Checks a coupon against a basket subtotal. The real discount is recalculated at checkout. */
  @Public()
  @Post('coupons/validate')
  @HttpCode(200)
  async validateCoupon(@Body() body: unknown, @Req() req: Request) {
    const dto = z.object({ code: z.string().trim().toUpperCase().min(1).max(40), subtotal: z.coerce.number().min(0).optional() }).parse(body);
    rateLimit(req, 'coupon', 20);
    const c = await this.prisma.coupon.findUnique({ where: { code: dto.code } });
    const now = new Date();
    const invalid = (reason: string) => ({ valid: false, reason });
    if (!c || !c.isActive) return invalid('This code is not valid.');
    if (c.startsAt && c.startsAt > now) return invalid('This code is not active yet.');
    if (c.expiresAt && c.expiresAt < now) return invalid('This code has expired.');
    if (c.maxRedemptions !== null && c.redemptions >= c.maxRedemptions) return invalid('This code has been fully used.');
    if (c.minSubtotal && dto.subtotal !== undefined && dto.subtotal < Number(c.minSubtotal))
      return invalid(`Spend at least £${Number(c.minSubtotal).toFixed(2)} to use this code.`);
    return { valid: true, code: c.code, percentOff: c.percentOff, description: c.description };
  }
}

@Module({ controllers: [PublicFormsController] })
export class PublicFormsModule {}
