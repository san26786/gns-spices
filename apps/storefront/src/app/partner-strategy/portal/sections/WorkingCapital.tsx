'use client';

import { inr, usePortal } from '../store';
import { IllustrativeTag, KPI, NumberField, Panel, SectionHead } from '../ui';

export default function WorkingCapital() {
  const w = usePortal((s) => s.workingCapital);
  const patch = usePortal((s) => s.patch);

  // All numbers stored in ₹ lakh; final WC also computed in ₹ crore.
  const monthlyPurchases = w.monthlyPurchases;              // ₹ lakh
  const daily = monthlyPurchases / 30;                       // ₹ lakh / day
  const inventoryInvestment = daily * w.stockDays;           // ₹ lakh
  const receivablesInvestment = daily * w.receivablesDays;   // ₹ lakh
  const payablesBenefit = daily * w.payablesDays;            // ₹ lakh
  const netWorkingCapital = inventoryInvestment + receivablesInvestment - payablesBenefit;
  const netWorkingCapitalCr = netWorkingCapital / 100;
  const cashConversionCycle = w.stockDays + w.receivablesDays - w.payablesDays;
  const openingInventory = inventoryInvestment;              // simplification
  const purchases = monthlyPurchases;
  const receivables = receivablesInvestment;
  const payables = payablesBenefit;

  const overThreshold = netWorkingCapitalCr > w.thresholdCr;

  return (
    <div>
      <SectionHead
        n="08"
        title="Working Capital Model"
        subtitle="This is the make-or-break of scale. Inventory + receivables − payables = the cash the business ties up. A threshold alert fires when net WC exceeds the ceiling you set."
      />

      <div className="grid lg:grid-cols-12 gap-4">
        <Panel title="Inputs" className="lg:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Monthly purchases"
              value={w.monthlyPurchases}
              onChange={(v) => patch({ workingCapital: { ...w, monthlyPurchases: v } })}
              suffix="₹ lakh / mo"
            />
            <NumberField
              label="Stock days"
              value={w.stockDays}
              onChange={(v) => patch({ workingCapital: { ...w, stockDays: v } })}
              suffix="days"
            />
            <NumberField
              label="Receivables days"
              value={w.receivablesDays}
              onChange={(v) => patch({ workingCapital: { ...w, receivablesDays: v } })}
              suffix="days"
            />
            <NumberField
              label="Payables days (credit period)"
              value={w.payablesDays}
              onChange={(v) => patch({ workingCapital: { ...w, payablesDays: v } })}
              suffix="days"
            />
            <NumberField
              label="Alert threshold"
              value={w.thresholdCr}
              onChange={(v) => patch({ workingCapital: { ...w, thresholdCr: v } })}
              suffix="₹ Cr"
              step={0.5}
            />
          </div>
          <IllustrativeTag>
            Simplified working-capital model — assumes steady-state monthly
            purchases and average day counts. For committee review, layer in
            seasonality and payment-behaviour distribution.
          </IllustrativeTag>
        </Panel>

        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <KPI k="Opening inventory" v={`₹${inr(openingInventory, 1)} L`} />
            <KPI k="Purchases / mo" v={`₹${inr(purchases, 1)} L`} />
            <KPI k="Receivables" v={`₹${inr(receivables, 1)} L`} />
            <KPI k="Payables" v={`₹${inr(payables, 1)} L`} tone="gold" />
            <KPI k="Stock days" v={`${w.stockDays} d`} />
            <KPI
              k="Cash conversion cycle"
              v={`${cashConversionCycle} d`}
              s="Stock + Receivables − Payables"
              tone={cashConversionCycle > 45 ? 'warn' : 'default'}
            />
          </div>

          <Panel title="Net working capital" tone="hi">
            <div className="space-y-1.5 text-sm">
              <Line k="Inventory investment" v={`+ ₹${inr(inventoryInvestment, 1)} L`} />
              <Line k="Receivable investment" v={`+ ₹${inr(receivablesInvestment, 1)} L`} />
              <Line k="Less payables" v={`− ₹${inr(payablesBenefit, 1)} L`} />
              <div style={{ borderTop: '1px solid var(--pt-line)' }} className="pt-2 mt-2 flex items-center justify-between">
                <span
                  className="text-[11px] uppercase tracking-widest font-semibold"
                  style={{ color: 'var(--pt-gold)' }}
                >
                  Net working capital
                </span>
                <span
                  className="mono font-bold text-xl"
                  style={{
                    color: overThreshold ? '#FCA5A5' : 'var(--pt-off)',
                  }}
                >
                  ₹{inr(netWorkingCapitalCr, 2)} Cr
                  <span className="text-xs ml-2" style={{ color: 'var(--pt-muted)' }}>
                    (₹{inr(netWorkingCapital, 1)} L)
                  </span>
                </span>
              </div>
            </div>

            {overThreshold && (
              <div
                className="mt-4 p-3 rounded-md text-sm flex items-start gap-2"
                style={{
                  background: 'rgba(220,53,69,0.08)',
                  border: '1px solid rgba(220,53,69,0.35)',
                  color: '#FCA5A5',
                }}
              >
                <strong style={{ color: '#FEE2E2' }}>Alert</strong>
                <span>
                  Net working capital of{' '}
                  <span className="mono">₹{inr(netWorkingCapitalCr, 2)} Cr</span>{' '}
                  exceeds the configured threshold of{' '}
                  <span className="mono">₹{inr(w.thresholdCr, 2)} Cr</span>.
                  Review credit policy, stock days or purchase pace before
                  scaling further.
                </span>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: 'var(--pt-muted)' }}>{k}</span>
      <span className="mono" style={{ color: 'var(--pt-text)' }}>{v}</span>
    </div>
  );
}
