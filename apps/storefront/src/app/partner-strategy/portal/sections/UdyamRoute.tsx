'use client';

import { usePortal } from '../store';
import { Panel, SectionHead } from '../ui';

/* ------------------------------------------------------------------ */
/*  DATA                                                                */
/* ------------------------------------------------------------------ */

const BENEFITS: { n: string; title: string; body: string }[] = [
  {
    n: '1',
    title: 'An existing product portfolio',
    body:
      "You don't have to invent a product. You start with an existing range — spices, blended masalas, papad, pickles — including proven ₹5 and ₹10 pack formats.",
  },
  {
    n: '2',
    title: 'Defined territory opportunity',
    body:
      'Depending on your level and capability, develop a village, block, tehsil, district, region — or ultimately a whole state. The larger the demonstrated performance, the larger the territory.',
  },
  {
    n: '3',
    title: 'Trading margin',
    body:
      'Buy at your commercial level and sell into the next. That is your first income stream: Buy → Distribute → Sell → Earn.',
  },
  {
    n: '4',
    title: 'Volume-based earnings',
    body:
      'Turnover drives rupee profit. ₹2 lakh, ₹10 lakh, ₹50 lakh, ₹1 crore of sales each move you into a materially different level of earnings — not by negotiating a bigger percentage, but by growing genuine business.',
  },
  {
    n: '5',
    title: 'Performance & growth benefits',
    body:
      'Volume, growth, retailer activation, reorders, territory development and product-mix depth all unlock additional benefits beyond the trading margin. Perform more, unlock more.',
  },
  {
    n: '6',
    title: 'A retail network below you',
    body:
      'You are not selling alone. Progressively you build Wholesalers → Channel Partners → Retail Coordinators → Retailers → Consumers. Your business becomes more valuable as the network becomes productive.',
  },
  {
    n: '7',
    title: 'Demand support from UDAAN',
    body:
      "You don't have to create all consumer demand yourself. Alongside your distribution work, GNS UDAAN is a community-led ecosystem generating retail demand. UDAAN creates it; UDYAM fulfils it.",
  },
  {
    n: '8',
    title: 'Real progression',
    body:
      'Retailer → Channel Partner → Distributor → District Partner → Regional Partner → State Partner. Your opportunity grows with demonstrated capability, not tenure.',
  },
];

const WHO_ITS_FOR: string[] = [
  'Existing distributors',
  'Wholesalers',
  'FMCG traders',
  'Retailers wanting to expand',
  'Business owners',
  'Sales professionals',
  'Local entrepreneurs',
  'People with strong retailer networks',
  'People wanting to build a district or territory business',
  'Existing UDAAN entrepreneurs ready for the next stage',
];

const JOURNEY: { step: string; label: string; body: string }[] = [
  { step: '1', label: 'JOIN',      body: 'Choose the appropriate territory and business level.' },
  { step: '2', label: 'SET UP',    body: 'Products, territory, commercial terms and training in place.' },
  { step: '3', label: 'BUILD',     body: 'Recruit and activate retailers and channel partners.' },
  { step: '4', label: 'SELL',      body: 'Develop consistent market sales.' },
  { step: '5', label: 'REORDER',   body: 'Build repeat business — the real engine of distribution.' },
  { step: '6', label: 'SCALE',     body: 'Increase outlets, geography and product penetration.' },
  { step: '7', label: 'EARN MORE', body: 'Trading profit plus volume and performance benefits compound.' },
  { step: '8', label: 'BUILD AN ENTERPRISE', body: 'That is what UDYAM should mean to you — an asset, not a commission.' },
];

const PROGRESSION: string[] = [
  'Retailer',
  'Channel Partner',
  'Distributor',
  'District Partner',
  'Regional Partner',
  'State Partner',
];

const COMPARE: [string, string, string][] = [
  ['What is it?',            'Distribution business opportunity',   'Community income opportunity'],
  ['Who is it for?',         'Business builders',                    'Anyone wanting to start smaller'],
  ['What do I need?',        'Capital + capability + territory',     'Relationships + activity + commitment'],
  ['Do I carry stock?',      'Usually yes',                          'Not necessarily'],
  ['Do I need a warehouse?', 'Depending on level',                   'No at entry level'],
  ['How do I earn?',         'Trading + volume + growth benefits',   'Sales + activation + performance'],
  ['What am I building?',    'A distribution enterprise',            'A customer / community network'],
  ['Can I grow?',            'Local → District → Regional → State',  'Customer → Entrepreneur → UDYAM'],
  ['Primary promise',        'Build Your Business',                  'Start Small. Earn. Grow.'],
];

/* ------------------------------------------------------------------ */
/*  ROOT                                                               */
/* ------------------------------------------------------------------ */

