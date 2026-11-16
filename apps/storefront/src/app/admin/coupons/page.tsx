'use client';

import { useState } from 'react';
import { adminApi, fmtDate, gbp } from '@/lib/admin-api';
import { Badge, Empty, Field, Notice, PageHeader, Table, btnDangerSm, btnGhostSm, btnPrimarySm, inputCls, useAdminData } from '../_ui';

interface Coupon {
  id: string; code: string; description: string | null; percentOff: number; minSubtotal: number | null; maxRedemptions: number | null;
  redemptions: number; isActive: boolean; startsAt: string | null; expiresAt: string | null;
}

const blank = { code: '', description: '', percentOff: 10, minSubtotal: '', maxRedemptions: '', startsAt: '', expiresAt: '' };

function couponState(c: Coupon) {
  const now = Date.now();
  if (!c.isActive) return { label: 'Off', status: 'inactive' };
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now) return { label: 'Expired', status: 'closed' };
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return { label: 'Scheduled', status: 'in_review' };
  if (c.maxRedemptions !== null && c.redemptions >= c.maxRedemptions) return { label: 'Used up', status: 'closed' };
  return { label: 'Live', status: 'active' };
}

export default function CouponsPage() {
  const { data, error, loading, reload } = useAdminData(() => adminApi.get<{ data: Coupon[] }>('/admin/coupons'));
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState<string | null>(null);

  async function act(fn: () => Promise<unknown>) {
    setMsg(null);
    try { await fn(); await reload(); } catch (e) { setMsg((e as Error).message); }
  }

  return (
    <>
      <PageHeader title="Coupons" sub="Percentage discounts customers enter at checkout. The checkout recalculates every discount on the server." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          act(async () => {
            await adminApi.post('/admin/coupons', {
              code: f.code, description: f.description || null, percentOff: f.percentOff,
              minSubtotal: f.minSubtotal === '' ? null : Number(f.minSubtotal),
              maxRedemptions: f.maxRedemptions === '' ? null : Number(f.maxRedemptions),
              startsAt: f.startsAt || null, expiresAt: f.expiresAt ? `${f.expiresAt}T23:59:59` : null,
            });
            setF(blank);
          });
        }}
        className="glass-card p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6"
      >
        <Field label="Code" hint="Letters, numbers, - and _"><input id="c-code" required pattern="[A-Za-z0-9_-]{3,40}" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="DIWALI15" className={`${inputCls} font-mono`} /></Field>
        <Field label="Discount %"><input id="c-pct" type="number" min={1} max={100} required value={f.percentOff} onChange={(e) => setF({ ...f, percentOff: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label="Minimum spend £"><input id="c-min" type="number" min={0} step="0.01" value={f.minSubtotal} onChange={(e) => setF({ ...f, minSubtotal: e.target.value })} placeholder="none" className={inputCls} /></Field>
        <Field label="Max uses"><input id="c-max" type="number" min={1} value={f.maxRedemptions} onChange={(e) => setF({ ...f, maxRedemptions: e.target.value })} placeholder="unlimited" className={inputCls} /></Field>
        <Field label="Starts"><input id="c-start" type="date" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} className={inputCls} /></Field>
        <Field label="Expires (end of day)"><input id="c-end" type="date" value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} className={inputCls} /></Field>
        <Field label="Internal note"><input id="c-desc" maxLength={200} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="e.g. Diwali email campaign" className={inputCls} /></Field>
        <button type="submit" className={btnPrimarySm}>Create coupon</button>
      </form>
      {(msg || error) && <div className="mb-4"><Notice>{msg ?? error}</Notice></div>}
      <Table head={['Code', 'Discount', 'Min spend', 'Used', 'Valid', 'State', '']} empty={!loading && data?.data.length === 0 ? <Empty>No coupons yet.</Empty> : null}>
        {data?.data.map((c) => {
          const s = couponState(c);
          return (
            <tr key={c.id} className="hover:bg-white/5">
              <td className="px-4 py-3"><span className="font-mono font-semibold">{c.code}</span>{c.description && <div className="text-xs text-zinc-500">{c.description}</div>}</td>
              <td className="px-4 py-3 tabular-nums">{c.percentOff}%</td>
              <td className="px-4 py-3 tabular-nums">{c.minSubtotal ? gbp(c.minSubtotal) : '—'}</td>
              <td className="px-4 py-3 tabular-nums">{c.redemptions}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}</td>
              <td className="px-4 py-3 whitespace-nowrap text-xs">{c.startsAt ? fmtDate(c.startsAt) : 'Now'} → {c.expiresAt ? fmtDate(c.expiresAt) : 'No end'}</td>
              <td className="px-4 py-3"><Badge status={s.status}>{s.label}</Badge></td>
              <td className="px-4 py-3 flex gap-2">
                <button type="button" className={btnGhostSm} onClick={() => act(() => adminApi.patch(`/admin/coupons/${c.id}`, { isActive: !c.isActive }))}>{c.isActive ? 'Turn off' : 'Turn on'}</button>
                <button type="button" className={btnDangerSm} onClick={() => window.confirm(`Delete coupon ${c.code}?`) && act(() => adminApi.del(`/admin/coupons/${c.id}`))}>Delete</button>
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
