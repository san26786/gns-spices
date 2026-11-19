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
        label: v.label,
        weightGrams: v.weightGrams,
        packaging: v.packaging,
        barcode: v.barcode,
      })),
    };
  }

  /**
   * Resolve a printed code (product `skuRoot` or variant `sku`) to the product's
   * *current* data. Printed QR codes and barcodes only ever carry this code, so
   * anything edited in the database shows up on the next scan.
   */
  async findByCode(rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    const variantSelect = {
      sku: true, label: true, weightGrams: true, packaging: true, barcode: true, isActive: true,
    } as const;
    const productInclude = {
      category: { select: { slug: true, name: true } },
      variants: { orderBy: { weightGrams: 'asc' as const }, select: variantSelect },
    };

    const variant = await this.prisma.productVariant.findFirst({
      where: { OR: [{ sku: { equals: code, mode: 'insensitive' } }, { barcode: code }] },
      select: { ...variantSelect, product: { include: productInclude } },
    });
    const product = variant?.product
      ?? (await this.prisma.product.findFirst({
        where: { skuRoot: { equals: code, mode: 'insensitive' } },
        include: productInclude,
      }));
    if (!product) throw new NotFoundException('code_not_found');

    return {
      code,
      kind: variant ? 'variant' : 'product',
      product: {
        slug: product.slug,
        skuRoot: product.skuRoot,
        name: product.name,
        shortDesc: product.shortDesc,
        isActive: product.isActive,
        category: product.category,
        updatedAt: product.updatedAt,
      },
      variant: variant
        ? { sku: variant.sku, label: variant.label, weightGrams: variant.weightGrams, packaging: variant.packaging, barcode: variant.barcode, isActive: variant.isActive }
        : null,
      variants: product.variants,
    };
  }

  /** Every product and pack with the codes to print. Includes B2B-only and inactive items. */
  async listCodes() {
    const products = await this.prisma.product.findMany({
      orderBy: [{ category: { position: 'asc' } }, { name: 'asc' }],
      select: {
        slug: true, skuRoot: true, name: true, isActive: true, isB2bOnly: true,
        category: { select: { slug: true, name: true } },
        variants: {
          orderBy: [{ label: 'asc' }, { weightGrams: 'asc' }],
          select: { sku: true, label: true, weightGrams: true, packaging: true, barcode: true, isActive: true },
        },
      },
    });
    return { data: products };
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
