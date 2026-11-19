import {
  Body, ConflictException, Controller, Delete, Get, Header, Module, NotFoundException, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { MailService, detailsTable, emailLayout, escapeHtml } from '../mail/mail.service';
import { StaffGuard, money } from './staff.guard';
import { AdminCatalogController } from './admin-catalog.controller';

const ORDER_STATUSES = ['pending_payment', 'paid', 'processing', 'partially_shipped', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold'] as const;
const ENQUIRY_TYPES = ['b2b_application', 'quote_request', 'private_label', 'contact'] as const;
const ENQUIRY_STATUSES = ['new', 'in_review', 'contacted', 'approved', 'rejected', 'closed'] as const;

const ENQUIRY_LABEL: Record<(typeof ENQUIRY_TYPES)[number], string> = {
  b2b_application: 'B2B account application', quote_request: 'quote request', private_label: 'private label enquiry', contact: 'message',
};
const STATUS_COPY: Partial<Record<(typeof ENQUIRY_STATUSES)[number], string>> = {
  in_review: 'is now being reviewed by our team.',
  contacted: 'has been picked up. A member of our team has been in touch or will be shortly.',
  approved: 'has been approved. We will be in touch shortly with the next steps.',
  rejected: 'could not be approved this time. Reply to this email if you would like to discuss it.',
  closed: 'has been closed. Thank you for getting in touch.',
};

const CouponDto = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/),
  description: z.string().trim().max(200).nullable().optional(),
  percentOff: z.coerce.number().int().min(1).max(100),
  minSubtotal: z.coerce.number().min(0).nullable().optional(),
  maxRedemptions: z.coerce.number().int().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; // block formula injection in Excel
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

@Controller('admin')
@UseGuards(JwtGuard, StaffGuard)
export class AdminOpsController {
  constructor(private readonly prisma: PrismaService, private readonly mail: MailService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const u = await this.prisma.user.findUnique({ where: { id: user.sub }, select: { id: true, email: true, firstName: true, lastName: true } });
    return { ...u, staffRole: user.staffRole };
  }

  // ── Dashboard ──────────────────────────────────────────────────────
  @Get('dashboard')
  async dashboard() {
    const since = new Date(Date.now() - 30 * 86400_000);
    const paidStatuses = ['paid', 'partially_refunded'] as const;
    const [products, packs, orders, orders30, revenue, revenue30, customers, subscribers, enquiriesNew, recentOrders, recentEnquiries] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.productVariant.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { placedAt: { gte: since } } }),
      this.prisma.order.aggregate({ _sum: { grandTotal: true }, where: { paymentStatus: { in: [...paidStatuses] } } }),
      this.prisma.order.aggregate({ _sum: { grandTotal: true }, where: { paymentStatus: { in: [...paidStatuses] }, placedAt: { gte: since } } }),
      this.prisma.user.count({ where: { staffRole: null, deletedAt: null } }),
      this.prisma.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
      this.prisma.enquiry.groupBy({ by: ['type'], where: { status: 'new' }, _count: true }),
      this.prisma.order.findMany({ take: 6, orderBy: { placedAt: 'desc' }, include: { user: { select: { email: true, firstName: true, lastName: true } } } }),
      this.prisma.enquiry.findMany({ take: 6, orderBy: { createdAt: 'desc' }, select: { id: true, reference: true, type: true, status: true, name: true, company: true, createdAt: true } }),
    ]);
    return {
      products, packs, orders, orders30, customers, subscribers,
      revenue: money(revenue._sum.grandTotal) ?? 0,
      revenue30: money(revenue30._sum.grandTotal) ?? 0,
      newEnquiries: Object.fromEntries(enquiriesNew.map((e) => [e.type, e._count])),
      recentOrders: recentOrders.map((o) => ({
        id: o.id, orderNumber: o.orderNumber, status: o.status, paymentStatus: o.paymentStatus, currency: o.currency,
        grandTotal: money(o.grandTotal), placedAt: o.placedAt,
        customer: o.user ? [o.user.firstName, o.user.lastName].filter(Boolean).join(' ') || o.user.email : null,
      })),
      recentEnquiries,
    };
  }

  // ── Orders ─────────────────────────────────────────────────────────
  @Get('orders')
  async listOrders(@Query() query: unknown) {
    const q = z.object({ status: z.enum(ORDER_STATUSES).optional(), q: z.string().trim().optional() }).parse(query);
    const orders = await this.prisma.order.findMany({
      where: {
        ...(q.status ? { status: q.status } : {}),
        ...(q.q ? { OR: [{ orderNumber: { contains: q.q, mode: 'insensitive' } }, { user: { email: { contains: q.q, mode: 'insensitive' } } }] } : {}),
      },
      orderBy: { placedAt: 'desc' },
      take: 200,
      include: { user: { select: { email: true, firstName: true, lastName: true } }, _count: { select: { items: true } } },
    });
    return {
      data: orders.map((o) => ({
        id: o.id, orderNumber: o.orderNumber, channel: o.channel, status: o.status, paymentStatus: o.paymentStatus,
        currency: o.currency, grandTotal: money(o.grandTotal), placedAt: o.placedAt, items: o._count.items,
        customer: o.user ? { email: o.user.email, name: [o.user.firstName, o.user.lastName].filter(Boolean).join(' ') || null } : null,
      })),
    };
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    const o = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, phone: true } },
        items: true, shippingAddress: true, billingAddress: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!o) throw new NotFoundException('order_not_found');
    return {
      ...o,
      subtotal: money(o.subtotal), discountTotal: money(o.discountTotal), taxTotal: money(o.taxTotal),
      shippingTotal: money(o.shippingTotal), grandTotal: money(o.grandTotal),
      items: o.items.map((i) => ({ ...i, unitPrice: money(i.unitPrice), lineTotal: money(i.lineTotal), discountAmount: money(i.discountAmount), taxAmount: money(i.taxAmount) })),
      statusHistory: o.statusHistory.map((h) => ({ ...h, id: h.id.toString() })),
    };
  }

  @Patch('orders/:id')
  async updateOrder(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: AuthUser) {
    const dto = z.object({ status: z.enum(ORDER_STATUSES), reason: z.string().trim().max(500).optional() }).parse(body);
    const o = await this.prisma.order.findUnique({ where: { id } });
    if (!o) throw new NotFoundException('order_not_found');
    if (o.status !== dto.status) {
      await this.prisma.$transaction([
        this.prisma.order.update({ where: { id }, data: { status: dto.status } }),
        this.prisma.orderStatusHistory.create({ data: { orderId: id, fromStatus: o.status, toStatus: dto.status, actorId: user.sub, reason: dto.reason } }),
      ]);
    }
    return this.getOrder(id);
  }

  // ── Customers (never return password hashes) ───────────────────────
  @Get('customers')
  async listCustomers(@Query() query: unknown) {
    const q = z.object({ q: z.string().trim().optional() }).parse(query);
    const users = await this.prisma.user.findMany({
      where: {
        staffRole: null, deletedAt: null,
        ...(q.q ? { OR: [{ email: { contains: q.q, mode: 'insensitive' } }, { firstName: { contains: q.q, mode: 'insensitive' } }, { lastName: { contains: q.q, mode: 'insensitive' } }] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true, status: true, createdAt: true, defaultRegion: true,
        orders: { select: { grandTotal: true, paymentStatus: true } },
        memberships: { select: { business: { select: { legalName: true } } }, take: 1 },
      },
    });
    return {
      data: users.map(({ orders, memberships, ...u }) => ({
        ...u,
        orders: orders.length,
        totalSpent: orders.filter((o) => o.paymentStatus === 'paid').reduce((n, o) => n + Number(o.grandTotal), 0),
        business: memberships[0]?.business.legalName ?? null,
      })),
    };
  }

  // ── Coupons ────────────────────────────────────────────────────────
  @Get('coupons')
  async listCoupons() {
    const list = await this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return { data: list.map((c) => ({ ...c, minSubtotal: money(c.minSubtotal) })) };
  }

  @Post('coupons')
  async createCoupon(@Body() body: unknown) {
    const dto = CouponDto.parse(body);
    if (await this.prisma.coupon.findUnique({ where: { code: dto.code } })) throw new ConflictException('coupon_exists');
    const c = await this.prisma.coupon.create({
      data: { ...dto, minSubtotal: dto.minSubtotal == null ? null : new Prisma.Decimal(dto.minSubtotal) },
    });
    return { ...c, minSubtotal: money(c.minSubtotal) };
  }

  @Patch('coupons/:id')
  async updateCoupon(@Param('id') id: string, @Body() body: unknown) {
    const dto = CouponDto.partial().parse(body);
    const c = await this.prisma.coupon.update({
      where: { id },
      data: { ...dto, minSubtotal: dto.minSubtotal === undefined ? undefined : dto.minSubtotal === null ? null : new Prisma.Decimal(dto.minSubtotal) },
    });
    return { ...c, minSubtotal: money(c.minSubtotal) };
  }

  @Delete('coupons/:id')
  async deleteCoupon(@Param('id') id: string) {
    await this.prisma.coupon.delete({ where: { id } });
    return { ok: true };
  }

  // ── Enquiries inbox ────────────────────────────────────────────────
  @Get('enquiries')
  async listEnquiries(@Query() query: unknown) {
    const q = z.object({ type: z.enum(ENQUIRY_TYPES).optional(), status: z.enum(ENQUIRY_STATUSES).optional(), q: z.string().trim().optional() }).parse(query);
    const where: Prisma.EnquiryWhereInput = {
      ...(q.type ? { type: q.type } : {}),
      ...(q.status ? { status: q.status } : {}),
      ...(q.q ? { OR: [{ name: { contains: q.q, mode: 'insensitive' } }, { email: { contains: q.q, mode: 'insensitive' } }, { company: { contains: q.q, mode: 'insensitive' } }, { reference: { contains: q.q, mode: 'insensitive' } }] } : {}),
    };
    const [data, counts] = await Promise.all([
      this.prisma.enquiry.findMany({ where, orderBy: { createdAt: 'desc' }, take: 300 }),
      this.prisma.enquiry.groupBy({ by: ['type', 'status'], _count: true }),
    ]);
    return { data, counts: counts.map((c) => ({ type: c.type, status: c.status, count: c._count })) };
  }

  @Patch('enquiries/:id')
  async updateEnquiry(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: AuthUser) {
    const dto = z.object({
      status: z.enum(ENQUIRY_STATUSES).optional(),
      adminNotes: z.string().max(5000).nullable().optional(),
      notifyCustomer: z.boolean().optional(),
    }).parse(body);
    const e = await this.prisma.enquiry.findUnique({ where: { id } });
    if (!e) throw new NotFoundException('enquiry_not_found');
    const updated = await this.prisma.enquiry.update({
      where: { id },
      data: { status: dto.status, adminNotes: dto.adminNotes, handledById: user.sub },
    });
    const copy = dto.status && STATUS_COPY[dto.status];
    if (dto.notifyCustomer && dto.status && dto.status !== e.status && copy) {
      await this.mail.send({
        to: e.email,
        subject: `Update on your ${ENQUIRY_LABEL[e.type]} (${e.reference}) — GNS Spices`,
        html: emailLayout(
          `Hello ${e.name.split(' ')[0]}`,
          `<p style="font-size:14px;line-height:1.6">Your ${escapeHtml(ENQUIRY_LABEL[e.type])} <b>${escapeHtml(e.reference)}</b> ${escapeHtml(copy)}</p>` +
            detailsTable([['Company', e.company], ['Submitted', e.createdAt.toDateString()]]),
        ),
      });
    }
    return updated;
  }

  // ── Newsletter ─────────────────────────────────────────────────────
  @Get('newsletter')
  async listSubscribers() {
    return { data: await this.prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } }) };
  }

  @Get('newsletter.csv')
  @Header('content-type', 'text/csv; charset=utf-8')
  @Header('content-disposition', 'attachment; filename="gns-newsletter-subscribers.csv"')
  async exportSubscribers() {
    const subs = await this.prisma.newsletterSubscriber.findMany({ where: { unsubscribedAt: null }, orderBy: { createdAt: 'asc' } });
    return ['email,source,subscribed_at', ...subs.map((s) => [s.email, s.source, s.createdAt.toISOString()].map(csvCell).join(','))].join('\n');
  }

  @Delete('newsletter/:id')
  async unsubscribe(@Param('id') id: string) {
    await this.prisma.newsletterSubscriber.update({ where: { id }, data: { unsubscribedAt: new Date() } });
    return { ok: true };
  }
}

@Module({ controllers: [AdminCatalogController, AdminOpsController], providers: [StaffGuard] })
export class AdminModule {}
