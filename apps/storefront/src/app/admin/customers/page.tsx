'use client';

import { useState } from 'react';
import { adminApi, fmtDate, gbp } from '@/lib/admin-api';
import { Badge, Empty, Notice, PageHeader, Table, inputCls, useAdminData } from '../_ui';

interface Row {
  id: string; email: string; firstName: string | null; lastName: string | null; phone: string | null; status: string;
  createdAt: string; defaultRegion: string; orders: number; totalSpent: number; business: string | null;
}

export default function CustomersPage() {
  const [q, setQ] = useState('');
  const { data, error, loading } = useAdminData(() => adminApi.get<{ data: Row[] }>(`/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`), [q]);

  return (
    <>
      <PageHeader title="Customers" sub={data ? `${data.data.length} customer accounts` : undefined} />
      <input id="customer-search" type="search" placeholder="Name or email…" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} max-w-xs mb-5`} aria-label="Search customers" />
      {error && <Notice>{error}</Notice>}
      <Table head={['Customer', 'Business', 'Region', 'Joined', 'Orders', 'Paid total', 'Status']} empty={!loading && data?.data.length === 0 ? <Empty>No customer accounts yet.</Empty> : null}>
        {data?.data.map((c) => (
          <tr key={c.id} className="hover:bg-white/5">
            <td className="px-4 py-3">{[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}<div className="text-xs text-zinc-500">{c.email}{c.phone ? ` · ${c.phone}` : ''}</div></td>
            <td className="px-4 py-3 text-zinc-300">{c.business ?? '—'}</td>
            <td className="px-4 py-3">{c.defaultRegion}</td>
            <td className="px-4 py-3 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
            <td className="px-4 py-3 tabular-nums">{c.orders}</td>
            <td className="px-4 py-3 tabular-nums">{gbp(c.totalSpent)}</td>
            <td className="px-4 py-3"><Badge status={c.status === 'active' ? 'active' : 'inactive'}>{c.status}</Badge></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
