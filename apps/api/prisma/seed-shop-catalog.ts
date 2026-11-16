/* eslint-disable no-console */
/**
 * Imports the storefront's /shop catalogue (apps/storefront/src/lib/catalog.ts)
 * into the database, so every product on the shop has a backend record, a
 * permanent code (skuRoot) and one variant per grade × pack size.
 *
 * Safe to re-run: products are matched by slug and variants by SKU. Existing
 * rows are never renamed or re-coded, so codes already printed stay valid.
 * Edit names, descriptions, prices etc. in the database afterwards; this
 * script only creates what is missing.
 */
import type { PrismaClient } from '@prisma/client';
import { CATALOG, type CatalogCategory, type GradeTier } from '../../storefront/src/lib/catalog';

const CATEGORY_MAP: Record<CatalogCategory, { slug: string; name: string; position: number }> = {
  powders: { slug: 'ground-spices', name: 'Ground spices', position: 2 },
  seeds:   { slug: 'whole-spices',  name: 'Whole spices',  position: 1 },
  whole:   { slug: 'whole-spices',  name: 'Whole spices',  position: 1 },
  masalas: { slug: 'blends',        name: 'Blends',        position: 3 },
  pickles: { slug: 'pickles',       name: 'Pickles',       position: 5 },
};

const TIER_CODE: Record<GradeTier, string> = {
  'Home Kitchen': 'H',
  'Professional Choice': 'P',
  "Chef's Reserve": 'C',
};

/** "100g · 500g · 1kg" → [100, 500, 1000] */
export function parsePack(pack: string | undefined): number[] {
  if (!pack) return [100];
  const grams = pack
    .split('·')
    .map((s) => s.trim().toLowerCase())
    .map((s) => {
      const m = s.match(/^([\d.]+)\s*(kg|g)$/);
      if (!m) return NaN;
      return Math.round(Number(m[1]) * (m[2] === 'kg' ? 1000 : 1));
    })
    .filter((n) => Number.isFinite(n) && n > 0);
  return grams.length ? grams : [100];
}

const fmtWeight = (g: number) => (g >= 1000 ? `${g / 1000}kg` : `${g}g`);

export async function seedShopCatalog(prisma: PrismaClient) {
  console.log('Importing shop catalogue…');

  const categoryIds = new Map<string, string>();
  for (const c of Object.values(CATEGORY_MAP)) {
    if (categoryIds.has(c.slug)) continue;
    const row = await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: {} });
    categoryIds.set(c.slug, row.id);
  }

  // New products get the next free number: GNS-101, GNS-102, …
  const numbered = await prisma.product.findMany({
    where: { skuRoot: { startsWith: 'GNS-' } },
    select: { skuRoot: true },
  });
  let next = Math.max(100, ...numbered.map((p) => Number(p.skuRoot.slice(4))).filter(Number.isFinite)) + 1;

  let created = 0;
  let variantsCreated = 0;
  for (const item of CATALOG) {
    let product = await prisma.product.findUnique({ where: { slug: item.slug } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          slug: item.slug,
          skuRoot: `GNS-${next++}`,
          name: item.name,
          shortDesc: item.shortDesc,
          brand: 'GNS',
          originCountry: 'IN',
          categoryId: categoryIds.get(CATEGORY_MAP[item.category].slug),
        },
      });
      created++;
      for (const region of ['GB', 'IN', 'AE']) {
        await prisma.productRegionData.upsert({
          where: { productId_region: { productId: product.id, region } },
          create: { productId: product.id, region, isAvailable: true, certifications: ['FSSAI'] },
          update: {},
        });
      }
    } else if (!/^GNS-\d+$/.test(product.skuRoot)) {
      // Product already seeded with its own SKUs (e.g. turmeric-whole). Leave it alone.
      continue;
    }

    for (const v of item.variants) {
      const tier = v.tier ? TIER_CODE[v.tier] : '';
      for (const grams of parsePack(v.pack)) {
        const sku = `${product.skuRoot}-${tier}${grams}`;
        const label = [v.tier, fmtWeight(grams)].filter(Boolean).join(' · ');
        const exists = await prisma.productVariant.findUnique({ where: { sku } });
        if (exists) continue;
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku,
            label,
            weightGrams: grams,
            packaging: item.category === 'pickles' ? 'jar' : 'pouch',
          },
        });
        variantsCreated++;
      }
    }
  }
  console.log(`  + ${created} products, ${variantsCreated} packs imported from the shop catalogue`);
}
