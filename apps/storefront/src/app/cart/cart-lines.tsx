'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { CartResponse } from '@/lib/types';
import { money } from '@/lib/api';

export function CartLines({ initial }: { initial: CartResponse }) {
  const [cart, setCart] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function update(itemId: string, qty: number) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/cart/items/${itemId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ qty }),
    });
    if (res.ok) {
      setCart(await res.json());
      router.refresh();
    }
  }

  async function remove(itemId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/cart/items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setCart(await res.json());
      router.refresh();
    }
  }

  return (
    <ul className="space-y-4">
      {cart.items.map((it) => (
        <li key={it.id} className="glass-card flex gap-4 p-4">
          <div className="gloss w-20 h-20 rounded-xl bg-gradient-to-br from-spice-turmeric via-spice-saffron to-spice-red flex items-center justify-center text-3xl flex-shrink-0 ring-1 ring-white/10 overflow-hidden">
            <span className="drop-shadow">🌿</span>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white">{it.productName}</h4>
            <p className="text-xs text-zinc-400">
              {it.weightGrams >= 1000 ? `${it.weightGrams / 1000}kg` : `${it.weightGrams}g`} · {it.packaging} · SKU {it.sku}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="inline-flex border border-white/15 rounded-lg overflow-hidden bg-white/5">
                <button
                  className="px-3 py-1 text-zinc-200 hover:bg-white/10 disabled:opacity-30"
                  disabled={pending || it.qty <= 1}
                  onClick={() => startTransition(() => update(it.id, it.qty - 1))}
                >−</button>
                <span className="px-3 py-1 text-white">{it.qty}</span>
                <button
                  className="px-3 py-1 text-zinc-200 hover:bg-white/10"
                  disabled={pending}
                  onClick={() => startTransition(() => update(it.id, it.qty + 1))}
                >+</button>
              </div>
              <button onClick={() => startTransition(() => remove(it.id))} className="text-zinc-400 hover:text-amber-400 underline">
                Remove
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-white">{money(it.lineTotal, cart.currency)}</p>
            <p className="text-xs text-zinc-500">{money(it.unitPrice, cart.currency)} ea</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
