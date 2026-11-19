'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function fmt(sec: number): string {
  const m = Math.max(0, Math.floor(sec / 60));
  const s = Math.max(0, sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function SessionBar({
  partner,
  expiresAt,
}: {
  partner: string;
  expiresAt: number;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, expiresAt - Math.floor(Date.now() / 1000)),
  );
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const r = Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
      setRemaining(r);
      if (r === 0) {
        setExpired(true);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  async function endSession() {
    try {
      await fetch('/api/partner-strategy/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    router.refresh();
  }

  const isLow = remaining <= 120 && remaining > 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div
        className="sticky top-0 z-40 w-full"
        style={{
          background: 'rgba(7,10,9,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="px-4 md:px-6 py-2 flex items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-4 min-w-0">
            <span
              className="tracking-[0.35em] uppercase font-semibold shrink-0"
              style={{ color: '#B08D3A' }}
            >
              Confidential
            </span>
            <span
              className="hidden md:inline uppercase tracking-widest shrink-0"
              style={{ color: '#8B9994' }}
            >
              Planning · Evaluation
            </span>
            <span
              className="hidden lg:inline uppercase tracking-widest shrink-0"
              style={{ color: '#8B9994' }}
            >
              Subject to Agreement
            </span>
            <span
              className="hidden lg:inline font-mono truncate"
              style={{ color: '#6E7A73' }}
            >
              v1.0 · {today} · partner:{' '}
              <span style={{ color: '#B7BFB8' }}>{partner}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="hidden sm:inline uppercase tracking-widest"
              style={{ color: '#8B9994' }}
            >
              Session
            </span>
            <span
              className="font-mono tabular-nums font-semibold px-2 py-0.5 rounded"
              style={{
                color: isLow ? '#FCA5A5' : '#F5F1E8',
                background: isLow ? 'rgba(220,53,69,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${
                  isLow ? 'rgba(220,53,69,0.25)' : 'rgba(255,255,255,0.06)'
                }`,
              }}
            >
              {fmt(remaining)}
            </span>
            <button
              onClick={endSession}
              className="px-2.5 py-0.5 rounded uppercase tracking-widest text-[10px] font-semibold transition"
              style={{
                color: '#B7BFB8',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(176,141,58,0.4)';
                e.currentTarget.style.color = '#B08D3A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.color = '#B7BFB8';
              }}
            >
              End session
            </button>
          </div>
        </div>
      </div>

      {expired && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ background: 'rgba(7,10,9,0.88)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="max-w-md w-full text-center p-8 rounded-xl"
            style={{
              background: '#0B0F0E',
              border: '1px solid rgba(176,141,58,0.25)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.65)',
            }}
          >
            <div
              className="text-[10px] tracking-[0.35em] uppercase font-semibold mb-4"
              style={{ color: '#B08D3A' }}
            >
              Session expired
            </div>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: '#F5F1E8' }}
            >
              Your 20-minute session has ended
            </h2>
            <p
              className="text-sm mb-6 leading-relaxed"
              style={{ color: '#8B9994' }}
            >
              Re-enter the same access code to open a fresh session. Your
              planning inputs are saved locally to this browser.
            </p>
            <button
              onClick={endSession}
              className="w-full rounded-md py-2.5 text-sm font-semibold uppercase tracking-[0.15em] transition"
              style={{
                background: '#154734',
                color: '#F5F1E8',
                border: '1px solid rgba(176,141,58,0.30)',
              }}
            >
              Re-enter access code
            </button>
          </div>
        </div>
      )}
    </>
  );
}
