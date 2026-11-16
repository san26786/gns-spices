'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, gbp } from '@/lib/admin-api';
import type { CartResponse } from '@/lib/types';
import { CartLines } from './cart-lines';

const FREE_SHIPPING_OVER = 40;

type State = { kind: 'loading' } | { kind: 'signed-out' } | { kind: 'error'; message: string } | { kind: 'ready'; cart: CartResponse };

export default function CartPage() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    api.get<CartResponse>('/cart')
      .then((cart) => setState({ kind: 'ready', cart }))
      .catch((e) => setState(e.status === 401 ? { kind: 'signed-out' } : { kind: 'error', message: 'We could not load your cart. Please refresh the page.' }));
  }, []);

  if (state.kind === 'loading') return <Shell><p className="text-zinc-400">Loading your cart…</p></Shell>;
  if (state.kind === 'error') return <Shell><p className="text-zinc-400">{state.message}</p></Shell>;
  if (state.kind === 'signed-out') {
    return (
      <Shell>
        <p className="text-zinc-400 mb-8">Sign in to see your cart and check out.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login?next=/cart" className="btn-primary">Sign in</Link>
          <Link href="/register?next=/cart" className="btn-ghost">Create account</Link>
        </div>
      </Shell>
    );
  }

  const { cart } = state;
  if (cart.items.length === 0) {
    return (
      <Shell title="Your cart is empty">
        <p className="text-zinc-400 mb-8">Browse the shop to find your next favourite spice.</p>
        <Link href="/shop" className="btn-primary">Browse the shop</Link>
      </Shell>
    );
  }

  const subtotal = Number(cart.subtotal);
  const toFree = Math.max(0, FREE_SHIPPING_OVER - subtotal);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 text-white">
      <div className="md:col-span-2 min-w-0">
        <h1 className="text-4xl font-bold mb-8">Your cart</h1>
        <CartLines cart={cart} onChange={(c) => setState({ kind: 'ready', cart: c })} />
      </div>
      <aside className="glass-card p-6 h-fit">
        <h2 className="text-xl font-bold mb-4">Summary</h2>
        <dl className="text-sm space-y-2 text-zinc-300">
          <div className="flex justify-between"><dt>Items</dt><dd>{cart.itemCount}</dd></div>
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{gbp(subtotal)}</dd></div>
          <div className="flex justify-between text-zinc-500"><dt>Delivery and discounts</dt><dd>At checkout</dd></div>
        </dl>
        <p className="mt-4 text-xs text-amber-300">
          {toFree > 0 ? `Add ${gbp(toFree)} more for free UK delivery.` : 'Your order qualifies for free UK delivery.'}
        </p>
        <Link href="/checkout" className="btn-primary w-full mt-6">Checkout</Link>
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
