import Link from 'next/link';

export default function PrivateLabelPage() {
  return (
    <div className="text-white">
      <section className="relative overflow-hidden hero-backdrop">
        <div className="absolute inset-0 bg-black/40" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <span className="gold-rule">Private label manufacturing</span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-5 max-w-3xl leading-tight">
            Launch your spice brand. <span className="text-amber-400">We&apos;ll make the rest.</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-300 max-w-2xl leading-relaxed">
            From formulation and packaging design to QC and export — one partner, one price, one shipment.
          </p>
          <Link href="/private-label/apply" className="btn-primary mt-10">Start a project</Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <span className="gold-rule">The process</span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-5 mb-12">How it works</h2>
        <ol className="space-y-6">
          {[
            ['Submit brief',          'Share your brand, target regions, estimated volumes, and any spec you have.'],
            ['Feasibility review',    'Our PL team confirms viability and assigns a project manager within 48 hours.'],
            ['Product selection',     'Pick from our SKUs or co-develop custom blends.'],
            ['Formulation & samples', 'We ship samples in 2–3 weeks. You sign off before mass production.'],
            ['Packaging design',      'Upload logos and artwork — our design team prepares print-ready proofs.'],
            ['Production & QC',       'Batch production with COA (Certificate of Analysis) for every lot.'],
            ['Export & deliver',      'Handled end-to-end: labels, HS codes, compliance docs, shipping.'],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-5 items-start">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500 text-amber-950 font-bold flex items-center justify-center shadow-amber">
                {i + 1}
              </span>
              <div>
                <h4 className="text-xl font-bold">{title}</h4>
                <p className="text-zinc-400 mt-1">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-white/10 bg-black/40">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h3 className="text-3xl font-bold tracking-tight">Minimum order: 500 units per SKU</h3>
          <p className="text-zinc-400 mt-3">Typical lead time 8–12 weeks. Smaller pilot runs considered case-by-case.</p>
          <Link href="/private-label/apply" className="btn-primary mt-8">Start a project</Link>
        </div>
      </section>
    </div>
  );
}
