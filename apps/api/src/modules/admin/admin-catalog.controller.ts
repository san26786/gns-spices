import {
  BadRequestException, Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { StaffGuard, money } from './staff.guard';

const RETAIL_LIST = 'RETAIL_GB';
const MAIN_WAREHOUSE = 'GB-LON-01';
const REGIONS = ['GB', 'IN', 'AE'];

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 150);

function isEan13(v: string) {
  if (!/^\d{13}$/.test(v)) return false;
  const d = v.split('').map(Number);
  const sum = d.slice(0, 12).reduce((a, n, i) => a + n * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === d[12];
}

const ProductDto = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().max(160).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  shortDesc: z.string().trim().max(500).nullable().optional(),
  longDesc: z.string().trim().max(10000).nullable().optional(),
  originCountry: z.string().trim().length(2).toUpperCase().nullable().optional(),
  isActive: z.boolean().optional(),
  isB2bOnly: z.boolean().optional(),
  ingredients: z.string().trim().max(2000).nullable().optional(),
  certifications: z.array(z.string().trim().max(40)).max(20).optional(),
});

const VariantDto = z.object({
  label: z.string().trim().max(120).nullable().optional(),
  weightGrams: z.coerce.number().int().min(1).max(1_000_000),
  packaging: z.enum(['pouch', 'jar', 'tin', 'sack', 'drum']),
  barcode: z.string().trim().max(32).nullable().optional(),
  isActive: z.boolean().optional(),
  priceGBP: z.coerce.number().min(0).max(1_000_000).nullable().optional(),
  stock: z.coerce.number().int().min(0).max(10_000_000).nullable().optional(),
});

const CategoryDto = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(120).optional(),
  position: z.coerce.number().int().min(0).max(999).optional(),
});

@Controller('admin')
@UseGuards(JwtGuard, StaffGuard)
export class AdminCatalogController {
  constructor(private readonly prisma: PrismaService) {}

