'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { api, fmtDate, gbp, humanize } from '@/lib/admin-api';

interface Order {
  id: string; orderNumber: string; status: string; paymentStatus: string; placedAt: string;
  subtotal: string; discountTotal: string; shippingTotal: string; grandTotal: string;
  items: Array<{ id: string; sku: string; name: string; qty: number; unitPrice: string; lineTotal: string }>;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Order>(`/orders/${id}`).then(setOrder).catch((e) => setError(e.status === 401 ? 'Please sign in to see this order.' : e.message));
  }, [id]);

  if (error) return <div className="max-w-md mx-auto px-6 py-24 text-center text-zinc-300">{error} <Link href="/account" className="text-amber-400 underline">My account</Link></div>;
  if (!order) return <div className="max-w-md mx-auto px-6 py-24 text-center text-zinc-400">Loading order…</div>;

  const n = (s: string) => Number(s);
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-white">
      <Link href="/account" className="text-sm text-zinc-400 hover:text-amber-400">← My account</Link>
      <h1 className="text-3xl font-bold mt-4">Order <span className="font-mono text-amber-300">{order.orderNumber}</span></h1>
      <p className="text-sm text-zinc-400 mt-1">
        Placed {fmtDate(order.placedAt, true)} · {order.status === 'pending_payment' ? 'Awaiting payment' : humanize(order.status)}
      </p>
      <div className="glass-card p-6 mt-8">
        <ul className="grid gap-3 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span>{i.name}<span className="block text-xs text-zinc-500">{i.sku} · {i.qty} × {gbp(n(i.unitPrice))}</span></span>
              <span className="tabular-nums">{gbp(n(i.lineTotal))}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 border-t border-white/10 pt-4 grid grid-cols-2 gap-y-1 text-sm tabular-nums">
          <dt className="text-zinc-400">Subtotal</dt><dd className="text-right">{gbp(n(order.subtotal))}</dd>
          {n(order.discountTotal) > 0 && <><dt className="text-zinc-400">Discount</dt><dd className="text-right">−{gbp(n(order.discountTotal))}</dd></>}
          <dt className="text-zinc-400">Delivery</dt><dd className="text-right">{n(order.shippingTotal) > 0 ? gbp(n(order.shippingTotal)) : 'Free'}</dd>
          <dt className="font-bold">Total</dt><dd className="text-right font-bold">{gbp(n(order.grandTotal))}</dd>
        </dl>
      </div>
      <p className="mt-6 text-sm text-zinc-400">Questions about this order? <Link href="/contact" className="text-amber-400 underline">Contact us</Link> and quote the order number.</p>
    </div>
  );
}
