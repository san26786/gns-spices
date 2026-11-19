'use client';

import Link from 'next/link';
import { useState } from 'react';
import { adminApi, gbp } from '@/lib/admin-api';
import { Badge, Empty, Notice, PageHeader, Table, btnPrimarySm, inputCls, useAdminData } from '../_ui';

interface Row {
  id: string; slug: string; skuRoot: string; name: string; isActive: boolean; isB2bOnly: boolean;
  category: { name: string; slug: string } | null; packs: number; activePacks: number; priceFrom: number | null; stock: number;
}
interface Cat { id: string; name: string; slug: string }

export default function ProductsPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('all');
  const params = new URLSearchParams({ status, ...(q ? { q } : {}), ...(category ? { category } : {}) });
  const { data, error, loading } = useAdminData(() => adminApi.get<{ data: Row[] }>(`/admin/products?${params}`), [params.toString()]);
  const cats = useAdminData(() => adminApi.get<{ data: Cat[] }>('/admin/categories'));

  return (
    <>
      <PageHeader
        title="Products"
        sub={data ? `${data.data.length} products` : undefined}
        actions={<Link href="/admin/products/new" className={btnPrimarySm}>Add product</Link>}
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <input id="product-search" type="search" placeholder="Search name or code…" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} max-w-xs`} aria-label="Search products" />
        <select id="product-category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} max-w-[200px]`} aria-label="Category">
          <option value="">All categories</option>
          {cats.data?.data.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select id="product-status" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} max-w-[160px]`} aria-label="Status">
          <option value="all">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </select>
      </div>
      {error && <Notice>{error}</Notice>}
      <Table
        head={['Product', 'Code', 'Category', 'Packs', 'From', 'Stock', 'Status']}
        empty={!loading && data?.data.length === 0 ? <Empty>No products match.</Empty> : null}
      >
        {data?.data.map((p) => (
          <tr key={p.id} className="hover:bg-white/5">
            <td className="px-4 py-3">
              <Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-amber-300">{p.name}</Link>
              <div className="text-xs text-zinc-500">/{p.slug}</div>
            </td>
            <td className="px-4 py-3 font-mono text-xs text-amber-300">{p.skuRoot}</td>
            <td className="px-4 py-3 text-zinc-300">{p.category?.name ?? '—'}</td>
            <td className="px-4 py-3 tabular-nums">{p.activePacks}/{p.packs}</td>
            <td className="px-4 py-3 tabular-nums">{gbp(p.priceFrom)}</td>
            <td className="px-4 py-3 tabular-nums">{p.stock > 0 ? p.stock : <span className="text-zinc-500">0</span>}</td>
            <td className="px-4 py-3 flex gap-1.5 flex-wrap">
              <Badge status={p.isActive ? 'active' : 'inactive'}>{p.isActive ? 'Active' : 'Hidden'}</Badge>
              {p.isB2bOnly && <Badge tone="blue">B2B only</Badge>}
              {p.priceFrom == null && <Badge tone="amber">No price</Badge>}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
