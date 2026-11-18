"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePack = parsePack;
exports.seedShopCatalog = seedShopCatalog;
const catalog_1 = require("../../storefront/src/lib/catalog");
const CATEGORY_MAP = {
    powders: { slug: 'ground-spices', name: 'Ground spices', position: 2 },
    seeds: { slug: 'whole-spices', name: 'Whole spices', position: 1 },
    whole: { slug: 'whole-spices', name: 'Whole spices', position: 1 },
    masalas: { slug: 'blends', name: 'Blends', position: 3 },
    pickles: { slug: 'pickles', name: 'Pickles', position: 5 },
};
const TIER_CODE = {
    'Home Kitchen': 'H',
    'Professional Choice': 'P',
    "Chef's Reserve": 'C',
};
/** "100g · 500g · 1kg" → [100, 500, 1000] */
function parsePack(pack) {
    if (!pack)
        return [100];
    const grams = pack
        .split('·')
        .map((s) => s.trim().toLowerCase())
        .map((s) => {
        const m = s.match(/^([\d.]+)\s*(kg|g)$/);
        if (!m)
            return NaN;
        return Math.round(Number(m[1]) * (m[2] === 'kg' ? 1000 : 1));
    })
        .filter((n) => Number.isFinite(n) && n > 0);
    return grams.length ? grams : [100];
}
const fmtWeight = (g) => (g >= 1000 ? `${g / 1000}kg` : `${g}g`);
async function seedShopCatalog(prisma) {
    console.log('Importing shop catalogue…');
    const categoryIds = new Map();
    for (const c of Object.values(CATEGORY_MAP)) {
        if (categoryIds.has(c.slug))
            continue;
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
    for (const item of catalog_1.CATALOG) {
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
        }
        else if (!/^GNS-\d+$/.test(product.skuRoot)) {
            // Product already seeded with its own SKUs (e.g. turmeric-whole). Leave it alone.
            continue;
        }
        for (const v of item.variants) {
            const tier = v.tier ? TIER_CODE[v.tier] : '';
            for (const grams of parsePack(v.pack)) {
                const sku = `${product.skuRoot}-${tier}${grams}`;
                const label = [v.tier, fmtWeight(grams)].filter(Boolean).join(' · ');
                const exists = await prisma.productVariant.findUnique({ where: { sku } });
                if (exists)
                    continue;
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
//# sourceMappingURL=seed-shop-catalog.js.map