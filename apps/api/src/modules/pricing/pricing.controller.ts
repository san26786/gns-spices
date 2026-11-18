import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { z } from 'zod';
import { PricingService } from './pricing.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { config } from '../../config';

const PriceQuery = z.object({
  qty: z.coerce.number().int().min(1).default(1),
  region: z.string().length(2).optional(),
});

@Controller('pricing')
export class PricingController {
  constructor(
    private readonly pricing: PricingService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Every active pack of every shop product with its one-unit price, keyed by
   * product slug. Lets the shop grid offer "Add to cart" without one request
   * per pack. `unitPrice` is null for packs that are not on sale online.
   */
  @Public()
  @Get('shop-packs')
  async shopPacks(@Query() q: unknown, @CurrentUser() user?: AuthUser) {
    const { region } = PriceQuery.parse(q);
    const ctx = await this.buildCtx(region, user);
    const products = await this.prisma.product.findMany({
      where: { isActive: true, ...(user?.businessId ? {} : { isB2bOnly: false }) },
      select: {
        slug: true,
        variants: {
          where: { isActive: true },
          orderBy: { weightGrams: 'asc' },
          select: { id: true, sku: true, label: true, weightGrams: true, packaging: true },
        },
      },
    });
    const prices = await this.pricing.unitPrices(
      products.flatMap((p) => p.variants.map((v) => v.id)),
      ctx,
    );
    const data: Record<string, Array<Record<string, unknown>>> = {};
    for (const p of products) {
      data[p.slug] = p.variants.map((v) => {
        const price = prices.get(v.id) ?? null;
        return {
          ...v,
          unitPrice: price ? price.unitPrice.toString() : null,
          baseUnitPrice: price ? price.baseUnitPrice.toString() : null,
          currency: price ? price.currency : null,
        };
      });
    }
    return { region: ctx.region, data };
  }

  /**
   * One product's packs for the product page: one-unit price (and pre-discount
   * price), stock available in the region's warehouses (null when stock is not
   * tracked for that pack) and the delivery rules used at checkout.
   */
  @Public()
  @Get('products/:slug/packs')
  async productPacks(@Param('slug') slug: string, @Query() q: unknown, @CurrentUser() user?: AuthUser) {
    const { region } = PriceQuery.parse(q);
    const ctx = await this.buildCtx(region, user);
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: {
        isActive: true,
        isB2bOnly: true,
        variants: {
          where: { isActive: true },
          orderBy: { weightGrams: 'asc' },
          select: {
            id: true, sku: true, label: true, weightGrams: true, packaging: true,
            inventoryLevels: { where: { warehouse: { region: ctx.region, isActive: true } }, select: { onHand: true, reserved: true } },
          },
        },
      },
    });
    if (!product || !product.isActive || (product.isB2bOnly && !user?.businessId)) {
      throw new NotFoundException('product_not_found');
    }
    const prices = await this.pricing.unitPrices(product.variants.map((v) => v.id), ctx);
    return {
      region: ctx.region,
      delivery: ctx.region === 'GB' ? { currency: 'GBP', flat: config.shipping.flat, freeOver: config.shipping.freeOver } : null,
      packs: product.variants.map(({ inventoryLevels, ...v }) => {
        const price = prices.get(v.id) ?? null;
        return {
          ...v,
          unitPrice: price ? price.unitPrice.toString() : null,
          baseUnitPrice: price ? price.baseUnitPrice.toString() : null,
          currency: price ? price.currency : null,
          stock: inventoryLevels.length ? inventoryLevels.reduce((n, l) => n + l.onHand - l.reserved, 0) : null,
        };
      }),
    };
  }

  @Public()
  @Get('variants/:variantId')
  async priceForVariant(
    @Param('variantId') variantId: string,
    @Query() q: unknown,
    @CurrentUser() user?: AuthUser,
  ) {
    const { qty, region } = PriceQuery.parse(q);
    const ctx = await this.buildCtx(region, user);
    const [resolved, ladder] = await Promise.all([
      this.pricing.resolveOne(variantId, qty, ctx),
      this.pricing.ladder(variantId, ctx),
    ]);
    return {
      variantId,
      qty,
      unitPrice: resolved.unitPrice.toString(),
      baseUnitPrice: resolved.baseUnitPrice.toString(),
      currency: resolved.currency,
      lineTotal: resolved.unitPrice.mul(qty).toDecimalPlaces(2).toString(),
      ladder,
      priceList: resolved.priceListCode,
    };
  }

  private async buildCtx(region: string | undefined, user: AuthUser | undefined) {
    const effectiveRegion = region ?? user?.region ?? 'GB';
    if (!user?.businessId) return { region: effectiveRegion, tier: 'retail' as const };
    const biz = await this.prisma.businessProfile.findUnique({ where: { id: user.businessId } });
    return {
      region: effectiveRegion,
      businessId: user.businessId,
      tier: (biz?.tier ?? 'retail') as 'retail' | 'wholesale' | 'distributor' | 'custom',
    };
  }
}
