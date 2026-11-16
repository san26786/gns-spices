'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { adminApi, fmtDate, gbp, humanize } from '@/lib/admin-api';
import { Badge, Field, Loading, Notice, PageHeader, btnGhostSm, btnPrimarySm, inputCls, useAdminData } from '../../_ui';

const ORDER_STATUSES = ['pending_payment', 'paid', 'processing', 'partially_shipped', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold'];

interface Address { contactName: string | null; phone: string | null; line1: string; line2: string | null; city: string; state: string | null; postcode: string | null; country: string }
interface Order {
  id: string; orderNumber: string; channel: string; region: string; currency: string; status: string; paymentStatus: string;
  fulfillmentStatus: string; placedAt: string; notes: string | null;
  subtotal: number; discountTotal: number; taxTotal: number; shippingTotal: number; grandTotal: number;
  user: { email: string; firstName: string | null; lastName: string | null; phone: string | null } | null;
  items: Array<{ id: string; sku: string; name: string; qty: number; unitPrice: number; lineTotal: number }>;
  shippingAddress: Address | null; billingAddress: Address | null;
  statusHistory: Array<{ id: string; fromStatus: string | null; toStatus: string; reason: string | null; createdAt: string }>;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: o, error, loading, setData } = useAdminData(() => adminApi.get<Order>(`/admin/orders/${id}`), [id]);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  if (loading && !o) return <Loading />;
  if (error && !o) return <Notice>{error}</Notice>;
  if (!o) return null;

  async function changeStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!status) return;
    try {
      setData(await adminApi.patch<Order>(`/admin/orders/${id}`, { status, reason: reason || undefined }));
      setMsg({ kind: 'ok', text: `Status changed to ${humanize(status)}.` });
      setStatus('');
      setReason('');
    } catch (err) {
      setMsg({ kind: 'error', text: (err as Error).message });
    }
  }

  const name = o.user ? [o.user.firstName, o.user.lastName].filter(Boolean).join(' ') || o.user.email : 'Guest';

  return (
    <>
      <PageHeader
        title={`Order ${o.orderNumber}`}
        sub={<>{fmtDate(o.placedAt, true)} · {o.channel.toUpperCase()} · {o.region}</>}
        actions={<Link href="/admin/orders" className={btnGhostSm}>← All orders</Link>}
      />
      <div className="flex flex-wrap gap-2 mb-6"><Badge status={o.status} /><Badge status={o.paymentStatus}>Payment: {humanize(o.paymentStatus)}</Badge><Badge>{humanize(o.fulfillmentStatus)}</Badge></div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="grid gap-6 min-w-0">
          <section className="glass-card p-5 overflow-x-auto">
            <h2 className="font-bold mb-3">Items</h2>
            <table className="w-full text-sm min-w-[480px]">
              <thead><tr className="text-left text-[11px] uppercase tracking-[0.15em] text-zinc-500"><th className="py-2">Item</th><th>SKU</th><th className="text-right">Qty</th><th className="text-right">Price</th><th className="text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {o.items.map((i) => (
                  <tr key={i.id}><td className="py-2">{i.name}</td><td className="font-mono text-xs text-zinc-400">{i.sku}</td><td className="text-right tabular-nums">{i.qty}</td><td className="text-right tabular-nums">{gbp(i.unitPrice)}</td><td className="text-right tabular-nums">{gbp(i.lineTotal)}</td></tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 ml-auto max-w-xs grid grid-cols-2 gap-y-1 text-sm tabular-nums">
              <dt className="text-zinc-400">Subtotal</dt><dd className="text-right">{gbp(o.subtotal)}</dd>
              {o.discountTotal > 0 && <><dt className="text-zinc-400">Discount</dt><dd className="text-right">−{gbp(o.discountTotal)}</dd></>}
              <dt className="text-zinc-400">Shipping</dt><dd className="text-right">{gbp(o.shippingTotal)}</dd>
              <dt className="text-zinc-400">Tax</dt><dd className="text-right">{gbp(o.taxTotal)}</dd>
              <dt className="font-bold">Total</dt><dd className="text-right font-bold">{gbp(o.grandTotal)}</dd>
            </dl>
          </section>

          <section className="glass-card p-5">
            <h2 className="font-bold mb-3">History</h2>
            {o.statusHistory.length === 0 ? <p className="text-sm text-zinc-500">No changes yet.</p> : (
              <ol className="grid gap-2 text-sm">
                {o.statusHistory.map((h) => (
                  <li key={h.id} className="flex flex-wrap gap-x-3"><span className="text-zinc-500 w-40">{fmtDate(h.createdAt, true)}</span><span>{h.fromStatus ? humanize(h.fromStatus) : 'Created'} → <b>{humanize(h.toStatus)}</b></span>{h.reason && <span className="text-zinc-400">“{h.reason}”</span>}</li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="grid gap-6">
          <form onSubmit={changeStatus} className="glass-card p-5 grid gap-3">
            <h2 className="font-bold">Change status</h2>
            <Field label="New status">
              <select id="order-new-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} required>
                <option value="">Choose…</option>
                {ORDER_STATUSES.filter((s) => s !== o.status).map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
              </select>
            </Field>
            <Field label="Note (optional)"><input id="order-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} className={inputCls} placeholder="e.g. Royal Mail tracking AB123" /></Field>
            {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
            <button type="submit" className={btnPrimarySm} disabled={!status}>Update status</button>
          </form>
          <section className="glass-card p-5 text-sm grid gap-1">
            <h2 className="font-bold mb-2">Customer</h2>
            <span>{name}</span>
            {o.user && <span className="text-zinc-400">{o.user.email}</span>}
            {o.user?.phone && <span className="text-zinc-400">{o.user.phone}</span>}
          </section>
          <AddressCard title="Ship to" a={o.shippingAddress} />
          <AddressCard title="Bill to" a={o.billingAddress} />
          {o.notes && <section className="glass-card p-5 text-sm"><h2 className="font-bold mb-2">Notes</h2><p className="whitespace-pre-line text-zinc-300">{o.notes}</p></section>}
        </div>
      </div>
    </>
  );
}

function AddressCard({ title, a }: { title: string; a: Address | null }) {
  return (
    <section className="glass-card p-5 text-sm grid gap-0.5">
      <h2 className="font-bold mb-2">{title}</h2>
      {a ? (
        <>
          {a.contactName && <span>{a.contactName}</span>}
          <span>{a.line1}</span>{a.line2 && <span>{a.line2}</span>}
          <span>{[a.city, a.state, a.postcode].filter(Boolean).join(', ')}</span>
          <span>{a.country}</span>
          {a.phone && <span className="text-zinc-400">{a.phone}</span>}
        </>
      ) : <span className="text-zinc-500">Not given</span>}
    </section>
  );
}
