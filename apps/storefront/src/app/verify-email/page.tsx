'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/admin-api';

type State = { kind: 'checking' } | { kind: 'ok' } | { kind: 'missing' } | { kind: 'failed'; message: string };

function Verify() {
  const token = useSearchParams()?.get('token');
  const [state, setState] = useState<State>(token ? { kind: 'checking' } : { kind: 'missing' });
  const [resend, setResend] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    api.post('/auth/verify-email', { token })
      .then(() => setState({ kind: 'ok' }))
      .catch((e: Error) => setState({ kind: 'failed', message: e.message }));
  }, [token]);

  async function resendLink() {
    try {
      await api.post('/auth/resend-verification', {});
      setResend('We’ve sent a new link. Check your inbox.');
    } catch (e) {
      const status = (e as { status?: number }).status;
      setResend(status === 401 ? 'Sign in first, then ask for a new link from your account page.' : (e as Error).message);
    }
  }

  const title = { checking: 'Confirming…', ok: 'Email confirmed.', missing: 'Missing link.', failed: 'Link not valid.' }[state.kind];

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-white">
      <span className="gold-rule">Email verification</span>
      <h1 className="text-4xl font-bold tracking-tight mt-4 mb-8">{title}</h1>
      <div className="glass-card p-6 grid gap-4" aria-live="polite">
        {state.kind === 'checking' && <p className="text-zinc-300">One moment while we confirm your email address.</p>}
        {state.kind === 'ok' && (
          <>
            <p className="text-zinc-300">Thanks, your email address is confirmed.</p>
            <Link href="/account" className="btn-primary inline-flex w-fit">Go to my account →</Link>
          </>
        )}
        {state.kind === 'missing' && <p className="text-zinc-300">Open the link from your email exactly as it was sent.</p>}
        {state.kind === 'failed' && (
          <>
            <p className="text-zinc-300">{state.message}</p>
            <button type="button" onClick={resendLink} className="btn-ghost w-fit">Send me a new link</button>
            {resend && <p className="text-sm text-zinc-400">{resend}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><Verify /></Suspense>;
}
