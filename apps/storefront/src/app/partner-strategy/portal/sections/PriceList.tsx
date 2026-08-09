'use client';

import { useMemo, useState } from 'react';
import {
  KAMDHENU_META,
  PRICE_LIST_1_16,
  PRICE_LIST_17_30,
  PriceRow,
  WEIGHTS_TABLE,
  WeightRow,
} from '../data/kamdhenuPriceList';
import { usePortal } from '../store';
import { IllustrativeTag, Panel, PlainEnglish, SectionHead } from '../ui';

/* ------------------------------------------------------------------ */
/*  ROLE DEFINITIONS                                                    */
/* ------------------------------------------------------------------ */

type UdyamKey =
  | 'regionalPartner'
  | 'districtPartner'
  | 'wholesaler'
  | 'distributor'
  | 'channelPartner'
  | 'retailer';

const UDYAM_ROLES: { key: UdyamKey; label: string; short: string; code: string }[] = [
  { key: 'regionalPartner', label: 'Regional / State Partner', short: 'Reg. Partner',    code: 'U1' },
  { key: 'districtPartner', label: 'District / Area Partner',  short: 'District Partner',code: 'U2' },
  { key: 'wholesaler',      label: 'Wholesaler',                short: 'Wholesaler',      code: 'U3' },
  { key: 'distributor',     label: 'Distributor',               short: 'Distributor',     code: 'U4' },
  { key: 'channelPartner',  label: 'Channel Partner',           short: 'Channel Ptr.',    code: 'U5' },
  { key: 'retailer',        label: 'Retailer',                  short: 'Retailer',        code: 'U6' },
];

type UdaanKey =
  | 'advocate'
  | 'retailCoordinator'
  | 'microEntrepreneur'
  | 'communityEntrepreneur';

const UDAAN_LEVELS: { key: UdaanKey; label: string; short: string; code: string }[] = [
  { key: 'advocate',              label: 'Community Advocate',    short: 'Advocate',        code: 'A1' },
  { key: 'retailCoordinator',     label: 'Retail Coordinator',    short: 'Retail Coord.',   code: 'A2' },
  { key: 'microEntrepreneur',     label: 'Micro-Entrepreneur',    short: 'Micro-Ent.',      code: 'A3' },
  { key: 'communityEntrepreneur', label: 'Community Entrepreneur',short: 'Comm. Ent.',      code: 'A4' },
];

/* ------------------------------------------------------------------ */
/*  MARGIN COMPUTATION                                                  */
/* ------------------------------------------------------------------ */

type UdyamStep = {
  role: UdyamKey;
  label: string;
  short: string;
  buyingCost: number;
  marginPctOfPool: number;
  marginRupees: number;
  sellingPrice: number;
};

type UdaanShare = {
  level: UdaanKey;
  label: string;
  short: string;
  sharePctOfPool: number;
  earningsRupees: number;
};

type Walk = {
  landing: number;
  mrp: number;
  totalMargin: number;
  udyamPool: number;
  udaanPool: number;
  udyamSteps: UdyamStep[];
  udaanShares: UdaanShare[];
};

function computeWalk(
  row: PriceRow,
  topSplit: { udyam: number; udaan: number },
  udyamSplit: Record<UdyamKey, number>,
  udaanSplit: Record<UdaanKey, number>,
): Walk {
  const landing = row.distLanding;
  const mrp = row.mrp;
  const totalMargin = Math.max(0, mrp - landing);
  const udyamPool = (totalMargin * topSplit.udyam) / 100;
  const udaanPool = (totalMargin * topSplit.udaan) / 100;

  let cumulative = landing;
  const udyamSteps: UdyamStep[] = UDYAM_ROLES.map((r) => {
    const buyingCost = cumulative;
    const marginPctOfPool = udyamSplit[r.key] ?? 0;
    const marginRupees = (udyamPool * marginPctOfPool) / 100;
    const sellingPrice = buyingCost + marginRupees;
    cumulative = sellingPrice;
    return { role: r.key, label: r.label, short: r.short, buyingCost, marginPctOfPool, marginRupees, sellingPrice };
  });

  const udaanShares: UdaanShare[] = UDAAN_LEVELS.map((l) => {
    const sharePctOfPool = udaanSplit[l.key] ?? 0;
    const earningsRupees = (udaanPool * sharePctOfPool) / 100;
    return { level: l.key, label: l.label, short: l.short, sharePctOfPool, earningsRupees };
  });

  return { landing, mrp, totalMargin, udyamPool, udaanPool, udyamSteps, udaanShares };
}

