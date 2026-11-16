'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams()?.get('next') ?? '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.post('/auth/login', { email, password });
      await adminApi.get('/admin/me'); // confirms the account is staff
      router.replace(next.startsWith('/admin') ? next : '/admin');
    } catch (err) {
      const status = (err as { status?: number }).status;
      setError(status === 403 ? 'This account does not have admin access.' : status === 401 ? 'Email or password is incorrect.' : (err as Error).message);
      if (status === 403) await adminApi.post('/auth/logout', {}).catch(() => {});
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-card p-8 w-full max-w-sm grid gap-5">
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="GNS Spices" className="h-14 w-auto mx-auto" />
        <p className="mt-4 text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400">Admin</p>
        <h1 className="text-2xl font-bold mt-1">Sign in</h1>
      </div>
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Email</span>
        <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Password</span>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark" />
      </label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
