'use client';

import { useState } from 'react';

const API = `${process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'}/v1`;

export function NewsletterForm({ source = 'homepage' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const website = (new FormData(e.currentTarget).get('website') as string) || undefined;
    try {
      const res = await fetch(`${API}/newsletter`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source, website }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return <p role="status" className="mt-10 text-amber-300 font-semibold">You&apos;re on the list. Look out for our next letter.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        autoComplete="email"
        className="input-dark flex-1"
      />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <button type="submit" disabled={state === 'sending'} className="btn-primary">{state === 'sending' ? 'Joining…' : 'Notify Me'}</button>
      {state === 'error' && <p role="alert" className="sm:basis-full text-sm text-red-300">That didn&apos;t work. Check the address and try again.</p>}
    </form>
  );
}
