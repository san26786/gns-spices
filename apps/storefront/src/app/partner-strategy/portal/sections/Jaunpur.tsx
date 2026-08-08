'use client';

import {
  DistStatus,
  JaunpurBlock,
  Priority,
  usePortal,
} from '../store';
import { IllustrativeTag, KPI, Panel, PriorityBadge, SectionHead } from '../ui';

const STATUS_OPTIONS: DistStatus[] = [
  'Not Assessed',
  'Priority',
  'Distributor Required',
  'Pilot',
  'Active',
  'Expansion',
];
const PRIORITY_OPTIONS: Priority[] = ['A+', 'A', 'B', 'C', 'D'];

export default function Jaunpur() {
  const blocks = usePortal((s) => s.jaunpurBlocks);
  const patch = usePortal((s) => s.patch);

  const totalGPs = blocks.reduce((a, b) => a + b.gramPanchayats, 0);
  const totalPop = blocks.reduce((a, b) => a + b.population, 0);
  const totalRet = blocks.reduce((a, b) => a + b.estRetailers, 0);
  const totalSales = blocks.reduce((a, b) => a + b.monthlySalesPotential, 0);
  const priorityCount = blocks.filter((b) => b.status === 'Priority').length;
  const activeCount = blocks.filter((b) => b.status === 'Active' || b.status === 'Pilot').length;

  function updateBlock(id: string, p: Partial<JaunpurBlock>) {
    patch({ jaunpurBlocks: blocks.map((b) => (b.id === id ? { ...b, ...p } : b)) });
  }

  return (
    <div>
      <SectionHead
        n="03"
        title="Jaunpur — Model District"
        subtitle="21 development blocks under the pilot planning frame. Every value is editable. Use it as a live working sheet during evaluation."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KPI k="Blocks" v={blocks.length} />
        <KPI k="Total GPs" v={totalGPs.toLocaleString('en-IN')} />
        <KPI k="Planning population" v={totalPop.toLocaleString('en-IN')} />
        <KPI k="Estimated retailers" v={totalRet.toLocaleString('en-IN')} />
        <KPI k="Monthly sales potential" v={`₹${(totalSales / 100).toFixed(2)} Cr`} s="Sum of blocks · illustrative" tone="gold" />
        <KPI
          k="Status"
          v={`${priorityCount + activeCount} / ${blocks.length}`}
          s={`${activeCount} active/pilot · ${priorityCount} priority`}
        />
      </div>

      <Panel padded={false}>
        <div className="scroll-x">
          <table className="data row-alt">
            <thead>
              <tr>
                <th>#</th>
                <th>Block</th>
                <th style={{ textAlign: 'right' }}>Population</th>
                <th style={{ textAlign: 'right' }}>GPs</th>
                <th style={{ textAlign: 'right' }}>Est. Retailers</th>
                <th style={{ textAlign: 'right' }}>Dist. Req.</th>
                <th style={{ textAlign: 'right' }}>Monthly Sales (₹L)</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b, i) => (
                <tr key={b.id}>
                  <td
                    className="mono"
                    style={{ color: 'var(--pt-muted-2)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td style={{ color: 'var(--pt-off)', fontWeight: 600 }}>
                    <input
                      className="cell-input"
                      value={b.block}
                      onChange={(e) => updateBlock(b.id, { block: e.target.value })}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <input
                      type="number"
                      className="cell-input"
                      style={{ textAlign: 'right' }}
                      value={b.population}
                      onChange={(e) => updateBlock(b.id, { population: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <input
                      type="number"
                      className="cell-input"
                      style={{ textAlign: 'right' }}
                      value={b.gramPanchayats}
                      onChange={(e) => updateBlock(b.id, { gramPanchayats: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <input
                      type="number"
                      className="cell-input"
                      style={{ textAlign: 'right' }}
                      value={b.estRetailers}
                      onChange={(e) => updateBlock(b.id, { estRetailers: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <input
                      type="number"
                      className="cell-input"
                      style={{ textAlign: 'right' }}
                      value={b.distributorRequirement}
                      onChange={(e) => updateBlock(b.id, { distributorRequirement: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    <input
                      type="number"
                      className="cell-input"
                      style={{ textAlign: 'right' }}
                      value={b.monthlySalesPotential}
                      onChange={(e) => updateBlock(b.id, { monthlySalesPotential: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td>
                    <select
                      className="cell-input"
                      value={b.priority}
                      onChange={(e) => updateBlock(b.id, { priority: e.target.value as Priority })}
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="cell-input"
                      value={b.status}
                      onChange={(e) => updateBlock(b.id, { status: e.target.value as DistStatus })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              <tr style={{ background: 'rgba(21,71,52,0.15)' }}>
                <td colSpan={2} style={{ color: 'var(--pt-gold-hi)', fontWeight: 700 }}>
                  Total
                </td>
                <td style={{ textAlign: 'right' }} className="mono">
                  {totalPop.toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'right' }} className="mono">
                  {totalGPs.toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'right' }} className="mono">
                  {totalRet.toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'right' }} className="mono">
                  {blocks.reduce((a, b) => a + b.distributorRequirement, 0)}
                </td>
                <td style={{ textAlign: 'right' }} className="mono" >
                  {totalSales.toLocaleString('en-IN')}
                </td>
                <td colSpan={2}>
                  <PriorityBadge p="A+" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <IllustrativeTag>
        Block-level population, Gram Panchayat counts and retail estimates are
        editable planning references. Verify against latest administrative
        records before commitment.
      </IllustrativeTag>
    </div>
  );
}
