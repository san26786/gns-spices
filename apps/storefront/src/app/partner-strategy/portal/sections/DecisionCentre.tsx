'use client';

import { DecisionStatus, inr, usePortal } from '../store';
import {
  IllustrativeTag,
  KPI,
  NumberField,
  Panel,
  SectionHead,
  TextareaField,
} from '../ui';

const ACTIONS: {
  key: Exclude<DecisionStatus, 'none'>;
  label: string;
  tone: 'primary' | 'ghost' | 'danger';
}[] = [
  { key: 'approved',  label: 'Approve pilot',      tone: 'primary' },
  { key: 'more_data', label: 'Request more data',  tone: 'ghost' },
  { key: 'revise',    label: 'Revise assumptions', tone: 'ghost' },
  { key: 'declined',  label: 'Do not proceed',     tone: 'danger' },
];

export default function DecisionCentre() {
  const d = usePortal((s) => s.decision);
  const patch = usePortal((s) => s.patch);
  const wc = usePortal((s) => s.workingCapital);
  const nationalSim = usePortal((s) => s.nationalSim);

  // Suggested derived values (partner can override)
  const monthlySales =
    nationalSim.states *
    nationalSim.districts *
    nationalSim.avgDistPerDistrict *
    nationalSim.avgRetailersPerDist *
    nationalSim.avgMonthlyRetailerPurchase;
  const annualSalesCr = (monthlySales * 12) / 10000000;
  const gnsContribCr = (annualSalesCr * nationalSim.gnsContribPct) / 100;
  const wcCr =
    ((wc.monthlyPurchases / 30) * (wc.stockDays + wc.receivablesDays - wc.payablesDays)) / 100;

  function record(status: DecisionStatus) {
    patch({ decision: { ...d, status } });
  }

  return (
    <div>
      <SectionHead
        n="10"
        title="Decision Centre"
        subtitle="The set of numbers the committee reads before choosing. Buttons are interface actions only — they do not send anything externally."
      />

      <div className="grid lg:grid-cols-12 gap-4">
        <Panel title="Executive figures" className="lg:col-span-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <NumberField label="Total investment (₹ L)" value={d.totalInvestment} onChange={(v) => patch({ decision: { ...d, totalInvestment: v } })} />
            <NumberField label="Annual revenue (₹ Cr)" value={d.expectedAnnualRevenue} onChange={(v) => patch({ decision: { ...d, expectedAnnualRevenue: v } })} step={0.5} />
            <NumberField label="Contribution (₹ Cr)" value={d.expectedContribution} onChange={(v) => patch({ decision: { ...d, expectedContribution: v } })} step={0.1} />
            <NumberField label="Break-even (month)" value={d.breakEvenMonth} onChange={(v) => patch({ decision: { ...d, breakEvenMonth: v } })} />
            <NumberField label="Expected ROI %" value={d.expectedROI} onChange={(v) => patch({ decision: { ...d, expectedROI: v } })} step={1} />
            <NumberField label="Payback (months)" value={d.paybackMonths} onChange={(v) => patch({ decision: { ...d, paybackMonths: v } })} />
            <NumberField label="Active retailers" value={d.activeRetailers} onChange={(v) => patch({ decision: { ...d, activeRetailers: v } })} />
            <NumberField label="Districts covered" value={d.districtsCovered} onChange={(v) => patch({ decision: { ...d, districtsCovered: v } })} />
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI k="Total investment" v={`₹${inr(d.totalInvestment)} L`} tone="gold" />
            <KPI k="Annual revenue" v={`₹${inr(d.expectedAnnualRevenue, 2)} Cr`} />
            <KPI k="Contribution" v={`₹${inr(d.expectedContribution, 2)} Cr`} tone="gold" />
            <KPI k="Break-even" v={`M${d.breakEvenMonth}`} />
            <KPI k="Expected ROI" v={`${d.expectedROI}%`} tone={d.expectedROI >= 20 ? 'gold' : 'warn'} />
            <KPI k="Payback" v={`${d.paybackMonths} mo`} />
            <KPI k="Active retailers" v={inr(d.activeRetailers)} />
            <KPI k="Districts covered" v={inr(d.districtsCovered)} />
          </div>

          <div
            className="mt-6 p-4 rounded-md text-sm"
            style={{
              background: 'rgba(176,141,58,0.06)',
              border: '1px solid rgba(176,141,58,0.25)',
            }}
          >
            <div className="label mb-2">Derived from other sections (for cross-check)</div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <Row label="National sim · annual sales" v={`₹${inr(annualSalesCr, 2)} Cr`} />
              <Row label="National sim · GNS contribution" v={`₹${inr(gnsContribCr, 2)} Cr`} />
              <Row label="Working capital · net" v={`₹${inr(wcCr, 2)} Cr`} />
            </div>
          </div>
        </Panel>

        <Panel title="Committee action" className="lg:col-span-4">
          <div className="space-y-3">
            {ACTIONS.map((a) => (
              <button
                key={a.key}
                onClick={() => record(a.key)}
                className={`btn w-full ${a.tone === 'primary' ? 'btn-primary' : a.tone === 'danger' ? 'btn-danger' : ''}`}
                style={{ justifyContent: 'space-between' }}
              >
                <span>{a.label}</span>
                {d.status === a.key && <span>●</span>}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <TextareaField
              label="Decision note (audit trail)"
              value={d.decisionNote}
              onChange={(v) => patch({ decision: { ...d, decisionNote: v } })}
              rows={5}
              placeholder="Rationale, conditions, follow-ups…"
            />
          </div>

          <div
            className="mt-5 p-3 rounded-md text-sm"
            style={{
              background:
                d.status === 'approved'
                  ? 'rgba(63,181,123,0.10)'
                  : d.status === 'declined'
                    ? 'rgba(220,53,69,0.10)'
                    : 'rgba(255,255,255,0.02)',
              border: `1px solid ${
                d.status === 'approved'
                  ? 'rgba(63,181,123,0.35)'
                  : d.status === 'declined'
                    ? 'rgba(220,53,69,0.35)'
                    : 'var(--pt-line)'
              }`,
            }}
          >
            <div className="label">Current status</div>
            <div
              className="mt-1 text-sm font-semibold"
              style={{
                color:
                  d.status === 'approved'
                    ? 'var(--pt-emerald-3)'
                    : d.status === 'declined'
                      ? '#FCA5A5'
                      : 'var(--pt-off)',
              }}
            >
              {d.status === 'none'
                ? 'Under evaluation — no decision recorded yet'
                : d.status === 'approved'
                  ? 'Pilot approved (recorded locally)'
                  : d.status === 'declined'
                    ? 'Not to proceed (recorded locally)'
                    : d.status === 'more_data'
                      ? 'More data requested'
                      : 'Assumptions to be revised'}
            </div>
          </div>
        </Panel>
      </div>

      <IllustrativeTag>
        Decisions recorded here are stored locally in this browser only. They
        are not transmitted, published or acted upon automatically.
      </IllustrativeTag>
    </div>
  );
}

function Row({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--pt-muted-2)' }}>{label}</div>
      <div className="mono mt-1" style={{ color: 'var(--pt-off)', fontWeight: 600 }}>{v}</div>
    </div>
  );
}
