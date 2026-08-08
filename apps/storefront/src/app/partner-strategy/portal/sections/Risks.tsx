'use client';

import { Risk, usePortal } from '../store';
import { IllustrativeTag, Panel, PlainEnglish, RiskBadge, SectionHead } from '../ui';

const LEVELS: Risk['level'][] = ['Low', 'Medium', 'High'];
const STATUSES: Risk['status'][] = ['Open', 'Monitoring', 'Mitigated', 'Escalated'];

export default function Risks() {
  const risks = usePortal((s) => s.risks);
  const patch = usePortal((s) => s.patch);

  function update(id: string, p: Partial<Risk>) {
    patch({ risks: risks.map((r) => (r.id === id ? { ...r, ...p } : r)) });
  }

  const high = risks.filter((r) => r.level === 'High').length;
  const med = risks.filter((r) => r.level === 'Medium').length;
  const low = risks.filter((r) => r.level === 'Low').length;
  const open = risks.filter((r) => r.status === 'Open').length;

  return (
    <div>
      <SectionHead
        n="09"
        title="Risk Dashboard"
        subtitle="A living register. Each risk has level, impact, mitigation, owner and status. Nothing here is auto-generated — edit as the working case matures."
      />

      <PlainEnglish>
        <p>
          Ten categories of risk that could damage the business, maintained
          as a live register. Each row has a
          <strong> level</strong> (Low / Medium / High), a description of
          what would happen if it materialises, our planned
          <strong> mitigation</strong>, the person or function that
          <strong> owns </strong> it, and its current <strong>status</strong>.
        </p>
        <p className="mt-2">
          Four of the ten — <em>distributor selection, credit, execution
          and working capital</em> — are the ones that historically destroy
          distribution ventures. They warrant particular attention in every
          review. The register is expected to be updated live: every
          operating review should touch at least two rows and escalate any
          &ldquo;High + Open&rdquo; item to the appropriate senior owner
          before the next scale decision.
        </p>
      </PlainEnglish>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="kpi">
          <div className="k">High</div>
          <div className="v" style={{ color: '#FCA5A5' }}>{high}</div>
        </div>
        <div className="kpi">
          <div className="k">Medium</div>
          <div className="v" style={{ color: 'var(--pt-warn)' }}>{med}</div>
        </div>
        <div className="kpi">
          <div className="k">Low</div>
          <div className="v" style={{ color: 'var(--pt-emerald-3)' }}>{low}</div>
        </div>
        <div className="kpi">
          <div className="k">Open items</div>
          <div className="v">{open}</div>
        </div>
      </div>

      <Panel padded={false}>
        <div className="scroll-x">
          <table className="data row-alt">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Level</th>
                <th>Impact</th>
                <th>Mitigation</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--pt-off)', fontWeight: 700 }}>
                    <input
                      className="cell-input"
                      value={r.name}
                      onChange={(e) => update(r.id, { name: e.target.value })}
                      style={{ minWidth: 160 }}
                    />
                  </td>
                  <td style={{ minWidth: 110 }}>
                    <select
                      className="cell-input"
                      value={r.level}
                      onChange={(e) => update(r.id, { level: e.target.value as Risk['level'] })}
                    >
                      {LEVELS.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                    <div className="mt-1">
                      <RiskBadge level={r.level} />
                    </div>
                  </td>
                  <td style={{ minWidth: 220 }}>
                    <input
                      className="cell-input"
                      value={r.impact}
                      onChange={(e) => update(r.id, { impact: e.target.value })}
                    />
                  </td>
                  <td style={{ minWidth: 240 }}>
                    <input
                      className="cell-input"
                      value={r.mitigation}
                      onChange={(e) => update(r.id, { mitigation: e.target.value })}
                    />
                  </td>
                  <td style={{ minWidth: 140 }}>
                    <input
                      className="cell-input"
                      value={r.owner}
                      onChange={(e) => update(r.id, { owner: e.target.value })}
                    />
                  </td>
                  <td style={{ minWidth: 140 }}>
                    <select
                      className="cell-input"
                      value={r.status}
                      onChange={(e) => update(r.id, { status: e.target.value as Risk['status'] })}
                    >
                      {STATUSES.map((s) => (
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
        Living register — update as the working case matures. Escalation of any
        High-level open item should be flagged to the CFO and COO before scale
        gates are cleared.
      </IllustrativeTag>
    </div>
  );
}
