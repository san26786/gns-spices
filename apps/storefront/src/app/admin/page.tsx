'use client';

import Link from 'next/link';
import { adminApi, fmtDate, gbp, humanize } from '@/lib/admin-api';
import { Badge, Loading, Notice, PageHeader, useAdminData } from './_ui';

interface Dashboard {
  products: number; packs: number; orders: number; orders30: number; customers: number; subscribers: number;
  revenue: number; revenue30: number;
  newEnquiries: Partial<Record<'b2b_application' | 'quote_request' | 'private_label' | 'contact', number>>;
  recentOrders: Array<{ id: string; orderNumber: string; status: string; paymentStatus: string; grandTotal: number; placedAt: string; customer: string | null }>;
  recentEnquiries: Array<{ id: string; reference: string; type: string; status: string; name: string; company: string | null; createdAt: string }>;
}

const ENQ: Array<[keyof Dashboard['newEnquiries'], string]> = [
  ['b2b_application', 'B2B applications'], ['quote_request', 'Quote requests'], ['private_label', 'Private label'], ['contact', 'Contact'],
];

export default function DashboardPage() {
  const { data, error, loading } = useAdminData(() => adminApi.get<Dashboard>('/admin/dashboard'));

  if (loading && !data) return <Loading />;
  if (error) return <Notice>{error}</Notice>;
  if (!data) return null;
  const totalNew = Object.values(data.newEnquiries).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <>
      <PageHeader title="Dashboard" sub="Live figures from the GNS database." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Paid revenue" value={gbp(data.revenue)} sub={`${gbp(data.revenue30)} in the last 30 days`} href="/admin/orders" />
        <Stat label="Orders" value={data.orders} sub={`${data.orders30} in the last 30 days`} href="/admin/orders" />
        <Stat label="Customers" value={data.customers} sub={`${data.subscribers} newsletter subscribers`} href="/admin/customers" />
        <Stat label="Products" value={data.products} sub={`${data.packs} active packs`} href="/admin/products" />
      </div>

      <section className="mt-8 glass-card p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-bold text-lg">New enquiries <span className="text-amber-400">{totalNew}</span></h2>
          <Link href="/admin/enquiries?status=new" className="text-sm text-amber-400 hover:text-amber-300">Open inbox →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {ENQ.map(([k, label]) => (
            <Link key={k} href={`/admin/enquiries?type=${k}&status=new`} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-amber-400/50">
              <div className="text-2xl font-bold tabular-nums">{data.newEnquiries[k] ?? 0}</div>
              <div className="text-xs text-zinc-400">{label}</div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <section className="glass-card p-5 min-w-0">
          <h2 className="font-bold text-lg mb-3">Recent orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-zinc-500 py-6">No orders yet. They appear here once checkout is live.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {data.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-amber-300">
                    <span className="min-w-0">
                      <span className="font-mono text-sm">{o.orderNumber}</span>
                      <span className="block text-xs text-zinc-500 truncate">{o.customer ?? 'Guest'} · {fmtDate(o.placedAt)}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0"><Badge status={o.status} /><span className="tabular-nums text-sm">{gbp(o.grandTotal)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="glass-card p-5 min-w-0">
          <h2 className="font-bold text-lg mb-3">Latest enquiries</h2>
          {data.recentEnquiries.length === 0 ? (
            <p className="text-sm text-zinc-500 py-6">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {data.recentEnquiries.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries?open=${e.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-amber-300">
                    <span className="min-w-0">
                      <span className="text-sm font-semibold">{e.company ?? e.name}</span>
                      <span className="block text-xs text-zinc-500 truncate">{humanize(e.type)} · {e.reference} · {fmtDate(e.createdAt)}</span>
                    </span>
                    <Badge status={e.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value, sub, href }: { label: string; value: React.ReactNode; sub: string; href: string }) {
  return (
    <Link href={href} className="glass-card p-5 hover:border-amber-400/40 transition min-w-0">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">{label}</div>
      <div className="text-3xl font-bold mt-2 tabular-nums">{value}</div>
      <div className="text-xs text-zinc-400 mt-1">{sub}</div>
    </Link>
  );
}
