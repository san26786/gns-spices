export type CatalogCategory = 'powders' | 'seeds' | 'masalas' | 'whole' | 'pickles';
/** Consumer-facing tier names. Same vocabulary across every product so shoppers
 *  can compare like-for-like across the range. */
export type GradeTier = 'Home Kitchen' | 'Professional Choice' | "Chef's Reserve";
export interface CatalogVariant {
    /** Tier name for multi-grade products. Omitted for single-grade items
     *  (those render as "House Selection"). */
    tier?: GradeTier;
    /** Origin / grade detail shown as supporting copy beneath the tier */
    description: string;
    /** Default retail pack sizes */
    pack?: string;
}
/** Visual styling for each tier badge — tuned for the dark theme */
export declare const TIER_BADGE: Record<GradeTier, string>;
export interface CatalogProduct {
    slug: string;
    name: string;
    shortDesc: string;
    origin: string;
    category: CatalogCategory;
    variants: CatalogVariant[];
    /** Tailwind gradient classes — chosen to match the actual colour of the spice */
    tone: string;
    /** Foreground colour class for text on the tile */
    ink: string;
    /** Decorative emoji shown on the tile */
    icon: string;
}
export declare const CATEGORY_META: Record<CatalogCategory, {
    label: string;
    blurb: string;
}>;
export declare const CATALOG: CatalogProduct[];
/** Per-spice visual identity used as a stand-in for product photography.
 *  Maps a product (by slug or by keywords in its name) to:
 *  - `tone` / `ink` — used by colorful catalog tiles (rich text overlay)
 *  - `pile`        — hex colour of the spice powder, used to draw the
 *                    "powder pile on dark" composition for product cards
 *  - `icon`        — emoji shown above the pile (the "whole spice on top")
 *  - `image`       — optional path to a real product photo. If set, the
 *                    photo replaces the powder-pile fallback. Drop files
 *                    into `/public/products/<slug>.jpg` and reference here. */
export interface ProductVisual {
    tone: string;
    ink: string;
    pile: string;
    icon: string;
    image?: string;
}
/** @deprecated Use `getProductImagesMap()` instead. Kept for backward compat. */
export declare const PRODUCT_IMAGES: Record<string, string>;
/** Resolves the visual for a product given any combination of slug, name, or
 *  category. Order: exact slug match → keyword match on name → category
 *  default → universal default. */
export declare function getProductVisual(input: {
    slug?: string;
    name?: string;
    category?: string;
}): ProductVisual;
export declare function filterCatalog(category?: string, q?: string): CatalogProduct[];
