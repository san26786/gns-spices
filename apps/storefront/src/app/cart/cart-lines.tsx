'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CartResponse } from '@/lib/types';
import { api, fmtWeight, gbp } from '@/lib/admin-api';

export function CartLines({ cart, onChange }: { cart: CartResponse; onChange: (c: CartResponse) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(itemId: string, fn: () => Promise<CartResponse>) {
    setBusy(itemId);
    setError(null);
    try {
      onChange(await fn());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}
      <ul className="space-y-4">
        {cart.items.map((it) => (
          <li key={it.id} className="glass-card flex gap-4 p-4">
            <div className="gloss w-20 h-20 rounded-xl bg-gradient-to-br from-spice-turmeric via-spice-saffron to-spice-red flex-shrink-0 ring-1 ring-white/10" aria-hidden />
            <div className="flex-1 min-w-0">
              <Link href={`/product/${it.productSlug}`} className="text-lg font-bold text-white hover:text-amber-300">{it.productName}</Link>
              <p className="text-xs text-zinc-400">{it.label ?? `${fmtWeight(it.weightGrams)} · ${it.packaging}`} · SKU {it.sku}</p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="inline-flex border border-white/15 rounded-lg overflow-hidden bg-white/5">
                  <button type="button" aria-label="Decrease quantity" className="px-3 py-1 text-zinc-200 hover:bg-white/10 disabled:opacity-30"
                    disabled={busy === it.id || it.qty <= 1}
                    onClick={() => run(it.id, () => api.patch<CartResponse>(`/cart/items/${it.id}`, { qty: it.qty - 1 }))}>−</button>
                  <span className="px-3 py-1 text-white tabular-nums" aria-live="polite">{it.qty}</span>
                  <button type="button" aria-label="Increase quantity" className="px-3 py-1 text-zinc-200 hover:bg-white/10 disabled:opacity-30"
                    disabled={busy === it.id}
                    onClick={() => run(it.id, () => api.patch<CartResponse>(`/cart/items/${it.id}`, { qty: it.qty + 1 }))}>+</button>
                </div>
                <button type="button" disabled={busy === it.id} onClick={() => run(it.id, () => api.del<CartResponse>(`/cart/items/${it.id}`))} className="text-zinc-400 hover:text-amber-400 underline">
                  Remove
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-white tabular-nums">{gbp(Number(it.lineTotal))}</p>
              <p className="text-xs text-zinc-500 tabular-nums">{gbp(Number(it.unitPrice))} each</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
