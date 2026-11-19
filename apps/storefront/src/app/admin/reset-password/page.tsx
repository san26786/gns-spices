'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';

const passwordOk = (pw: string) => pw.length >= 8 && pw.length <= 128 && /[A-Za-z]/.test(pw) && /\d/.test(pw);

function ResetForm() {
  const token = useSearchParams()?.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passwordOk(password)) return setError('Password must be at least 8 characters and include a letter and a number.');
    if (password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await adminApi.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  let body: React.ReactNode;
  if (!token) {
    body = (
      <p role="alert" className="text-sm text-red-300 text-center">
        This link is missing its token. Open the link exactly as it appeared in your email, or request a new one.
      </p>
    );
  } else if (done) {
    body = (
      <>
        <p role="status" className="text-sm text-zinc-300 text-center">Your password has been updated. Sign in with your new password.</p>
        <Link href="/admin/login" className="btn-primary">Sign in</Link>
      </>
    );
  } else {
    body = (
      <>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">New password</span>
          <input id="admin-new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Confirm new password</span>
          <input id="admin-confirm-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-dark" />
        </label>
        <p className="text-xs text-zinc-500">At least 8 characters, including a letter and a number.</p>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save new password'}</button>
      </>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-card p-8 w-full max-w-sm grid gap-5">
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="GNS Spices" className="h-14 w-auto mx-auto" />
        <p className="mt-4 text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400">Admin</p>
        <h1 className="text-2xl font-bold mt-1">Reset password</h1>
      </div>
      {body}
      {!done && (
        <Link href="/admin/forgot-password" className="text-center text-xs text-amber-400 hover:text-amber-300">Request a new reset link</Link>
      )}
    </form>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