export default function UdyamRoute() {
  const routeChoice = usePortal((s) => s.routeChoice);
  const patch = usePortal((s) => s.patch);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 no-print">
        <div />
        <button
          onClick={() => window.print()}
          className="btn btn-primary"
          style={{ fontSize: 11 }}
        >
          Print / Save PDF
        </button>
      </div>

      <SectionHead
        n="04"
        title="🏢 GNS UDYAM · Build Your Distribution Business"
        subtitle="For people who want to invest, distribute, develop a territory and build a scalable business. Shareable page — send this to prospective distribution partners."
      />

      {/* HERO */}
      <div
        className="mb-8 rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(176,141,58,0.14) 0%, rgba(0,0,0,0.20) 100%)',
          border: '1px solid rgba(176,141,58,0.30)',
        }}
      >
        <div
          className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3"
          style={{ color: 'var(--pt-gold-hi)' }}
        >
          GNS UDYAM · उद्यम
        </div>
        <h1
          className="text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight max-w-3xl"
          style={{ color: 'var(--pt-off)' }}
        >
          Build Your Own{' '}
          <span style={{ color: 'var(--pt-gold-hi)' }}>Distribution Business.</span>
        </h1>
        <p
          className="mt-5 text-base md:text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--pt-muted-hi)' }}
        >
          UDYAM is the enterprise route. It is for people who want to build{' '}
          <strong style={{ color: 'var(--pt-off)' }}>Products + Territory + Customers +
          Retailers + Distribution + Repeat Sales = a Business Asset.</strong>{' '}
          Not just a monthly commission — a business you own and grow.
        </p>
      </div>

      {/* WHAT IS UDYAM */}
      <Panel title="What is UDYAM?" className="mb-6">
        <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--pt-text)' }}>
          <strong style={{ color: 'var(--pt-off)' }}>UDYAM (उद्यम)</strong>{' '}
          represents <em>enterprise, entrepreneurship and business endeavour</em>.
          GNS UDYAM is designed for people who want to participate in the
          commercial distribution of products and progressively build a
          territory-based business — not merely buy and resell.
        </p>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--pt-muted-hi)' }}>
          The key distinction:{' '}
          <strong style={{ color: 'var(--pt-gold-hi)' }}>
            UDYAM is for someone who wants to build a BUSINESS, not simply earn a commission.
          </strong>
        </p>
      </Panel>

      {/* WHO IT'S FOR */}
      <Panel title="Who UDYAM is for" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
          {WHO_ITS_FOR.map((w) => (
            <div key={w} className="flex items-start gap-2 text-sm" style={{ color: 'var(--pt-text)' }}>
              <span style={{ color: 'var(--pt-gold-hi)', lineHeight: '1.5' }}>▸</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* BENEFITS — 8 cards */}
      <div className="mb-8">
        <h3
          className="text-lg md:text-xl font-semibold mb-4"
          style={{ color: 'var(--pt-off)' }}
        >
          What&apos;s in it for an UDYAM Partner?
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {BENEFITS.map((b) => (
            <div
              key={b.n}
              className="p-5 rounded-xl"
              style={{
                background: 'rgba(176,141,58,0.05)',
                border: '1px solid rgba(176,141,58,0.20)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mono font-bold shrink-0"
                  style={{
                    background: 'rgba(176,141,58,0.16)',
                    color: 'var(--pt-gold-hi)',
                    border: '1px solid rgba(176,141,58,0.40)',
                  }}
                >
                  {b.n}
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold" style={{ color: 'var(--pt-off)' }}>
                    {b.title}
                  </div>
                  <div className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--pt-muted-hi)' }}>
                    {b.body}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JOURNEY */}
      <div className="mb-8">
        <h3
          className="text-lg md:text-xl font-semibold mb-4"
          style={{ color: 'var(--pt-off)' }}
        >
          UDYAM participant journey
        </h3>
        <Panel padded={false}>
          <div className="p-4 md:p-5 space-y-2">
            {JOURNEY.map((j, i) => {
              const isFinal = i === JOURNEY.length - 1;
              return (
                <div key={j.step}>
                  <div
                    className="flex items-center gap-4 p-3 rounded-md"
                    style={{
                      background: isFinal
                        ? 'rgba(176,141,58,0.14)'
                        : 'rgba(255,255,255,0.02)',
                      border: isFinal
                        ? '1px solid rgba(176,141,58,0.45)'
                        : '1px solid var(--pt-line)',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center mono text-sm font-bold shrink-0"
                      style={{
                        background: isFinal
                          ? 'rgba(176,141,58,0.28)'
                          : 'rgba(255,255,255,0.04)',
                        color: isFinal ? 'var(--pt-gold-hi)' : 'var(--pt-muted-hi)',
                        border: `1px solid ${isFinal ? 'rgba(176,141,58,0.55)' : 'var(--pt-line-hi)'}`,
                      }}
                    >
                      {j.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-bold ${isFinal ? 'text-lg' : 'text-sm'} tracking-widest uppercase`}
                        style={{ color: isFinal ? 'var(--pt-gold-hi)' : 'var(--pt-off)' }}
                      >
                        {j.label}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--pt-muted-hi)' }}
                      >
                        {j.body}
                      </div>
                    </div>
                  </div>
                  {i < JOURNEY.length - 1 && (
                    <div
                      className="ml-[22px] my-1 h-3 border-l"
                      style={{ borderColor: 'rgba(255,255,255,0.12)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* PROGRESSION */}
      <div className="mb-8">
        <h3
          className="text-lg md:text-xl font-semibold mb-4"
          style={{ color: 'var(--pt-off)' }}
        >
          The progression opportunity
        </h3>
        <p
          className="text-sm mb-4 max-w-3xl"
          style={{ color: 'var(--pt-muted)' }}
        >
          You are not fixed at a single level. Your opportunity grows with
          demonstrated capability.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {PROGRESSION.map((p, i, arr) => (
            <div key={p} className="flex items-center gap-2">
              <div
                className="px-4 py-2.5 rounded-md text-sm font-semibold"
                style={{
                  background:
                    i === arr.length - 1
                      ? 'rgba(176,141,58,0.16)'
                      : 'rgba(255,255,255,0.03)',
                  border:
                    i === arr.length - 1
                      ? '1px solid rgba(176,141,58,0.45)'
                      : '1px solid var(--pt-line-hi)',
                  color:
                    i === arr.length - 1 ? 'var(--pt-gold-hi)' : 'var(--pt-off)',
                }}
              >
                {p}
              </div>
              {i < arr.length - 1 && (
                <span
                  style={{ color: 'var(--pt-gold)', fontSize: 18 }}
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PROMISE STATEMENT */}
      <Panel tone="hi" className="mb-8">
        <div className="text-center">
          <div
            className="text-[11px] tracking-[0.35em] uppercase font-bold mb-2"
            style={{ color: 'var(--pt-gold-hi)' }}
          >
            The UDYAM promise
          </div>
          <div
            className="text-xl md:text-2xl font-semibold leading-tight max-w-3xl mx-auto"
            style={{ color: 'var(--pt-off)' }}
          >
            &ldquo;The more productive your territory becomes, the greater
            your business opportunity.&rdquo;
          </div>
        </div>
      </Panel>

      {/* COMPARE / NOT SURE */}
      <div className="mb-8">
        <h3
          className="text-lg md:text-xl font-semibold mb-4"
          style={{ color: 'var(--pt-off)' }}
        >
          Not sure? Compare UDYAM with UDAAN
        </h3>
        <Panel padded={false}>
          <div className="scroll-x">
            <table className="data row-alt">
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>Participant question</th>
                  <th style={{ color: 'var(--pt-gold-hi)' }}>🏢 UDYAM</th>
                  <th style={{ color: 'var(--pt-emerald-3)' }}>🚀 UDAAN</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([q, u, a]) => (
                  <tr key={q}>
                    <td style={{ color: 'var(--pt-muted)' }}>{q}</td>
                    <td style={{ color: 'var(--pt-off)' }}>{u}</td>
                    <td style={{ color: 'var(--pt-text)' }}>{a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* INTEGRITY STATEMENT */}
      <Panel className="mb-8">
        <div
          className="text-[11px] tracking-[0.35em] uppercase font-bold mb-2"
          style={{ color: 'var(--pt-gold-hi)' }}
        >
          How you earn — with integrity
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--pt-text)' }}>
          <strong style={{ color: 'var(--pt-off)' }}>
            No joining-based income. No reward simply for recruiting people.
          </strong>{' '}
          Earnings are driven by genuine product sales, market development
          and repeat business.
        </p>
      </Panel>

      {/* CTA */}
      <div className="mb-6">
        <h3
          className="text-lg md:text-xl font-semibold mb-3"
          style={{ color: 'var(--pt-off)' }}
        >
          Interested in UDYAM?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() =>
              patch({
                routeChoice: { ...routeChoice, chosen: 'udyam' },
              })
            }
            className="p-4 rounded-xl text-left transition"
            style={{
              background:
                routeChoice.chosen === 'udyam'
                  ? 'linear-gradient(180deg, rgba(176,141,58,0.20) 0%, rgba(176,141,58,0.06) 100%)'
                  : 'rgba(176,141,58,0.06)',
              border: '1px solid rgba(176,141,58,0.45)',
            }}
          >
            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--pt-gold-hi)' }}>
              Choose route
            </div>
            <div
              className="mt-1 text-sm font-semibold"
              style={{ color: 'var(--pt-off)' }}
            >
              {routeChoice.chosen === 'udyam' ? '● UDYAM selected' : 'I want UDYAM'}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: 'var(--pt-muted)' }}>
              Records your interest locally
            </div>
          </button>

          <div className="md:col-span-2">
            <input
              className="input w-full"
              placeholder={
                routeChoice.chosen === 'udyam'
                  ? 'Which UDYAM level fits you? e.g. Regional Partner · Uttar Pradesh'
                  : 'Select UDYAM first, then tell us the level and territory that fits you'
              }
              value={routeChoice.role}
              disabled={routeChoice.chosen !== 'udyam'}
              onChange={(e) =>
                patch({
                  routeChoice: { ...routeChoice, role: e.target.value },
                })
              }
              style={{ height: 44 }}
            />
            <p
              className="mt-2 text-[11px]"
              style={{ color: 'var(--pt-muted-2)' }}
            >
              Your interest is saved to your browser only. To formally begin
              the conversation, contact your GNS partnerships point of
              contact and share what you have entered here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
