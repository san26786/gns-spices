'use client';

import Link from 'next/link';
import { ProductTile } from '@/components/ProductTile';
import { getProductVisual } from '@/lib/catalog';
import { fmtMoney, useCart } from '@/lib/cart';

export function CartLines({ images }: { images: Record<string, string> }) {
  const { lines, busy, error, setQty, remove } = useCart();

  return (
    <>
      {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}
      <ul className="space-y-4">
        {lines.map((it) => {
          const visual = { ...getProductVisual({ slug: it.slug, name: it.name }), image: it.image ?? images[it.slug] };
          const working = busy === it.variantId;
          return (
            <li key={it.variantId} className={`glass-card flex gap-3 sm:gap-4 p-3 sm:p-4 transition ${working ? 'opacity-70' : ''}`}>
              <Link href={`/product/${it.slug}`} className="w-20 sm:w-24 flex-shrink-0" tabIndex={-1} aria-hidden>
                <ProductTile visual={visual} alt="" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/product/${it.slug}`} className="text-base sm:text-lg font-bold text-white hover:text-amber-300 leading-tight">
                      {it.name}
                    </Link>
                    <p className="text-xs text-zinc-400 mt-0.5">{it.packLabel}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">{fmtMoney(it.unitPrice, it.currency)} each</p>
                  </div>
                  <p className="font-bold text-white tabular-nums whitespace-nowrap" aria-label="Line subtotal">
                    {fmtMoney(it.unitPrice * it.qty, it.currency)}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className="inline-flex border border-white/15 rounded-lg overflow-hidden bg-white/5">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${it.name}`}
                      className="px-3 py-1 text-zinc-200 hover:bg-white/10 disabled:opacity-30"
                      disabled={working || it.qty <= 1}
                      onClick={() => setQty(it.variantId, it.qty - 1)}
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-white tabular-nums min-w-[2.5rem] text-center" aria-live="polite">{it.qty}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${it.name}`}
                      className="px-3 py-1 text-zinc-200 hover:bg-white/10 disabled:opacity-30"
                      disabled={working || it.qty >= 10_000}
                      onClick={() => setQty(it.variantId, it.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => remove(it.variantId)}
                    className="text-zinc-400 hover:text-amber-400 underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
