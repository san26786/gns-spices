'use client';

import Link from 'next/link';
import { useState } from 'react';
import { adminApi, fmtDate, gbp, humanize } from '@/lib/admin-api';
import { Badge, Empty, Notice, PageHeader, Table, inputCls, useAdminData } from '../_ui';

const ORDER_STATUSES = ['pending_payment', 'paid', 'processing', 'partially_shipped', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold'];

interface Row {
  id: string; orderNumber: string; channel: string; status: string; paymentStatus: string; grandTotal: number;
  placedAt: string; items: number; customer: { email: string; name: string | null } | null;
}

export default function OrdersPage() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const params = new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}) }).toString();
  const { data, error, loading } = useAdminData(() => adminApi.get<{ data: Row[] }>(`/admin/orders?${params}`), [params]);

  return (
    <>
      <PageHeader title="Orders" sub={data ? `${data.data.length} shown (latest 200)` : undefined} />
      <div className="flex flex-wrap gap-3 mb-5">
        <input id="order-search" type="search" placeholder="Order number or email…" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} max-w-xs`} aria-label="Search orders" />
        <select id="order-status" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} max-w-[200px]`} aria-label="Status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
        </select>
      </div>
      {error && <Notice>{error}</Notice>}
      <Table head={['Order', 'Customer', 'Placed', 'Items', 'Total', 'Payment', 'Status']} empty={!loading && data?.data.length === 0 ? <Empty>No orders yet.</Empty> : null}>
        {data?.data.map((o) => (
          <tr key={o.id} className="hover:bg-white/5">
            <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono hover:text-amber-300">{o.orderNumber}</Link><div className="text-xs text-zinc-500 uppercase">{o.channel}</div></td>
            <td className="px-4 py-3">{o.customer?.name ?? '—'}<div className="text-xs text-zinc-500">{o.customer?.email ?? 'Guest'}</div></td>
            <td className="px-4 py-3 whitespace-nowrap">{fmtDate(o.placedAt, true)}</td>
            <td className="px-4 py-3 tabular-nums">{o.items}</td>
            <td className="px-4 py-3 tabular-nums">{gbp(o.grandTotal)}</td>
            <td className="px-4 py-3"><Badge status={o.paymentStatus} /></td>
            <td className="px-4 py-3"><Badge status={o.status} /></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
