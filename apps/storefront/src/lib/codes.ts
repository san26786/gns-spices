// Server-only helpers for product QR codes and barcodes.
//
// How "dynamic" codes work: a printed QR code only contains a permanent link
// (https://www.gnsspices.com/p/<CODE>) and a printed barcode only contains the
// permanent <CODE> itself (variant SKU, or its GS1 GTIN once assigned). Nothing
// else is baked into the print. Every scan looks the code up in the database,
// so names, prices, slugs and descriptions can change without reprinting.

import QRCode from 'qrcode';
import bwipjs from 'bwip-js/node';
import { apiFetch, ApiError } from '@/lib/api';

/** Public domain the printed QR codes point at. Must be the live site, never localhost. */
export const CODES_BASE_URL = (process.env.CODES_BASE_URL ?? 'https://www.gnsspices.com').replace(/\/+$/, '');

export const scanUrl = (code: string) => `${CODES_BASE_URL}/p/${encodeURIComponent(code)}`;

export interface CodeVariant {
  sku: string;
  label: string | null;
  weightGrams: number;
  packaging: string;
  barcode: string | null;
  isActive: boolean;
}

export interface CodeLookup {
  code: string;
  kind: 'product' | 'variant';
  product: {
    slug: string;
    skuRoot: string;
    name: string;
    shortDesc: string | null;
    isActive: boolean;
    category: { slug: string; name: string } | null;
  };
  variant: CodeVariant | null;
  variants: CodeVariant[];
}

export interface CodesListItem {
  slug: string;
  skuRoot: string;
  name: string;
  isActive: boolean;
  isB2bOnly: boolean;
  category: { slug: string; name: string } | null;
  variants: CodeVariant[];
}

/** Live lookup, never cached, so a scan always reflects the database. */
export async function lookupCode(code: string): Promise<CodeLookup | null> {
  try {
    return await apiFetch<CodeLookup>(`/products/by-code/${encodeURIComponent(code)}`, { cache: 'no-store' });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function listCodes(): Promise<CodesListItem[]> {
  const res = await apiFetch<{ data: CodesListItem[] }>('/products/codes', { cache: 'no-store' });
  return res.data;
}

/** Valid GS1 EAN-13 (13 digits with a correct check digit). */
export function isEan13(value: string | null | undefined): value is string {
  if (!value || !/^\d{13}$/.test(value)) return false;
  const digits = value.split('').map(Number);
  const sum = digits.slice(0, 12).reduce((acc, d, i) => acc + d * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === digits[12];
}

/** What a barcode should encode: the GTIN when one is assigned, otherwise the SKU / skuRoot. */
export function barcodeSpec(code: string, gtin?: string | null) {
  return isEan13(gtin)
    ? { bcid: 'ean13' as const, text: gtin, human: gtin }
    : { bcid: 'code128' as const, text: code, human: code };
}

const QR_OPTS = { errorCorrectionLevel: 'M' as const, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } };

export function qrSvg(code: string) {
  return QRCode.toString(scanUrl(code), { ...QR_OPTS, type: 'svg' });
}

export function qrPng(code: string, width = 1024) {
  return QRCode.toBuffer(scanUrl(code), { ...QR_OPTS, type: 'png', width });
}

function barcodeOptions(code: string, gtin?: string | null) {
  const spec = barcodeSpec(code, gtin);
  return {
    bcid: spec.bcid,
    text: spec.text,
    scale: 3,
    height: 14,
    includetext: true,
    textxalign: 'center' as const,
    textsize: 10,
    paddingwidth: 6,
    paddingheight: 4,
    backgroundcolor: 'FFFFFF',
  };
}

export function barcodeSvg(code: string, gtin?: string | null) {
  return bwipjs.toSVG(barcodeOptions(code, gtin));
}

export function barcodePng(code: string, gtin?: string | null) {
  return bwipjs.toBuffer(barcodeOptions(code, gtin));
}