  // ── Products ───────────────────────────────────────────────────────
  @Get('products')
  async listProducts(@Query() query: unknown) {
    const q = z.object({ q: z.string().optional(), category: z.string().optional(), status: z.enum(['active', 'inactive', 'all']).default('all') }).parse(query);
    const products = await this.prisma.product.findMany({
      where: {
        ...(q.status === 'active' ? { isActive: true } : q.status === 'inactive' ? { isActive: false } : {}),
        ...(q.category ? { category: { slug: q.category } } : {}),
        ...(q.q ? { OR: [{ name: { contains: q.q, mode: 'insensitive' } }, { skuRoot: { contains: q.q, mode: 'insensitive' } }, { slug: { contains: q.q, mode: 'insensitive' } }] } : {}),
      },
      orderBy: [{ name: 'asc' }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          select: {
            id: true, isActive: true,
            priceListItems: { where: { priceList: { code: RETAIL_LIST }, minQty: 1 }, select: { unitPrice: true } },
            inventoryLevels: { select: { onHand: true, reserved: true } },
          },
        },
      },
    });
    return {
      data: products.map((p) => {
        const prices = p.variants.flatMap((v) => v.priceListItems.map((i) => Number(i.unitPrice)));
        const stock = p.variants.reduce((n, v) => n + v.inventoryLevels.reduce((m, l) => m + l.onHand - l.reserved, 0), 0);
        return {
          id: p.id, slug: p.slug, skuRoot: p.skuRoot, name: p.name, isActive: p.isActive, isB2bOnly: p.isB2bOnly,
          category: p.category, updatedAt: p.updatedAt,
          packs: p.variants.length, activePacks: p.variants.filter((v) => v.isActive).length,
          priceFrom: prices.length ? Math.min(...prices) : null,
          stock,
        };
      }),
    };
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        regions: { where: { region: 'GB' } },
        variants: {
          orderBy: [{ label: 'asc' }, { weightGrams: 'asc' }],
          include: {
            priceListItems: { where: { priceList: { code: RETAIL_LIST }, minQty: 1 }, select: { unitPrice: true } },
            inventoryLevels: { where: { warehouse: { code: MAIN_WAREHOUSE } }, select: { onHand: true, reserved: true } },
          },
        },
      },
    });
    if (!p) throw new NotFoundException('product_not_found');
    const gb = p.regions[0];
    return {
      id: p.id, slug: p.slug, skuRoot: p.skuRoot, name: p.name, shortDesc: p.shortDesc, longDesc: p.longDesc,
      originCountry: p.originCountry, isActive: p.isActive, isB2bOnly: p.isB2bOnly, category: p.category,
      ingredients: gb?.ingredients ?? null, certifications: gb?.certifications ?? [],
      createdAt: p.createdAt, updatedAt: p.updatedAt,
      variants: p.variants.map((v) => ({
        id: v.id, sku: v.sku, label: v.label, weightGrams: v.weightGrams, packaging: v.packaging, barcode: v.barcode, isActive: v.isActive,
        priceGBP: money(v.priceListItems[0]?.unitPrice),
        stock: v.inventoryLevels[0] ? v.inventoryLevels[0].onHand : null,
      })),
    };
  }

  @Post('products')
  async createProduct(@Body() body: unknown) {
    const dto = ProductDto.parse(body);
    const slug = slugify(dto.slug || dto.name);
    if (!slug) throw new BadRequestException('invalid_slug');
    if (await this.prisma.product.findUnique({ where: { slug } })) throw new ConflictException('slug_taken');

    const numbered = await this.prisma.product.findMany({ where: { skuRoot: { startsWith: 'GNS-' } }, select: { skuRoot: true } });
    const next = Math.max(100, ...numbered.map((p) => Number(p.skuRoot.slice(4))).filter(Number.isFinite)) + 1;

    const product = await this.prisma.product.create({
      data: {
        slug, skuRoot: `GNS-${next}`, name: dto.name, shortDesc: dto.shortDesc, longDesc: dto.longDesc,
        categoryId: dto.categoryId ?? null, originCountry: dto.originCountry ?? 'IN', brand: 'GNS',
        isActive: dto.isActive ?? true, isB2bOnly: dto.isB2bOnly ?? false,
        regions: {
          create: REGIONS.map((region) => ({
            region, isAvailable: true, ingredients: dto.ingredients ?? null, certifications: dto.certifications ?? ['FSSAI'],
          })),
        },
      },
    });
    return { id: product.id, skuRoot: product.skuRoot, slug: product.slug };
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: unknown) {
    const dto = ProductDto.partial().parse(body);
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('product_not_found');

    let slug: string | undefined;
    if (dto.slug !== undefined) {
      slug = slugify(dto.slug);
      if (!slug) throw new BadRequestException('invalid_slug');
      const clash = await this.prisma.product.findUnique({ where: { slug } });
      if (clash && clash.id !== id) throw new ConflictException('slug_taken');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: dto.name, slug, shortDesc: dto.shortDesc, longDesc: dto.longDesc, categoryId: dto.categoryId,
          originCountry: dto.originCountry, isActive: dto.isActive, isB2bOnly: dto.isB2bOnly,
        },
      });
      if (dto.ingredients !== undefined || dto.certifications !== undefined) {
        await tx.productRegionData.updateMany({
          where: { productId: id },
          data: {
            ...(dto.ingredients !== undefined ? { ingredients: dto.ingredients } : {}),
            ...(dto.certifications !== undefined ? { certifications: dto.certifications } : {}),
          },
        });
      }
    });
    return this.getProduct(id);
  }

  // ── Packs (variants) ───────────────────────────────────────────────
  @Post('products/:id/variants')
  async createVariant(@Param('id') productId: string, @Body() body: unknown) {
    const dto = VariantDto.parse(body);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('product_not_found');
    this.checkBarcode(dto.barcode);

    let sku = `${product.skuRoot}-${dto.weightGrams}`;
    for (let n = 2; await this.prisma.productVariant.findUnique({ where: { sku } }); n++) sku = `${product.skuRoot}-${dto.weightGrams}-${n}`;

    const variant = await this.prisma.productVariant.create({
      data: {
        productId, sku, label: dto.label ?? null, weightGrams: dto.weightGrams, packaging: dto.packaging,
        barcode: dto.barcode || null, isActive: dto.isActive ?? true,
      },
    });
    await this.writePriceAndStock(variant.id, dto.priceGBP, dto.stock);
    return this.getProduct(productId);
  }

  @Patch('variants/:id')
  async updateVariant(@Param('id') id: string, @Body() body: unknown) {
    const dto = VariantDto.partial().parse(body);
    const v = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('variant_not_found');
    this.checkBarcode(dto.barcode);
    if (dto.barcode) {
      const clash = await this.prisma.productVariant.findFirst({ where: { barcode: dto.barcode, NOT: { id } } });
      if (clash) throw new ConflictException('barcode_in_use');
    }
    // SKU is permanent: it is printed in barcodes and QR codes.
    await this.prisma.productVariant.update({
      where: { id },
      data: {
        label: dto.label, weightGrams: dto.weightGrams, packaging: dto.packaging, isActive: dto.isActive,
        barcode: dto.barcode === undefined ? undefined : dto.barcode || null,
      },
    });
    await this.writePriceAndStock(id, dto.priceGBP, dto.stock);
    return this.getProduct(v.productId);
  }

  private checkBarcode(barcode?: string | null) {
    if (barcode && !isEan13(barcode)) throw new BadRequestException('barcode_must_be_valid_ean13');
  }

  private async writePriceAndStock(variantId: string, priceGBP?: number | null, stock?: number | null) {
    if (priceGBP !== undefined) {
      const list = await this.prisma.priceList.findUnique({ where: { code: RETAIL_LIST } });
      if (!list) throw new BadRequestException('retail_price_list_missing');
      const key = { priceListId_variantId_minQty: { priceListId: list.id, variantId, minQty: 1 } };
      if (priceGBP === null) await this.prisma.priceListItem.deleteMany({ where: { priceListId: list.id, variantId, minQty: 1 } });
      else {
        const unitPrice = new Prisma.Decimal(priceGBP);
        await this.prisma.priceListItem.upsert({ where: key, create: { priceListId: list.id, variantId, minQty: 1, unitPrice }, update: { unitPrice } });
      }
    }
    if (stock !== undefined && stock !== null) {
      const wh = await this.prisma.warehouse.findUnique({ where: { code: MAIN_WAREHOUSE } });
      if (!wh) throw new BadRequestException('warehouse_missing');
      await this.prisma.inventoryLevel.upsert({
        where: { warehouseId_variantId: { warehouseId: wh.id, variantId } },
        create: { warehouseId: wh.id, variantId, onHand: stock },
        update: { onHand: stock },
      });
    }
  }

  // ── Categories ─────────────────────────────────────────────────────
  @Get('categories')
  async listCategories() {
    const cats = await this.prisma.category.findMany({ orderBy: [{ position: 'asc' }, { name: 'asc' }], include: { _count: { select: { products: true } } } });
    return { data: cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, position: c.position, products: c._count.products })) };
  }

  @Post('categories')
  async createCategory(@Body() body: unknown) {
    const dto = CategoryDto.parse(body);
    const slug = slugify(dto.slug || dto.name);
    if (await this.prisma.category.findUnique({ where: { slug } })) throw new ConflictException('category_exists');
    return this.prisma.category.create({ data: { name: dto.name, slug, position: dto.position ?? 0 } });
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: unknown) {
    const dto = CategoryDto.partial().parse(body);
    const slug = dto.slug !== undefined ? slugify(dto.slug) : undefined;
    if (slug) {
      const clash = await this.prisma.category.findUnique({ where: { slug } });
      if (clash && clash.id !== id) throw new ConflictException('category_exists');
    }
    return this.prisma.category.update({ where: { id }, data: { name: dto.name, slug, position: dto.position } });
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    const count = await this.prisma.product.count({ where: { categoryId: id } });
    if (count) throw new ConflictException('category_has_products');
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }
}
