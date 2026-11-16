'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, gbp } from '@/lib/admin-api';

interface Summary {
  id: string; orderNumber: string; status: string; paymentStatus: string; grandTotal: number; shippingTotal: number; discountTotal: number;
  items: Array<{ name: string; qty: number; lineTotal: number }>;
  shippingAddress: { contactName: string | null; line1: string; line2: string | null; city: string; postcode: string | null; country: string } | null;
}

function Success() {
  const sessionId = useSearchParams()?.get('session_id');
  const [order, setOrder] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(sessionId ? null : 'This page needs a payment reference.');
  const tries = useRef(0);

  useEffect(() => {
    if (!sessionId) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () =>
      api.get<Summary>(`/checkout/session/${encodeURIComponent(sessionId)}`)
        .then((o) => {
          setOrder(o);
          // Some payment methods take a moment to confirm; check again a few times.
          if (o.paymentStatus !== 'paid' && tries.current++ < 5) timer = setTimeout(check, 2500);
        })
        .catch((e) => setError(e.message));
    check();
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (error) return <Wrap title="Something went wrong"><p className="text-zinc-300">{error}</p><Link href="/account" className="btn-primary mt-6 inline-flex">My orders</Link></Wrap>;
  if (!order) return <Wrap title="Confirming your payment…"><p className="text-zinc-400">This takes a few seconds.</p></Wrap>;

  const paid = order.paymentStatus === 'paid';
  return (
    <Wrap title={paid ? 'Thank you for your order!' : 'Payment processing'}>
      <p className="text-zinc-300">
        {paid
          ? <>Order <b className="font-mono text-amber-300">{order.orderNumber}</b> is confirmed. We&apos;ve emailed you a receipt and will let you know when it ships.</>
          : <>We&apos;re waiting for your bank to confirm payment for order <b className="font-mono">{order.orderNumber}</b>. You&apos;ll get an email as soon as it does.</>}
      </p>
      <ul className="mt-6 grid gap-2 text-sm text-left">
        {order.items.map((i) => (
          <li key={i.name} className="flex justify-between gap-4"><span>{i.name} × {i.qty}</span><span className="tabular-nums">{gbp(i.lineTotal)}</span></li>
        ))}
        <li className="flex justify-between gap-4 border-t border-white/10 pt-2 font-bold"><span>Total paid</span><span className="tabular-nums">{gbp(order.grandTotal)}</span></li>
      </ul>
      <div className="mt-8 flex gap-3 justify-center">
        <Link href="/account" className="btn-primary">View my orders</Link>
        <Link href="/shop" className="btn-ghost">Keep shopping</Link>
      </div>
    </Wrap>
  );
}

function Wrap({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-white text-center">
      <span className="gold-rule">Order</span>
      <h1 className="text-4xl font-bold mt-4 mb-6">{title}</h1>
      <div className="glass-card p-6" aria-live="polite">{children}</div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense><Success /></Suspense>;
}
