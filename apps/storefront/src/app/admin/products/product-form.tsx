'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Field, Notice, btnPrimarySm, inputCls, useAdminData } from '../_ui';

export interface ProductFields {
  name: string; slug: string; categoryId: string | null; shortDesc: string | null; longDesc: string | null;
  originCountry: string | null; isActive: boolean; isB2bOnly: boolean; ingredients: string | null; certifications: string[];
}

export function ProductForm({
  initial, submitLabel, onSubmit,
}: { initial: ProductFields; submitLabel: string; onSubmit: (v: ProductFields) => Promise<void> }) {
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const cats = useAdminData(() => adminApi.get<{ data: Array<{ id: string; name: string }> }>('/admin/categories'));
  const set = <K extends keyof ProductFields>(k: K, val: ProductFields[K]) => setV((s) => ({ ...s, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await onSubmit(v);
      setMsg({ kind: 'ok', text: 'Saved.' });
    } catch (err) {
      setMsg({ kind: 'error', text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass-card p-6 grid gap-5">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Product name">
          <input id="p-name" required minLength={2} value={v.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Web address (slug)" hint="Shown as /product/<slug>. Printed QR codes keep working if you change it.">
          <input id="p-slug" value={v.slug} onChange={(e) => set('slug', e.target.value)} placeholder="made from the name if empty" className={inputCls} />
        </Field>
        <Field label="Category">
          <select id="p-category" value={v.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value || null)} className={inputCls}>
            <option value="">No category</option>
            {cats.data?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Origin country" hint="Two-letter code, e.g. IN">
          <input id="p-origin" maxLength={2} value={v.originCountry ?? ''} onChange={(e) => set('originCountry', e.target.value.toUpperCase() || null)} className={inputCls} />
        </Field>
      </div>
      <Field label="Short description" hint="One line under the product name.">
        <input id="p-short" maxLength={500} value={v.shortDesc ?? ''} onChange={(e) => set('shortDesc', e.target.value || null)} className={inputCls} />
      </Field>
      <Field label="About this product">
        <textarea id="p-long" rows={5} value={v.longDesc ?? ''} onChange={(e) => set('longDesc', e.target.value || null)} className={inputCls} />
      </Field>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Ingredients">
          <input id="p-ingredients" value={v.ingredients ?? ''} onChange={(e) => set('ingredients', e.target.value || null)} className={inputCls} />
        </Field>
        <Field label="Certifications" hint="Comma separated, e.g. FSSAI, Organic, Vegan">
          <input
            id="p-certs"
            value={v.certifications.join(', ')}
            onChange={(e) => set('certifications', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            className={inputCls}
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input id="p-active" type="checkbox" checked={v.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Visible in the shop</label>
        <label className="flex items-center gap-2"><input id="p-b2b" type="checkbox" checked={v.isB2bOnly} onChange={(e) => set('isB2bOnly', e.target.checked)} /> Trade (B2B) customers only</label>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <div><button type="submit" disabled={busy} className={btnPrimarySm}>{busy ? 'Saving…' : submitLabel}</button></div>
    </form>
  );
}
