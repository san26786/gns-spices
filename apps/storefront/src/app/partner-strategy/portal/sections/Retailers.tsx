'use client';

import { RetailerTier, usePortal } from '../store';
import { IllustrativeTag, Panel, SectionHead } from '../ui';

type TierComputed = {
  effectiveCost: number;
  grossPerPack: number;
  grossMarginPct: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  annualProfit: number;
};

function compute(t: RetailerTier): TierComputed {
  const effectiveCost = t.basePrice * (1 - t.volumeDiscount / 100) * (1 - t.promoDiscount / 100);
  const grossPerPack = t.sellingPrice - effectiveCost;
  const grossMarginPct = t.sellingPrice > 0 ? (grossPerPack / t.sellingPrice) * 100 : 0;
  const monthlyRevenue = t.sellingPrice * t.monthlyPacks;
  const monthlyProfit = grossPerPack * t.monthlyPacks;
  const annualProfit = monthlyProfit * 12;
  return { effectiveCost, grossPerPack, grossMarginPct, monthlyRevenue, monthlyProfit, annualProfit };
}

export default function Retailers() {
  const tiers = usePortal((s) => s.retailerTiers);
  const patch = usePortal((s) => s.patch);

  function update(id: string, p: Partial<RetailerTier>) {
    patch({ retailerTiers: tiers.map((t) => (t.id === id ? { ...t, ...p } : t)) });
  }

  return (
    <div>
      <SectionHead
        n="05"
        title="Retailer Profitability Engine"
        subtitle="Six ascending tiers. All commercial assumptions are editable — pricing, discounts, volumes. Effective cost, margin, monthly and annual profit compute live."
      />

      <Panel padded={false}>
        <div className="scroll-x">
          <table className="data row-alt">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Range</th>
                <th style={{ textAlign: 'right' }}>Packs / mo</th>
                <th style={{ textAlign: 'right' }}>Base ₹</th>
                <th style={{ textAlign: 'right' }}>Vol %</th>
                <th style={{ textAlign: 'right' }}>Promo %</th>
                <th style={{ textAlign: 'right' }}>Effective ₹</th>
                <th style={{ textAlign: 'right' }}>Retail ₹</th>
                <th style={{ textAlign: 'right' }}>GP / pack</th>
                <th style={{ textAlign: 'right' }}>GM %</th>
                <th style={{ textAlign: 'right' }}>Monthly ₹</th>
                <th style={{ textAlign: 'right' }}>Annual ₹</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => {
                const c = compute(t);
                return (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--pt-off)', fontWeight: 700 }}>
                      {t.name}
                    </td>
                    <td style={{ color: 'var(--pt-muted)' }}>{t.range}</td>
                    <td style={{ textAlign: 'right' }} className="mono">
                      <input
                        type="number"
                        className="cell-input"
                        style={{ textAlign: 'right' }}
                        value={t.monthlyPacks}
                        onChange={(e) => update(t.id, { monthlyPacks: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }} className="mono">
                      <input
                        type="number"
                        className="cell-input"
                        style={{ textAlign: 'right' }}
                        value={t.basePrice}
                        onChange={(e) => update(t.id, { basePrice: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }} className="mono">
                      <input
                        type="number"
                        step={0.5}
                        className="cell-input"
                        style={{ textAlign: 'right' }}
                        value={t.volumeDiscount}
                        onChange={(e) => update(t.id, { volumeDiscount: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }} className="mono">
                      <input
                        type="number"
                        step={0.5}
                        className="cell-input"
                        style={{ textAlign: 'right' }}
                        value={t.promoDiscount}
                        onChange={(e) => update(t.id, { promoDiscount: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td
                      style={{ textAlign: 'right', color: 'var(--pt-off)' }}
                      className="mono"
                    >
                      {c.effectiveCost.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }} className="mono">
                      <input
                        type="number"
                        className="cell-input"
                        style={{ textAlign: 'right' }}
                        value={t.sellingPrice}
                        onChange={(e) => update(t.id, { sellingPrice: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td
                      style={{ textAlign: 'right', color: 'var(--pt-off)' }}
                      className="mono"
                    >
                      {c.grossPerPack.toFixed(2)}
                    </td>
                    <td
                      style={{ textAlign: 'right', color: 'var(--pt-gold-hi)' }}
                      className="mono"
                    >
                      {c.grossMarginPct.toFixed(1)}%
                    </td>
                    <td
                      style={{ textAlign: 'right', color: 'var(--pt-off)' }}
                      className="mono"
                    >
                      {Math.round(c.monthlyProfit).toLocaleString('en-IN')}
                    </td>
                    <td
                      style={{ textAlign: 'right', color: 'var(--pt-emerald-3)', fontWeight: 700 }}
                      className="mono"
                    >
                      {Math.round(c.annualProfit).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <IllustrativeTag>
        Illustrative commercial assumptions — subject to supplier agreement.
        Absolute values shown here are planning inputs, not published prices.
      </IllustrativeTag>
    </div>
  );
}
