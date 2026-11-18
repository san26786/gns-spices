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
/** "100g · 500g · 1kg" → [100, 500, 1000] */
export declare function parsePack(pack: string | undefined): number[];
export declare function seedShopCatalog(prisma: PrismaClient): Promise<void>;
