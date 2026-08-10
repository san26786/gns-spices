'use client';

import { useState } from 'react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || body.ok === false) {
        throw new Error(body.error ?? 'Failed to send reset link');
      }
      setMessage(body.message ?? "If that email is registered, we've sent a reset link.");
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send reset link');
    } finally {
      setPending(false);
    }
  }

  if (message) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">✉️</div>
        <p className="text-zinc-300">{message}</p>
        <p className="text-xs text-zinc-500">Check your spam folder if you don&apos;t see it within a couple of minutes.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-zinc-400">
        Enter the email you signed up with — we&apos;ll send you a link to choose a new password.
      </p>
      <label className="block">
        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Email</span>
        <input
          className="input-dark mt-1.5 block w-full"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
}
