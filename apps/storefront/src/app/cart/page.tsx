import { cookies } from 'next/headers';
import Link from 'next/link';
import { apiFetch, money } from '@/lib/api';
import type { CartResponse } from '@/lib/types';
import { CartLines } from './cart-lines';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const cookieHeader = (await cookies()).toString();
  let cart: CartResponse | null = null;
  let authed = true;
  let apiOffline = false;
  try {
    cart = await apiFetch<CartResponse>('/cart', { cookie: cookieHeader });
  } catch (e: any) {
    if (e?.status === 401) authed = false;
    else apiOffline = true;
  }

  if (apiOffline) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center text-white">
        <span className="gold-rule">Cart unavailable</span>
        <h1 className="text-4xl font-bold mt-4 mb-4">Your cart will be back shortly</h1>
        <p className="text-zinc-400 mb-8">
          The catalog service is offline right now, so we can&apos;t show your cart. You can keep browsing in the meantime.
        </p>
        <Link href="/shop" className="btn-primary">Browse the shop</Link>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Your cart</h1>
        <p className="text-zinc-400 mb-8">Sign in to view your cart.</p>
        <Link href="/login?next=/cart" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-zinc-400 mb-8">Browse the shop to find your next favourite spice.</p>
        <Link href="/shop" className="btn-primary">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 text-white">
      <div className="md:col-span-2">
        <h1 className="text-4xl font-bold mb-8">Your cart</h1>
        <CartLines initial={cart} />
      </div>
      <aside className="glass-card p-6 h-fit">
        <h3 className="text-xl font-bold mb-4">Summary</h3>
        <dl className="text-sm space-y-2 text-zinc-300">
          <div className="flex justify-between"><dt>Items</dt><dd>{cart.itemCount}</dd></div>
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(cart.subtotal, cart.currency)}</dd></div>
          <div className="flex justify-between text-zinc-500"><dt>Shipping</dt><dd>Calculated at checkout</dd></div>
          <div className="flex justify-between text-zinc-500"><dt>Tax</dt><dd>Calculated at checkout</dd></div>
        </dl>
        <Link href="/checkout" className="btn-primary w-full mt-6">Checkout</Link>
      </aside>
    </div>
  );
}
