'use client';

import { useState } from 'react';
import { adminApi, adminFetch, fmtDate } from '@/lib/admin-api';
import { Badge, Empty, Notice, PageHeader, Table, btnDangerSm, btnPrimarySm, useAdminData } from '../_ui';

interface Sub { id: string; email: string; source: string | null; createdAt: string; unsubscribedAt: string | null }

export default function NewsletterPage() {
  const { data, error, loading, reload } = useAdminData(() => adminApi.get<{ data: Sub[] }>('/admin/newsletter'));
  const [msg, setMsg] = useState<string | null>(null);
  const active = data?.data.filter((s) => !s.unsubscribedAt).length ?? 0;

  async function exportCsv() {
    setMsg(null);
    try {
      const csv = await adminFetch<string>('/admin/newsletter.csv');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: 'gns-newsletter-subscribers.csv' });
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Newsletter"
        sub={data ? `${active} subscribed · ${data.data.length - active} unsubscribed` : undefined}
        actions={<button type="button" onClick={exportCsv} className={btnPrimarySm}>Export CSV</button>}
      />
      <p className="text-sm text-zinc-400 mb-5 max-w-2xl">
        Sign-ups from the homepage form. Export the list to send campaigns from your email tool. Subscribers are never emailed automatically.
      </p>
      {(msg || error) && <div className="mb-4"><Notice>{msg ?? error}</Notice></div>}
      <Table head={['Email', 'Source', 'Subscribed', 'Status', '']} empty={!loading && data?.data.length === 0 ? <Empty>No subscribers yet.</Empty> : null}>
        {data?.data.map((s) => (
          <tr key={s.id} className="hover:bg-white/5">
            <td className="px-4 py-3">{s.email}</td>
            <td className="px-4 py-3 text-zinc-400">{s.source ?? '—'}</td>
            <td className="px-4 py-3 whitespace-nowrap">{fmtDate(s.createdAt)}</td>
            <td className="px-4 py-3">{s.unsubscribedAt ? <Badge status="inactive">Unsubscribed {fmtDate(s.unsubscribedAt)}</Badge> : <Badge status="active">Subscribed</Badge>}</td>
            <td className="px-4 py-3">
              {!s.unsubscribedAt && (
                <button type="button" className={btnDangerSm} onClick={() => window.confirm(`Unsubscribe ${s.email}?`) && adminApi.del(`/admin/newsletter/${s.id}`).then(reload).catch((e) => setMsg(e.message))}>
                  Unsubscribe
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
