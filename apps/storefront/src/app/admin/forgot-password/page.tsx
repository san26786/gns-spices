'use client';

import Link from 'next/link';
import { useState } from 'react';
import { adminApi } from '@/lib/admin-api';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.post('/auth/request-password-reset', { email, scope: 'admin' });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={onSubmit} className="glass-card p-8 w-full max-w-sm grid gap-5">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="GNS Spices" className="h-14 w-auto mx-auto" />
          <p className="mt-4 text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400">Admin</p>
          <h1 className="text-2xl font-bold mt-1">Forgot password</h1>
        </div>
        {sent ? (
          <p role="status" className="text-sm text-zinc-300 text-center">
            If that email belongs to an admin account, we&apos;ve sent a link to reset the password. It works for 1 hour and can be used once.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-400">Enter your admin email and we&apos;ll send you a link to choose a new password.</p>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Email</span>
              <input id="admin-reset-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark" />
            </label>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Sending…' : 'Send reset link'}</button>
          </>
        )}
        <Link href="/admin/login" className="text-center text-xs text-amber-400 hover:text-amber-300">Back to sign in</Link>
      </form>
    </div>
  );
}
