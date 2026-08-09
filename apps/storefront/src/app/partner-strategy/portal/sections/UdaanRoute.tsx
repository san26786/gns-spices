'use client';

import { usePortal } from '../store';
import { Panel, SectionHead } from '../ui';

/* ------------------------------------------------------------------ */
/*  DATA                                                                */
/* ------------------------------------------------------------------ */

const BENEFITS: { n: string; title: string; body: string }[] = [
  {
    n: '1',
    title: 'Start small',
    body:
      "The entry point is deliberately simple. Start as a customer or member. Use the products. Understand them. Share them. Decide later whether you want to build something larger.",
  },
  {
    n: '2',
    title: 'Save',
    body:
      "Your first benefit doesn't have to be income. Customer offers, loyalty benefits and promotional savings mean the first level of UDAAN is simply: Buy & Save.",
  },
  {
    n: '3',
    title: 'Share',
    body:
      'If you like the products, introduce them to your family, friends, community, retailers or local businesses. Your reward is tied to genuine qualifying sales — not to introducing or recruiting anyone.',
  },
  {
    n: '4',
    title: 'Earn',
    body:
      'As your activity grows, you earn from real commercial outcomes: customer sales, retailer activation, repeat orders, community sales, local demand generation.',
  },
  {
    n: '5',
    title: 'Build recurring income',
    body:
      "The biggest opportunity isn't the first sale — it's the reorder. Grow from 25 to 50 to 100 to 250 active customers; your income compounds as your community grows.",
  },
  {
    n: '6',
    title: 'Become a Retail Coordinator',
    body:
      'Progress beyond consumer referrals. Approach kirana stores, grocery shops, convenience outlets, independent supermarkets and food retailers. Identify → Introduce → Activate → Support → Reorder.',
  },
  {
    n: '7',
    title: 'Become a Community Entrepreneur',
    body:
      'At the next stage you are not merely generating individual sales — you are developing customers, retailers, other coordinators and local demand together. This is where UDAAN becomes a genuine entrepreneurial opportunity.',
  },
];

const WHO_ITS_FOR: string[] = [
  'Existing customers who love the products',
  'Community members with local reach',
  'Students and young adults (where appropriate)',
  'Homemakers',
  'Retired professionals',
  'Shop owners',
  'Salespeople',
  'Local community leaders',
  'Social and community groups',
  'People looking for supplementary income',
  'Aspiring entrepreneurs without capital',
];

