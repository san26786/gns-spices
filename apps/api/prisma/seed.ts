/* eslint-disable no-console */
import { PrismaClient, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { seedShopCatalog } from './seed-shop-catalog';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding regions…');
  await prisma.region.createMany({
    data: [
      { code: 'GB', name: 'United Kingdom', defaultCurrency: 'GBP', defaultLang: 'en', taxModel: 'vat' },
      { code: 'IN', name: 'India',          defaultCurrency: 'INR', defaultLang: 'en', taxModel: 'gst' },
      { code: 'AE', name: 'United Arab Emirates', defaultCurrency: 'AED', defaultLang: 'en', taxModel: 'vat' },
      { code: 'SA', name: 'Saudi Arabia',   defaultCurrency: 'SAR', defaultLang: 'ar', taxModel: 'vat' },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding categories…');
  const cats = [
    { slug: 'whole-spices',  name: 'Whole spices',  position: 1 },
    { slug: 'ground-spices', name: 'Ground spices', position: 2 },
    { slug: 'blends',        name: 'Blends',        position: 3 },
    { slug: 'bulk',          name: 'Bulk & wholesale', position: 4 },
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: c });
  }
  const whole   = await prisma.category.findUniqueOrThrow({ where: { slug: 'whole-spices' } });
  const ground  = await prisma.category.findUniqueOrThrow({ where: { slug: 'ground-spices' } });
  const blends  = await prisma.category.findUniqueOrThrow({ where: { slug: 'blends' } });

  console.log('Seeding warehouses…');
  const whIn = await prisma.warehouse.upsert({
    where: { code: 'IN-CHN-01' },
    create: { code: 'IN-CHN-01', region: 'IN', name: 'Chennai DC' },
    update: {},
  });
  const whGb = await prisma.warehouse.upsert({
    where: { code: 'GB-LON-01' },
    create: { code: 'GB-LON-01', region: 'GB', name: 'London DC' },
    update: {},
  });

  console.log('Seeding products…');
  const products = [
    {
      slug: 'turmeric-whole',
      skuRoot: 'GNS-TURM',
      name: 'Turmeric (whole)',
      shortDesc: 'Curcumin-rich turmeric fingers from Erode, Tamil Nadu.',
      longDesc: 'Hand-sorted whole turmeric fingers sun-dried at source. Deep ochre colour, earthy aroma, min 3% curcumin.',
      category: whole.id,
      origin: 'IN',
      variants: [
        { sku: 'GNS-TURM-100-POUCH',  weight: 100,   pkg: 'pouch', retailGBP: '4.50' },
        { sku: 'GNS-TURM-500-JAR',    weight: 500,   pkg: 'jar',   retailGBP: '18.00' },
        { sku: 'GNS-TURM-5000-SACK',  weight: 5000,  pkg: 'sack',  retailGBP: '120.00' },
        { sku: 'GNS-TURM-25000-SACK', weight: 25000, pkg: 'sack',  retailGBP: '525.00' },
      ],
      ingredients: 'Curcuma longa (whole).',
      certs: ['Organic', 'FSSAI', 'Vegan'],
    },
    {
      slug: 'black-pepper-tellicherry',
      skuRoot: 'GNS-PEP',
      name: 'Black Pepper (Tellicherry)',
      shortDesc: 'Large-berry Tellicherry Extra Bold peppercorns from Kerala.',
      longDesc: 'TGSEB grade peppercorns harvested at peak ripeness, oven-dried for consistent pungency (min 2.5% piperine).',
      category: whole.id,
      origin: 'IN',
      variants: [
        { sku: 'GNS-PEP-100-JAR',   weight: 100,  pkg: 'jar',  retailGBP: '6.00' },
        { sku: 'GNS-PEP-500-POUCH', weight: 500,  pkg: 'pouch', retailGBP: '27.50' },
        { sku: 'GNS-PEP-5000-SACK', weight: 5000, pkg: 'sack',  retailGBP: '230.00' },
      ],
      ingredients: 'Piper nigrum.',
      certs: ['Rainforest Alliance'],
    },
    {
      slug: 'cardamom-green',
      skuRoot: 'GNS-CARD',
      name: 'Green Cardamom',
      shortDesc: '8mm AAA green cardamom pods from the Idukki hills.',
      longDesc: 'Bold, vividly green pods with 6–8% volatile oil content. Closed-pod grade, no bleaching.',
      category: whole.id,
      origin: 'IN',
      variants: [
        { sku: 'GNS-CARD-50-JAR',  weight: 50,  pkg: 'jar',  retailGBP: '9.00' },
        { sku: 'GNS-CARD-250-TIN', weight: 250, pkg: 'tin',  retailGBP: '38.00' },
        { sku: 'GNS-CARD-1000-POUCH', weight: 1000, pkg: 'pouch', retailGBP: '140.00' },
      ],
      ingredients: 'Elettaria cardamomum.',
      certs: ['FSSAI', 'Organic'],
    },
    {
      slug: 'garam-masala',
      skuRoot: 'GNS-GMAS',
      name: 'Garam Masala (house blend)',
      shortDesc: 'House-ground garam masala toasted in small batches.',
      longDesc: 'Our signature blend of 11 spices, toasted and ground in-house weekly. Warming, rounded, not spicy.',
      category: blends.id,
      origin: 'IN',
      variants: [
        { sku: 'GNS-GMAS-100-TIN', weight: 100,  pkg: 'tin',  retailGBP: '5.50' },
        { sku: 'GNS-GMAS-500-JAR', weight: 500,  pkg: 'jar',  retailGBP: '22.00' },
      ],
      ingredients: 'Coriander, cumin, cinnamon, cardamom, clove, black pepper, bay, nutmeg, mace, ginger, fennel.',
      certs: ['Vegan'],
    },
    {
      slug: 'kashmiri-chilli-ground',
      skuRoot: 'GNS-KCHI',
      name: 'Kashmiri Chilli (ground)',
      shortDesc: 'Deep red, mild, colour-rich Kashmiri chilli powder.',
      longDesc: 'Prized for its deep red colour and mild heat (2,000–4,000 SHU). Essential for tikka masalas and rogan josh.',
      category: ground.id,
      origin: 'IN',
      variants: [
        { sku: 'GNS-KCHI-100-POUCH',  weight: 100,  pkg: 'pouch', retailGBP: '3.80' },
        { sku: 'GNS-KCHI-500-JAR',    weight: 500,  pkg: 'jar',   retailGBP: '15.50' },
        { sku: 'GNS-KCHI-5000-SACK',  weight: 5000, pkg: 'sack',  retailGBP: '105.00' },
      ],
      ingredients: 'Capsicum annuum (Kashmiri variety).',
      certs: ['FSSAI'],
    },
    {
      slug: 'cumin-whole',
      skuRoot: 'GNS-CUMIN',
      name: 'Cumin (whole)',
      shortDesc: 'Bold Rajasthan cumin seeds with a warm, peppery aroma.',
      longDesc: 'Gujarat/Rajasthan cumin, min 2.5% volatile oil, electronically cleaned.',
      category: whole.id,
      origin: 'IN',
      variants: [
        { sku: 'GNS-CUMIN-100-POUCH', weight: 100,  pkg: 'pouch', retailGBP: '3.20' },
        { sku: 'GNS-CUMIN-500-JAR',   weight: 500,  pkg: 'jar',   retailGBP: '13.00' },
        { sku: 'GNS-CUMIN-5000-SACK', weight: 5000, pkg: 'sack',  retailGBP: '92.00' },
      ],
      ingredients: 'Cuminum cyminum.',
      certs: ['FSSAI'],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        skuRoot: p.skuRoot,
        name: p.name,
        shortDesc: p.shortDesc,
        longDesc: p.longDesc,
        brand: 'GNS',
        originCountry: p.origin,
        categoryId: p.category,
      },
      update: {
        name: p.name,
        shortDesc: p.shortDesc,
        longDesc: p.longDesc,
      },
    });

    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        create: {
          productId: product.id,
          sku: v.sku,
          weightGrams: v.weight,
          packaging: v.pkg as any,
        },
        update: {},
      });
    }

    // Region data for GB + IN (AE/SA left off by default — covered by M2).
    for (const region of ['GB', 'IN', 'AE']) {
      await prisma.productRegionData.upsert({
        where: { productId_region: { productId: product.id, region } },
        create: {
          productId: product.id,
          region,
          isAvailable: true,
          ingredients: p.ingredients,
          certifications: p.certs,
        },
        update: {},
      });
    }

    if (!existing) console.log(`  + ${p.name} (${p.variants.length} variants)`);
  }

  console.log('Seeding price lists…');
  // Retail GB in GBP
  const retailGB = await prisma.priceList.upsert({
    where: { code: 'RETAIL_GB' },
    create: { code: 'RETAIL_GB', name: 'Retail (UK)', region: 'GB', currency: 'GBP', tier: 'retail' },
    update: {},
  });
  // Wholesale GB in GBP (15% off retail, min_qty thresholds via price_rules)
  const wholesaleGB = await prisma.priceList.upsert({
    where: { code: 'WHOLESALE_GB' },
    create: { code: 'WHOLESALE_GB', name: 'Wholesale (UK)', region: 'GB', currency: 'GBP', tier: 'wholesale' },
    update: {},
  });
  // Retail IN in INR (rough conversion to show multi-currency)
  const retailIN = await prisma.priceList.upsert({
    where: { code: 'RETAIL_IN' },
    create: { code: 'RETAIL_IN', name: 'Retail (India)', region: 'IN', currency: 'INR', tier: 'retail' },
    update: {},
  });

  const allVariants = await prisma.productVariant.findMany({ where: { isActive: true } });

  for (const v of allVariants) {
    // Find the seed row we used above to compute GBP
    const seedProduct = products.find((p) => p.variants.some((x) => x.sku === v.sku));
    const seedVariant = seedProduct?.variants.find((x) => x.sku === v.sku);
    if (!seedVariant) continue;

    const retail = new Prisma.Decimal(seedVariant.retailGBP);
    const wholesaleBase = retail.mul('0.85').toDecimalPlaces(4);
    const inrPrice = retail.mul(105).toDecimalPlaces(2); // ~GBP→INR

    await prisma.priceListItem.upsert({
      where: {
        priceListId_variantId_minQty: { priceListId: retailGB.id, variantId: v.id, minQty: 1 },
      },
      create: { priceListId: retailGB.id, variantId: v.id, minQty: 1, unitPrice: retail },
      update: { unitPrice: retail },
    });

    await prisma.priceListItem.upsert({
      where: {
        priceListId_variantId_minQty: { priceListId: wholesaleGB.id, variantId: v.id, minQty: 1 },
      },
      create: { priceListId: wholesaleGB.id, variantId: v.id, minQty: 1, unitPrice: wholesaleBase },
      update: { unitPrice: wholesaleBase },
    });

    await prisma.priceListItem.upsert({
      where: {
        priceListId_variantId_minQty: { priceListId: retailIN.id, variantId: v.id, minQty: 1 },
      },
      create: { priceListId: retailIN.id, variantId: v.id, minQty: 1, unitPrice: inrPrice },
      update: { unitPrice: inrPrice },
    });

    // Inventory seed (plenty of stock in both warehouses)
    await prisma.inventoryLevel.upsert({
      where: { warehouseId_variantId: { warehouseId: whIn.id, variantId: v.id } },
      create: { warehouseId: whIn.id, variantId: v.id, onHand: 1000, reorderPoint: 100 },
      update: {},
    });
    await prisma.inventoryLevel.upsert({
      where: { warehouseId_variantId: { warehouseId: whGb.id, variantId: v.id } },
      create: { warehouseId: whGb.id, variantId: v.id, onHand: 250, reorderPoint: 40 },
      update: {},
    });
  }

  // Quantity-break rules on RETAIL_GB: 10%+ off at 10 units, 15% off at 50 units.
  console.log('Seeding price rules…');
  await prisma.priceRule.deleteMany({ where: { priceListId: { in: [retailGB.id, wholesaleGB.id] } } });
  await prisma.priceRule.createMany({
    data: [
      { priceListId: retailGB.id, minQty: 10, discountType: 'pct', discountValue: new Prisma.Decimal(10) },
      { priceListId: retailGB.id, minQty: 50, discountType: 'pct', discountValue: new Prisma.Decimal(15) },
      { priceListId: wholesaleGB.id, minQty: 50,  discountType: 'pct', discountValue: new Prisma.Decimal(5) },
      { priceListId: wholesaleGB.id, minQty: 200, discountType: 'pct', discountValue: new Prisma.Decimal(10) },
    ],
  });

  // Default admin user (for quick dashboard testing)
  const adminEmail = 'admin@gnsspices.test';
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await argon2.hash('ChangeMeNow!123', { type: argon2.argon2id }),
        firstName: 'GNS',
        lastName: 'Admin',
        emailVerifiedAt: new Date(),
        defaultRegion: 'GB',
        defaultCurrency: 'GBP',
      },
    });
    await prisma.staffRole.create({ data: { userId: admin.id, role: 'super_admin' } });
    console.log(`  + Admin created: ${adminEmail}  /  ChangeMeNow!123`);
  }

  await seedShopCatalog(prisma);

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
