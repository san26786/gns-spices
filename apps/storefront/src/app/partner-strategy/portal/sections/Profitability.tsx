'use client';

import { inr, usePortal } from '../store';
import {
  IllustrativeTag,
  KPI,
  NumberField,
  Panel,
  PlainEnglish,
  SectionHead,
} from '../ui';

/* ------------------------------------------------------------------ */
/*  DISTRIBUTOR PROFITABILITY                                          */
/* ------------------------------------------------------------------ */

function DistributorProfit() {
  const d = usePortal((s) => s.distProfit);
  const patch = usePortal((s) => s.patch);

  const revenue = d.sellingPrice * d.monthlyVolume;
  const cogs = d.purchasePrice * d.monthlyVolume;
  const grossMargin = revenue - cogs;
  const incentiveValue = (revenue * (d.volumeIncentive + d.targetBonus)) / 100;
  const opCostPct = d.logisticsPct + d.salesPct + d.warehousePct + d.wcCostPct;
  const opCost = (revenue * opCostPct) / 100;
  const contribution = grossMargin + incentiveValue - opCost;
  const contribPct = revenue > 0 ? (contribution / revenue) * 100 : 0;
  const monthlyProfit = contribution;
  const annualProfit = monthlyProfit * 12;
  const perUnitProfit = d.monthlyVolume > 0 ? contribution / d.monthlyVolume : 0;
  const breakEvenVolume =
    perUnitProfit > 0 ? Math.ceil(opCost / Math.max(0.01, (d.sellingPrice - d.purchasePrice))) : 0;

  return (
    <div>
      <SectionHead
        n="06.a"
        title="Distributor Profitability"
        subtitle="Full P&L for a district distributor. Change any input; the contribution, margin and break-even recalc immediately."
      />
      <div className="grid lg:grid-cols-12 gap-4">
        <Panel title="Inputs" className="lg:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Monthly volume (packs)" value={d.monthlyVolume} onChange={(v) => patch({ distProfit: { ...d, monthlyVolume: v } })} />
            <NumberField label="Purchase price (₹/pack)" value={d.purchasePrice} onChange={(v) => patch({ distProfit: { ...d, purchasePrice: v } })} />
            <NumberField label="Selling price (₹/pack)" value={d.sellingPrice} onChange={(v) => patch({ distProfit: { ...d, sellingPrice: v } })} />
            <NumberField label="Volume incentive %" value={d.volumeIncentive} onChange={(v) => patch({ distProfit: { ...d, volumeIncentive: v } })} step={0.25} />
            <NumberField label="Target bonus %" value={d.targetBonus} onChange={(v) => patch({ distProfit: { ...d, targetBonus: v } })} step={0.25} />
            <NumberField label="Logistics % of revenue" value={d.logisticsPct} onChange={(v) => patch({ distProfit: { ...d, logisticsPct: v } })} step={0.1} />
            <NumberField label="Sales cost %" value={d.salesPct} onChange={(v) => patch({ distProfit: { ...d, salesPct: v } })} step={0.1} />
            <NumberField label="Warehouse %" value={d.warehousePct} onChange={(v) => patch({ distProfit: { ...d, warehousePct: v } })} step={0.1} />
            <NumberField label="Working capital cost %" value={d.wcCostPct} onChange={(v) => patch({ distProfit: { ...d, wcCostPct: v } })} step={0.1} />
          </div>
        </Panel>

        <div className="lg:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
          <KPI k="Revenue / mo" v={`₹${inr(revenue)}`} />
          <KPI k="Gross margin" v={`₹${inr(grossMargin)}`} s={`Base ${((grossMargin / Math.max(1, revenue)) * 100).toFixed(1)}%`} />
          <KPI k="Incentive value" v={`₹${inr(incentiveValue)}`} tone="gold" />
          <KPI k="Operating cost" v={`₹${inr(opCost)}`} s={`${opCostPct.toFixed(1)}% of revenue`} />
          <KPI k="Contribution / mo" v={`₹${inr(contribution)}`} tone="gold" />
          <KPI k="Contribution %" v={`${contribPct.toFixed(1)}%`} tone={contribPct >= 5 ? 'gold' : 'warn'} />
          <KPI k="Annual profit" v={`₹${inr(annualProfit)}`} tone="gold" />
          <KPI
            k="Break-even volume"
            v={breakEvenVolume ? `${inr(breakEvenVolume)} packs` : '—'}
            s="Packs to cover operating cost from gross margin"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GNS PROFITABILITY  (three scenarios)                                */
/* ------------------------------------------------------------------ */

function GNSProfit() {
  const g = usePortal((s) => s.gnsProfit);
  const factors = usePortal((s) => s.gnsScenarioFactors);
  const scenario = usePortal((s) => s.gnsScenario);
  const patch = usePortal((s) => s.patch);

  const factor = factors[scenario];
  const volume = g.monthlyVolume * factor;
  const revenue = g.gnsSellingPrice * volume;
  const cogs = g.kamdhenuPrice * volume;
  const gross = revenue - cogs;
  const supplierValue = (cogs * g.supplierIncentive) / 100;
  const volInc = (revenue * g.volumeIncentive) / 100;
  const marketing = (revenue * g.marketingSupport) / 100;
  const opCostPct = g.logisticsPct + g.salesPct + g.adminPct + g.wcCostPct;
  const opCost = (revenue * opCostPct) / 100;
  const contribution = gross + supplierValue - volInc - marketing - opCost;
  const contribPct = revenue > 0 ? (contribution / revenue) * 100 : 0;
  const annualContribution = contribution * 12;
  const ebitda = contribution * 0.9; // illustrative — non-cash exclusion
  const perPackGross = g.gnsSellingPrice - g.kamdhenuPrice;
  const breakEvenVolume =
    perPackGross > 0 ? Math.ceil(opCost / perPackGross) : 0;

  return (
    <div>
      <SectionHead
        n="06.b"
        title="GNS Spices Profitability"
        subtitle="The central business case. Scenario selector re-runs the volume line at conservative, base or growth multiples."
        right={
          <div className="inline-flex rounded-md" style={{ border: '1px solid var(--pt-line)' }}>
            {(['conservative', 'base', 'growth'] as const).map((s) => (
              <button
                key={s}
                onClick={() => patch({ gnsScenario: s })}
                className="px-3 py-1.5 text-[11px] uppercase tracking-widest font-semibold transition"
                style={{
                  background: scenario === s ? 'rgba(21,71,52,0.35)' : 'transparent',
                  color: scenario === s ? 'var(--pt-off)' : 'var(--pt-muted)',
                  borderRight: '1px solid var(--pt-line)',
                }}
              >
                {s} · {(factors[s] * 100).toFixed(0)}%
              </button>
            ))}
          </div>
        }
      />

      <div className="grid lg:grid-cols-12 gap-4">
        <Panel title="Inputs" className="lg:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Kamdhenu price (₹/pack)" value={g.kamdhenuPrice} onChange={(v) => patch({ gnsProfit: { ...g, kamdhenuPrice: v } })} />
            <NumberField label="GNS selling price (₹/pack)" value={g.gnsSellingPrice} onChange={(v) => patch({ gnsProfit: { ...g, gnsSellingPrice: v } })} />
            <NumberField label="Base monthly volume (packs)" value={g.monthlyVolume} onChange={(v) => patch({ gnsProfit: { ...g, monthlyVolume: v } })} />
            <NumberField label="Supplier incentive %" value={g.supplierIncentive} onChange={(v) => patch({ gnsProfit: { ...g, supplierIncentive: v } })} step={0.25} />
            <NumberField label="Volume incentive %" value={g.volumeIncentive} onChange={(v) => patch({ gnsProfit: { ...g, volumeIncentive: v } })} step={0.25} />
            <NumberField label="Marketing support %" value={g.marketingSupport} onChange={(v) => patch({ gnsProfit: { ...g, marketingSupport: v } })} step={0.25} />
            <NumberField label="Logistics %" value={g.logisticsPct} onChange={(v) => patch({ gnsProfit: { ...g, logisticsPct: v } })} step={0.1} />
            <NumberField label="Sales cost %" value={g.salesPct} onChange={(v) => patch({ gnsProfit: { ...g, salesPct: v } })} step={0.1} />
            <NumberField label="Admin %" value={g.adminPct} onChange={(v) => patch({ gnsProfit: { ...g, adminPct: v } })} step={0.1} />
            <NumberField label="WC cost %" value={g.wcCostPct} onChange={(v) => patch({ gnsProfit: { ...g, wcCostPct: v } })} step={0.1} />
          </div>
        </Panel>

        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
          <KPI k="Scenario volume" v={inr(Math.round(volume)) + ' packs/mo'} />
          <KPI k="Revenue / mo" v={`₹${inr(revenue)}`} />
          <KPI k="Gross margin" v={`₹${inr(gross)}`} s={`${((gross / Math.max(1, revenue)) * 100).toFixed(1)}%`} />
          <KPI k="Supplier incentive" v={`₹${inr(supplierValue)}`} tone="gold" />
          <KPI k="Operating cost" v={`₹${inr(opCost)}`} s={`${opCostPct.toFixed(1)}%`} />
          <KPI k="Contribution / mo" v={`₹${inr(contribution)}`} tone="gold" />
          <KPI k="Contribution %" v={`${contribPct.toFixed(1)}%`} tone={contribPct >= 3 ? 'gold' : 'warn'} />
          <KPI k="Annual contribution" v={`₹${inr(annualContribution)}`} tone="gold" />
          <KPI k="EBITDA (illustrative)" v={`₹${inr(ebitda * 12)}`} s="Excluding non-cash items" />
          <KPI
            k="Break-even volume"
            v={breakEvenVolume ? `${inr(breakEvenVolume)} packs` : '—'}
            s="Packs to cover operating cost"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RETAILER NETWORK SIMULATOR                                          */
/* ------------------------------------------------------------------ */

function RetailerSim() {
  const r = usePortal((s) => s.retailerSim);
  const patch = usePortal((s) => s.patch);

  const active = Math.round((r.numRetailers * r.activePct) / 100);
  const monthlySecondary = active * r.avgMonthlyPurchase;
  const annualSecondary = monthlySecondary * 12;
  const gnsContrib = (annualSecondary * r.gnsContribPct) / 100;
  const distContrib = (annualSecondary * r.distContribPct) / 100;
  const retailerGross = (annualSecondary * r.retailerGrossMarginPct) / 100;

  return (
    <div>
      <SectionHead
        n="06.c"
        title="Retailer Network Simulator"
        subtitle="Density → activity → contribution. Change retailer count, activity or margin to test sensitivity."
      />
      <div className="grid lg:grid-cols-12 gap-4">
        <Panel title="Inputs" className="lg:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Number of retailers" value={r.numRetailers} onChange={(v) => patch({ retailerSim: { ...r, numRetailers: v } })} />
            <NumberField label="Avg monthly ₹" value={r.avgMonthlyPurchase} onChange={(v) => patch({ retailerSim: { ...r, avgMonthlyPurchase: v } })} />
            <NumberField label="Active %" value={r.activePct} onChange={(v) => patch({ retailerSim: { ...r, activePct: v } })} step={1} min={0} max={100} />
            <NumberField label="GNS contribution %" value={r.gnsContribPct} onChange={(v) => patch({ retailerSim: { ...r, gnsContribPct: v } })} step={0.25} />
            <NumberField label="Distributor contrib %" value={r.distContribPct} onChange={(v) => patch({ retailerSim: { ...r, distContribPct: v } })} step={0.25} />
            <NumberField label="Retailer GM %" value={r.retailerGrossMarginPct} onChange={(v) => patch({ retailerSim: { ...r, retailerGrossMarginPct: v } })} step={0.5} />
          </div>
        </Panel>

        <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
          <KPI k="Active retailers" v={inr(active)} s={`of ${inr(r.numRetailers)}`} />
          <KPI k="Monthly secondary" v={`₹${inr(monthlySecondary)}`} s={`≈ ₹${inr(monthlySecondary / 10000000, 2)} Cr`} />
          <KPI k="Annual secondary" v={`₹${inr(annualSecondary / 10000000, 2)} Cr`} tone="gold" />
          <KPI k="GNS contribution" v={`₹${inr(gnsContrib / 10000000, 2)} Cr`} tone="gold" />
          <KPI k="Distributor contribution" v={`₹${inr(distContrib / 10000000, 2)} Cr`} />
          <KPI k="Retailer gross profit" v={`₹${inr(retailerGross / 10000000, 2)} Cr`} />
        </div>
      </div>
      <IllustrativeTag>
        Example: 500 retailers × ₹30,000 average monthly purchase = ₹1.5 Crore
        monthly secondary sales ≈ ₹18 Crore annualised. Illustrative scenario —
        not a forecast.
      </IllustrativeTag>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ROOT                                                               */
/* ------------------------------------------------------------------ */

export default function Profitability() {
  return (
    <div className="space-y-10">
      <PlainEnglish>
        <p>
          This is where the money makes sense — or does not. There are
          <strong> three connected profit-and-loss models </strong> on this
          page.
        </p>
        <p className="mt-2">
          The <strong>first</strong> calculates a distributor&apos;s
          profitability at a chosen volume, price and cost structure. The
          <strong> second</strong> calculates GNS Spices&apos; own
          profitability, with a scenario selector —
          <em> Conservative · Base · Growth </em> — that scales volume up or
          down to test sensitivity. The <strong>third</strong> simulates a
          whole retailer network: enter a number of retailers and their
          average monthly purchase, and it computes annual sales and the
          estimated contribution to each layer of the chain.
        </p>
        <p className="mt-2">
          Every input is editable and every output recalculates instantly.
          This is the sensitivity dial the CFO will spend the most time on —
          adjust the supplier price, incentives or operating cost and see
          what breaks.
        </p>
      </PlainEnglish>
      <DistributorProfit />
      <div className="divider" />
      <GNSProfit />
      <div className="divider" />
      <RetailerSim />
    </div>
  );
}
