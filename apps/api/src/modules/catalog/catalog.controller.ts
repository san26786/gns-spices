import { Controller, Get, Param, Query } from '@nestjs/common';
import { z } from 'zod';
import { CatalogService } from './catalog.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

const ListQuery = z.object({
  region: z.string().length(2).optional(),
  category: z.string().optional(),
  q: z.string().max(200).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const DetailQuery = z.object({
  region: z.string().length(2).optional(),
});

@Controller('products')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Public()
  @Get()
  async list(@Query() query: unknown, @CurrentUser() user?: AuthUser) {
    const q = ListQuery.parse(query);
    return this.catalog.list({
      region: q.region ?? user?.region ?? 'GB',
      category: q.category,
      q: q.q,
      cursor: q.cursor,
      limit: q.limit,
      includeB2bOnly: !!user?.businessId,
    });
  }

  @Public()
  @Get('categories')
  async categories() {
    return { data: await this.catalog.listCategories() };
  }

  @Public()
  @Get(':slug')
  async detail(@Param('slug') slug: string, @Query() query: unknown, @CurrentUser() user?: AuthUser) {
    const q = DetailQuery.parse(query);
    return this.catalog.getBySlug(slug, q.region ?? user?.region ?? 'GB');
  }
}
