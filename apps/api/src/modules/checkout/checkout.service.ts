import {
  BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomInt } from 'crypto';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { MailService, detailsTable, emailLayout, escapeHtml } from '../mail/mail.service';
import { config } from '../../config';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

const D = (n: Prisma.Decimal.Value) => new Prisma.Decimal(n);
const pence = (d: Prisma.Decimal) => d.mul(100).toDecimalPlaces(0).toNumber();
const MAIN_WAREHOUSE = 'GB-LON-01';

export interface AddressInput {
  contactName: string; phone?: string | null; line1: string; line2?: string | null;
  city: string; state?: string | null; postcode: string; country: string;
}

@Injectable()
export class CheckoutService {
  private readonly log = new Logger('Checkout');
  private readonly stripe = config.stripe.secretKey ? new Stripe(config.stripe.secretKey) : null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly mail: MailService,
  ) {}

  get enabled() {
    return !!this.stripe;
  }

  private stripeOrThrow() {
    if (!this.stripe) throw new ServiceUnavailableException('payments_not_configured');
    return this.stripe;
  }

  private async ctx(user: AuthUser) {
    if (!user.businessId) return { region: user.region, tier: 'retail' as const };
    const biz = await this.prisma.businessProfile.findUnique({ where: { id: user.businessId } });
    return { region: user.region, businessId: user.businessId, tier: (biz?.tier ?? 'retail') as 'retail' | 'wholesale' | 'distributor' | 'custom' };
  }

  private async findCart(user: AuthUser) {
    return this.prisma.cart.findFirst({
      where: user.businessId ? { businessId: user.businessId } : { userId: user.sub },
      include: { items: { include: { variant: { include: { product: true } } }, orderBy: { addedAt: 'asc' } } },
    });
  }

  private async checkCoupon(code: string | undefined, subtotal: Prisma.Decimal) {
    if (!code) return { coupon: null, error: null };
    const c = await this.prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
    const now = new Date();
    let error: string | null = null;
    if (!c || !c.isActive) error = 'This code is not valid.';
    else if (c.startsAt && c.startsAt > now) error = 'This code is not active yet.';
    else if (c.expiresAt && c.expiresAt < now) error = 'This code has expired.';
    else if (c.maxRedemptions !== null && c.redemptions >= c.maxRedemptions) error = 'This code has been fully used.';
    else if (c.minSubtotal && subtotal.lt(c.minSubtotal)) error = `Spend at least £${Number(c.minSubtotal).toFixed(2)} to use this code.`;
    return { coupon: error ? null : c, error };
  }

  /** The single source of truth for what the customer pays. Used for display and for charging. */
  async quote(user: AuthUser, couponCode?: string) {
    const cart = await this.findCart(user);
    if (!cart || cart.items.length === 0) throw new BadRequestException('cart_empty');
    const resolved = await this.pricing.resolveMany(cart.items.map((i) => ({ variantId: i.variantId, qty: i.qty })), await this.ctx(user));

    const lines = cart.items.map((ci, idx) => {
      const unit = resolved[idx]!.unitPrice.toDecimalPlaces(2);
      return {
        variantId: ci.variantId, sku: ci.variant.sku, name: ci.variant.product.name, label: ci.variant.label,
        weightGrams: ci.variant.weightGrams, slug: ci.variant.product.slug, qty: ci.qty,
        unitPrice: unit, lineTotal: unit.mul(ci.qty),
      };
    });
    const subtotal = lines.reduce((s, l) => s.plus(l.lineTotal), D(0));
    const { coupon, error: couponError } = await this.checkCoupon(couponCode, subtotal);
    const discount = coupon ? subtotal.mul(coupon.percentOff).div(100).toDecimalPlaces(2) : D(0);
    const afterDiscount = subtotal.minus(discount);
    const shipping = afterDiscount.gte(config.shipping.freeOver) ? D(0) : D(config.shipping.flat);
    const total = afterDiscount.plus(shipping);

    return {
      cartId: cart.id, currency: cart.currency, lines, subtotal, discount, shipping, total,
      coupon: coupon ? { id: coupon.id, code: coupon.code, percentOff: coupon.percentOff } : null,
      couponError,
    };
  }

  serializeQuote(q: Awaited<ReturnType<CheckoutService['quote']>>) {
    return {
      currency: q.currency,
      lines: q.lines.map((l) => ({ ...l, unitPrice: l.unitPrice.toNumber(), lineTotal: l.lineTotal.toNumber() })),
      subtotal: q.subtotal.toNumber(), discount: q.discount.toNumber(), shipping: q.shipping.toNumber(), total: q.total.toNumber(),
      coupon: q.coupon ? { code: q.coupon.code, percentOff: q.coupon.percentOff } : null,
      couponError: q.couponError,
      freeShippingOver: config.shipping.freeOver,
      paymentsEnabled: this.enabled,
    };
  }

  async createSession(user: AuthUser, input: { shipping: AddressInput; billing?: AddressInput; couponCode?: string; notes?: string }) {
    const stripe = this.stripeOrThrow();
    const q = await this.quote(user, input.couponCode);
    if (input.couponCode && !q.coupon) throw new BadRequestException(q.couponError ?? 'coupon_invalid');

    const userRow = await this.prisma.user.findUniqueOrThrow({ where: { id: user.sub } });
    const order = await this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({ where: { ownerType: 'user', ownerId: user.sub, isDefaultShip: true }, data: { isDefaultShip: false } });
      const ship = await tx.address.create({ data: { ownerType: 'user', ownerId: user.sub, label: 'Shipping', isDefaultShip: true, ...input.shipping } });
      const bill = input.billing
        ? await tx.address.create({ data: { ownerType: 'user', ownerId: user.sub, label: 'Billing', ...input.billing } })
        : ship;
      const orderNumber = await this.nextOrderNumber(user.region, tx);
      return tx.order.create({
        data: {
          orderNumber, userId: user.sub, businessId: user.businessId ?? null,
          channel: user.businessId ? 'b2b' : 'd2c', region: user.region, currency: q.currency,
          subtotal: q.subtotal, discountTotal: q.discount, taxTotal: D(0), shippingTotal: q.shipping, grandTotal: q.total,
          status: 'pending_payment', paymentStatus: 'unpaid',
          shippingAddressId: ship.id, billingAddressId: bill.id, notes: input.notes || null,
          metadata: { couponId: q.coupon?.id ?? null, couponCode: q.coupon?.code ?? null } as Prisma.InputJsonValue,
          items: {
            create: q.lines.map((l) => ({
              variantId: l.variantId, sku: l.sku, name: l.label ? `${l.name} — ${l.label}` : l.name,
              qty: l.qty, unitPrice: l.unitPrice, lineTotal: l.lineTotal,
            })),
          },
          statusHistory: { create: { toStatus: 'pending_payment', actorId: user.sub, reason: 'checkout_started' } },
        },
      });
    });

    const currency = q.currency.toLowerCase();
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (q.discount.gt(0)) {
      const sc = await stripe.coupons.create({
        amount_off: pence(q.discount), currency, duration: 'once', max_redemptions: 1,
        name: `${q.coupon!.code} (${q.coupon!.percentOff}% off)`,
      });
      discounts = [{ coupon: sc.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userRow.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.orderNumber } },
      line_items: q.lines.map((l) => ({
        quantity: l.qty,
        price_data: { currency, unit_amount: pence(l.unitPrice), product_data: { name: l.label ? `${l.name} — ${l.label}` : l.name } },
      })),
      discounts,
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: q.shipping.gt(0) ? 'Standard delivery' : 'Free delivery',
          fixed_amount: { amount: pence(q.shipping), currency },
        },
      }],
      success_url: `${config.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.siteUrl}/checkout?cancelled=1`,
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { metadata: { couponId: q.coupon?.id ?? null, couponCode: q.coupon?.code ?? null, stripeSessionId: session.id } as Prisma.InputJsonValue },
    });
    return { url: session.url, orderId: order.id, orderNumber: order.orderNumber };
  }

  /** Success page: confirm the payment with Stripe (covers a delayed or missing webhook). */
  async confirm(user: AuthUser, sessionId: string) {
    const stripe = this.stripeOrThrow();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.client_reference_id ?? session.metadata?.orderId;
    const order = orderId ? await this.prisma.order.findFirst({ where: { id: orderId, userId: user.sub } }) : null;
    if (!order) throw new NotFoundException('order_not_found');
    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') await this.markPaid(session);
    return this.orderSummary(order.id);
  }

  async handleWebhook(rawBody: Buffer | undefined, signature: string | undefined) {
    const stripe = this.stripeOrThrow();
    if (!config.stripe.webhookSecret) throw new ServiceUnavailableException('webhook_not_configured');
    if (!rawBody || !signature) throw new BadRequestException('missing_signature');
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
    } catch {
      throw new BadRequestException('invalid_signature');
    }
    const session = event.data.object as Stripe.Checkout.Session;
    switch (event.type) {
      case 'checkout.session.completed':
        if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') await this.markPaid(session);
        break;
      case 'checkout.session.async_payment_succeeded':
        await this.markPaid(session);
        break;
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired':
        await this.markAbandoned(session, event.type === 'checkout.session.expired' ? 'checkout_expired' : 'payment_failed');
        break;
    }
    return { received: true };
  }

  /** Idempotent: safe to call from both the webhook and the success page. */
  private async markPaid(session: Stripe.Checkout.Session) {
    const orderId = session.client_reference_id ?? session.metadata?.orderId;
    if (!orderId) return;
    const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

    const won = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order) return null;
      const flipped = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: { not: 'paid' } },
        data: {
          paymentStatus: 'paid', status: 'paid',
          metadata: { ...(order.metadata as object), stripeSessionId: session.id, stripePaymentIntent: paymentIntent ?? null } as Prisma.InputJsonValue,
        },
      });
      if (flipped.count === 0) return null; // already processed

      await tx.orderStatusHistory.create({ data: { orderId, fromStatus: order.status, toStatus: 'paid', reason: 'stripe_payment' } });
      const couponId = (order.metadata as { couponId?: string | null })?.couponId;
      if (couponId) await tx.coupon.update({ where: { id: couponId }, data: { redemptions: { increment: 1 } } });

      const wh = await tx.warehouse.findUnique({ where: { code: MAIN_WAREHOUSE } });
      if (wh) {
        for (const i of order.items) {
          await tx.inventoryLevel.updateMany({ where: { warehouseId: wh.id, variantId: i.variantId }, data: { onHand: { decrement: i.qty } } });
        }
      }
      const cart = await tx.cart.findFirst({ where: order.businessId ? { businessId: order.businessId } : { userId: order.userId ?? undefined } });
      if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      await tx.outboxEvent.create({
        data: { aggregate: 'order', aggregateId: orderId, eventType: 'order.paid', payload: { orderId, orderNumber: order.orderNumber, grandTotal: order.grandTotal.toString(), currency: order.currency } },
      });
      return order.id;
    });

    if (won) await this.sendOrderEmails(won).catch((e) => this.log.error(`order emails failed: ${(e as Error).message}`));
  }

  private async markAbandoned(session: Stripe.Checkout.Session, reason: string) {
    const orderId = session.client_reference_id ?? session.metadata?.orderId;
    if (!orderId) return;
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentStatus === 'paid' || order.status !== 'pending_payment') return;
    await this.prisma.$transaction([
      this.prisma.order.update({ where: { id: orderId }, data: { status: 'cancelled', paymentStatus: reason === 'payment_failed' ? 'failed' : 'unpaid' } }),
      this.prisma.orderStatusHistory.create({ data: { orderId, fromStatus: order.status, toStatus: 'cancelled', reason } }),
    ]);
  }

  async orderSummary(orderId: string) {
    const o = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true, shippingAddress: true } });
    return {
      id: o.id, orderNumber: o.orderNumber, status: o.status, paymentStatus: o.paymentStatus, currency: o.currency,
      subtotal: o.subtotal.toNumber(), discountTotal: o.discountTotal.toNumber(), shippingTotal: o.shippingTotal.toNumber(), grandTotal: o.grandTotal.toNumber(),
      placedAt: o.placedAt,
      items: o.items.map((i) => ({ name: i.name, sku: i.sku, qty: i.qty, unitPrice: i.unitPrice.toNumber(), lineTotal: i.lineTotal.toNumber() })),
      shippingAddress: o.shippingAddress,
    };
  }

  private async sendOrderEmails(orderId: string) {
    const o = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true, shippingAddress: true, user: true } });
    const money = (d: Prisma.Decimal) => `£${d.toFixed(2)}`;
    const itemsHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse">${o.items
      .map((i) => `<tr><td style="padding:6px 0;border-bottom:1px solid #EEDDC0">${escapeHtml(i.name)} × ${i.qty}</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEDDC0">${money(i.lineTotal)}</td></tr>`)
      .join('')}</table>`;
    const totals = detailsTable([
      ['Subtotal', money(o.subtotal)],
      ...(o.discountTotal.gt(0) ? [['Discount', `−${money(o.discountTotal)}`] as [string, string]] : []),
      ['Delivery', o.shippingTotal.gt(0) ? money(o.shippingTotal) : 'Free'],
      ['Total paid', money(o.grandTotal)],
    ]);
    const a = o.shippingAddress;
    const addr = a ? [a.contactName, a.line1, a.line2, `${a.city} ${a.postcode ?? ''}`.trim(), a.country].filter(Boolean).join('\n') : '';
    const body = `${itemsHtml}<div style="margin-top:12px">${totals}</div>${addr ? `<p style="font-size:14px;margin-top:16px"><b>Delivering to</b><br>${escapeHtml(addr).replace(/\n/g, '<br>')}</p>` : ''}`;

    if (o.user) {
      await this.mail.send({
        to: o.user.email,
        subject: `Order ${o.orderNumber} confirmed — GNS Spices`,
        html: emailLayout(
          `Thank you${o.user.firstName ? `, ${o.user.firstName}` : ''}!`,
          `<p style="font-size:14px;line-height:1.6">We've received your payment for order <b>${escapeHtml(o.orderNumber)}</b> and will let you know when it ships.</p>${body}
           <p style="font-size:13px"><a href="${escapeHtml(`${config.siteUrl}/account`)}" style="color:#971010">View your orders</a></p>`,
        ),
      });
    }
    if (this.mail.adminAddress) {
      await this.mail.send({
        to: this.mail.adminAddress,
        subject: `New paid order ${o.orderNumber} — ${money(o.grandTotal)}`,
        html: emailLayout(`New order ${o.orderNumber}`, `<p style="font-size:14px">${escapeHtml(o.user?.email ?? 'Guest')}</p>${body}
          <p style="font-size:13px"><a href="${escapeHtml(`${config.siteUrl}/admin/orders/${o.id}`)}" style="color:#971010">Open in admin</a></p>`),
      });
    }
  }

  private async nextOrderNumber(region: string, tx: Prisma.TransactionClient) {
    const d = new Date();
    const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    for (let attempt = 0; attempt < 5; attempt++) {
      const n = `GNS-${region}-${stamp}-${randomInt(1000, 9999)}`;
      if (!(await tx.order.findUnique({ where: { orderNumber: n } }))) return n;
    }
    throw new Error('could_not_allocate_order_number');
  }
}
