'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, gbp } from '@/lib/admin-api';

interface Quote {
  currency: string;
  lines: Array<{ sku: string; name: string; label: string | null; qty: number; unitPrice: number; lineTotal: number }>;
  subtotal: number; discount: number; shipping: number; total: number;
  coupon: { code: string; percentOff: number } | null; couponError: string | null;
  freeShippingOver: number; paymentsEnabled: boolean;
}
interface Me {
  email: string; firstName: string | null; lastName: string | null; phone: string | null;
  defaultShipping: { contactName: string | null; phone: string | null; line1: string; line2: string | null; city: string; state: string | null; postcode: string | null; country: string } | null;
}

const COUNTRIES: Array<[string, string]> = [['GB', 'United Kingdom'], ['IE', 'Ireland'], ['IN', 'India'], ['AE', 'United Arab Emirates']];
const blankAddress = { contactName: '', phone: '', line1: '', line2: '', city: '', state: '', postcode: '', country: 'GB' };

function Checkout() {
  const router = useRouter();
  const cancelled = useSearchParams()?.has('cancelled');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [addr, setAddr] = useState(blankAddress);
  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const loadQuote = useCallback(async (code?: string) => {
    const q = await api.post<Quote>('/checkout/quote', { couponCode: code });
    setQuote(q);
    return q;
  }, []);

  useEffect(() => {
    Promise.all([api.get<Me>('/auth/me'), loadQuote()])
      .then(([m]) => {
        setMe(m);
        const d = m.defaultShipping;
        setAddr(d
          ? { contactName: d.contactName ?? '', phone: d.phone ?? '', line1: d.line1, line2: d.line2 ?? '', city: d.city, state: d.state ?? '', postcode: d.postcode ?? '', country: d.country }
          : { ...blankAddress, contactName: [m.firstName, m.lastName].filter(Boolean).join(' '), phone: m.phone ?? '' });
      })
      .catch((e) => {
        if (e.status === 401) router.replace('/login?next=/checkout');
        else if (e.code === 'cart_empty') router.replace('/cart');
        else setError(e.message);
      });
  }, [loadQuote, router]);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const q = await loadQuote(code).catch((err) => { setError(err.message); return null; });
    if (q?.coupon) setAppliedCode(q.coupon.code);
  }

  async function removeCoupon() {
    setAppliedCode(undefined);
    setCouponInput('');
    await loadQuote();
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setPaying(true);
    setError(null);
    try {
      const res = await api.post<{ url: string }>('/checkout/session', { shipping: addr, couponCode: appliedCode, notes: notes || undefined });
      window.location.href = res.url;
    } catch (err) {
      setError((err as Error).message);
      setPaying(false);
    }
  }

  const set = (k: keyof typeof addr, v: string) => setAddr((a) => ({ ...a, [k]: v }));

  if (!quote || !me) {
    return <div className="max-w-5xl mx-auto px-6 py-24 text-white">{error ? <p role="alert" className="text-red-300">{error}</p> : <p className="text-zinc-400">Loading checkout…</p>}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-14 text-white">
      <Link href="/cart" className="text-sm text-zinc-400 hover:text-amber-400">← Back to cart</Link>
      <h1 className="text-4xl font-bold mt-4 mb-8">Checkout</h1>
      {cancelled && <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Payment was cancelled. Your cart is still here when you&apos;re ready.</p>}

      <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-8 items-start">
        <form id="checkout-form" onSubmit={pay} className="glass-card p-6 grid sm:grid-cols-2 gap-4">
          <h2 className="sm:col-span-2 text-xl font-bold">Delivery address</h2>
          <F label="Full name" wide><input id="co-name" required maxLength={120} autoComplete="name" value={addr.contactName} onChange={(e) => set('contactName', e.target.value)} className="input-dark w-full" /></F>
          <F label="Address line 1" wide><input id="co-line1" required maxLength={200} autoComplete="address-line1" value={addr.line1} onChange={(e) => set('line1', e.target.value)} className="input-dark w-full" /></F>
          <F label="Address line 2 (optional)" wide><input id="co-line2" maxLength={200} autoComplete="address-line2" value={addr.line2} onChange={(e) => set('line2', e.target.value)} className="input-dark w-full" /></F>
          <F label="Town or city"><input id="co-city" required maxLength={120} autoComplete="address-level2" value={addr.city} onChange={(e) => set('city', e.target.value)} className="input-dark w-full" /></F>
          <F label="Postcode"><input id="co-postcode" required maxLength={24} autoComplete="postal-code" value={addr.postcode} onChange={(e) => set('postcode', e.target.value.toUpperCase())} className="input-dark w-full" /></F>
          <F label="County / state (optional)"><input id="co-state" maxLength={120} autoComplete="address-level1" value={addr.state} onChange={(e) => set('state', e.target.value)} className="input-dark w-full" /></F>
          <F label="Country">
            <select id="co-country" value={addr.country} onChange={(e) => set('country', e.target.value)} className="input-dark w-full" autoComplete="country">
              {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </F>
          <F label="Phone (for the courier)"><input id="co-phone" type="tel" maxLength={24} autoComplete="tel" value={addr.phone} onChange={(e) => set('phone', e.target.value)} className="input-dark w-full" /></F>
          <F label="Email"><input id="co-email" value={me.email} disabled className="input-dark w-full opacity-60" /></F>
          <F label="Delivery notes (optional)" wide><textarea id="co-notes" rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} className="input-dark w-full" placeholder="e.g. leave with the neighbour at no. 12" /></F>
        </form>

        <aside className="glass-card p-6 grid gap-5 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">Your order</h2>
          <ul className="grid gap-3 text-sm">
            {quote.lines.map((l) => (
              <li key={l.sku} className="flex justify-between gap-4">
                <span className="min-w-0">{l.name}<span className="block text-xs text-zinc-500">{l.label ?? l.sku} · × {l.qty}</span></span>
                <span className="tabular-nums shrink-0">{gbp(l.lineTotal)}</span>
              </li>
            ))}
          </ul>

          {appliedCode ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">
              <span><b className="font-mono">{appliedCode}</b> · {quote.coupon?.percentOff}% off</span>
              <button type="button" onClick={removeCoupon} className="text-zinc-300 hover:text-white underline">Remove</button>
            </div>
          ) : (
            <form onSubmit={applyCoupon} className="flex gap-2">
              <label htmlFor="co-coupon" className="sr-only">Discount code</label>
              <input id="co-coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Discount code" maxLength={40} className="input-dark flex-1 !py-2 font-mono uppercase" />
              <button type="submit" className="btn-ghost !py-2 !px-4">Apply</button>
            </form>
          )}
          {!appliedCode && quote.couponError && <p className="text-xs text-red-300 -mt-3">{quote.couponError}</p>}

          <dl className="grid grid-cols-2 gap-y-1.5 text-sm tabular-nums border-t border-white/10 pt-4">
            <dt className="text-zinc-400">Subtotal</dt><dd className="text-right">{gbp(quote.subtotal)}</dd>
            {quote.discount > 0 && <><dt className="text-zinc-400">Discount</dt><dd className="text-right text-emerald-300">−{gbp(quote.discount)}</dd></>}
            <dt className="text-zinc-400">Delivery</dt><dd className="text-right">{quote.shipping > 0 ? gbp(quote.shipping) : 'Free'}</dd>
            <dt className="text-lg font-bold mt-2">Total</dt><dd className="text-right text-lg font-bold mt-2 text-amber-300">{gbp(quote.total)}</dd>
          </dl>
          {quote.shipping > 0 && <p className="text-xs text-zinc-500 -mt-2">Free delivery on orders over {gbp(quote.freeShippingOver)}.</p>}

          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          {quote.paymentsEnabled ? (
            <button type="submit" form="checkout-form" disabled={paying} className="btn-primary w-full">{paying ? 'Taking you to secure payment…' : `Pay ${gbp(quote.total)}`}</button>
          ) : (
            <p className="text-sm text-amber-200 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              Online payment isn&apos;t switched on yet. <Link href="/contact" className="underline">Contact us</Link> to place this order.
            </p>
          )}
          <p className="text-xs text-zinc-500">Card payment is handled by Stripe. We never see your card details.</p>
        </aside>
      </div>
    </div>
  );
}

function F({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`grid gap-1.5 min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export default function CheckoutPage() {
  return <Suspense><Checkout /></Suspense>;
}
