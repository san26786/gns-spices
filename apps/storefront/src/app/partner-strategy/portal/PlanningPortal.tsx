'use client';

import { useEffect, useState } from 'react';
import SessionBar from './SessionBar';
import { hydrateFor, persistFor, usePortal } from './store';
import { portalCSS } from './ui';
import Overview from './sections/Overview';
import BusinessCase from './sections/BusinessCase';
import PriceList from './sections/PriceList';
import UdyamRoute from './sections/UdyamRoute';
import UdaanRoute from './sections/UdaanRoute';
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
  { key: 'business-case',  n: '02', label: 'Business Case' },
  { key: 'price-list',     n: '03', label: 'Price List' },
  { key: 'udyam-route',    n: '04', label: '🏢 UDYAM Route' },
  { key: 'udaan-route',    n: '05', label: '🚀 UDAAN Route' },
  { key: 'territories',    n: '06', label: 'Territories' },
  { key: 'jaunpur',        n: '07', label: 'Jaunpur' },
  { key: 'distributors',   n: '08', label: 'Distributors' },
  { key: 'retailers',      n: '09', label: 'Retailers' },
  { key: 'profitability',  n: '10', label: 'Profitability' },
  { key: 'national',       n: '11', label: 'National Scale' },
  { key: 'working-capital',n: '12', label: 'Working Capital' },
  { key: 'risks',          n: '13', label: 'Risks' },
  { key: 'decision',       n: '14', label: 'Decision Centre' },
  { key: 'notes',          n: '15', label: 'Notes' },
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
              className="text-[18px] font-bold leading-none tracking-tight"
              style={{ color: 'var(--pt-off)' }}
            >
              GNS <span style={{ color: 'var(--pt-gold)' }}>UDYAM</span>{' '}
              <span style={{ color: 'var(--pt-muted-2)', fontWeight: 400 }}>+</span>{' '}
              <span style={{ color: 'var(--pt-emerald-3)' }}>UDAAN</span>
            </div>
            <div
              className="mt-1 text-[11px] leading-snug"
              style={{ color: 'var(--pt-muted-hi)' }}
            >
              Enterprise &amp; Community Growth Network
            </div>
            <div
              className="mt-1 text-[10px] tracking-[0.2em] uppercase"
              style={{ color: 'var(--pt-muted-2)' }}
            >
              A GNS Spices platform
            </div>
            <div
              className="mt-4 pt-4 text-[10px] tracking-[0.3em] uppercase font-semibold"
              style={{ color: 'var(--pt-muted)', borderTop: '1px solid var(--pt-line)' }}
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
                GNS UDYAM · Confidential Distribution Strategy
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
                {active === 'business-case' && <BusinessCase />}
                {active === 'price-list' && <PriceList />}
                {active === 'udyam-route' && <UdyamRoute />}
                {active === 'udaan-route' && <UdaanRoute />}
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
                GNS UDYAM · A GNS Spices platform · Private Partner Strategy
                Portal · Confidential Planning Environment
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
