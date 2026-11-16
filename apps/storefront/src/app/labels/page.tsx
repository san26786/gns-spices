import { barcodeSpec, barcodeSvg, CODES_BASE_URL, listCodes, qrSvg, scanUrl, type CodesListItem } from '@/lib/codes';
import { PrintButton } from './print-button';

// Every product's QR code and every pack's barcode, generated from the live
// database on each request. Print this page or download single files for artwork.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Product QR codes & barcodes — GNS Spices',
  robots: { index: false, follow: false },
};

const fmtWeight = (g: number) => (g >= 1000 ? `${g / 1000}kg` : `${g}g`);

export default async function LabelsPage() {
  const products = await listCodes();
  const packs = products.reduce((n, p) => n + p.variants.length, 0);

  const cards = await Promise.all(
    products.map(async (p) => ({
      p,
      qr: await qrSvg(p.skuRoot),
      bars: p.variants.map((v) => ({ v, svg: barcodeSvg(v.sku, v.barcode), spec: barcodeSpec(v.sku, v.barcode) })),
    })),
  );

  return (
    <div className="labels-page max-w-7xl mx-auto px-6 py-14 text-white">
      <style>{PRINT_CSS}</style>

      <div className="no-print flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <span className="gold-rule">Packaging</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-4">Product QR codes &amp; barcodes</h1>
          <p className="mt-4 text-zinc-300 leading-relaxed">
            {products.length} products · {packs} packs. Each QR code opens{' '}
            <code className="text-amber-300">{CODES_BASE_URL}/p/&lt;code&gt;</code>, and each barcode carries the pack’s SKU.
            Scans are looked up in the database every time, so changing a product’s name, price, description or
            page never needs a new code. Only print new codes for new products or packs.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="mt-12 grid gap-6">
        {cards.map(({ p, qr, bars }) => (
          <ProductCard key={p.skuRoot} p={p} qr={qr} bars={bars} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  p,
  qr,
  bars,
}: {
  p: CodesListItem;
  qr: string;
  bars: { v: CodesListItem['variants'][number]; svg: string; spec: ReturnType<typeof barcodeSpec> }[];
}) {
  return (
    <section className="label-card glass-card p-6 md:p-7 grid md:grid-cols-[200px_minmax(0,1fr)] gap-7">
      <div>
        <div className="bg-white rounded-xl p-2 w-[200px] max-w-full" dangerouslySetInnerHTML={{ __html: qr }} />
        <p className="mt-2 font-mono text-xs text-zinc-400 break-all">{scanUrl(p.skuRoot)}</p>
        <p className="no-print mt-2 text-xs flex gap-3">
          <a className="text-amber-400 hover:text-amber-300" href={`/api/codes/qr/${p.skuRoot}?download`}>SVG</a>
          <a className="text-amber-400 hover:text-amber-300" href={`/api/codes/qr/${p.skuRoot}?format=png&download`}>PNG</a>
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-2xl font-bold">{p.name}</h2>
          <span className="font-mono text-sm text-amber-300">{p.skuRoot}</span>
          {p.category && <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">{p.category.name}</span>}
          {!p.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">Inactive</span>}
          {p.isB2bOnly && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300">B2B only</span>}
        </div>

        {bars.length === 0 ? (
          <p className="mt-4 text-zinc-400 text-sm">No packs yet. Add a variant in the database to get a barcode.</p>
        ) : (
          <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {bars.map(({ v, svg, spec }) => (
              <figure key={v.sku} className="bar-cell m-0 min-w-0">
                <div className="bg-white rounded-lg p-2 [&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
                <figcaption className="mt-2 text-sm">
                  <span className="font-semibold">{v.label ?? `${fmtWeight(v.weightGrams)} · ${v.packaging}`}</span>
                  <span className="block text-xs text-zinc-400">
                    {spec.bcid === 'ean13' ? `EAN-13 · SKU ${v.sku}` : `Code 128 · no GTIN yet`}
                    {!v.isActive && ' · inactive'}
                  </span>
                  <span className="no-print text-xs flex gap-3 mt-1">
                    <a className="text-amber-400 hover:text-amber-300" href={`/api/codes/barcode/${v.sku}?download`}>SVG</a>
                    <a className="text-amber-400 hover:text-amber-300" href={`/api/codes/barcode/${v.sku}?format=png&download`}>PNG</a>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 10mm; }
  body { background: #fff !important; color: #000 !important; }
  body > *:not(main), .no-print { display: none !important; }
  .label-card h2 { flex: 1 1 100%; font-size: 18pt !important; }
  .labels-page { color: #000 !important; padding: 0 !important; max-width: none !important; }
  .label-card { background: #fff !important; border: 1px solid #ccc !important; backdrop-filter: none !important;
    break-inside: avoid; page-break-inside: avoid; grid-template-columns: 150px minmax(0,1fr) !important; padding: 12px !important; }
  .label-card * { color: #000 !important; }
  .label-card > div > div:first-child { width: 150px !important; }
  .bar-cell { break-inside: avoid; }
  .label-card .grid { grid-template-columns: repeat(3, minmax(0,1fr)) !important; }
}
`;