const JOURNEY: { step: string; label: string; verb: string; body: string }[] = [
  { step: '1', label: 'CUSTOMER',              verb: 'Buy & Save',      body: 'Use the products at member benefits.' },
  { step: '2', label: 'MEMBER',                verb: 'Use & Learn',     body: 'Understand what you use; become confident.' },
  { step: '3', label: 'ADVOCATE',              verb: 'Share & Earn',    body: 'Bring in genuine customers from your circle.' },
  { step: '4', label: 'COORDINATOR',           verb: 'Activate & Earn', body: 'Onboard retailers and organise a local network.' },
  { step: '5', label: 'COMMUNITY ENTREPRENEUR',verb: 'Build & Grow',    body: 'Lead a local sales community; earn from its growth.' },
  { step: '6', label: 'UDYAM PARTNER',         verb: 'Own & Scale',     body: 'Cross into UDYAM — own a territory, distribute at scale.' },
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

export default function UdaanRoute() {
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
        n="05"
        title="🚀 GNS UDAAN · Start. Earn. Grow. Fly."
        subtitle="For people who want to start with little or no distribution infrastructure — using their relationships and community — and grow into a real income opportunity. Shareable page — send this to prospective community participants."
      />

      {/* HERO */}
      <div
        className="mb-8 rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(21,71,52,0.24) 0%, rgba(0,0,0,0.20) 100%)',
          border: '1px solid rgba(21,71,52,0.55)',
        }}
      >
        <div
          className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3"
          style={{ color: 'var(--pt-emerald-3)' }}
        >
          GNS UDAAN · उड़ान
        </div>
        <h1
          className="text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight max-w-3xl"
          style={{ color: 'var(--pt-off)' }}
        >
          Start Small.{' '}
          <span style={{ color: 'var(--pt-emerald-3)' }}>Earn. Grow. Take Flight.</span>
        </h1>
        <p
          className="mt-5 text-base md:text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--pt-muted-hi)' }}
        >
          You don&apos;t need capital or a warehouse to begin. You need
          <strong style={{ color: 'var(--pt-off)' }}> relationships, energy, local knowledge,
          a community — or the willingness to build one.</strong> UDAAN is
          designed for the person who wants to start small and let their
          effort compound into a real income opportunity.
        </p>
      </div>

      {/* WHAT IS UDAAN */}
      <Panel title="What is UDAAN?" className="mb-6">
        <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--pt-text)' }}>
          <strong style={{ color: 'var(--pt-off)' }}>UDAAN (उड़ान)</strong>{' '}
          represents <em>taking flight, rising and progressing</em>. It is
          designed for someone who thinks:{' '}
          <em>&ldquo;I don&apos;t have the capital to become a distributor.&rdquo;</em>
          {' '}or{' '}
          <em>&ldquo;I don&apos;t have a warehouse.&rdquo;</em>{' '}or{' '}
          <em>&ldquo;I&apos;ve never operated an FMCG business.&rdquo;</em>
        </p>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--pt-muted-hi)' }}>
          The proposition is simple:{' '}
          <strong style={{ color: 'var(--pt-emerald-3)' }}>
            You don&apos;t need to start by investing heavily in stock. Start
            by creating genuine customers and demand.
          </strong>
        </p>
      </Panel>

      {/* WHO CAN START */}
      <Panel title="Who can start with UDAAN?" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
          {WHO_ITS_FOR.map((w) => (
            <div key={w} className="flex items-start gap-2 text-sm" style={{ color: 'var(--pt-text)' }}>
              <span style={{ color: 'var(--pt-emerald-3)', lineHeight: '1.5' }}>▸</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* BENEFITS — 7 cards */}
      <div className="mb-8">
        <h3
          className="text-lg md:text-xl font-semibold mb-4"
          style={{ color: 'var(--pt-off)' }}
        >
          What&apos;s in it for an UDAAN Participant?
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {BENEFITS.map((b) => (
            <div
              key={b.n}
              className="p-5 rounded-xl"
              style={{
                background: 'rgba(21,71,52,0.10)',
                border: '1px solid rgba(21,71,52,0.35)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mono font-bold shrink-0"
                  style={{
                    background: 'rgba(21,71,52,0.30)',
                    color: 'var(--pt-emerald-3)',
                    border: '1px solid rgba(21,71,52,0.55)',
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
          UDAAN participant journey
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
                        : 'rgba(21,71,52,0.10)',
                      border: isFinal
                        ? '1px solid rgba(176,141,58,0.45)'
                        : '1px solid rgba(21,71,52,0.35)',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center mono text-sm font-bold shrink-0"
                      style={{
                        background: isFinal
                          ? 'rgba(176,141,58,0.28)'
                          : 'rgba(21,71,52,0.30)',
                        color: isFinal ? 'var(--pt-gold-hi)' : 'var(--pt-emerald-3)',
                        border: `1px solid ${
                          isFinal ? 'rgba(176,141,58,0.55)' : 'rgba(21,71,52,0.60)'
                        }`,
                      }}
                    >
                      {j.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span
                          className={`font-bold ${isFinal ? 'text-lg' : 'text-base'} tracking-widest uppercase`}
                          style={{ color: isFinal ? 'var(--pt-gold-hi)' : 'var(--pt-off)' }}
                        >
                          {j.label}
                        </span>
                        <span
                          className="text-[11px] tracking-widest uppercase font-bold"
                          style={{
                            color: isFinal ? 'var(--pt-gold-hi)' : 'var(--pt-emerald-3)',
                          }}
                        >
                          &ldquo;{j.verb}&rdquo;
                        </span>
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--pt-muted-hi)' }}
                      >
                        {j.body}
                      </div>
                    </div>
                    {isFinal && (
                      <span
                        className="tag tag-gold shrink-0"
                        title="Cross-over into the UDYAM enterprise route"
                      >
                        → UDYAM
                      </span>
                    )}
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
        <p
          className="mt-3 text-sm max-w-3xl"
          style={{ color: 'var(--pt-muted-hi)' }}
        >
          <strong style={{ color: 'var(--pt-off)' }}>
            UDAAN can be the runway. UDYAM can be the enterprise.
          </strong>{' '}
          The last transition is important — a person who begins as a
          customer can walk this ladder all the way to owning a distribution
          territory.
        </p>
      </div>

      {/* PROMISE STATEMENT */}
      <Panel tone="hi" className="mb-8">
        <div className="text-center">
          <div
            className="text-[11px] tracking-[0.35em] uppercase font-bold mb-2"
            style={{ color: 'var(--pt-emerald-3)' }}
          >
            The UDAAN promise
          </div>
          <div
            className="text-xl md:text-2xl font-semibold leading-tight max-w-3xl mx-auto"
            style={{ color: 'var(--pt-off)' }}
          >
            &ldquo;The more genuine customers, retailers and repeat sales
            you create, the greater your income opportunity.&rdquo;
          </div>
        </div>
      </Panel>

      {/* COMPARE / NOT SURE */}
      <div className="mb-8">
        <h3
          className="text-lg md:text-xl font-semibold mb-4"
          style={{ color: 'var(--pt-off)' }}
        >
          Not sure? Compare UDAAN with UDYAM
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
                    <td style={{ color: 'var(--pt-text)' }}>{u}</td>
                    <td style={{ color: 'var(--pt-off)' }}>{a}</td>
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
          style={{ color: 'var(--pt-emerald-3)' }}
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
          Interested in UDAAN?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() =>
              patch({
                routeChoice: { ...routeChoice, chosen: 'udaan' },
              })
            }
            className="p-4 rounded-xl text-left transition"
            style={{
              background:
                routeChoice.chosen === 'udaan'
                  ? 'linear-gradient(180deg, rgba(21,71,52,0.28) 0%, rgba(21,71,52,0.08) 100%)'
                  : 'rgba(21,71,52,0.10)',
              border: '1px solid rgba(21,71,52,0.55)',
            }}
          >
            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--pt-emerald-3)' }}>
              Choose route
            </div>
            <div
              className="mt-1 text-sm font-semibold"
              style={{ color: 'var(--pt-off)' }}
            >
              {routeChoice.chosen === 'udaan' ? '● UDAAN selected' : 'I want UDAAN'}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: 'var(--pt-muted)' }}>
              Records your interest locally
            </div>
          </button>

          <div className="md:col-span-2">
            <input
              className="input w-full"
              placeholder={
                routeChoice.chosen === 'udaan'
                  ? 'Which UDAAN level are you starting at? e.g. Advocate · Jaunpur'
                  : 'Select UDAAN first, then tell us the starting level that fits you'
              }
              value={routeChoice.role}
              disabled={routeChoice.chosen !== 'udaan'}
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
              Your interest is saved to your browser only. To formally
              express interest, contact your GNS partnerships point of
              contact and share what you have entered here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
