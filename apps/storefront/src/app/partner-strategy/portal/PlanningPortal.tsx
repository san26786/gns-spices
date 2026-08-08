'use client';

import { useEffect, useState } from 'react';
import SessionBar from './SessionBar';
import { hydrateFor, persistFor, usePortal } from './store';
import { portalCSS } from './ui';
import Overview from './sections/Overview';
import Territories from './sections/Territories';
import Jaunpur from './sections/Jaunpur';
import Distributors from './sections/Distributors';
import Retailers from './sections/Retailers';
import Profitability from './sections/Profitability';
import NationalScale from './sections/NationalScale';
import WorkingCapital from './sections/WorkingCapital';
import Risks from './sections/Risks';
import DecisionCentre from './sections/DecisionCentre';
import Notes from './sections/Notes';

const NAV: {
  key: string;
  n: string;
  label: string;
}[] = [
  { key: 'overview',       n: '01', label: 'Overview' },
  { key: 'territories',    n: '02', label: 'Territories' },
  { key: 'jaunpur',        n: '03', label: 'Jaunpur' },
  { key: 'distributors',   n: '04', label: 'Distributors' },
  { key: 'retailers',      n: '05', label: 'Retailers' },
  { key: 'profitability',  n: '06', label: 'Profitability' },
  { key: 'national',       n: '07', label: 'National Scale' },
  { key: 'working-capital',n: '08', label: 'Working Capital' },
  { key: 'risks',          n: '09', label: 'Risks' },
  { key: 'decision',       n: '10', label: 'Decision Centre' },
  { key: 'notes',          n: '11', label: 'Notes' },
];

export default function PlanningPortal({
  partner,
  expiresAt,
}: {
  partner: string;
  expiresAt: number;
}) {
  const active = usePortal((s) => s.activeSection);
  const setActive = usePortal((s) => s.setActive);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrateFor(partner);
    setHydrated(true);
    const unsub = persistFor(partner);
    return unsub;
  }, [partner]);

  return (
    <div className="pt-root min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: portalCSS }} />
      <SessionBar partner={partner} expiresAt={expiresAt} />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-40px)]">
        {/* SIDEBAR */}
        <aside
          className="lg:w-[240px] lg:shrink-0"
          style={{
            borderRight: '1px solid var(--pt-line)',
            background: 'var(--pt-bg-2)',
          }}
        >
          <div className="p-5">
            <div
              className="text-[10px] tracking-[0.45em] uppercase font-semibold mb-1"
              style={{ color: 'var(--pt-muted)' }}
            >
              GNS Spices
            </div>
            <div
              className="text-[13px] font-semibold leading-tight"
              style={{ color: 'var(--pt-off)' }}
            >
              Partner Strategy Portal
            </div>
            <div
              className="mt-3 p-3 rounded-md"
              style={{
                background: 'rgba(176,141,58,0.06)',
                border: '1px solid rgba(176,141,58,0.25)',
              }}
            >
              <div className="text-[9px] tracking-[0.3em] uppercase font-bold" style={{ color: 'var(--pt-gold)' }}>
                Confidential project
              </div>
              <div className="mt-1 text-[13px] font-semibold" style={{ color: 'var(--pt-off)' }}>
                Kamdhenu — India
              </div>
              <div className="mt-0.5 text-[10px]" style={{ color: 'var(--pt-muted)' }}>
                Working Business Case
              </div>
            </div>
          </div>

          <nav className="px-3 pb-6 space-y-0.5">
            {NAV.map((item) => (
              <div
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`nav-item ${active === item.key ? 'active' : ''}`}
              >
                <span className="nav-num">{item.n}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div
            className="mx-3 mb-4 p-3 rounded-md text-[10px] leading-relaxed"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--pt-line)',
              color: 'var(--pt-muted-2)',
            }}
          >
            Planning inputs are saved locally to this browser (per-partner).
            They are not transmitted to any server.
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0">
          <div
            className="px-5 md:px-8 py-4 flex items-center justify-between gap-4"
            style={{ borderBottom: '1px solid var(--pt-line)' }}
          >
            <div className="min-w-0">
              <div
                className="text-[10px] tracking-[0.3em] uppercase font-semibold"
                style={{ color: 'var(--pt-muted)' }}
              >
                Confidential Distribution Strategy
              </div>
              <h1
                className="mt-1 text-lg md:text-xl font-semibold truncate"
                style={{ color: 'var(--pt-off)' }}
              >
                Kamdhenu — India Market Development Business Case
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <span className="tag">Planning · Evaluation</span>
              <span className="tag tag-gold">Subject to Agreement</span>
              <span className="tag">v1.0</span>
            </div>
          </div>

          <div className="p-5 md:p-8">
            {hydrated && (
              <>
                {active === 'overview' && <Overview />}
                {active === 'territories' && <Territories />}
                {active === 'jaunpur' && <Jaunpur />}
                {active === 'distributors' && <Distributors />}
                {active === 'retailers' && <Retailers />}
                {active === 'profitability' && <Profitability />}
                {active === 'national' && <NationalScale />}
                {active === 'working-capital' && <WorkingCapital />}
                {active === 'risks' && <Risks />}
                {active === 'decision' && <DecisionCentre />}
                {active === 'notes' && <Notes />}
              </>
            )}
          </div>

          <footer
            className="px-5 md:px-8 py-6 mt-8 text-[11px] leading-relaxed"
            style={{
              borderTop: '1px solid var(--pt-line)',
              color: 'var(--pt-muted-2)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div
                  className="text-[10px] tracking-[0.3em] uppercase font-semibold"
                  style={{ color: 'var(--pt-gold)' }}
                >
                  Confidential — Authorised access only
                </div>
                <div className="mt-1">
                  Information contained within this portal is proprietary
                  planning information of GNS Spices and is intended solely
                  for authorised users. Not for redistribution.
                </div>
              </div>
              <div className="md:text-right">
                GNS Spices · Private Partner Strategy Portal ·{' '}
                Confidential Planning Environment
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
