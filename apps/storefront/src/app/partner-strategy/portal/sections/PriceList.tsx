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
/*  SUPPLY-CHAIN MARGIN WALK                                            */
/* ------------------------------------------------------------------ */

type RoleKey =
  | 'regionalPartner'
  | 'wholesaler'
  | 'distributor'
  | 'channelPartner'
  | 'retailCoordinator'
  | 'retailer';

const ROLES: { key: RoleKey; label: string; short: string }[] = [
  { key: 'regionalPartner',   label: 'Regional Partner',   short: 'Reg. Partner' },
  { key: 'wholesaler',        label: 'Wholesaler',          short: 'Wholesaler'   },
  { key: 'distributor',       label: 'Distributor',         short: 'Distributor'  },
  { key: 'channelPartner',    label: 'Channel Partner',     short: 'Channel Ptr.' },
  { key: 'retailCoordinator', label: 'Retail Coordinator',  short: 'Retail Coord.' },
  { key: 'retailer',          label: 'Retailer',            short: 'Retailer'      },
];

type Walk = {
  landing: number;
  mrp: number;
  totalMargin: number;
  totalMarginPct: number;
  steps: {
    role: RoleKey;
    label: string;
    short: string;
    buyingCost: number;
    marginPctOfTotal: number;
    marginRupees: number;
    sellingPrice: number;
  }[];
};

function walkSupplyChain(
  row: PriceRow,
  split: Record<RoleKey, number>,
): Walk {
  const landing = row.distLanding;
  const mrp = row.mrp;
  const totalMargin = mrp - landing;
  const totalMarginPct = landing > 0 ? (totalMargin / landing) * 100 : 0;

  let cumulativeCost = landing;
  const steps = ROLES.map((r) => {
    const buyingCost = cumulativeCost;
    const marginPctOfTotal = split[r.key] ?? 0;
    const marginRupees = (totalMargin * marginPctOfTotal) / 100;
    const sellingPrice = buyingCost + marginRupees;
    cumulativeCost = sellingPrice;
    return {
      role: r.key,
      label: r.label,
      short: r.short,
      buyingCost,
      marginPctOfTotal,
      marginRupees,
      sellingPrice,
    };
  });
  return { landing, mrp, totalMargin, totalMarginPct, steps };
}

const printCSS = `
@media print {
  .pt-root .sidebar, .pt-root nav, .pt-root .session-bar, .pt-root .no-print {
    display: none !important;
  }
  .pt-root { background: white !important; color: black !important; }
  .pt-root table.data { font-size: 9pt; }
  .pt-root table.data th, .pt-root table.data td {
    color: black !important; background: white !important;
  }
  .pt-root table.data th {
    background: #f5f0e6 !important; border-color: #ccc !important;
  }
  .pt-root table.data td { border-color: #eee !important; }
  .pt-root .panel { background: white !important; border-color: #ddd !important; }
  .pt-root .panel-hi { background: #fbf7ea !important; border-color: #b08d3a !important; }
  .pt-root .kpi { background: white !important; border-color: #ddd !important; }
  .pt-root .kpi .k { color: #666 !important; }
  .pt-root .kpi .v { color: black !important; }
}
`;

