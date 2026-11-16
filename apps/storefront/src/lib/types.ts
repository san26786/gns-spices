// Shared API response types. Kept thin — nothing that needs regenerating.

export type Region = 'GB' | 'IN' | 'AE' | 'SA' | 'US' | 'EU';

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  brand: string;
  originCountry: string | null;
  category: { id: string; slug: string; name: string } | null;
  image: { s3Key: string; altText: string | null } | null;
  previewVariant: { id: string; sku: string; weightGrams: number; packaging: string } | null;
}

export interface ProductDetail extends Omit<ProductListItem, 'previewVariant' | 'image'> {
  skuRoot: string;
  longDesc: string | null;
  isB2bOnly: boolean;
  media: Array<{ id: string; kind: string; s3Key: string; altText: string | null }>;
  region: {
    code: string;
    ingredients: string | null;
    allergenInfo: string | null;
    certifications: string[];
    nutrition: unknown;
  };
  variants: Array<{
    id: string;
    sku: string;
    label: string | null;
    weightGrams: number;
    packaging: string;
    barcode: string | null;
  }>;
}

export interface PriceResponse {
  variantId: string;
  qty: number;
  unitPrice: string;
  baseUnitPrice: string;
  currency: string;
  lineTotal: string;
  priceList: string;
  ladder: Array<{ minQty: number; unitPrice: string; currency: string }>;
}

export interface CartResponse {
  id: string;
  region: string;
  currency: string;
  itemCount: number;
  subtotal: string;
  items: Array<{
    id: string;
    variantId: string;
    sku: string;
    productSlug: string;
    productName: string;
    weightGrams: number;
    packaging: string;
    qty: number;
    unitPrice: string;
    baseUnitPrice: string;
    discountPerUnit: string;
    lineTotal: string;
  }>;
}
