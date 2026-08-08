'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnlockGate() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/partner-strategy/unlock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Invalid access code');
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-16"
      style={{
        background:
          'radial-gradient(ellipse at 20% 10%, rgba(21,71,52,0.28) 0%, transparent 55%), linear-gradient(180deg, #070A09 0%, #0B0F0E 100%)',
        color: '#F5F1E8',
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-14 text-center">
          <div
            className="text-[10px] tracking-[0.45em] uppercase font-semibold"
            style={{ color: '#8B9994' }}
          >
            GNS Spices
          </div>
          <div className="mt-4">
            <div
              className="text-[10px] tracking-[0.35em] uppercase font-semibold"
              style={{ color: '#B08D3A' }}
            >
              Private Partner Strategy Portal
            </div>
            <div
              className="mt-2 text-sm"
              style={{ color: '#8B9994' }}
            >
              Confidential Business Planning Environment
            </div>
          </div>
        </div>

        <div
          className="p-8 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span
                className="text-[10px] tracking-[0.3em] uppercase font-semibold"
                style={{ color: '#8B9994' }}
              >
                Access code
              </span>
              <input
                type="text"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="—"
                className="mt-2 w-full rounded-md px-3 py-2.5 text-base outline-none transition font-mono"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: '#F5F1E8',
                  letterSpacing: '0.18em',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(176,141,58,0.55)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(176,141,58,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                disabled={busy}
              />
            </label>

            {error && (
              <div
                className="text-xs px-3 py-2 rounded"
                style={{
                  color: '#FCA5A5',
                  background: 'rgba(220,53,69,0.06)',
                  border: '1px solid rgba(220,53,69,0.20)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="w-full rounded-md py-2.5 text-sm font-semibold uppercase tracking-[0.15em] transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: '#154734',
                color: '#F5F1E8',
                border: '1px solid rgba(176,141,58,0.30)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1B5D45')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#154734')}
            >
              {busy ? 'Verifying…' : 'Enter secure portal'}
            </button>
          </form>

          <div
            className="mt-6 pt-5 text-[11px] leading-relaxed"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#6E7A73' }}
          >
            <p>
              <span
                className="uppercase font-semibold"
                style={{ color: '#B08D3A', letterSpacing: '0.15em' }}
              >
                Authorised access only.
              </span>{' '}
              Information contained within this portal is confidential and
              intended solely for authorised planning and evaluation.
            </p>
            <p className="mt-3">
              Sessions are valid for 20 minutes. To resume after expiry,
              re-enter the same access code.
            </p>
          </div>
        </div>

        <div
          className="mt-10 text-center text-[10px] tracking-[0.3em] uppercase"
          style={{ color: '#6E7A73' }}
        >
          Confidential · Not for redistribution
        </div>
      </div>
    </div>
  );
}
