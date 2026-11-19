'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/admin-api';
import { fmtMoney, fmtPack, useCart } from '@/lib/cart';
import type { PriceResponse } from '@/lib/types';

/** A pack as served by GET /v1/pricing/products/:slug/packs. */
export interface ProductPack {
  id: string;
  sku: string;
  label: string | null;
  weightGrams: number;
  packaging: string;
  unitPrice: string | null;
  baseUnitPrice: string | null;
  currency: string | null;
  /** Units available in the region. null = stock not tracked for this pack. */
  stock: number | null;
}

export interface Delivery {
  currency: string;
  flat: number;
  freeOver: number;
}

const MAX_QTY = 10_000;
const LOW_STOCK = 10;

function stockState(p: ProductPack | undefined) {
  if (!p || p.stock == null) return null;
  if (p.stock <= 0) return { tone: 'text-rose-400', text: 'Currently out of stock' } as const;
  if (p.stock <= LOW_STOCK) return { tone: 'text-amber-300', text: `Only ${p.stock} left in stock` } as const;
  return { tone: 'text-emerald-400', text: 'In stock' } as const;
}

/**
 * Centre column (price + pack picker + page details) and the right-hand buy box.
 * They share the selected pack and quantity, so they live in one client component
 * and are laid out as two cells of the page grid.
 */
