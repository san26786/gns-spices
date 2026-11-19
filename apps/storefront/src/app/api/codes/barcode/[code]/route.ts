import { NextResponse } from 'next/server';
import { barcodePng, barcodeSvg, lookupCode } from '@/lib/codes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/codes/barcode/GNS-101-H100            → SVG
// GET /api/codes/barcode/GNS-101-H100?format=png → PNG
// Encodes the pack's GS1 GTIN as EAN-13 when one is saved in the database,
// otherwise Code 128 of the SKU.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const hit = await lookupCode(decodeURIComponent(raw));
  if (!hit) return NextResponse.json({ error: 'code_not_found' }, { status: 404 });

  const code = hit.variant?.sku ?? hit.product.skuRoot;
  const gtin = hit.variant?.barcode;
  const url = new URL(req.url);
  const download = url.searchParams.has('download');
  const disposition = (ext: string) =>
    `${download ? 'attachment' : 'inline'}; filename="${code}-barcode.${ext}"`;

  if (url.searchParams.get('format') === 'png') {
    const png = await barcodePng(code, gtin);
    return new NextResponse(new Uint8Array(png), {
      headers: { 'content-type': 'image/png', 'content-disposition': disposition('png') },
    });
  }
  return new NextResponse(barcodeSvg(code, gtin), {
    headers: { 'content-type': 'image/svg+xml', 'content-disposition': disposition('svg') },
  });
}
