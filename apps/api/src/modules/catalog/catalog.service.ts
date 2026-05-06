import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    region: string;
    category?: string;
    q?: string;
    cursor?: string;
    limit?: number;
    includeB2bOnly?: boolean;
  }) {
    const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const products = await this.prisma.product.findMany({
      take: limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      where: {
        isActive: true,
        ...(params.includeB2bOnly ? {} : { isB2bOnly: false }),
        ...(params.category ? { category: { slug: params.category } } : {}),
        ...(params.q
          ? {
              OR: [
                { name: { contains: params.q, mode: 'insensitive' } },
                { shortDesc: { contains: params.q, mode: 'insensitive' } },
              ],
            }
          : {}),
        regions: { some: { region: params.region, isAvailable: true } },
      },
      include: {
        category: { select: { id: true, slug: true, name: true } },
        media: { take: 1, orderBy: { position: 'asc' } },
        regions: { where: { region: params.region } },
        variants: {
          where: { isActive: true },
          orderBy: { weightGrams: 'asc' },
          take: 1, // display variant; detail page returns all
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, -1) : products;

    return {
      data: data.map((p) => this.toListItem(p, params.region)),
      nextCursor: hasMore ? data[data.length - 1]!.id : null,
    };
  }

  async getBySlug(slug: string, region: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        media: { orderBy: { position: 'asc' } },
        regions: { where: { region } },
        variants: {
          where: { isActive: true },
          orderBy: { weightGrams: 'asc' },
          include: { media: { orderBy: { position: 'asc' } } },
        },
      },
    });

    if (!product || !product.isActive) throw new NotFoundException('product_not_found');

    const regionData = product.regions[0];
    if (!regionData?.isAvailable) throw new NotFoundException('product_not_in_region');

    return {
      id: product.id,
      slug: product.slug,
      skuRoot: product.skuRoot,
      name: regionData.displayName ?? product.name,
      shortDesc: product.shortDesc,
      longDesc: product.longDesc,
      brand: product.brand,
      originCountry: product.originCountry,
      isB2bOnly: product.isB2bOnly,
      category: product.category ? { id: product.category.id, slug: product.category.slug, name: product.category.name } : null,
      media: product.media.map((m) => ({ id: m.id, kind: m.kind, s3Key: m.s3Key, altText: m.altText })),
      region: {
        code: regionData.region,
        ingredients: regionData.ingredients,
        allergenInfo: regionData.allergenInfo,
        nutrition: regionData.nutrition,
        certifications: regionData.certifications,
      },
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        weightGrams: v.weightGrams,
        packaging: v.packaging,
        barcode: v.barcode,
      })),
    };
  }

  async listCategories() {
    return this.prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
      select: { id: true, slug: true, name: true, parentId: true, position: true },
    });
  }

  private toListItem(p: any, region: string) {
    const displayName = p.regions[0]?.displayName ?? p.name;
    return {
      id: p.id,
      slug: p.slug,
      name: displayName,
      shortDesc: p.shortDesc,
      brand: p.brand,
      originCountry: p.originCountry,
      category: p.category,
      image: p.media[0] ? { s3Key: p.media[0].s3Key, altText: p.media[0].altText } : null,
      previewVariant: p.variants[0]
        ? {
            id: p.variants[0].id,
            sku: p.variants[0].sku,
            weightGrams: p.variants[0].weightGrams,
            packaging: p.variants[0].packaging,
          }
        : null,
    };
  }
}
