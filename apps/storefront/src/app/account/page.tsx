'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, fmtDate, gbp, humanize } from '@/lib/admin-api';

interface Me { email: string; firstName: string | null; lastName: string | null; phone: string | null; emailVerified: boolean; staffRole: string | null }
interface Order { id: string; orderNumber: string; status: string; paymentStatus: string; grandTotal: string; placedAt: string; items: Array<{ id: string }> }

type Tab = 'orders' | 'profile' | 'password';

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('orders');

  useEffect(() => {
    Promise.all([api.get<Me>('/auth/me'), api.get<{ data: Order[] }>('/orders')])
      .then(([m, o]) => { setMe(m); setOrders(o.data); })
      .catch((e) => (e.status === 401 ? setSignedOut(true) : setError('We could not load your account. Please refresh the page.')));
  }, []);

  async function signOut() {
    await api.post('/auth/logout', {}).catch(() => {});
    router.push('/');
    router.refresh();
  }

  if (signedOut) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">My account</h1>
        <p className="text-zinc-400 mb-8">Sign in to see your orders and details.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login?next=/account" className="btn-primary">Sign in</Link>
          <Link href="/register" className="btn-ghost">Create account</Link>
        </div>
      </div>
    );
  }
  if (error) return <div className="max-w-md mx-auto px-6 py-24 text-center text-zinc-300">{error}</div>;
  if (!me || !orders) return <div className="max-w-md mx-auto px-6 py-24 text-center text-zinc-400">Loading your account…</div>;

  const visibleOrders = orders.filter((o) => o.status !== 'cancelled' || o.paymentStatus === 'paid');

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-white">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="gold-rule">Your account</span>
          <h1 className="text-4xl font-bold tracking-tight mt-4">Hello{me.firstName ? `, ${me.firstName}` : ''}</h1>
          <p className="text-sm text-zinc-400 mt-1">{me.email}</p>
        </div>
        <div className="flex gap-3">
          {me.staffRole && <Link href="/admin" className="btn-ghost !py-2">Admin</Link>}
          <button type="button" onClick={signOut} className="btn-ghost !py-2">Sign out</button>
        </div>
      </div>

      {!me.emailVerified && <VerifyBanner />}

      <div className="mt-10 flex gap-2" role="tablist">
        {(['orders', 'profile', 'password'] as Tab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`${tab === t ? 'bg-amber-500 text-amber-950' : 'bg-white/5 text-zinc-300 hover:bg-white/10'} rounded-full px-4 py-1.5 text-sm font-semibold`}>
            {{ orders: 'Orders', profile: 'Details', password: 'Password' }[t]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'orders' && (visibleOrders.length === 0 ? (
          <div className="glass-card p-10 text-center text-zinc-400">
            No orders yet. <Link href="/shop" className="text-amber-400 hover:text-amber-300 underline">Start shopping</Link>.
          </div>
        ) : (
          <div className="glass-card overflow-x-auto p-2">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left border-b border-white/10 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-3">Order</th><th className="py-3 px-3">Placed</th><th className="py-3 px-3">Status</th><th className="py-3 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-3"><Link href={`/account/orders/${o.id}`} className="text-amber-400 hover:text-amber-300 underline font-mono">{o.orderNumber}</Link></td>
                    <td className="py-3 px-3 text-zinc-300">{fmtDate(o.placedAt)}</td>
                    <td className="py-3 px-3 text-zinc-300">{o.status === 'pending_payment' ? 'Awaiting payment' : humanize(o.status)}</td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">{gbp(Number(o.grandTotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {tab === 'profile' && <ProfileForm me={me} onSaved={setMe} />}
        {tab === 'password' && <PasswordForm />}
      </div>
    </div>
  );
}

function VerifyBanner() {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 flex flex-wrap items-center gap-3 justify-between">
      <span>{msg ?? 'Please confirm your email address using the link we sent you.'}</span>
      {!msg && (
        <button type="button" className="underline" onClick={() => api.post('/auth/resend-verification', {}).then(() => setMsg('New link sent. Check your inbox.')).catch((e) => setMsg(e.message))}>
          Send a new link
        </button>
      )}
    </div>
  );
}

function ProfileForm({ me, onSaved }: { me: Me; onSaved: (m: Me) => void }) {
  const [f, setF] = useState({ firstName: me.firstName ?? '', lastName: me.lastName ?? '', phone: me.phone ?? '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="glass-card p-6 grid sm:grid-cols-2 gap-4 max-w-2xl"
      onSubmit={async (e) => {
        e.preventDefault();
        try { onSaved(await api.patch<Me>('/auth/me', f)); setMsg({ ok: true, text: 'Saved.' }); } catch (err) { setMsg({ ok: false, text: (err as Error).message }); }
      }}
    >
      <Field label="First name"><input id="acc-first" maxLength={80} autoComplete="given-name" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} className="input-dark w-full" /></Field>
      <Field label="Last name"><input id="acc-last" maxLength={80} autoComplete="family-name" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} className="input-dark w-full" /></Field>
      <Field label="Phone"><input id="acc-phone" type="tel" maxLength={24} autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="input-dark w-full" /></Field>
      <Field label="Email"><input id="acc-email" value={me.email} disabled className="input-dark w-full opacity-60" /></Field>
      {msg && <p role="status" className={`sm:col-span-2 text-sm ${msg.ok ? 'text-emerald-300' : 'text-red-300'}`}>{msg.text}</p>}
      <div className="sm:col-span-2"><button type="submit" className="btn-primary">Save details</button></div>
    </form>
  );
}

function PasswordForm() {
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="glass-card p-6 grid gap-4 max-w-md"
      onSubmit={async (e) => {
        e.preventDefault();
        if (f.newPassword !== f.confirm) return setMsg({ ok: false, text: 'The new passwords do not match.' });
        try {
          await api.post('/auth/change-password', { currentPassword: f.currentPassword, newPassword: f.newPassword });
          setF({ currentPassword: '', newPassword: '', confirm: '' });
          setMsg({ ok: true, text: 'Password changed.' });
        } catch (err) { setMsg({ ok: false, text: (err as Error).message }); }
      }}
    >
      <Field label="Current password"><input id="pw-current" type="password" required autoComplete="current-password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} className="input-dark w-full" /></Field>
      <Field label="New password · 8+ characters, a letter and a number"><input id="pw-new" type="password" required minLength={8} autoComplete="new-password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} className="input-dark w-full" /></Field>
      <Field label="Confirm new password"><input id="pw-confirm" type="password" required autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} className="input-dark w-full" /></Field>
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-300' : 'text-red-300'}`}>{msg.text}</p>}
      <div><button type="submit" className="btn-primary">Change password</button></div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 min-w-0">
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
