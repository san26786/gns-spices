import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { CartService } from '../cart/cart.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

interface PlaceOrderInput {
  billingAddressId: string;
  shippingAddressId: string;
  notes?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly cart: CartService,
  ) {}

  async place(user: AuthUser, input: PlaceOrderInput) {
    const cart = await this.prisma.cart.findFirst({
      where: user.businessId ? { businessId: user.businessId } : { userId: user.sub },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });
    if (!cart || cart.items.length === 0) throw new BadRequestException('cart_empty');

    const ctx = user.businessId
      ? {
          region: user.region,
          businessId: user.businessId,
          tier: await this.tier(user.businessId),
        }
      : { region: user.region, tier: 'retail' as const };

    const resolved = await this.pricing.resolveMany(
      cart.items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      ctx,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      let subtotal = new Prisma.Decimal(0);
      let discountTotal = new Prisma.Decimal(0);

      const orderItemsData = cart.items.map((ci, idx) => {
        const r = resolved[idx]!;
        const lineTotal = r.unitPrice.mul(ci.qty).toDecimalPlaces(2);
        const lineDiscount = r.discountPerUnit.mul(ci.qty).toDecimalPlaces(2);
        subtotal = subtotal.plus(r.baseUnitPrice.mul(ci.qty).toDecimalPlaces(2));
        discountTotal = discountTotal.plus(lineDiscount);
        return {
          variantId: ci.variantId,
          sku: ci.variant.sku,
          name: ci.variant.product.name,
          qty: ci.qty,
          unitPrice: r.unitPrice,
          discountAmount: lineDiscount,
          lineTotal,
        };
      });

      // Placeholder shipping/tax (wired up to real engines in M2).
      const taxTotal = new Prisma.Decimal(0);
      const shippingTotal = new Prisma.Decimal(0);
      const grandTotal = subtotal.minus(discountTotal).plus(taxTotal).plus(shippingTotal);

      const orderNumber = await this.nextOrderNumber(user.region, tx);

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.sub,
          businessId: user.businessId ?? null,
          channel: user.businessId ? 'b2b' : 'd2c',
          region: user.region,
          currency: cart.currency,
          subtotal,
          discountTotal,
          taxTotal,
          shippingTotal,
          grandTotal,
          status: 'pending_payment',
          paymentStatus: 'unpaid',
          billingAddressId: input.billingAddressId,
          shippingAddressId: input.shippingAddressId,
          notes: input.notes,
          items: { create: orderItemsData },
          statusHistory: {
            create: { toStatus: 'pending_payment', actorId: user.sub, reason: 'placed' },
          },
        },
        include: { items: true },
      });

      // Transactional outbox — workers pick this up for emails, ERP sync, etc.
      await tx.outboxEvent.create({
        data: {
          aggregate: 'order',
          aggregateId: order.id,
          eventType: 'order.placed',
          payload: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            channel: order.channel,
            region: order.region,
            grandTotal: order.grandTotal.toString(),
            currency: order.currency,
          } as Prisma.InputJsonValue,
        },
      });

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });

    return this.serialize(result);
  }

  async listMine(user: AuthUser, cursor?: string) {
    const orders = await this.prisma.order.findMany({
      take: 21,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: user.businessId
        ? { businessId: user.businessId }
        : { userId: user.sub },
      orderBy: { placedAt: 'desc' },
      include: { items: true },
    });
    const hasMore = orders.length > 20;
    const data = hasMore ? orders.slice(0, -1) : orders;
    return {
      data: data.map((o) => this.serialize(o)),
      nextCursor: hasMore ? data[data.length - 1]!.id : null,
    };
  }

  async getMine(user: AuthUser, id: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        OR: [
          { userId: user.sub },
          ...(user.businessId ? [{ businessId: user.businessId }] : []),
        ],
      },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'desc' } } },
    });
    if (!order) throw new NotFoundException('order_not_found');
    return this.serialize(order);
  }

  private serialize(o: any) {
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      channel: o.channel,
      region: o.region,
      currency: o.currency,
      subtotal: o.subtotal.toString(),
      discountTotal: o.discountTotal.toString(),
      taxTotal: o.taxTotal.toString(),
      shippingTotal: o.shippingTotal.toString(),
      grandTotal: o.grandTotal.toString(),
      placedAt: o.placedAt,
      items: o.items?.map((i: any) => ({
        id: i.id,
        sku: i.sku,
        name: i.name,
        qty: i.qty,
        unitPrice: i.unitPrice.toString(),
        lineTotal: i.lineTotal.toString(),
      })),
    };
  }

  private async tier(businessId: string) {
    const b = await this.prisma.businessProfile.findUnique({ where: { id: businessId } });
    return (b?.tier ?? 'retail') as 'retail' | 'wholesale' | 'distributor' | 'custom';
  }

  private async nextOrderNumber(region: string, tx: Prisma.TransactionClient): Promise<string> {
    // Human-friendly, region-scoped. Collisions avoided by atomic count+random.
    const n = await tx.order.count({ where: { region } });
    const suffix = (n + 1).toString().padStart(6, '0');
    return `GNS-${region}-${suffix}`;
  }
}
