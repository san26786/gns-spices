'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Variant { id: string; sku: string; label?: string | null; weightGrams: number; packaging: string }

export function AddToCart({
  variants,
  currency: _currency,
  slug: _slug,
}: {
  variants: Variant[];
  currency: string;
  slug: string;
}) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    setError(null);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/cart/items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ variantId, qty }),
    });
    if (res.status === 401) {
      router.push(`/login?next=/product/${_slug}`);
      return;
    }
    if (!res.ok) {
      setError((await res.text()) || `Failed (${res.status})`);
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    router.refresh();
  }

  return (
    <div className="mt-7 space-y-4">
      <div className="flex gap-2 flex-wrap">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setVariantId(v.id)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              variantId === v.id
                ? 'border-amber-400 bg-amber-500 text-amber-950 shadow-amber'
                : 'border-white/15 text-zinc-300 hover:border-amber-400 hover:text-amber-400 bg-white/5'
            }`}
          >
            {v.label ?? `${v.weightGrams >= 1000 ? `${v.weightGrams / 1000}kg` : `${v.weightGrams}g`} · ${v.packaging}`}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center border border-white/15 rounded-lg overflow-hidden bg-white/5">
          <button className="px-3 py-2 text-zinc-200 hover:bg-white/10" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-16 text-center bg-transparent outline-none text-white"
          />
          <button className="px-3 py-2 text-zinc-200 hover:bg-white/10" onClick={() => setQty((q) => q + 1)}>+</button>
        </div>

        <button
          onClick={() => startTransition(handleAdd)}
          disabled={pending || !variantId}
          className="btn-primary"
        >
          {pending ? 'Adding…' : added ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}
    </div>
  );
}