export function ProductPurchase({
  slug,
  name,
  image,
  packs,
  delivery,
  pricesUnavailable,
  header,
  details,
}: {
  slug: string;
  name: string;
  image: string | null;
  packs: ProductPack[];
  delivery: Delivery | null;
  /** True when the price service could not be reached. */
  pricesUnavailable: boolean;
  header: React.ReactNode;
  details: React.ReactNode;
}) {
  const router = useRouter();
  const { add, mode, error: cartError, clearError } = useCart();
  const firstBuyable = packs.find((p) => p.unitPrice != null && (p.stock == null || p.stock > 0)) ?? packs.find((p) => p.unitPrice != null) ?? packs[0];
  const [packId, setPackId] = useState(firstBuyable?.id ?? '');
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<'idle' | 'adding' | 'buying' | 'added'>('idle');
  const [ladder, setLadder] = useState<PriceResponse['ladder']>([]);

  const pack = packs.find((p) => p.id === packId);
  const price = pack?.unitPrice != null ? Number(pack.unitPrice) : null;
  const base = pack?.baseUnitPrice != null ? Number(pack.baseUnitPrice) : null;
  const currency = pack?.currency ?? 'GBP';
  const off = price != null && base != null && base > price ? Math.round((1 - price / base) * 100) : 0;
  const stock = stockState(pack);
  const outOfStock = pack?.stock != null && pack.stock <= 0;
  const maxQty = pack?.stock != null && pack.stock > 0 ? Math.min(pack.stock, MAX_QTY) : MAX_QTY;
  const canBuy = !!pack && price != null && !outOfStock;
  const lineTotal = price != null ? price * qty : null;

  // Keep the quantity inside the selected pack's stock.
  useEffect(() => setQty((q) => Math.min(Math.max(1, q), maxQty)), [maxQty]);

  // Quantity price breaks for the selected pack (shown when there is more than one).
  useEffect(() => {
    setLadder([]);
    if (!pack || pack.unitPrice == null) return;
    let live = true;
    api
      .get<PriceResponse>(`/pricing/variants/${pack.id}?qty=1&region=GB`)
      .then((r) => live && setLadder(r.ladder ?? []))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [pack]);

  async function addToCart() {
    if (!pack || !canBuy) return false;
    clearError();
    return add(
      {
        variantId: pack.id,
        sku: pack.sku,
        slug,
        name,
        image,
        packLabel: fmtPack(pack.weightGrams, pack.packaging, pack.label),
        unitPrice: price,
        currency,
      },
      qty,
    );
  }

  async function onAdd() {
    setStatus('adding');
    const ok = await addToCart();
    setStatus(ok ? 'added' : 'idle');
    if (ok) setTimeout(() => setStatus('idle'), 2000);
  }

  async function onBuyNow() {
    setStatus('buying');
    const ok = await addToCart();
    if (!ok) return setStatus('idle');
    // Checkout needs an account. Guests sign in first; their cart moves over on the way.
    router.push(mode === 'server' ? '/checkout' : '/login?next=/cart');
  }

  const perKg = price != null && pack ? (price / pack.weightGrams) * 1000 : null;

  return (
    <>
      {/* ── Centre: title, price, pack picker, details ── */}
      <div className="min-w-0">
        {header}

        <div className="mt-5 pt-5 border-t border-white/10">
          {pricesUnavailable ? (
            <p className="text-sm text-zinc-400">Prices could not be loaded right now. Please refresh the page.</p>
          ) : price != null ? (
            <div>
              <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
                {off > 0 && <span className="text-2xl font-light text-rose-400">-{off}%</span>}
                <span className="text-4xl font-bold text-amber-400 tabular-nums">{fmtMoney(price, currency)}</span>
                {perKg != null && (
                  <span className="text-sm text-zinc-400 tabular-nums">({fmtMoney(perKg, currency)}/kg)</span>
                )}
              </div>
              {off > 0 && base != null && (
                <p className="mt-1 text-sm text-zinc-500">
                  Was <span className="line-through tabular-nums">{fmtMoney(base, currency)}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">This pack is not on sale online yet.</p>
          )}
        </div>

        {packs.length > 0 && (
          <fieldset className="mt-6">
            <legend className="text-sm text-zinc-300 mb-2">
              Pack: <span className="font-semibold text-white">{pack ? fmtPack(pack.weightGrams, pack.packaging, pack.label) : '—'}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {packs.map((p) => {
                const selected = p.id === packId;
                const unavailable = p.unitPrice == null || (p.stock != null && p.stock <= 0);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPackId(p.id)}
                    aria-pressed={selected}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition text-left ${
                      selected
                        ? 'border-amber-400 bg-amber-500 text-amber-950 shadow-amber'
                        : `border-white/15 bg-white/5 hover:border-amber-400 hover:text-amber-400 ${unavailable ? 'text-zinc-500 border-dashed' : 'text-zinc-300'}`
                    }`}
                  >
                    <span className="block">{fmtPack(p.weightGrams, p.packaging, p.label)}</span>
                    <span className={`block text-xs tabular-nums ${selected ? 'text-amber-950/80' : 'text-zinc-500'}`}>
                      {p.unitPrice != null ? fmtMoney(Number(p.unitPrice), p.currency ?? 'GBP') : 'Price on request'}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {ladder.length > 1 && (
          <section className="mt-6 glass-card p-5">
            <h2 className="text-base font-bold mb-3 text-amber-400">Quantity pricing</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-400">
                  <th className="py-2 font-medium">Quantity</th>
                  <th className="py-2 font-medium">Unit price</th>
                </tr>
              </thead>
              <tbody>
                {ladder.map((tier) => (
                  <tr key={tier.minQty} className="border-b border-white/5">
                    <td className="py-2 text-zinc-300">{tier.minQty}+</td>
                    <td className="py-2 text-white font-semibold tabular-nums">{fmtMoney(Number(tier.unitPrice), tier.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

      </div>

      {/* ── Right: buy box ── */}
      <aside className="md:col-span-2 lg:col-span-1">
        <div className="glass-card p-5 lg:sticky lg:top-28">
          {price != null ? (
            <p className="text-3xl font-bold text-white tabular-nums">{fmtMoney(price, currency)}</p>
          ) : (
            <p className="text-lg font-semibold text-zinc-300">{pricesUnavailable ? 'Price unavailable' : 'Price on request'}</p>
          )}

          {delivery && price != null && (
            <p className="mt-3 text-sm text-zinc-300">
              {lineTotal != null && lineTotal >= delivery.freeOver ? (
                <><span className="font-semibold text-emerald-400">FREE UK delivery</span> on this order.</>
              ) : (
                <>
                  <span className="font-semibold text-white">{fmtMoney(delivery.flat, delivery.currency)}</span> UK delivery, or{' '}
                  <span className="font-semibold text-emerald-400">FREE</span> on orders over {fmtMoney(delivery.freeOver, delivery.currency)}.
                </>
              )}
            </p>
          )}

          {stock && <p className={`mt-3 text-lg font-semibold ${stock.tone}`}>{stock.text}</p>}

          {canBuy ? (
            <>
              <div className="mt-4">
                <label htmlFor="qty" className="block text-sm text-zinc-300">Quantity</label>
                <div className="mt-1.5 inline-flex items-center border border-white/15 rounded-lg overflow-hidden bg-white/5">
                  <button type="button" aria-label="Decrease quantity" className="px-3 py-2 text-zinc-200 hover:bg-white/10 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <input
                    id="qty"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={maxQty}
                    value={qty}
                    onChange={(e) => setQty(Math.min(maxQty, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
                    className="w-16 text-center bg-transparent outline-none text-white tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button type="button" aria-label="Increase quantity" className="px-3 py-2 text-zinc-200 hover:bg-white/10 disabled:opacity-30" disabled={qty >= maxQty} onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>+</button>
                </div>
              </div>
              {lineTotal != null && qty > 1 && (
                <p className="mt-2 text-sm text-zinc-400 tabular-nums">Total {fmtMoney(lineTotal, currency)}</p>
              )}

              <div className="mt-5 space-y-3">
                <button type="button" onClick={onAdd} disabled={status === 'adding' || status === 'buying'} className="btn-primary w-full">
                  {status === 'adding' ? 'Adding…' : status === 'added' ? 'Added to cart ✓' : 'Add to cart'}
                </button>
                <button type="button" onClick={onBuyNow} disabled={status === 'adding' || status === 'buying'} className="btn-ghost w-full">
                  {status === 'buying' ? 'Just a moment…' : 'Buy now'}
                </button>
              </div>
              {status === 'added' && (
                <p className="mt-3 text-sm text-center">
                  <Link href="/cart" className="text-amber-400 hover:text-amber-300">Go to cart</Link>
                </p>
              )}
            </>
          ) : (
            <div className="mt-5">
              <p className="text-sm text-zinc-400">
                {outOfStock ? 'This pack is out of stock. Choose another pack or ask us when it will be back.' : 'Contact us to order this pack or to ask about bulk supply.'}
              </p>
              <Link href="/contact" className="btn-ghost w-full mt-4">Enquire</Link>
            </div>
          )}

          {cartError && status === 'idle' && <p role="alert" className="mt-3 text-sm text-rose-400">{cartError}</p>}

          <dl className="mt-5 pt-4 border-t border-white/10 text-xs text-zinc-400 space-y-1.5">
            {pack && <div className="flex justify-between gap-3"><dt>SKU</dt><dd className="text-zinc-300 font-mono">{pack.sku}</dd></div>}
            {pack && <div className="flex justify-between gap-3"><dt>Pack</dt><dd className="text-zinc-300">{fmtPack(pack.weightGrams, pack.packaging, pack.label)}</dd></div>}
          </dl>
        </div>
      </aside>

      {/* Details sit under the centre column on desktop, and after the buy box on phones and tablets. */}
      <div className="min-w-0 md:col-span-2 lg:col-span-1 lg:col-start-2">{details}</div>
    </>
  );
}
