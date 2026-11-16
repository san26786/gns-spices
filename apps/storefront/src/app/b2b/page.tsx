import Link from 'next/link';

export default function B2BPage() {
  return (
    <div className="text-white">
      <section className="relative overflow-hidden hero-backdrop">
        <div className="absolute inset-0 bg-black/40" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="gold-rule">For trade</span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-5 leading-tight">
              Spices for <span className="text-amber-400">serious kitchens.</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-300 max-w-prose leading-relaxed">
              Tiered pricing, credit terms, and logistics built for restaurants, retailers, and distributors across the UK, India, and the Middle East.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/b2b/apply" className="btn-primary">Apply for a business account</Link>
              <Link href="/b2b/quote" className="btn-ghost">Request a quote</Link>
            </div>
          </div>
          <Stats />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-6">
        <Tier name="Retailer" perks={['5–15% off retail', 'Net 0 prepaid', 'Order online 24/7']} />
        <Tier name="Wholesale" perks={['15–25% off retail', 'Bulk SKUs (5kg, 25kg)', 'Net 30 on approval']} highlight />
        <Tier name="Distributor" perks={['Custom contract pricing', 'Dedicated account manager', 'Container-load logistics']} />
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-white/10">
        <span className="gold-rule">The process</span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-5 mb-10">How it works</h2>
        <ol className="space-y-6">
          <Step n={1} title="Apply">Share your legal name, tax ID, and what you sell.</Step>
          <Step n={2} title="Verify">Our ops team verifies within 1–2 business days.</Step>
          <Step n={3} title="Get pricing">Assigned tier + custom quote if needed.</Step>
          <Step n={4} title="Order">Dashboard for recurring orders, reorders, and tracking.</Step>
        </ol>
      </section>
    </div>
  );
}

function Stats() {
  return (
    <dl className="grid grid-cols-2 gap-4">
      {[
        ['4', 'regions served'],
        ['120+', 'B2B customers'],
        ['25kg', 'max bulk SKU'],
        ['24h', 'RFQ response'],
      ].map(([value, label]) => (
        <div key={label} className="glass-card p-6">
          <dt className="text-4xl font-bold text-amber-400">{value}</dt>
          <dd className="text-zinc-300 mt-1">{label}</dd>
        </div>
      ))}
    </dl>
  );
}

function Tier({ name, perks, highlight }: { name: string; perks: string[]; highlight?: boolean }) {
  return (
    <div
      className={
        highlight
          ? 'gloss bg-gradient-to-br from-spice-chili via-spice-red to-spice-maroon text-white rounded-2xl p-8 ring-1 ring-amber-400/40 shadow-amber overflow-hidden'
          : 'glass-card p-8'
      }
    >
      <h3 className={`text-2xl font-bold mb-4 ${highlight ? 'text-white' : 'text-amber-400'}`}>{name}</h3>
      <ul className={`space-y-2 text-sm ${highlight ? 'text-white/90' : 'text-zinc-300'}`}>
        {perks.map((p) => <li key={p}>• {p}</li>)}
      </ul>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-5 items-start">
      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500 text-amber-950 font-bold flex items-center justify-center shadow-amber">
        {n}
      </span>
      <div>
        <h4 className="text-xl font-bold text-white">{title}</h4>
        <p className="text-zinc-400 mt-1">{children}</p>
      </div>
    </li>
  );
}
