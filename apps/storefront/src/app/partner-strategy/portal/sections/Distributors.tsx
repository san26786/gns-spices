'use client';

import { useMemo, useState } from 'react';
import { DistCriteriaWeights, distRecommendationFromScore, usePortal } from '../store';
import { IllustrativeTag, Panel, PlainEnglish, SectionHead } from '../ui';

const DIST_LABELS: Record<keyof DistCriteriaWeights, string> = {
  fmcgNetwork: 'Existing FMCG network',
  workingCapital: 'Working capital',
  warehouse: 'Warehouse',
  deliveryCapability: 'Delivery capability',
  retailerRelationships: 'Retailer relationships',
  salesTeam: 'Sales team',
  localReputation: 'Local reputation',
  technologyCapability: 'Technology capability',
  growthCommitment: 'Growth commitment',
};

type NodeKey =
  | 'kamdhenu'
  | 'gns'
  | 'regional'
  | 'district'
  | 'block'
  | 'anchor'
  | 'gp'
  | 'consumer';

type NodeMeta = {
  key: NodeKey;
  title: string;
  chip?: string;
  role: string;
  revenue: string;
  cost: string;
  kpi: string;
  risk: string;
  target: string;
};

const NODES: NodeMeta[] = [
  {
    key: 'kamdhenu',
    title: 'Kamdhenu',
    chip: 'Supplier / Manufacturer',
    role: 'Manufactures product, sets brand and quality standard.',
    revenue: 'Primary supply revenue and category-development funding.',
    cost: 'Manufacturing, packaging, R&D, brand marketing.',
    kpi: 'Fill rate · quality · category NPS.',
    risk: 'Single-supplier dependency and channel-conflict risk.',
    target: 'Consistent supply, stable pricing, aligned category plan.',
  },
  {
    key: 'gns',
    title: 'GNS Spices',
    chip: 'Distribution & Market Development Partner',
    role: 'Owns the India route-to-market: territory strategy, distributor development, retailer activation, incentive design, data.',
    revenue: 'Distribution margin, market-development fees, incentive pools, data services.',
    cost: 'Field sales, technology platform, working capital, marketing support.',
    kpi: 'Coverage · distribution density · active retailers · growth.',
    risk: 'Execution risk and working-capital scaling.',
    target: 'A scalable, repeatable market-development platform.',
  },
  {
    key: 'regional',
    title: 'Regional / State Distribution',
    role: 'Regional inventory hub, credit and district-appointment engine.',
    revenue: 'Regional distribution margin + performance incentives.',
    cost: 'Warehouse, credit, sales force overhead, receivables.',
    kpi: 'Secondary sales · district coverage · WC rotation.',
    risk: 'Credit slippage and stockout at hub.',
    target: 'Regional depth and predictable cash cycle.',
  },
  {
    key: 'district',
    title: 'District Distributor',
    role: 'District inventory, retailer onboarding, direct sales force.',
    revenue: 'District margin + volume incentives.',
    cost: 'Delivery vehicles, salesmen, warehouse, WC.',
    kpi: 'Active retailers · order frequency · range extraction.',
    risk: 'Wrong distributor selection compounds silently.',
    target: 'Own the district; turn coverage into velocity.',
  },
  {
    key: 'block',
    title: 'Block / Sub-Distributor',
    role: 'Block-level delivery, retailer onboarding, cash cycle.',
    revenue: 'Sub-distribution margin per block.',
    cost: 'Local delivery, WC, invoicing.',
    kpi: 'Retailers served / week · delivery adherence.',
    risk: 'Rural last-mile disruption.',
    target: 'Last-mile logistics discipline.',
  },
  {
    key: 'anchor',
    title: 'Anchor Retailer',
    role: 'High-volume node, category showcasing, consumer trial.',
    revenue: 'Retail margin + tier incentives.',
    cost: 'Shelf space, working capital, staff.',
    kpi: 'Monthly purchase · repeat rate · product mix.',
    risk: 'Anchor churn or competitor lock-in.',
    target: 'Anchor retailers become growth partners.',
  },
  {
    key: 'gp',
    title: 'Gram Panchayat Market',
    role: 'Village-cluster coverage through Kirana and micro-outlets.',
    revenue: 'Volume-based retail margin.',
    cost: 'Fragmented service cost per unit.',
    kpi: 'Panchayats covered · retailers per panchayat.',
    risk: 'Fragmentation and slow adoption.',
    target: 'Rural consumer reach.',
  },
  {
    key: 'consumer',
    title: 'Consumer',
    role: 'Purchase, prefer, repeat, recommend.',
    revenue: 'End demand — the source of every rupee upstream.',
    cost: 'Shelf price to consumer.',
    kpi: 'Repeat purchase · basket · preference.',
    risk: 'Price sensitivity and category substitution.',
    target: 'Consumer preference for category leadership.',
  },
];

