'use client';

import { RoadmapYear, inr, usePortal } from '../store';
import {
  IllustrativeTag,
  KPI,
  NumberField,
  Panel,
  SectionHead,
} from '../ui';

const PRESETS = {
  jaunpur: { states: 1, districts: 1, avgDistPerDistrict: 6, avgRetailersPerDist: 85, avgMonthlyRetailerPurchase: 30000 },
  up:      { states: 1, districts: 12, avgDistPerDistrict: 5, avgRetailersPerDist: 100, avgMonthlyRetailerPurchase: 32000 },
  multi:   { states: 4, districts: 40, avgDistPerDistrict: 5, avgRetailersPerDist: 100, avgMonthlyRetailerPurchase: 35000 },
  national:{ states: 20, districts: 200, avgDistPerDistrict: 5, avgRetailersPerDist: 100, avgMonthlyRetailerPurchase: 40000 },
} as const;

export default function NationalScale() {
  const s = usePortal((st) => st.nationalSim);
  const roadmap = usePortal((st) => st.roadmap);
  const patch = usePortal((st) => st.patch);

  const totalDist = s.states * s.districts * s.avgDistPerDistrict;
  const totalRet = totalDist * s.avgRetailersPerDist;
  const monthlySales = totalRet * s.avgMonthlyRetailerPurchase;
  const annualSales = monthlySales * 12;
  const gnsContrib = (annualSales * s.gnsContribPct) / 100;

  function applyPreset(k: keyof typeof PRESETS) {
    patch({ nationalSim: { ...s, ...PRESETS[k] } });
  }
  function updateRoadmap(idx: number, p: Partial<RoadmapYear>) {
    patch({
      roadmap: roadmap.map((y, i) => (i === idx ? { ...y, ...p } : y)),
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <SectionHead
          n="07.a"
          title="National Scale Simulator"
          subtitle="Model national coverage from four presets: Jaunpur pilot → UP → multi-state → national. All numbers editable."
          right={
            <div className="inline-flex rounded-md" style={{ border: '1px solid var(--pt-line)' }}>
              {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => (
                <button
                  key={k}
                  onClick={() => applyPreset(k)}
                  className="px-3 py-1.5 text-[11px] uppercase tracking-widest font-semibold transition"
                  style={{
                    background: 'transparent',
                    color: 'var(--pt-muted-2)',
                    borderRight: '1px solid var(--pt-line)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pt-gold)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pt-muted-2)')}
                >
                  {k === 'up' ? 'Uttar Pradesh' : k === 'multi' ? 'Multi-State' : k === 'national' ? 'National' : 'Jaunpur'}
                </button>
              ))}
            </div>
          }
        />
        <div className="grid lg:grid-cols-12 gap-4">
          <Panel title="Inputs" className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="States" value={s.states} onChange={(v) => patch({ nationalSim: { ...s, states: v } })} />
              <NumberField label="Districts" value={s.districts} onChange={(v) => patch({ nationalSim: { ...s, districts: v } })} />
              <NumberField label="Avg dist / district" value={s.avgDistPerDistrict} onChange={(v) => patch({ nationalSim: { ...s, avgDistPerDistrict: v } })} />
              <NumberField label="Avg retailers / dist" value={s.avgRetailersPerDist} onChange={(v) => patch({ nationalSim: { ...s, avgRetailersPerDist: v } })} />
              <NumberField label="Avg monthly / retailer ₹" value={s.avgMonthlyRetailerPurchase} onChange={(v) => patch({ nationalSim: { ...s, avgMonthlyRetailerPurchase: v } })} />
              <NumberField label="GNS contribution %" value={s.gnsContribPct} onChange={(v) => patch({ nationalSim: { ...s, gnsContribPct: v } })} step={0.25} />
            </div>
          </Panel>
          <div className="lg:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
            <KPI k="Total distributors" v={inr(totalDist)} />
            <KPI k="Total retailers" v={inr(totalRet)} />
            <KPI k="Monthly sales" v={`₹${inr(monthlySales / 10000000, 2)} Cr`} />
            <KPI k="Annual sales" v={`₹${inr(annualSales / 10000000, 2)} Cr`} tone="gold" />
            <KPI k="GNS contribution" v={`₹${inr(gnsContrib / 10000000, 2)} Cr`} tone="gold" />
            <KPI k="Retailers / district" v={inr(s.avgDistPerDistrict * s.avgRetailersPerDist)} s="Density check" />
          </div>
        </div>
      </div>

      {/* 5-YEAR ROADMAP */}
      <div>
        <SectionHead
          n="07.b"
          title="5-Year Roadmap"
          subtitle="Plan the multi-year trajectory. States, distributors, retailers, sales, contribution, working capital and management headcount — every cell is editable."
        />
        <Panel padded={false}>
          <div className="scroll-x">
            <table className="data row-alt">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Focus</th>
                  <th style={{ textAlign: 'right' }}>States</th>
                  <th style={{ textAlign: 'right' }}>Districts</th>
                  <th style={{ textAlign: 'right' }}>Distributors</th>
                  <th style={{ textAlign: 'right' }}>Retailers</th>
                  <th style={{ textAlign: 'right' }}>Annual sales (Cr)</th>
                  <th style={{ textAlign: 'right' }}>Contribution (Cr)</th>
                  <th style={{ textAlign: 'right' }}>WC (Cr)</th>
                  <th style={{ textAlign: 'right' }}>Mgmt team</th>
                </tr>
              </thead>
              <tbody>
                {roadmap.map((y, i) => (
                  <tr key={y.year}>
                    <td style={{ color: 'var(--pt-gold-hi)', fontWeight: 700 }} className="mono">
                      {y.year}
                    </td>
                    <td style={{ color: 'var(--pt-off)', fontWeight: 600 }}>
                      <input
                        className="cell-input"
                        value={y.label}
                        onChange={(e) => updateRoadmap(i, { label: e.target.value })}
                      />
                    </td>
                    {(
                      [
                        ['states',        y.states,        false],
                        ['districts',     y.districts,     false],
                        ['distributors',  y.distributors,  false],
                        ['retailers',     y.retailers,     false],
                        ['annualSales',   y.annualSales,   true],
                        ['contribution',  y.contribution,  true],
                        ['workingCapital',y.workingCapital,true],
                        ['management',    y.management,    false],
                      ] as [keyof RoadmapYear, number, boolean][]
                    ).map(([k, v, dec]) => (
                      <td key={String(k)} style={{ textAlign: 'right' }} className="mono">
                        <input
                          type="number"
                          className="cell-input"
                          style={{ textAlign: 'right' }}
                          value={v}
                          step={dec ? 0.5 : 1}
                          onChange={(e) =>
                            updateRoadmap(i, { [k]: Number(e.target.value) || 0 } as Partial<RoadmapYear>)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <IllustrativeTag>
          All figures are editable planning values. This roadmap is a working
          document — not a commitment or forecast.
        </IllustrativeTag>
      </div>
    </div>
  );
}
