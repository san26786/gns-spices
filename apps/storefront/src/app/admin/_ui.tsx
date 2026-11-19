'use client';

import { useCallback, useEffect, useState } from 'react';
import { humanize } from '@/lib/admin-api';

/** Loads data from the admin API; `reload()` refetches. */
export function useAdminData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await run());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [run]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload, setData };
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-zinc-400">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const TONES: Record<string, string> = {
  green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  red: 'bg-red-500/15 text-red-300 border-red-500/30',
  blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  zinc: 'bg-white/5 text-zinc-300 border-white/15',
};

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  new: 'amber', in_review: 'blue', contacted: 'blue', approved: 'green', rejected: 'red', closed: 'zinc',
  pending_payment: 'amber', paid: 'green', processing: 'blue', partially_shipped: 'blue', shipped: 'blue', delivered: 'green',
  cancelled: 'red', refunded: 'zinc', on_hold: 'amber', unpaid: 'amber', authorized: 'blue', failed: 'red', partially_refunded: 'zinc',
  active: 'green', inactive: 'zinc',
};

export function Badge({ children, tone, status }: { children?: React.ReactNode; tone?: keyof typeof TONES; status?: string }) {
  const t = tone ?? (status ? STATUS_TONE[status] : undefined) ?? 'zinc';
  return (
    <span className={`inline-flex items-center whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded-full border ${TONES[t]}`}>
      {children ?? (status ? humanize(status) : null)}
    </span>
  );
}

export function Notice({ kind = 'error', children }: { kind?: 'error' | 'ok'; children: React.ReactNode }) {
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm border ${kind === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 min-w-0">
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">{label}</span>
      {children}
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export const inputCls = 'input-dark w-full !py-2.5 text-sm';
export const btnSm = 'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50';
export const btnPrimarySm = `${btnSm} bg-amber-500 text-amber-950 hover:bg-amber-400`;
export const btnGhostSm = `${btnSm} border border-white/20 text-zinc-200 hover:border-amber-400/60 hover:bg-white/5`;
export const btnDangerSm = `${btnSm} border border-red-500/40 text-red-300 hover:bg-red-500/10`;

export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: React.ReactNode }) {
  return (
    <div className="glass-card !p-0 overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-zinc-500 border-b border-white/10">
            {head.map((h, i) => <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-zinc-500">{children}</p>;
}

export function Loading() {
  return <p className="text-sm text-zinc-500 py-10">Loading…</p>;
}