export default function Distributors() {
  const [openNode, setOpenNode] = useState<NodeKey>('gns');

  const weights = usePortal((s) => s.distributorWeights);
  const cand = usePortal((s) => s.distributorCandidate);
  const patch = usePortal((s) => s.patch);

  const totalWeights = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalScore = Object.values(cand.scores).reduce((a, b) => a + b, 0);
  const recommendation = distRecommendationFromScore(totalScore);
  const recTone =
    recommendation === 'Strategic'
      ? 'var(--pt-gold-hi)'
      : recommendation === 'Preferred'
        ? 'var(--pt-emerald-3)'
        : recommendation === 'Eligible'
          ? 'var(--pt-text)'
          : '#FCA5A5';

  const node = useMemo(
    () => NODES.find((n) => n.key === openNode) ?? NODES[0],
    [openNode],
  );

  return (
    <div>
      <SectionHead
        n="04"
        title="Distribution Architecture"
        subtitle="Every layer has a role, a revenue formula, a cost, a KPI and a risk. Click any node to see the working definition used in this business case."
      />

      <PlainEnglish>
        <p>
          Distributors are the partners who physically move product from the
          supplier down to the shops. This page has two working tools.
        </p>
        <p className="mt-2">
          The <strong>architecture</strong> on the left shows the eight tiers
          our product passes through — from the supplier (Kamdhenu) down to
          the consumer. Click any tier to see that layer&apos;s role, revenue
          model, cost, KPI and risk. The <strong>scoring engine</strong> further
          down is how we evaluate a candidate distributor: nine criteria such
          as existing network, working capital, warehouse and technology,
          each scored against a maximum weight. The total decides whether a
          candidate is recommended as Strategic, Preferred, Eligible or Not
          Recommended.
        </p>
        <p className="mt-2">
          The <strong>pipeline</strong> at the bottom shows the eight steps
          every distributor moves through before earning exclusive territory
          rights — <em>exclusivity is earned, never granted at signing</em>.
        </p>
      </PlainEnglish>

      <div className="grid lg:grid-cols-12 gap-4">
        <Panel title="Architecture · click a node" className="lg:col-span-5">
          <div className="space-y-2">
            {NODES.map((n, i) => {
              const isActive = openNode === n.key;
              const isGNS = n.key === 'gns';
              return (
                <div key={n.key}>
                  <button
                    onClick={() => setOpenNode(n.key)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition"
                    style={{
                      background: isGNS
                        ? 'rgba(21,71,52,0.30)'
                        : isActive
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(255,255,255,0.02)',
                      border: isGNS
                        ? '1px solid rgba(176,141,58,0.45)'
                        : isActive
                          ? '1px solid rgba(176,141,58,0.35)'
                          : '1px solid var(--pt-line)',
                    }}
                  >
                    <span
                      className="mono text-[11px]"
                      style={{ color: 'var(--pt-muted-2)', width: 18 }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: 'var(--pt-off)' }}
                    >
                      {n.title}
                    </span>
                    {n.chip && (
                      <span className="tag tag-gold ml-auto">{n.chip}</span>
                    )}
                  </button>
                  {i < NODES.length - 1 && (
                    <div
                      className="ml-[27px] my-0.5 h-2.5 border-l"
                      style={{ borderColor: 'rgba(176,141,58,0.30)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title={`Node · ${node.title}`}
          right={node.chip ? <span className="tag tag-gold">{node.chip}</span> : null}
          className="lg:col-span-7"
        >
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <Meta label="Role" v={node.role} />
            <Meta label="Revenue model" v={node.revenue} />
            <Meta label="Cost" v={node.cost} />
            <Meta label="Key KPI" v={node.kpi} />
            <Meta label="Risk" v={node.risk} />
            <Meta label="Target" v={node.target} />
          </div>
        </Panel>
      </div>

      {/* SECTION 6 — DISTRIBUTOR SCORING */}
      <div className="mt-10">
        <SectionHead
          n="04.b"
          title="Distributor Appointment Engine"
          subtitle="Score each candidate distributor against the weighted criteria. Recommendation updates in real time."
        />
        <div className="grid lg:grid-cols-12 gap-4">
          <Panel title="Criteria weights · 100 pts" className="lg:col-span-4">
            <div className="space-y-2.5 text-sm">
              {(Object.keys(weights) as (keyof DistCriteriaWeights)[]).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <div className="flex-1 label">{DIST_LABELS[k]}</div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={weights[k]}
                    onChange={(e) =>
                      patch({
                        distributorWeights: { ...weights, [k]: Number(e.target.value) || 0 },
                      })
                    }
                    className="cell-input mono"
                    style={{ width: 60, textAlign: 'right' }}
                  />
                </div>
              ))}
              <div
                className="flex items-center justify-between pt-3 mt-3 text-sm font-semibold"
                style={{ borderTop: '1px solid var(--pt-line)' }}
              >
                <span>Total</span>
                <span
                  className="mono"
                  style={{
                    color:
                      totalWeights === 100 ? 'var(--pt-emerald-3)' : 'var(--pt-warn)',
                  }}
                >
                  {totalWeights}
                </span>
              </div>
            </div>
          </Panel>

          <Panel
            title="Score candidate"
            right={
              <input
                className="cell-input"
                value={cand.name}
                onChange={(e) =>
                  patch({
                    distributorCandidate: { ...cand, name: e.target.value },
                  })
                }
                style={{ width: 200 }}
              />
            }
            className="lg:col-span-5"
          >
            <div className="space-y-2 text-sm">
              {(Object.keys(weights) as (keyof DistCriteriaWeights)[]).map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <div className="flex-1 text-[13px]" style={{ color: 'var(--pt-text)' }}>
                    {DIST_LABELS[k]}
                  </div>
                  <div className="w-40 progress">
                    <i
                      style={{
                        width: `${weights[k] ? (cand.scores[k] / weights[k]) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={weights[k]}
                    value={cand.scores[k]}
                    onChange={(e) =>
                      patch({
                        distributorCandidate: {
                          ...cand,
                          scores: { ...cand.scores, [k]: Number(e.target.value) || 0 },
                        },
                      })
                    }
                    className="cell-input mono"
                    style={{ width: 56, textAlign: 'right' }}
                  />
                  <div
                    className="mono text-[11px]"
                    style={{ color: 'var(--pt-muted-2)', width: 30, textAlign: 'right' }}
                  >
                    /{weights[k]}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Recommendation" tone="hi" className="lg:col-span-3">
            <div className="text-center">
              <div
                className="mono font-bold"
                style={{ fontSize: 56, color: 'var(--pt-off)', lineHeight: 1 }}
              >
                {totalScore}
                <span style={{ color: 'var(--pt-muted-2)', fontSize: 24 }}>/100</span>
              </div>
              <div
                className="mt-4 text-lg font-semibold"
                style={{ color: recTone }}
              >
                {recommendation}
              </div>
              <div
                className="mt-3 text-[11px] leading-relaxed"
                style={{ color: 'var(--pt-muted)' }}
              >
                90+ Strategic · 80+ Preferred · 70+ Eligible · &lt;70 Not Recommended
              </div>
            </div>
          </Panel>
        </div>

        {/* PIPELINE */}
        <div className="mt-6">
          <Panel title="Distributor pipeline">
            <div className="flex flex-wrap items-center gap-2">
              {[
                'Identified',
                'Screened',
                'Assessed',
                'Approved',
                '90-Day Probation',
                'Performance Territory',
                'Preferred',
                'Exclusive',
              ].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className="px-3 py-2 rounded-md text-sm font-medium"
                    style={{
                      background:
                        i >= 6
                          ? 'rgba(176,141,58,0.10)'
                          : 'rgba(255,255,255,0.03)',
                      border:
                        i >= 6
                          ? '1px solid rgba(176,141,58,0.35)'
                          : '1px solid var(--pt-line)',
                      color: 'var(--pt-off)',
                    }}
                  >
                    <span
                      className="mono text-[11px] mr-1.5"
                      style={{ color: i >= 6 ? 'var(--pt-gold)' : 'var(--pt-muted-2)' }}
                    >
                      0{i + 1}
                    </span>
                    {step}
                  </div>
                  {i < arr.length - 1 && (
                    <span style={{ color: 'var(--pt-muted-2)' }}>→</span>
                  )}
                </div>
              ))}
            </div>
            <div
              className="mt-4 p-3 rounded-md text-sm"
              style={{
                background: 'rgba(176,141,58,0.08)',
                border: '1px solid rgba(176,141,58,0.30)',
                color: 'var(--pt-gold-hi)',
              }}
            >
              Territory <strong>exclusivity is conditional on performance</strong> —
              never granted at signing.
            </div>
          </Panel>
        </div>
      </div>

      <IllustrativeTag>
        Criteria weights, candidate scores and recommendation thresholds are
        internal planning parameters — not a public commitment.
      </IllustrativeTag>
    </div>
  );
}

function Meta({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="label mb-1">{label}</div>
      <div style={{ color: 'var(--pt-text)' }}>{v}</div>
    </div>
  );
}