export default function PriceList() {
  const [query, setQuery] = useState('');
  const split = usePortal((s) => s.marginSplit);
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
    () =>
      WEIGHTS_TABLE.filter((w) => !q || w.product.toLowerCase().includes(q)),
    [q],
  );

  const totalRows = PRICE_LIST_1_16.length + PRICE_LIST_17_30.length;
  const totalShowing = filtered1_16.length + filtered17_30.length;

  const splitTotal =
    split.regionalPartner +
    split.wholesaler +
    split.distributor +
    split.channelPartner +
    split.retailCoordinator +
    split.retailer;
  const splitOk = Math.abs(splitTotal - 100) < 0.001;

  const combinedFiltered = useMemo(
    () => [...filtered1_16, ...filtered17_30],
    [filtered1_16, filtered17_30],
  );

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
        subtitle={`Rate card issued by the supplier · effective ${KAMDHENU_META.effectiveDate}. Reference data — this is what Kamdhenu charges GNS UDYAM, and the retail prices they publish. The interactive P&L models elsewhere in the portal use these figures as their default inputs.`}
      />

      <PlainEnglish>
        <p>
          This is the <strong>rate card Kamdhenu has provided</strong> — the
          official price list from the supplier, effective{' '}
          <strong>{KAMDHENU_META.effectiveDate}</strong>. It is the
          foundational commercial document behind everything else in the
          portal.
        </p>
        <p className="mt-2">
          Each row is one SKU. Read left to right: the{' '}
          <strong>Company Basic Rate</strong> is the manufacturer&apos;s ex-factory
          price. <strong>Distributor Landing</strong> is what the distributor
          (GNS UDYAM, in our case) pays after freight and standard adjustments.
          The <strong>8% Margin</strong> column is the distributor&apos;s
          budgeted trade margin. <strong>Retail Rate</strong> is what the
          shopkeeper pays. <strong>Trade / Kg</strong> and{' '}
          <strong>Trade / Unit</strong> are the shopkeeper&apos;s per-kg and
          per-pack cost. <strong>MRP</strong> is the shelf price to the
          consumer, and <strong>Margin %</strong> is the retailer&apos;s
          margin at that MRP.
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
          <Meta
            k="Notice"
            v={KAMDHENU_META.notice}
            span={2}
          />
          <Meta
            k="Expiry responsibility"
            v={KAMDHENU_META.expiry}
            span={3}
          />
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
      <div className="mb-8">
        <div
          className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-widest font-semibold"
          style={{ color: 'var(--pt-gold)' }}
        >
          <span>Table 1</span>
          <span style={{ color: 'var(--pt-muted-2)' }}>·</span>
          <span style={{ color: 'var(--pt-text)' }}>
            Products 1–16 — Blended masalas, papads, whole spices
          </span>
        </div>
        <PriceTable rows={filtered1_16} />
      </div>

      {/* TABLE 2 · PRODUCTS 17–30 */}
      <div className="mb-8">
        <div
          className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-widest font-semibold"
          style={{ color: 'var(--pt-gold)' }}
        >
          <span>Table 2</span>
          <span style={{ color: 'var(--pt-muted-2)' }}>·</span>
          <span style={{ color: 'var(--pt-text)' }}>
            Products 17–30 — Chilli · turmeric · coriander powders · KPT range · pickles
          </span>
        </div>
        <PriceTable rows={filtered17_30} />
      </div>

      {/* TABLE 3 · WEIGHTS */}
      <div className="mb-6">
        <div
          className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-widest font-semibold"
          style={{ color: 'var(--pt-gold)' }}
        >
          <span>Table 3</span>
          <span style={{ color: 'var(--pt-muted-2)' }}>·</span>
          <span style={{ color: 'var(--pt-text)' }}>
            ₹5 &amp; ₹10 packaging — pouch, hanger and sack weights (dated{' '}
            {KAMDHENU_META.weightsDate})
          </span>
        </div>
        <WeightsTable rows={filteredWeights} />
      </div>

      <IllustrativeTag>
        Prices are reproduced verbatim from the supplier rate card dated{' '}
        {KAMDHENU_META.effectiveDate}. Nothing in this portal implies a
        commercial agreement with Kamdhenu Pickles &amp; Spices Ind. Pvt. Ltd.
        unless separately verified in writing.
      </IllustrativeTag>

      {/* ============================================================ */}
      {/*  GNS UDYAM SUPPLY-CHAIN COST WALK                             */}
      {/* ============================================================ */}
      <div className="divider" style={{ margin: '36px 0 24px' }} />

      <SectionHead
        n="03.b"
        title="GNS UDYAM · Supply-chain cost walk"
        subtitle="The Kamdhenu margin — the gap between what GNS UDYAM pays the supplier (Landing) and the consumer MRP — split across the six roles in our distribution network. Change the split; every row recalculates instantly."
      />

      <PlainEnglish>
        <p>
          Kamdhenu&apos;s rate card leaves a certain <strong>Total Margin</strong>{' '}
          on every SKU — the difference between what we pay them (
          <em> Landing</em>) and what the consumer pays (<em>MRP</em>). That
          margin has to be split across the six layers of GNS UDYAM&apos;s
          supply chain, because each layer needs to earn something to keep
          moving the product.
        </p>
        <p className="mt-2">
          The panel below lets you set the split as percentages that
          <strong> sum to 100</strong>. Each row of the table beneath it then
          shows, for every SKU, what each role in the chain pays to buy
          the product — Regional Partner buys at Landing, Wholesaler pays
          the Regional Partner&apos;s selling price, and so on until the
          Retailer, whose selling price is the consumer MRP.
        </p>
      </PlainEnglish>

      <Panel
        title="Margin split configuration"
        right={
          <span
            className="tag"
            style={{
              color: splitOk ? 'var(--pt-emerald-3)' : 'var(--pt-warn)',
              borderColor: splitOk ? 'rgba(63,181,123,0.4)' : 'rgba(240,177,64,0.4)',
              background: splitOk ? 'rgba(63,181,123,0.08)' : 'rgba(240,177,64,0.08)',
            }}
          >
            Total: {splitTotal.toFixed(1)}%{splitOk ? ' ✓' : ' — must equal 100%'}
          </span>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ROLES.map((r) => (
            <label key={r.key} className="block">
              <span className="label">{r.label}</span>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  className="input mono"
                  style={{ textAlign: 'right' }}
                  value={split[r.key]}
                  onChange={(e) =>
                    patch({
                      marginSplit: {
                        ...split,
                        [r.key]: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
                <span
                  className="text-xs"
                  style={{ color: 'var(--pt-muted-2)' }}
                >
                  %
                </span>
              </div>
              <div className="mt-1.5 progress">
                <i style={{ width: `${Math.max(0, Math.min(100, split[r.key]))}%` }} />
              </div>
            </label>
          ))}
        </div>
      </Panel>

      <div className="mt-6">
        <div
          className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-widest font-semibold"
          style={{ color: 'var(--pt-gold)' }}
        >
          <span>Table 4</span>
          <span style={{ color: 'var(--pt-muted-2)' }}>·</span>
          <span style={{ color: 'var(--pt-text)' }}>
            Per-SKU cost walk across the GNS UDYAM supply chain
          </span>
        </div>
        <SupplyChainTable rows={combinedFiltered} split={split} />
      </div>

      <IllustrativeTag>
        Cost walk is derived from Kamdhenu&apos;s Landing and MRP values
        combined with GNS UDYAM&apos;s configurable margin split. Both are
        planning inputs — final commercials must be secured with the supplier
        and each downstream partner before commitment.
      </IllustrativeTag>
    </div>
  );
}

function SupplyChainTable({
  rows,
  split,
}: {
  rows: PriceRow[];
  split: Record<RoleKey, number>;
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
              <th style={{ textAlign: 'right' }}>Landing (₹)</th>
              <th style={{ textAlign: 'right' }}>MRP (₹)</th>
              <th style={{ textAlign: 'right' }}>Total Margin (₹)</th>
              {ROLES.map((r) => (
                <th key={r.key} style={{ textAlign: 'right' }}>
                  {r.short} pays
                </th>
              ))}
              <th style={{ textAlign: 'right' }}>Retailer sells @</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6 + ROLES.length + 1}
                  style={{ textAlign: 'center', color: 'var(--pt-muted)', padding: 20 }}
                >
                  No rows match the current search.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const w = walkSupplyChain(r, split);
                const retailerSells = w.steps[w.steps.length - 1].sellingPrice;
                const marginMatches = Math.abs(retailerSells - r.mrp) < 0.5;
                return (
                  <tr key={`${r.sr}-${r.product}-${r.size}-${i}`}>
                    <td className="mono" style={{ color: 'var(--pt-muted-2)' }}>{r.sr}</td>
                    <td style={{ color: 'var(--pt-off)', fontWeight: 600 }}>{r.product}</td>
                    <td style={{ color: 'var(--pt-gold-hi)', fontWeight: 500 }}>{r.size}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmt(w.landing)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-off)', fontWeight: 700 }}>
                      {fmt(w.mrp, 0)}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--pt-emerald-3)', fontWeight: 700 }}>
                      {fmt(w.totalMargin)}
                    </td>
                    {w.steps.map((s) => (
                      <td
                        key={s.role}
                        className="mono"
                        style={{ textAlign: 'right' }}
                        title={`${s.label} pays ${fmt(s.buyingCost)}, adds ${s.marginPctOfTotal.toFixed(1)}% of margin = ₹${fmt(s.marginRupees)}, sells at ₹${fmt(s.sellingPrice)}`}
                      >
                        {fmt(s.buyingCost)}
                      </td>
                    ))}
                    <td
                      className="mono"
                      style={{
                        textAlign: 'right',
                        color: marginMatches ? 'var(--pt-emerald-3)' : 'var(--pt-warn)',
                        fontWeight: 700,
                      }}
                      title={
                        marginMatches
                          ? 'Ties out to MRP.'
                          : `Retailer selling price (${fmt(retailerSells)}) differs from MRP (${fmt(r.mrp)}) — margin split may not equal 100%.`
                      }
                    >
                      {fmt(retailerSells)}
                    </td>
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

function fmt(n: number, digits = 2): string {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function PriceTable({ rows }: { rows: PriceRow[] }) {
  return (
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
                  <td
                    className="mono"
                    style={{ textAlign: 'right', color: 'var(--pt-off)', fontWeight: 700 }}
                  >
                    {fmt(r.mrp, 0)}
                  </td>
                  <td
                    className="mono"
                    style={{
                      textAlign: 'right',
                      color: 'var(--pt-gold-hi)',
                      fontWeight: 700,
                    }}
                  >
                    {r.marginPct}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
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
