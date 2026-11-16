'use client';

import { api } from '@/lib/admin-api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setPending(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">✅</div>
        <p className="text-white font-bold">Password updated.</p>
        <p className="text-zinc-400 text-sm">Sign in with your new password…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">New password</span>
        <input
          className="input-dark mt-1.5 block w-full"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Confirm new password</span>
        <input
          className="input-dark mt-1.5 block w-full"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
        />
      </label>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Saving…' : 'Save new password'}
      </button>
    </form>
  );
}
