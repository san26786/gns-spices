import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ResolvedPrice {
  variantId: string;
  qty: number;
  unitPrice: Prisma.Decimal;   // post-rule
  baseUnitPrice: Prisma.Decimal; // pre-rule
  discountPerUnit: Prisma.Decimal;
  currency: string;
  priceListId: string;
  priceListCode: string;
  appliedRuleId?: string;
}

interface ResolveContext {
  region: string;
  businessId?: string;
  tier?: 'retail' | 'wholesale' | 'distributor' | 'custom';
}

/**
 * Price resolution order:
 *  1. Custom per-business list (if business has `tier=custom` and list exists)
 *  2. <tier>_<region> list
 *  3. RETAIL_<region> (fallback)
 *
 * Then apply the highest-`minQty` matching `price_rules` (<= qty).
 * Prices are stored in the list's native currency — no on-the-fly FX.
 */
@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveOne(variantId: string, qty: number, ctx: ResolveContext): Promise<ResolvedPrice> {
    const list = await this.pickList(ctx);
    const item = await this.pickItem(list.id, variantId, qty);
    const rule = await this.pickRule(list.id, variantId, qty);

    const baseUnit = item.unitPrice;
    const unit = rule ? applyRule(baseUnit, rule.discountType, rule.discountValue) : baseUnit;
    const discountPerUnit = baseUnit.minus(unit);

    return {
      variantId,
      qty,
      unitPrice: unit,
      baseUnitPrice: baseUnit,
      discountPerUnit,
      currency: list.currency,
      priceListId: list.id,
      priceListCode: list.code,
      appliedRuleId: rule?.id,
    };
  }

  async resolveMany(
    lines: Array<{ variantId: string; qty: number }>,
    ctx: ResolveContext,
  ): Promise<ResolvedPrice[]> {
    const list = await this.pickList(ctx);
    return Promise.all(
      lines.map(async (l) => {
        const item = await this.pickItem(list.id, l.variantId, l.qty);
        const rule = await this.pickRule(list.id, l.variantId, l.qty);
        const baseUnit = item.unitPrice;
        const unit = rule ? applyRule(baseUnit, rule.discountType, rule.discountValue) : baseUnit;
        return {
          variantId: l.variantId,
          qty: l.qty,
          unitPrice: unit,
          baseUnitPrice: baseUnit,
          discountPerUnit: baseUnit.minus(unit),
          currency: list.currency,
          priceListId: list.id,
          priceListCode: list.code,
          appliedRuleId: rule?.id,
        };
      }),
    );
  }

  /**
   * Price for one unit of each variant, or null when the variant has no price
   * in the resolved list. Used to show many packs at once (shop grid).
   */
  async unitPrices(variantIds: string[], ctx: ResolveContext) {
    let list: Awaited<ReturnType<PricingService['pickList']>>;
    try {
      list = await this.pickList(ctx);
    } catch (e) {
      if (e instanceof NotFoundException) return new Map<string, null>();
      throw e;
    }
    // Two queries for all variants (not two per variant): on serverless hosting the
    // database pool is small, and hundreds of parallel queries time out.
    const now = new Date();
    const [items, rules] = await Promise.all([
      this.prisma.priceListItem.findMany({
        where: { priceListId: list.id, variantId: { in: variantIds }, minQty: { lte: 1 } },
        orderBy: { minQty: 'desc' },
      }),
      this.prisma.priceRule.findMany({
        where: {
          priceListId: list.id,
          minQty: { lte: 1 },
          OR: [{ variantId: { in: variantIds } }, { variantId: null }],
          AND: [
            { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
            { OR: [{ validTo: null }, { validTo: { gte: now } }] },
          ],
        },
        orderBy: [{ minQty: 'desc' }],
      }),
    ]);
    const out = new Map<string, { unitPrice: Prisma.Decimal; baseUnitPrice: Prisma.Decimal; currency: string } | null>();
    for (const variantId of variantIds) {
      const item = items.find((i) => i.variantId === variantId);
      if (!item) {
        out.set(variantId, null);
        continue;
      }
      const rule = rules.find((r) => r.variantId === variantId || r.variantId === null);
      const base = item.unitPrice;
      const unit = rule ? applyRule(base, rule.discountType, rule.discountValue) : base;
      out.set(variantId, { unitPrice: unit, baseUnitPrice: base, currency: list.currency });
    }
    return out;
  }

  /** Quantity break ladder for a variant — for PDP display. */
  async ladder(variantId: string, ctx: ResolveContext) {
    const list = await this.pickList(ctx);
    const items = await this.prisma.priceListItem.findMany({
      where: { priceListId: list.id, variantId },
      orderBy: { minQty: 'asc' },
    });
    const rules = await this.prisma.priceRule.findMany({
      where: {
        priceListId: list.id,
        OR: [{ variantId }, { variantId: null }],
      },
      orderBy: { minQty: 'asc' },
    });

    const breakpoints = new Set<number>([1]);
    items.forEach((i) => breakpoints.add(i.minQty));
    rules.forEach((r) => breakpoints.add(r.minQty));

    return Array.from(breakpoints)
      .sort((a, b) => a - b)
      .map((minQty) => {
        const item =
          [...items].reverse().find((i) => i.minQty <= minQty) ?? items[0];
        if (!item) return null;
        const rule = [...rules].reverse().find((r) => r.minQty <= minQty);
        const baseUnit = item.unitPrice;
        const unit = rule ? applyRule(baseUnit, rule.discountType, rule.discountValue) : baseUnit;
        return {
          minQty,
          unitPrice: unit,
          currency: list.currency,
        };
      })
      .filter(Boolean);
  }

  private async pickList(ctx: ResolveContext) {
    // 1. Custom business list
    if (ctx.businessId && ctx.tier === 'custom') {
      const custom = await this.prisma.priceList.findFirst({
        where: { businessId: ctx.businessId, isActive: true },
      });
      if (custom) return custom;
    }
    // 2. Tier + region
    const tier = ctx.tier ?? 'retail';
    const tiered = await this.prisma.priceList.findFirst({
      where: {
        region: ctx.region,
        tier,
        businessId: null,
        isActive: true,
      },
    });
    if (tiered) return tiered;
    // 3. Retail + region fallback
    const retail = await this.prisma.priceList.findFirst({
      where: { region: ctx.region, tier: 'retail', businessId: null, isActive: true },
    });
    if (!retail) throw new NotFoundException(`no_price_list_for_region:${ctx.region}`);
    return retail;
  }

  private async pickItem(priceListId: string, variantId: string, qty: number) {
    const item = await this.prisma.priceListItem.findFirst({
      where: { priceListId, variantId, minQty: { lte: qty } },
      orderBy: { minQty: 'desc' },
    });
    if (!item) throw new NotFoundException(`no_price_for_variant:${variantId}`);
    return item;
  }

  private async pickRule(priceListId: string, variantId: string, qty: number) {
    const now = new Date();
    const rule = await this.prisma.priceRule.findFirst({
      where: {
        priceListId,
        minQty: { lte: qty },
        OR: [{ variantId }, { variantId: null }],
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validTo: null }, { validTo: { gte: now } }] },
        ],
      },
      orderBy: [{ minQty: 'desc' }],
    });
    return rule ?? null;
  }
}

function applyRule(
  base: Prisma.Decimal,
  type: 'pct' | 'fixed_off' | 'fixed_price',
  value: Prisma.Decimal,
): Prisma.Decimal {
  switch (type) {
    case 'pct':
      // value is a % (e.g. 10 = 10% off)
      return base.mul(new Prisma.Decimal(100).minus(value)).div(100);
    case 'fixed_off':
      return Prisma.Decimal.max(new Prisma.Decimal(0), base.minus(value));
    case 'fixed_price':
      return value;
  }
}
