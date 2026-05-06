import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
  ) {}

  async getOrCreate(user: AuthUser) {
    const existing = user.businessId
      ? await this.prisma.cart.findUnique({ where: { businessId: user.businessId } })
      : await this.prisma.cart.findUnique({ where: { userId: user.sub } });

    if (existing) return existing;
    return this.prisma.cart.create({
      data: {
        userId: user.businessId ? null : user.sub,
        businessId: user.businessId ?? null,
        region: user.region,
        currency: user.currency,
      },
    });
  }

  async view(user: AuthUser) {
    const cart = await this.getOrCreate(user);
    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        variant: {
          include: {
            product: {
              select: { id: true, slug: true, name: true, regions: { where: { region: cart.region } } },
            },
          },
        },
      },
      orderBy: { addedAt: 'asc' },
    });

    // Re-resolve pricing on view so the cart reflects the authoritative price.
    const resolved = items.length
      ? await this.pricing.resolveMany(
          items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
          await this.buildCtx(user),
        )
      : [];

    let subtotal = new Prisma.Decimal(0);
    const lines = items.map((i, idx) => {
      const r = resolved[idx]!;
      const lineTotal = r.unitPrice.mul(i.qty).toDecimalPlaces(2);
      subtotal = subtotal.plus(lineTotal);
      const displayName = i.variant.product.regions[0]?.displayName ?? i.variant.product.name;
      return {
        id: i.id,
        variantId: i.variantId,
        sku: i.variant.sku,
        productSlug: i.variant.product.slug,
        productName: displayName,
        weightGrams: i.variant.weightGrams,
        packaging: i.variant.packaging,
        qty: i.qty,
        unitPrice: r.unitPrice.toString(),
        baseUnitPrice: r.baseUnitPrice.toString(),
        discountPerUnit: r.discountPerUnit.toString(),
        lineTotal: lineTotal.toString(),
      };
    });

    return {
      id: cart.id,
      region: cart.region,
      currency: cart.currency,
      items: lines,
      subtotal: subtotal.toString(),
      itemCount: lines.reduce((s, l) => s + l.qty, 0),
    };
  }

  async addItem(user: AuthUser, variantId: string, qty: number) {
    if (qty < 1) throw new BadRequestException('qty_invalid');
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { include: { regions: { where: { region: user.region } } } } },
    });
    if (!variant || !variant.isActive) throw new NotFoundException('variant_not_found');
    if (!variant.product.regions[0]?.isAvailable)
      throw new BadRequestException('not_available_in_region');
    if (variant.product.isB2bOnly && !user.businessId)
      throw new BadRequestException('b2b_only');

    const cart = await this.getOrCreate(user);
    const price = await this.pricing.resolveOne(variantId, qty, await this.buildCtx(user));

    const existing = await this.prisma.cartItem.findFirst({ where: { cartId: cart.id, variantId } });
    if (existing) {
      const newQty = existing.qty + qty;
      const repriced = await this.pricing.resolveOne(variantId, newQty, await this.buildCtx(user));
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: newQty, unitPrice: repriced.unitPrice, currency: repriced.currency },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          qty,
          unitPrice: price.unitPrice,
          currency: price.currency,
        },
      });
    }
    return this.view(user);
  }

  async updateItem(user: AuthUser, itemId: string, qty: number) {
    if (qty < 1) throw new BadRequestException('qty_invalid');
    const cart = await this.getOrCreate(user);
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('cart_item_not_found');
    const price = await this.pricing.resolveOne(item.variantId, qty, await this.buildCtx(user));
    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { qty, unitPrice: price.unitPrice, currency: price.currency },
    });
    return this.view(user);
  }

  async removeItem(user: AuthUser, itemId: string) {
    const cart = await this.getOrCreate(user);
    await this.prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    return this.view(user);
  }

  async clear(user: AuthUser) {
    const cart = await this.getOrCreate(user);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.view(user);
  }

  private async buildCtx(user: AuthUser) {
    if (!user.businessId) return { region: user.region, tier: 'retail' as const };
    const biz = await this.prisma.businessProfile.findUnique({ where: { id: user.businessId } });
    return {
      region: user.region,
      businessId: user.businessId,
      tier: (biz?.tier ?? 'retail') as 'retail' | 'wholesale' | 'distributor' | 'custom',
    };
  }
}
