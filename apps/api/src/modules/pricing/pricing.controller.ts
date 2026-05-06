import { Controller, Get, Param, Query } from '@nestjs/common';
import { z } from 'zod';
import { PricingService } from './pricing.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

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
