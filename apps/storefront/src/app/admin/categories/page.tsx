'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Empty, Field, Notice, PageHeader, Table, btnDangerSm, btnGhostSm, btnPrimarySm, inputCls, useAdminData } from '../_ui';

interface Cat { id: string; name: string; slug: string; position: number; products: number }

export default function CategoriesPage() {
  const { data, error, loading, reload } = useAdminData(() => adminApi.get<{ data: Cat[] }>('/admin/categories'));
  const [form, setForm] = useState({ name: '', slug: '', position: 0 });
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<Cat | null>(null);

  async function act(fn: () => Promise<unknown>) {
    setMsg(null);
    try { await fn(); await reload(); } catch (e) { setMsg((e as Error).message); }
  }

  return (
    <>
      <PageHeader title="Categories" sub="Group products for the shop filters." />
      <form
        onSubmit={(e) => { e.preventDefault(); act(async () => { await adminApi.post('/admin/categories', { ...form, slug: form.slug || undefined }); setForm({ name: '', slug: '', position: 0 }); }); }}
        className="glass-card p-5 grid md:grid-cols-[1fr_1fr_120px_auto] gap-4 items-end mb-6"
      >
        <Field label="Name"><input id="cat-name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
        <Field label="Slug"><input id="cat-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="from the name" className={inputCls} /></Field>
        <Field label="Order"><input id="cat-pos" type="number" min={0} value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} className={inputCls} /></Field>
        <button type="submit" className={btnPrimarySm}>Add category</button>
      </form>
      {(msg || error) && <div className="mb-4"><Notice>{msg ?? error}</Notice></div>}
      <Table head={['Name', 'Slug', 'Order', 'Products', '']} empty={!loading && data?.data.length === 0 ? <Empty>No categories yet.</Empty> : null}>
        {data?.data.map((c) =>
          editing?.id === c.id ? (
            <tr key={c.id} className="bg-amber-500/5">
              <td className="px-4 py-2"><input aria-label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></td>
              <td className="px-4 py-2"><input aria-label="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={inputCls} /></td>
              <td className="px-4 py-2"><input aria-label="Order" type="number" value={editing.position} onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })} className={`${inputCls} w-20`} /></td>
              <td className="px-4 py-2 tabular-nums">{c.products}</td>
              <td className="px-4 py-2 flex gap-2">
                <button type="button" className={btnPrimarySm} onClick={() => act(async () => { await adminApi.patch(`/admin/categories/${c.id}`, { name: editing.name, slug: editing.slug, position: editing.position }); setEditing(null); })}>Save</button>
                <button type="button" className={btnGhostSm} onClick={() => setEditing(null)}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={c.id} className="hover:bg-white/5">
              <td className="px-4 py-3 font-semibold">{c.name}</td>
              <td className="px-4 py-3 text-zinc-400">{c.slug}</td>
              <td className="px-4 py-3 tabular-nums">{c.position}</td>
              <td className="px-4 py-3 tabular-nums">{c.products}</td>
              <td className="px-4 py-3 flex gap-2">
                <button type="button" className={btnGhostSm} onClick={() => setEditing(c)}>Edit</button>
                <button
                  type="button"
                  className={btnDangerSm}
                  disabled={c.products > 0}
                  title={c.products > 0 ? 'Move its products to another category first' : undefined}
                  onClick={() => act(() => adminApi.del(`/admin/categories/${c.id}`))}
                >
                  Delete
                </button>
              </td>
            </tr>
          ),
        )}
      </Table>
    </>
  );
}
