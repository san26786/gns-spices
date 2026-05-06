import { cookies } from 'next/headers';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  currency: string;
  grandTotal: string;
  placedAt: string;
}

export default async function AccountPage() {
  const cookieHeader = (await cookies()).toString();
  let orders: Order[] = [];
  let authed = true;
  let apiOffline = false;
  try {
    const res = await apiFetch<{ data: Order[] }>('/orders', { cookie: cookieHeader });
    orders = res.data;
  } catch (e: any) {
    if (e?.status === 401) authed = false;
    else apiOffline = true;
  }

  if (apiOffline) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center text-white">
        <span className="gold-rule">Account unavailable</span>
        <h1 className="text-4xl font-bold mt-4 mb-4">My account</h1>
        <p className="text-zinc-400 mb-8">
          The catalog service is offline right now. Account details will be available again shortly.
        </p>
        <Link href="/shop" className="btn-primary">Browse the shop</Link>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">My account</h1>
        <p className="text-zinc-400 mb-8">Please sign in to view your orders.</p>
        <Link href="/login?next=/account" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-white">
      <span className="gold-rule">Your account</span>
      <h1 className="text-4xl font-bold tracking-tight mt-4 mb-10">My account</h1>
      <section>
        <h2 className="text-2xl font-bold mb-5">Orders</h2>
        {orders.length === 0 ? (
          <div className="glass-card p-10 text-center text-zinc-400">
            No orders yet. <Link href="/shop" className="text-amber-400 hover:text-amber-300 underline">Start shopping</Link>.
          </div>
        ) : (
          <div className="glass-card overflow-x-auto p-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-white/10 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-3">Order #</th>
                  <th className="py-3 px-3">Placed</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-3">
                      <Link href={`/account/orders/${o.id}`} className="text-amber-400 hover:text-amber-300 underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-zinc-300">{new Date(o.placedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3 capitalize text-zinc-300">{o.status.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-3 text-white font-semibold">{o.currency} {Number(o.grandTotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
