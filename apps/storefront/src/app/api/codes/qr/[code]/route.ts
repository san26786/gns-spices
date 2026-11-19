import { NextResponse } from 'next/server';
import { lookupCode, qrPng, qrSvg } from '@/lib/codes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/codes/qr/GNS-101            → SVG (vector, for packaging artwork)
// GET /api/codes/qr/GNS-101?format=png → 1024px PNG
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const hit = await lookupCode(decodeURIComponent(raw));
  if (!hit) return NextResponse.json({ error: 'code_not_found' }, { status: 404 });

  const code = hit.code;
  const url = new URL(req.url);
  const download = url.searchParams.has('download');
  const disposition = (ext: string) =>
    `${download ? 'attachment' : 'inline'}; filename="${code}-qr.${ext}"`;

  if (url.searchParams.get('format') === 'png') {
    const size = Math.min(Math.max(Number(url.searchParams.get('size')) || 1024, 128), 4096);
    const png = await qrPng(code, size);
    return new NextResponse(new Uint8Array(png), {
      headers: { 'content-type': 'image/png', 'content-disposition': disposition('png') },
    });
  }
  return new NextResponse(await qrSvg(code), {
    headers: { 'content-type': 'image/svg+xml', 'content-disposition': disposition('svg') },
  });
}
