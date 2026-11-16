'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { adminApi, fmtDate, fmtWeight } from '@/lib/admin-api';
import { Badge, Loading, Notice, PageHeader, btnGhostSm, btnPrimarySm, inputCls, useAdminData } from '../../_ui';
import { ProductForm, type ProductFields } from '../product-form';

interface Variant {
  id: string; sku: string; label: string | null; weightGrams: number; packaging: string; barcode: string | null;
  isActive: boolean; priceGBP: number | null; stock: number | null;
}
interface Product extends ProductFields {
  id: string; skuRoot: string; category: { id: string; name: string } | null; createdAt: string; updatedAt: string; variants: Variant[];
}

const PACKAGING = ['pouch', 'jar', 'tin', 'sack', 'drum'];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: p, error, loading, setData, reload } = useAdminData(() => adminApi.get<Product>(`/admin/products/${id}`), [id]);

  if (loading && !p) return <Loading />;
  if (error && !p) return <Notice>{error}</Notice>;
  if (!p) return null;

  return (
    <>
      <PageHeader
        title={p.name}
        sub={<>Code <span className="font-mono text-amber-300">{p.skuRoot}</span> · updated {fmtDate(p.updatedAt, true)}</>}
        actions={
          <>
            <Link href="/admin/products" className={btnGhostSm}>← All products</Link>
            <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" className={btnGhostSm}>View in shop</a>
            <a href={`/api/codes/qr/${p.skuRoot}?download`} className={btnGhostSm}>Download QR</a>
          </>
        }
      />

      <div className="grid xl:grid-cols-[minmax(0,1fr)_220px] gap-6 items-start">
        <ProductForm
          submitLabel="Save product"
          initial={{
            name: p.name, slug: p.slug, categoryId: p.category?.id ?? null, shortDesc: p.shortDesc, longDesc: p.longDesc,
            originCountry: p.originCountry, isActive: p.isActive, isB2bOnly: p.isB2bOnly, ingredients: p.ingredients, certifications: p.certifications,
          }}
          onSubmit={async (v) => setData(await adminApi.patch<Product>(`/admin/products/${id}`, v))}
        />
        <div className="glass-card p-4 text-center">
          <div className="bg-white rounded-lg p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/codes/qr/${p.skuRoot}`} alt={`QR code for ${p.name}`} className="w-full h-auto" />
          </div>
          <p className="mt-2 text-xs text-zinc-400">Scans always open the current product page.</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h2 className="text-xl font-bold">Packs</h2>
          <p className="text-xs text-zinc-500">Prices are UK retail (GBP, incl. any VAT you charge). Stock is the London warehouse.</p>
        </div>
        <div className="glass-card !p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-zinc-500 border-b border-white/10">
                {['SKU', 'Label', 'Weight (g)', 'Packaging', 'Price £', 'Stock', 'GTIN / EAN-13', 'Active', ''].map((h) => (
                  <th key={h} className="px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {p.variants.map((v) => <VariantRow key={v.id} v={v} onSaved={setData} />)}
              <NewVariantRow productId={id} onSaved={setData} />
            </tbody>
          </table>
        </div>
        {p.variants.length === 0 && <p className="mt-3 text-sm text-zinc-400">No packs yet. Add one in the last row to give this product a price and a barcode.</p>}
        <button type="button" onClick={reload} className="mt-3 text-xs text-zinc-500 hover:text-zinc-300">Reload</button>
      </section>
    </>
  );
}

function VariantRow({ v, onSaved }: { v: Variant; onSaved: (p: Product) => void }) {
  const [f, setF] = useState({ ...v });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const dirty = JSON.stringify(f) !== JSON.stringify(v);

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      onSaved(await adminApi.patch<Product>(`/admin/variants/${v.id}`, {
        label: f.label || null, weightGrams: f.weightGrams, packaging: f.packaging, barcode: f.barcode || null,
        isActive: f.isActive, priceGBP: f.priceGBP, stock: f.stock ?? undefined,
      }));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <tr className={dirty ? 'bg-amber-500/5' : undefined}>
        <td className="px-3 py-2 font-mono text-xs text-amber-300 whitespace-nowrap">
          {v.sku}
          <a href={`/api/codes/barcode/${v.sku}?download`} className="block text-[10px] text-zinc-500 hover:text-zinc-300 font-sans">barcode ↓</a>
        </td>
        <td className="px-3 py-2"><input aria-label="Label" value={f.label ?? ''} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder={fmtWeight(f.weightGrams)} className={`${inputCls} min-w-[150px]`} /></td>
        <td className="px-3 py-2"><input aria-label="Weight in grams" type="number" min={1} value={f.weightGrams} onChange={(e) => setF({ ...f, weightGrams: Number(e.target.value) })} className={`${inputCls} w-24`} /></td>
        <td className="px-3 py-2">
          <select aria-label="Packaging" value={f.packaging} onChange={(e) => setF({ ...f, packaging: e.target.value })} className={`${inputCls} w-28`}>
            {PACKAGING.map((x) => <option key={x}>{x}</option>)}
          </select>
        </td>
        <td className="px-3 py-2"><input aria-label="Price in pounds" type="number" min={0} step="0.01" value={f.priceGBP ?? ''} onChange={(e) => setF({ ...f, priceGBP: e.target.value === '' ? null : Number(e.target.value) })} className={`${inputCls} w-24`} /></td>
        <td className="px-3 py-2"><input aria-label="Stock" type="number" min={0} value={f.stock ?? ''} onChange={(e) => setF({ ...f, stock: e.target.value === '' ? null : Number(e.target.value) })} className={`${inputCls} w-24`} /></td>
        <td className="px-3 py-2"><input aria-label="GTIN" inputMode="numeric" maxLength={13} value={f.barcode ?? ''} onChange={(e) => setF({ ...f, barcode: e.target.value.replace(/\D/g, '') })} placeholder="none yet" className={`${inputCls} w-36 font-mono`} /></td>
        <td className="px-3 py-2"><input aria-label="Active" type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /></td>
        <td className="px-3 py-2 whitespace-nowrap">
          <button type="button" onClick={save} disabled={!dirty || busy} className={btnPrimarySm}>{busy ? '…' : 'Save'}</button>
          {!v.isActive && <span className="ml-2"><Badge status="inactive">Off</Badge></span>}
        </td>
      </tr>
      {err && <tr><td colSpan={9} className="px-3 pb-2 text-xs text-red-300">{err}</td></tr>}
    </>
  );
}

function NewVariantRow({ productId, onSaved }: { productId: string; onSaved: (p: Product) => void }) {
  const blank = { label: '', weightGrams: 100, packaging: 'pouch', priceGBP: '' as number | '', stock: '' as number | '', barcode: '' };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setErr(null);
    try {
      onSaved(await adminApi.post<Product>(`/admin/products/${productId}/variants`, {
        label: f.label || null, weightGrams: f.weightGrams, packaging: f.packaging, barcode: f.barcode || null,
        priceGBP: f.priceGBP === '' ? undefined : f.priceGBP, stock: f.stock === '' ? undefined : f.stock,
      }));
      setF(blank);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <tr className="bg-white/[0.03]">
        <td className="px-3 py-2 text-xs text-zinc-500 whitespace-nowrap">New pack</td>
        <td className="px-3 py-2"><input aria-label="New pack label" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="e.g. Chef's Reserve · 250g" className={`${inputCls} min-w-[150px]`} /></td>
        <td className="px-3 py-2"><input aria-label="New pack weight" type="number" min={1} value={f.weightGrams} onChange={(e) => setF({ ...f, weightGrams: Number(e.target.value) })} className={`${inputCls} w-24`} /></td>
        <td className="px-3 py-2">
          <select aria-label="New pack packaging" value={f.packaging} onChange={(e) => setF({ ...f, packaging: e.target.value })} className={`${inputCls} w-28`}>
            {PACKAGING.map((x) => <option key={x}>{x}</option>)}
          </select>
        </td>
        <td className="px-3 py-2"><input aria-label="New pack price" type="number" min={0} step="0.01" value={f.priceGBP} onChange={(e) => setF({ ...f, priceGBP: e.target.value === '' ? '' : Number(e.target.value) })} className={`${inputCls} w-24`} /></td>
        <td className="px-3 py-2"><input aria-label="New pack stock" type="number" min={0} value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value === '' ? '' : Number(e.target.value) })} className={`${inputCls} w-24`} /></td>
        <td className="px-3 py-2"><input aria-label="New pack GTIN" inputMode="numeric" maxLength={13} value={f.barcode} onChange={(e) => setF({ ...f, barcode: e.target.value.replace(/\D/g, '') })} className={`${inputCls} w-36 font-mono`} /></td>
        <td />
        <td className="px-3 py-2"><button type="button" onClick={add} disabled={busy} className={btnPrimarySm}>{busy ? '…' : 'Add pack'}</button></td>
      </tr>
      {err && <tr><td colSpan={9} className="px-3 pb-2 text-xs text-red-300">{err}</td></tr>}
    </>
  );
}
