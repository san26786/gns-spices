'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fmtMoney, useCart } from '@/lib/cart';
import { CartLines } from './cart-lines';

const FREE_SHIPPING_OVER = 40;

export function CartView({ images }: { images: Record<string, string> }) {
  const { mode, lines, itemCount, subtotal, currency } = useCart();
  const router = useRouter();

  // A guest who pressed Checkout signs in and comes back here with ?checkout=1. Once their
  // saved items have moved into their account cart, continue straight to checkout.
  useEffect(() => {
    if (mode !== 'server' || !new URLSearchParams(window.location.search).has('checkout')) return;
    router.replace(lines.length ? '/checkout' : '/cart');
  }, [mode, lines.length, router]);

  if (mode === 'loading') {
    return <Shell><p className="text-zinc-400">Loading your cart…</p></Shell>;
  }

  if (lines.length === 0) {
    return (
      <Shell title="Your cart is empty">
        <div aria-hidden className="mx-auto mb-6 w-20 h-20 rounded-full bg-white/5 border border-white/10 grid place-items-center text-amber-400">
          <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
            <circle cx="9.5" cy="20" r="1.3" />
            <circle cx="17.5" cy="20" r="1.3" />
          </svg>
        </div>
        <p className="text-zinc-400 mb-8">Browse the shop to find your next favourite spice.</p>
        <Link href="/shop" className="btn-primary">Continue shopping</Link>
      </Shell>
    );
  }

  const isGbp = currency === 'GBP';
  const toFree = Math.max(0, FREE_SHIPPING_OVER - subtotal);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid lg:grid-cols-3 gap-8 text-white">
      <div className="lg:col-span-2 min-w-0">
        <div className="flex items-baseline justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Your cart</h1>
          <Link href="/shop" className="text-sm text-amber-400 hover:text-amber-300">Continue shopping</Link>
        </div>
        <CartLines images={images} />
      </div>
      <aside className="glass-card p-6 h-fit lg:sticky lg:top-28">
        <h2 className="text-xl font-bold mb-4">Summary</h2>
        <dl className="text-sm space-y-2 text-zinc-300">
          <div className="flex justify-between"><dt>Items</dt><dd className="tabular-nums">{itemCount}</dd></div>
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{fmtMoney(subtotal, currency)}</dd></div>
          <div className="flex justify-between text-zinc-500"><dt>Delivery and discounts</dt><dd>At checkout</dd></div>
          <div className="flex justify-between border-t border-white/10 pt-3 mt-3 text-base font-bold text-white">
            <dt>Total</dt><dd className="tabular-nums">{fmtMoney(subtotal, currency)}</dd>
          </div>
        </dl>
        {isGbp && (
          <p className="mt-4 text-xs text-amber-300">
            {toFree > 0 ? `Add ${fmtMoney(toFree, currency)} more for free UK delivery.` : 'Your order qualifies for free UK delivery.'}
          </p>
        )}
        {mode === 'server' ? (
          <Link href="/checkout" className="btn-primary w-full mt-6">Checkout</Link>
        ) : (
          <>
            <Link href={`/login?next=${encodeURIComponent('/cart?checkout=1')}`} className="btn-primary w-full mt-6">Checkout</Link>
            <p className="mt-3 text-xs text-zinc-500 text-center">
              You&apos;ll sign in first. Your cart is saved on this device and moves to your account when you sign in.{' '}
              <Link href="/register?next=/cart" className="text-amber-400 hover:text-amber-300">Create an account</Link>
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

function Shell({ title = 'Your cart', children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center text-white">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      {children}
    </div>
  );
}
