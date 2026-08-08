'use client';

import { useMemo } from 'react';
import { inrCr, usePortal } from '../store';
import { IllustrativeTag, KPI, Panel, SectionHead } from '../ui';

export default function Overview() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const wc = usePortal((s) => s.workingCapital);
  const decision = usePortal((s) => s.decision);
  const jaunpurBlocks = usePortal((s) => s.jaunpurBlocks);
  const territories = usePortal((s) => s.territories);

  const totalGPs = jaunpurBlocks.reduce((a, b) => a + b.gramPanchayats, 0);
  const totalRetailers = jaunpurBlocks.reduce((a, b) => a + b.estRetailers, 0);
  const activeDistricts = territories.filter(
    (t) => t.status === 'Active' || t.status === 'Pilot' || t.status === 'Expansion',
  ).length;

  return (
    <div>
      <SectionHead
        n="01"
        title="Executive Business Case"
        subtitle="Kamdhenu is a proposed distribution opportunity under evaluation. This section frames the strategic intent, top-line planning references, and the objectives the case is being tested against."
      />

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPI k="Target market" v="India" s="National platform" />
        <KPI k="Initial pilot" v="Jaunpur" s="Model district" tone="gold" />
        <KPI k="District model" v="21 Blocks" s="Planning reference" />
        <KPI k="Gram Panchayats" v={totalGPs.toLocaleString('en-IN')} s="Sum of Jaunpur blocks (editable)" />
        <KPI
          k="Proposed network"
          v={`${totalRetailers.toLocaleString('en-IN')}+`}
          s="Retailers · sum of Jaunpur blocks"
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Panel title="Why this opportunity" className="lg:col-span-2">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--pt-text)' }}>
            The opportunity is to develop a structured, technology-enabled
            distribution network that can move from{' '}
            <strong style={{ color: 'var(--pt-gold-hi)' }}>District</strong> →{' '}
            <strong style={{ color: 'var(--pt-gold-hi)' }}>Block</strong> →{' '}
            <strong style={{ color: 'var(--pt-gold-hi)' }}>Gram Panchayat</strong> →{' '}
            <strong style={{ color: 'var(--pt-gold-hi)' }}>Retailer</strong> →{' '}
            <strong style={{ color: 'var(--pt-gold-hi)' }}>Consumer</strong>.
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--pt-muted)' }}>
            The objective is not simply to sell products. The objective is to
            build a repeatable market-development system that a supplier can
            plug into, and that GNS Spices can extend across categories and
            geographies.
          </p>
          <div className="mt-5 grid md:grid-cols-3 gap-3">
            {[
              ['Market penetration', 'Territories mapped and scored before capital is committed.'],
              ['Distribution density', 'Depth of coverage — Distributors, Blocks, Panchayats, Retailers.'],
              ['Retailer productivity', 'Turning coverage into recurring, growing per-retailer velocity.'],
            ].map(([t, d]) => (
              <div
                key={t}
                className="p-3 rounded-md"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--pt-line)',
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: 'var(--pt-gold)' }}
                >
                  {t}
                </div>
                <div className="mt-1 text-xs" style={{ color: 'var(--pt-muted)' }}>
                  {d}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Status snapshot">
          <div className="space-y-3 text-sm">
            <Row k="Version" v="v1.0" />
            <Row k="Date" v={today} />
            <Row k="Commercial status" v={<span className="tag tag-gold">Subject to agreement</span>} />
            <Row
              k="Decision status"
              v={
                <span
                  className="tag"
                  style={{
                    color:
                      decision.status === 'approved'
                        ? 'var(--pt-emerald-3)'
                        : decision.status === 'declined'
                          ? '#FCA5A5'
                          : 'var(--pt-muted)',
                  }}
                >
                  {decision.status === 'none' ? 'Under evaluation' : decision.status.replace('_', ' ')}
                </span>
              }
            />
            <div style={{ borderTop: '1px solid var(--pt-line)' }} />
            <Row
              k="Active / pilot districts"
              v={<span className="mono">{activeDistricts}</span>}
            />
            <Row
              k="Planning WC threshold"
              v={<span className="mono">{inrCr(wc.thresholdCr)}</span>}
            />
          </div>
        </Panel>
      </div>

      <IllustrativeTag>
        Kamdhenu is treated in this portal as a{' '}
        <em>Confidential — Working Business Case</em>. Nothing in this document
        implies a formal appointment, exclusivity or commercial agreement
        unless separately verified.
      </IllustrativeTag>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="label">{k}</span>
      <span>{v}</span>
    </div>
  );
}
