'use client';

import Link from 'next/link';
import { useState } from 'react';
import { fmtMoney, fmtPack, useCart } from '@/lib/cart';

/** One pack of a product as served by GET /v1/pricing/shop-packs. */
export interface ShopPack {
  id: string;
  sku: string;
  label: string | null;
  weightGrams: number;
  packaging: string;
  unitPrice: string | null;
  baseUnitPrice: string | null;
  currency: string | null;
}

export function ShopAddToCart({
  slug,
  name,
  image,
  packs,
}: {
  slug: string;
  name: string;
  image?: string | null;
  packs: ShopPack[];
}) {
  const { add, busy } = useCart();
  const priced = packs.filter((p) => p.unitPrice != null);
  const [packId, setPackId] = useState(priced[0]?.id ?? '');
  const [status, setStatus] = useState<'idle' | 'added' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const pack = priced.find((p) => p.id === packId);

  if (!priced.length) {
    return (
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-zinc-500">Not on sale online yet.</p>
        <Link href="/contact" className="mt-2 btn-ghost w-full text-sm">Enquire</Link>
      </div>
    );
  }

  async function onAdd() {
    if (!pack) return;
    setStatus('idle');
    const ok = await add({
      variantId: pack.id,
      sku: pack.sku,
      slug,
      name,
      packLabel: fmtPack(pack.weightGrams, pack.packaging, pack.label),
      image,
      unitPrice: Number(pack.unitPrice),
      currency: pack.currency,
    });
    if (ok) {
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1800);
    } else {
      setStatus('error');
      setMessage('Could not add this pack. Please try again.');
    }
  }

  const adding = busy === pack?.id;

  return (
    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="sr-only" htmlFor={`pack-${slug}`}>Pack for {name}</label>
        {priced.length > 1 ? (
          <select
            id={`pack-${slug}`}
            value={packId}
            onChange={(e) => setPackId(e.target.value)}
            className="input-dark min-w-0 flex-1 !py-1.5 !px-2 text-xs"
          >
            {priced.map((p) => (
              <option key={p.id} value={p.id}>
                {fmtPack(p.weightGrams, p.packaging, p.label)}
              </option>
            ))}
          </select>
        ) : (
          <span id={`pack-${slug}`} className="text-xs text-zinc-400 truncate">
            {fmtPack(priced[0]!.weightGrams, priced[0]!.packaging, priced[0]!.label)}
          </span>
        )}
        {pack && (
          <span className="text-base font-bold text-amber-400 tabular-nums whitespace-nowrap">
            {fmtMoney(Number(pack.unitPrice), pack.currency ?? 'GBP')}
          </span>
        )}
      </div>
      <button type="button" onClick={onAdd} disabled={adding || !pack} className="btn-primary w-full text-sm">
        {adding ? 'Adding…' : status === 'added' ? 'Added ✓' : 'Add to cart'}
      </button>
      <p aria-live="polite" className="text-xs text-rose-400 min-h-0">
        {status === 'error' ? message : ''}
      </p>
    </div>
  );
}
