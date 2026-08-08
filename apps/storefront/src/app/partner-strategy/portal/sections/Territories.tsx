'use client';

import { useMemo } from 'react';
import {
  Priority,
  DistStatus,
  Territory,
  TerritoryWeights,
  priorityFromScore,
  usePortal,
} from '../store';
import {
  IllustrativeTag,
  Panel,
  PlainEnglish,
  PriorityBadge,
  SectionHead,
} from '../ui';

const STATUS_OPTIONS: DistStatus[] = [
  'Not Assessed',
  'Priority',
  'Distributor Required',
  'Pilot',
  'Active',
  'Expansion',
];
const PRIORITY_OPTIONS: Priority[] = ['A+', 'A', 'B', 'C', 'D'];

export default function Territories() {
  const territories = usePortal((s) => s.territories);
  const filter = usePortal((s) => s.territoriesFilter);
  const patch = usePortal((s) => s.patch);
  const weights = usePortal((s) => s.territoryWeights);
  const cand = usePortal((s) => s.territoryCandidate);

  const states = useMemo(
    () => Array.from(new Set(territories.map((t) => t.state))).sort(),
    [territories],
  );

  const filtered = territories.filter((t) => {
    if (filter.state && t.state !== filter.state) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.status && t.status !== filter.status) return false;
    return true;
  });

  const totalWeights = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalScore = Object.entries(cand.scores).reduce((a, [, v]) => a + v, 0);
  const priority = priorityFromScore(totalScore);

  function updateTerr(id: string, patchTerr: Partial<Territory>) {
    patch({
      territories: territories.map((t) =>
        t.id === id ? { ...t, ...patchTerr } : t,
      ),
    });
  }
  function updateWeight(k: keyof TerritoryWeights, v: number) {
    patch({ territoryWeights: { ...weights, [k]: v } });
  }
  function updateScore(k: keyof TerritoryWeights, v: number) {
    patch({
      territoryCandidate: { ...cand, scores: { ...cand.scores, [k]: v } },
    });
  }

  return (
    <div>
      <SectionHead
        n="02"
        title="India Territory Planning"
        subtitle="India → State → District → Block → Gram Panchayat → Retailer. Every row is editable; every filter is live. Add / remove rows to build the full national plan."
      />

      <PlainEnglish>
        <p>
          This page shows two things. Above, a table of sample Indian
          districts — real states, populations and administrative counts —
          each with a <strong>priority band</strong> and a
          <strong> status</strong> column indicating which we plan to enter
          first. The filters let you narrow the list by state, priority or
          status.
        </p>
        <p className="mt-2">
          Further down, a <strong>scoring engine</strong> shows <em>how</em>{' '}
          those priority bands are actually calculated: nine factors —
          population, retail opportunity, competition, and so on — each worth
          a share of 100 points. Move the point weights up or down and the
          priority for the sample district recalculates instantly. It is the
          model behind the classifications, not just the classifications
          themselves.
        </p>
      </PlainEnglish>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterSelect
          label="State"
          value={filter.state}
          options={states}
          onChange={(v) => patch({ territoriesFilter: { ...filter, state: v } })}
        />
        <FilterSelect
          label="Priority"
          value={filter.priority}
          options={PRIORITY_OPTIONS}
          onChange={(v) => patch({ territoriesFilter: { ...filter, priority: v } })}
        />
        <FilterSelect
          label="Status"
          value={filter.status}
          options={STATUS_OPTIONS}
          onChange={(v) => patch({ territoriesFilter: { ...filter, status: v } })}
        />
        <div
          className="text-[11px] tracking-widest uppercase ml-auto"
          style={{ color: 'var(--pt-muted-2)' }}
        >
          {filtered.length} of {territories.length} rows
        </div>
      </div>

      <Panel padded={false}>
        <div className="scroll-x">
          <table className="data row-alt">
            <thead>
              <tr>
                <th>State</th>
                <th>District</th>
                <th style={{ textAlign: 'right' }}>Population</th>
                <th style={{ textAlign: 'right' }}>Blocks</th>
                <th style={{ textAlign: 'right' }}>GPs</th>
                <th style={{ textAlign: 'right' }}>Retail Opp.</th>
                <th style={{ textAlign: 'right' }}>Dist. Req.</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.state}</td>
                  <td style={{ color: 'var(--pt-off)', fontWeight: 600 }}>
                    {t.district}
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <CellNum
                      value={t.population}
                      onChange={(v) => updateTerr(t.id, { population: v })}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <CellNum
                      value={t.blocks}
                      onChange={(v) => updateTerr(t.id, { blocks: v })}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <CellNum
                      value={t.gramPanchayats}
                      onChange={(v) => updateTerr(t.id, { gramPanchayats: v })}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <CellNum
                      value={t.estRetailOpportunity}
                      onChange={(v) => updateTerr(t.id, { estRetailOpportunity: v })}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <CellNum
                      value={t.distributorRequirement}
                      onChange={(v) => updateTerr(t.id, { distributorRequirement: v })}
                    />
                  </td>
                  <td>
                    <select
                      className="cell-input"
                      value={t.priority}
                      onChange={(e) =>
                        updateTerr(t.id, { priority: e.target.value as Priority })
                      }
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="cell-input"
                      value={t.status}
                      onChange={(e) =>
                        updateTerr(t.id, { status: e.target.value as DistStatus })
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <IllustrativeTag>
        Population and administrative counts are planning references only.
        Verify against latest sources before commitment.
      </IllustrativeTag>

      {/* SECTION 5 — TERRITORY SCORING ENGINE */}
      <div className="mt-10">
        <SectionHead
          n="02.b"
          title="Territory Scoring Engine"
          subtitle="A 100-point scorecard that turns a district or block into a ranked opportunity. Weights and scores are editable; the resulting classification updates live."
        />
        <div className="grid lg:grid-cols-12 gap-4">
          <Panel title="Weight allocation · 100 pts" className="lg:col-span-4">
            <div className="space-y-2.5 text-sm">
              {(Object.keys(weights) as (keyof TerritoryWeights)[]).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <div className="flex-1 label" style={{ letterSpacing: '0.1em' }}>
                    {LABELS[k]}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={weights[k]}
                    onChange={(e) => updateWeight(k, Number(e.target.value) || 0)}
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
                      totalWeights === 100
                        ? 'var(--pt-emerald-3)'
                        : 'var(--pt-warn)',
                  }}
                >
                  {totalWeights}
                </span>
              </div>
            </div>
          </Panel>

          <Panel
            title={`Score a territory · ${cand.name}`}
            right={
              <input
                className="cell-input"
                value={cand.name}
                onChange={(e) =>
                  patch({ territoryCandidate: { ...cand, name: e.target.value } })
                }
                style={{ width: 180 }}
              />
            }
            className="lg:col-span-5"
          >
            <div className="space-y-2 text-sm">
              {(Object.keys(weights) as (keyof TerritoryWeights)[]).map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <div className="flex-1 text-[13px]" style={{ color: 'var(--pt-text)' }}>
                    {LABELS[k]}
                  </div>
                  <div className="w-40 progress gold">
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
                    onChange={(e) => updateScore(k, Number(e.target.value) || 0)}
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

          <Panel title="Classification" tone="hi" className="lg:col-span-3">
            <div className="text-center">
              <div
                className="mono font-bold"
                style={{ fontSize: 56, color: 'var(--pt-off)', lineHeight: 1 }}
              >
                {totalScore}
                <span style={{ color: 'var(--pt-muted-2)', fontSize: 24 }}>/100</span>
              </div>
              <div className="mt-4">
                <PriorityBadge p={priority} />
              </div>
              <div
                className="mt-4 text-[11px] leading-relaxed"
                style={{ color: 'var(--pt-muted)' }}
              >
                80–100 = A+ · 60–79 = A · 40–59 = B · 20–39 = C · &lt;20 = D
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

const LABELS: Record<keyof TerritoryWeights, string> = {
  population: 'Population',
  households: 'Households',
  gramPanchayats: 'Gram Panchayats',
  retailOpportunity: 'Retail opportunity',
  existingSales: 'Existing sales',
  urbanMarket: 'Urban market',
  logistics: 'Logistics',
  competition: 'Competition',
  productFit: 'Product fit',
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="label">{label}</span>
      <select
        className="select"
        style={{ width: 180 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function CellNum({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      className="cell-input"
      style={{ textAlign: 'right' }}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
    />
  );
}