function fmt(n: number, digits = 2): string {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/* ------------------------------------------------------------------ */
/*  PRINT STYLES                                                        */
/* ------------------------------------------------------------------ */

const printCSS = `
@media print {
  .pt-root .sidebar, .pt-root nav, .pt-root .session-bar, .pt-root .no-print {
    display: none !important;
  }
  .pt-root { background: white !important; color: black !important; }
  .pt-root table.data { font-size: 9pt; }
  .pt-root table.data th, .pt-root table.data td { color: black !important; background: white !important; }
  .pt-root table.data th { background: #f5f0e6 !important; border-color: #ccc !important; }
  .pt-root table.data td { border-color: #eee !important; }
  .pt-root .panel { background: white !important; border-color: #ddd !important; }
  .pt-root .panel-hi { background: #fbf7ea !important; border-color: #b08d3a !important; }
  .pt-root .kpi { background: white !important; border-color: #ddd !important; }
  .pt-root .kpi .k { color: #666 !important; }
  .pt-root .kpi .v { color: black !important; }
}
`;

/* ------------------------------------------------------------------ */
/*  ROOT                                                                */
/* ------------------------------------------------------------------ */

export default function PriceList() {
  const [query, setQuery] = useState('');
  const topSplit = usePortal((s) => s.topSplit);
  const udyamSplit = usePortal((s) => s.udyamSplit);
  const udaanSplit = usePortal((s) => s.udaanSplit);
  const patch = usePortal((s) => s.patch);

  const q = query.trim().toLowerCase();
  const match = (r: PriceRow) =>
    !q ||
    r.product.toLowerCase().includes(q) ||
    r.size.toLowerCase().includes(q) ||
    r.sr.toLowerCase().includes(q);

  const filtered1_16 = useMemo(() => PRICE_LIST_1_16.filter(match), [q]);
  const filtered17_30 = useMemo(() => PRICE_LIST_17_30.filter(match), [q]);
  const filteredWeights = useMemo(
    () => WEIGHTS_TABLE.filter((w) => !q || w.product.toLowerCase().includes(q)),
    [q],
  );

  const totalRows = PRICE_LIST_1_16.length + PRICE_LIST_17_30.length;
  const totalShowing = filtered1_16.length + filtered17_30.length;
  const combinedFiltered = useMemo(
    () => [...filtered1_16, ...filtered17_30],
    [filtered1_16, filtered17_30],
  );

  const topSplitTotal = topSplit.udyam + topSplit.udaan;
  const topSplitOk = Math.abs(topSplitTotal - 100) < 0.001;
  const udyamSplitTotal = Object.values(udyamSplit).reduce((a, b) => a + b, 0);
  const udyamSplitOk = Math.abs(udyamSplitTotal - 100) < 0.001;
  const udaanSplitTotal = Object.values(udaanSplit).reduce((a, b) => a + b, 0);
  const udaanSplitOk = Math.abs(udaanSplitTotal - 100) < 0.001;

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: printCSS }} />

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
        n="03"
        title="Kamdhenu — Supplier Price List"
        subtitle={`Rate card issued by the supplier · effective ${KAMDHENU_META.effectiveDate}. Reference data — this is what Kamdhenu charges GNS UDYAM, and the retail prices they publish.`}
      />

      <PlainEnglish>
        <p>
          This is the <strong>rate card Kamdhenu has provided</strong> — the
          official price list from the supplier, effective{' '}
          <strong>{KAMDHENU_META.effectiveDate}</strong>. It is the
          foundational commercial document behind the two profitability
          matrices that follow.
        </p>
        <p className="mt-2">
          Each row is one SKU. Read left to right: the{' '}
          <strong>Company Basic Rate</strong> is the manufacturer&apos;s
          ex-factory price. <strong>Distributor Landing</strong> is what we
          pay after freight and standard adjustments. The{' '}
          <strong>Retail Rate</strong>, <strong>Trade / Kg</strong>,{' '}
          <strong>Trade / Unit</strong>, <strong>MRP</strong> and{' '}
          <strong>Margin %</strong> columns show the supplier&apos;s suggested
          retail ladder.
        </p>
        <p className="mt-2">
          Prices <em>supersede</em> all previous price lists. Distributors are
          responsible for returning goods before product expiry. GST on
          spices, amla candy, papad and pickles is 5%.
        </p>
      </PlainEnglish>

      {/* SUPPLIER METADATA */}
      <Panel title="Supplier · document details" className="mb-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm">
          <Meta k="Company" v={KAMDHENU_META.company} />
          <Meta k="Effective from" v={KAMDHENU_META.effectiveDate} strong />
          <Meta k="Weights sheet dated" v={KAMDHENU_META.weightsDate} />
          <Meta k="Address" v={KAMDHENU_META.address} />
          <Meta k="Website" v={KAMDHENU_META.website} />
          <Meta k="GST" v={KAMDHENU_META.gstNote} />
          <Meta k="Billing" v={KAMDHENU_META.billing} />
          <Meta k="Notice" v={KAMDHENU_META.notice} span={2} />
          <Meta k="Expiry responsibility" v={KAMDHENU_META.expiry} span={3} />
        </div>
      </Panel>

      {/* SEARCH */}
      <div className="mb-4 flex flex-wrap items-center gap-3 no-print">
        <label className="flex items-center gap-2">
          <span className="label">Search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Chatpat, Mirchi, ₹5, 200g…"
            className="input"
            style={{ width: 320 }}
          />
        </label>
        <span
          className="text-[11px] tracking-widest uppercase"
          style={{ color: 'var(--pt-muted-2)' }}
        >
          {totalShowing} of {totalRows} rows
        </span>
      </div>

      {/* TABLE 1 · PRODUCTS 1–16 */}
      <TableHeading n="Table 1" title="Products 1–16 — Blended masalas, papads, whole spices" />
      <PriceTable rows={filtered1_16} className="mb-8" />

      {/* TABLE 2 · PRODUCTS 17–30 */}
      <TableHeading n="Table 2" title="Products 17–30 — Chilli · turmeric · coriander powders · KPT range · pickles" />
      <PriceTable rows={filtered17_30} className="mb-8" />

      {/* TABLE 3 · WEIGHTS */}
      <TableHeading n="Table 3" title={`₹5 & ₹10 packaging — pouch, hanger and sack weights (dated ${KAMDHENU_META.weightsDate})`} />
      <WeightsTable rows={filteredWeights} />

      <IllustrativeTag>
        Prices are reproduced verbatim from the supplier rate card dated{' '}
        {KAMDHENU_META.effectiveDate}. Nothing in this portal implies a
        commercial agreement with Kamdhenu Pickles &amp; Spices Ind. Pvt. Ltd.
        unless separately verified in writing.
      </IllustrativeTag>

      {/* ============================================================ */}
      {/*  70:30 PROFIT POOL — UDYAM + UDAAN                            */}
      {/* ============================================================ */}
      <div className="divider" style={{ margin: '40px 0 28px' }} />

      <SectionHead
        n="03.b"
        title="GNS UDYAM + GNS UDAAN · 70:30 Profitability Matrix"
        subtitle="The Kamdhenu margin (MRP − Landing) is our whole distributable profit pool. We split it into two complementary growth routes — an enterprise route (UDYAM, 70%) and a community route (UDAAN, 30%). Each has its own participants and its own internal share."
      />

      <PlainEnglish>
        <p>
          Think of the total margin on each SKU as one pool of money —
          <strong> everything left over after we pay Kamdhenu </strong>. Our
          model is to divide it two ways:
        </p>
        <p className="mt-2">
          <strong style={{ color: 'var(--pt-gold-hi)' }}>GNS UDYAM (70%)</strong> — the
          <em> enterprise route</em>. Traditional supply chain: <em>Regional
          Partner → District Partner → Wholesaler → Distributor → Channel
          Partner → Retailer</em>. Each layer physically moves product and
          takes a share of the UDYAM pool.
        </p>
        <p className="mt-2">
          <strong style={{ color: 'var(--pt-emerald-3)' }}>GNS UDAAN (30%)</strong> — the
          <em> community route</em>. Advocates, retail coordinators and
          micro-entrepreneurs earn by <em>creating demand, activating retailers
          and building community</em> — with a low barrier to entry. Their
          share comes from the UDAAN pool.
        </p>
        <p className="mt-2">
          Every percentage on this page is <strong>editable</strong>. Change
          any input and both matrices below recalculate for every SKU
          instantly.
        </p>
      </PlainEnglish>

      {/* TOP-LEVEL 70:30 SPLIT */}
      <Panel
        title="1 · Top-level split — UDYAM vs UDAAN"
        className="mb-4"
        right={
          <span
            className="tag"
            style={{
              color: topSplitOk ? 'var(--pt-emerald-3)' : 'var(--pt-warn)',
              borderColor: topSplitOk ? 'rgba(63,181,123,0.4)' : 'rgba(240,177,64,0.4)',
              background: topSplitOk ? 'rgba(63,181,123,0.08)' : 'rgba(240,177,64,0.08)',
            }}
          >
            Total: {topSplitTotal.toFixed(1)}%{topSplitOk ? ' ✓' : ' — must equal 100%'}
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopSplitInput
            label="GNS UDYAM · Enterprise pool"
            sub="Traditional distribution supply chain"
            value={topSplit.udyam}
            colorFrom="var(--pt-gold)"
            colorTo="var(--pt-gold-hi)"
            onChange={(v) => patch({ topSplit: { ...topSplit, udyam: v } })}
          />
          <TopSplitInput
            label="GNS UDAAN · Community pool"
            sub="Advocacy, activation, community entrepreneurship"
            value={topSplit.udaan}
            colorFrom="#1F6B4C"
            colorTo="var(--pt-emerald-3)"
            onChange={(v) => patch({ topSplit: { ...topSplit, udaan: v } })}
          />
        </div>
      </Panel>

      {/* UDYAM 6-role split */}
      <Panel
        title="2 · UDYAM enterprise pool — split across 6 supply-chain roles"
        className="mb-4"
        right={
          <span
            className="tag"
            style={{
              color: udyamSplitOk ? 'var(--pt-emerald-3)' : 'var(--pt-warn)',
              borderColor: udyamSplitOk ? 'rgba(63,181,123,0.4)' : 'rgba(240,177,64,0.4)',
              background: udyamSplitOk ? 'rgba(63,181,123,0.08)' : 'rgba(240,177,64,0.08)',
            }}
          >
            Total: {udyamSplitTotal.toFixed(1)}%{udyamSplitOk ? ' ✓' : ' — must equal 100%'}
          </span>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {UDYAM_ROLES.map((r) => (
            <SplitInput
              key={r.key}
              code={r.code}
              label={r.label}
              value={udyamSplit[r.key]}
              accent="gold"
              onChange={(v) =>
                patch({ udyamSplit: { ...udyamSplit, [r.key]: v } })
              }
            />
          ))}
        </div>
      </Panel>

      {/* UDAAN 4-level split */}
      <Panel
        title="3 · UDAAN community pool — split across 4 community levels"
        className="mb-6"
        right={
          <span
            className="tag"
            style={{
              color: udaanSplitOk ? 'var(--pt-emerald-3)' : 'var(--pt-warn)',
              borderColor: udaanSplitOk ? 'rgba(63,181,123,0.4)' : 'rgba(240,177,64,0.4)',
              background: udaanSplitOk ? 'rgba(63,181,123,0.08)' : 'rgba(240,177,64,0.08)',
            }}
          >
            Total: {udaanSplitTotal.toFixed(1)}%{udaanSplitOk ? ' ✓' : ' — must equal 100%'}
          </span>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {UDAAN_LEVELS.map((l) => (
            <SplitInput
              key={l.key}
              code={l.code}
              label={l.label}
              value={udaanSplit[l.key]}
              accent="emerald"
              onChange={(v) =>
                patch({ udaanSplit: { ...udaanSplit, [l.key]: v } })
              }
            />
          ))}
        </div>
      </Panel>

      {/* TABLE 4 · UDYAM COST WALK */}
      <TableHeading n="Table 4" title="Per-SKU cost walk across the UDYAM supply chain (Landing → Retailer)" />
      <UdyamCostWalkTable rows={combinedFiltered} topSplit={topSplit} udyamSplit={udyamSplit} udaanSplit={udaanSplit} />

      {/* TABLE 5 · UDAAN POOL DISTRIBUTION */}
      <div className="mt-8">
        <TableHeading n="Table 5" title="Per-SKU UDAAN community pool distribution (₹ per pack, by level)" />
        <UdaanPoolTable rows={combinedFiltered} topSplit={topSplit} udyamSplit={udyamSplit} udaanSplit={udaanSplit} />
      </div>

      <IllustrativeTag>
        Both matrices are derived from Kamdhenu&apos;s Landing and MRP values
        combined with GNS UDYAM/UDAAN&apos;s configurable margin splits — all
        illustrative planning inputs. Final commercials must be secured with
        the supplier and each downstream partner before commitment.
      </IllustrativeTag>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SMALL COMPONENTS                                                    */
/* ------------------------------------------------------------------ */

function TableHeading({ n, title }: { n: string; title: string }) {
  return (
    <div
      className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-widest font-semibold"
      style={{ color: 'var(--pt-gold)' }}
    >
      <span>{n}</span>
      <span style={{ color: 'var(--pt-muted-2)' }}>·</span>
      <span style={{ color: 'var(--pt-text)' }}>{title}</span>
    </div>
  );
}

function Meta({
  k,
  v,
  strong,
  span,
}: {
  k: string;
  v: string;
  strong?: boolean;
  span?: 2 | 3;
}) {
  const colClass =
    span === 3 ? 'lg:col-span-3 md:col-span-2' : span === 2 ? 'md:col-span-2' : '';
  return (
    <div className={colClass}>
      <div className="label">{k}</div>
      <div
        className="mt-1"
        style={{
          color: strong ? 'var(--pt-gold-hi)' : 'var(--pt-off)',
          fontWeight: strong ? 700 : 500,
        }}
      >
        {v}
      </div>
    </div>
  );
}

function TopSplitInput({
  label,
  sub,
  value,
  onChange,
  colorFrom,
  colorTo,
}: {
  label: string;
  sub: string;
  value: number;
  onChange: (v: number) => void;
  colorFrom: string;
  colorTo: string;
}) {
  return (
    <div
      className="p-4 rounded-lg"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--pt-line)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="label" style={{ color: 'var(--pt-off)' }}>{label}</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--pt-muted)' }}>{sub}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            className="input mono"
            style={{ width: 90, textAlign: 'right' }}
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
          />
          <span className="text-xs" style={{ color: 'var(--pt-muted-2)' }}>%</span>
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function SplitInput({
  code,
  label,
  value,
  onChange,
  accent,
}: {
  code: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: 'gold' | 'emerald';
}) {
  return (
    <label className="block">
      <div className="flex items-center gap-2">
        <span
          className="mono text-[10px] font-bold"
          style={{ color: accent === 'gold' ? 'var(--pt-gold)' : 'var(--pt-emerald-3)' }}
        >
          {code}
        </span>
        <span className="label" style={{ letterSpacing: '0.1em' }}>{label}</span>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          className="input mono"
          style={{ textAlign: 'right' }}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <span className="text-xs" style={{ color: 'var(--pt-muted-2)' }}>%</span>
      </div>
      <div className={`mt-1.5 progress ${accent === 'gold' ? 'gold' : ''}`}>
        <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  TABLES                                                              */
/* ------------------------------------------------------------------ */

function PriceTable({ rows, className = '' }: { rows: PriceRow[]; className?: string }) {
  return (
    <div className={className}>
      <Panel padded={false}>
        <div className="scroll-x">
          <table className="data row-alt">
            <thead>
              <tr>
                <th style={{ minWidth: 40 }}>Sr</th>
                <th style={{ minWidth: 200 }}>Product</th>
                <th>Size / SKU</th>
                <th>Sack Pack</th>
                <th style={{ textAlign: 'right' }}>Co. Basic</th>
                <th style={{ textAlign: 'right' }}>Dist. Landing</th>
                <th style={{ textAlign: 'right' }}>8% Margin</th>
                <th style={{ textAlign: 'right' }}>Retail Rate</th>
                <th style={{ textAlign: 'right' }}>Trade / Kg</th>
                <th style={{ textAlign: 'right' }}>Trade / Unit</th>
                <th style={{ textAlign: 'right' }}>MRP</th>
                <th style={{ textAlign: 'right' }}>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', color: 'var(--pt-muted)', padding: 20 }}>
                    No rows match the current search.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={`${r.sr}-${r.product}-${r.size}-${i}`}>
                    <td className="mono" style={{ color: 'var(--pt-muted-2)' }}>{r.sr}</td>
                    <td style={{ color: 'var(--pt-off)', fontWeight: 600 }}>{r.product}</td>
                    <td style={{ color: 'var(--pt-gold-hi)', fontWeight: 500 }}>{r.size}</td>
                    <td style={{ color: 'var(--pt-muted-hi)' }}>{r.sackPack}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmt(r.coBasicRate)}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmt(r.distLanding)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-muted)' }}>{fmt(r.margin8pct)}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmt(r.retailRate)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-emerald-3)' }}>{fmt(r.tradePerKg)}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmt(r.tradePerUnit)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-off)', fontWeight: 700 }}>{fmt(r.mrp, 0)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-gold-hi)', fontWeight: 700 }}>{r.marginPct}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function WeightsTable({ rows }: { rows: WeightRow[] }) {
  return (
    <Panel padded={false}>
      <div className="scroll-x">
        <table className="data row-alt">
          <thead>
            <tr>
              <th style={{ minWidth: 220 }}>Product</th>
              <th>Value</th>
              <th>Pouch Wt</th>
              <th>Pouches / Hanger</th>
              <th>Hanger Wt</th>
              <th>Hangers / Sack</th>
              <th>Sack Wt</th>
              <th style={{ textAlign: 'right' }}>Trade / Pouch</th>
              <th style={{ textAlign: 'right' }}>Trade / Hanger</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--pt-muted)', padding: 20 }}>
                  No rows match the current search.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={`${r.product}-${i}`}>
                  <td style={{ color: 'var(--pt-off)', fontWeight: 600 }}>{r.product}</td>
                  <td className="mono" style={{ color: 'var(--pt-gold-hi)', fontWeight: 700 }}>{r.value}</td>
                  <td className="mono">{r.pouchWeight}</td>
                  <td className="mono">{r.pouchesPerHanger}</td>
                  <td className="mono">{r.hangerWeight}</td>
                  <td className="mono">{r.hangersPerSack}</td>
                  <td className="mono">{r.sackWeight}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{r.tradePerPouch}</td>
                  <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-emerald-3)', fontWeight: 700 }}>{r.tradePerHanger}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function UdyamCostWalkTable({
  rows,
  topSplit,
  udyamSplit,
  udaanSplit,
}: {
  rows: PriceRow[];
  topSplit: { udyam: number; udaan: number };
  udyamSplit: Record<UdyamKey, number>;
  udaanSplit: Record<UdaanKey, number>;
}) {
  return (
    <Panel padded={false}>
      <div className="scroll-x">
        <table className="data row-alt">
          <thead>
            <tr>
              <th style={{ minWidth: 40 }}>Sr</th>
              <th style={{ minWidth: 200 }}>Product</th>
              <th>Size</th>
              <th style={{ textAlign: 'right' }}>Landing</th>
              <th style={{ textAlign: 'right' }}>MRP</th>
              <th style={{ textAlign: 'right' }}>Total Margin</th>
              <th style={{ textAlign: 'right', color: 'var(--pt-gold)' }}>UDYAM ₹</th>
              <th style={{ textAlign: 'right', color: 'var(--pt-emerald-3)' }}>UDAAN ₹</th>
              {UDYAM_ROLES.map((r) => (
                <th key={r.key} style={{ textAlign: 'right' }}>
                  <span className="mono" style={{ color: 'var(--pt-gold)' }}>{r.code}</span>{' '}{r.short} pays
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8 + UDYAM_ROLES.length} style={{ textAlign: 'center', color: 'var(--pt-muted)', padding: 20 }}>
                  No rows match the current search.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const w = computeWalk(r, topSplit, udyamSplit, udaanSplit);
                return (
                  <tr key={`${r.sr}-${r.product}-${r.size}-${i}`}>
                    <td className="mono" style={{ color: 'var(--pt-muted-2)' }}>{r.sr}</td>
                    <td style={{ color: 'var(--pt-off)', fontWeight: 600 }}>{r.product}</td>
                    <td style={{ color: 'var(--pt-gold-hi)', fontWeight: 500 }}>{r.size}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmt(w.landing)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-off)', fontWeight: 700 }}>{fmt(w.mrp, 0)}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmt(w.totalMargin)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-gold-hi)', fontWeight: 700 }}>{fmt(w.udyamPool)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-emerald-3)', fontWeight: 700 }}>{fmt(w.udaanPool)}</td>
                    {w.udyamSteps.map((s) => (
                      <td
                        key={s.role}
                        className="mono"
                        style={{ textAlign: 'right' }}
                        title={`${s.label} pays ${fmt(s.buyingCost)}, earns ${s.marginPctOfPool.toFixed(1)}% of UDYAM pool = ₹${fmt(s.marginRupees)}, sells at ₹${fmt(s.sellingPrice)}`}
                      >
                        {fmt(s.buyingCost)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function UdaanPoolTable({
  rows,
  topSplit,
  udyamSplit,
  udaanSplit,
}: {
  rows: PriceRow[];
  topSplit: { udyam: number; udaan: number };
  udyamSplit: Record<UdyamKey, number>;
  udaanSplit: Record<UdaanKey, number>;
}) {
  return (
    <Panel padded={false}>
      <div className="scroll-x">
        <table className="data row-alt">
          <thead>
            <tr>
              <th style={{ minWidth: 40 }}>Sr</th>
              <th style={{ minWidth: 200 }}>Product</th>
              <th>Size</th>
              <th style={{ textAlign: 'right' }}>MRP</th>
              <th style={{ textAlign: 'right', color: 'var(--pt-emerald-3)' }}>UDAAN Pool ₹</th>
              {UDAAN_LEVELS.map((l) => (
                <th key={l.key} style={{ textAlign: 'right' }}>
                  <span className="mono" style={{ color: 'var(--pt-emerald-3)' }}>{l.code}</span>{' '}{l.short} earns
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5 + UDAAN_LEVELS.length} style={{ textAlign: 'center', color: 'var(--pt-muted)', padding: 20 }}>
                  No rows match the current search.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const w = computeWalk(r, topSplit, udyamSplit, udaanSplit);
                return (
                  <tr key={`${r.sr}-${r.product}-${r.size}-${i}`}>
                    <td className="mono" style={{ color: 'var(--pt-muted-2)' }}>{r.sr}</td>
                    <td style={{ color: 'var(--pt-off)', fontWeight: 600 }}>{r.product}</td>
                    <td style={{ color: 'var(--pt-gold-hi)', fontWeight: 500 }}>{r.size}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-off)', fontWeight: 700 }}>{fmt(w.mrp, 0)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-emerald-3)', fontWeight: 700 }}>{fmt(w.udaanPool)}</td>
                    {w.udaanShares.map((s) => (
                      <td
                        key={s.level}
                        className="mono"
                        style={{ textAlign: 'right' }}
                        title={`${s.label} earns ${s.sharePctOfPool.toFixed(1)}% of the UDAAN pool = ₹${fmt(s.earningsRupees)}`}
                      >
                        {fmt(s.earningsRupees)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
