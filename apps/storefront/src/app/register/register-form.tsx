'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/admin-api';

export function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/account';
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    website: '', // honeypot
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const openedAtRef = useRef<number>(Date.now());
  useEffect(() => { openedAtRef.current = Date.now(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api.post('/auth/register', { ...form, formOpenedAt: openedAtRef.current });
      setDone(true);
      setTimeout(() => {
        router.push(next);
        router.refresh();
      }, 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">✉️</div>
        <p className="text-lg font-bold text-white">Account created.</p>
        <p className="text-sm text-zinc-400">
          We&apos;ve sent a verification link to <b className="text-white">{form.email}</b>.
          Taking you to your account…
        </p>
      </div>
    );
  }

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={submit} className="space-y-4" autoComplete="on">
      {/* Honeypot · hidden from real users, filled by bots. Positioned
          off-screen with aria-hidden + tabIndex=-1. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" value={form.firstName} onChange={(v) => set('firstName', v)} required autoComplete="given-name" />
        <Input label="Last name" value={form.lastName} onChange={(v) => set('lastName', v)} required autoComplete="family-name" />
      </div>
      <Input label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} required autoComplete="email" />
      <Input label="Phone (optional)" type="tel" value={form.phone} onChange={(v) => set('phone', v)} autoComplete="tel" />
      <Input label="Password · 8+ chars, letter + digit" type="password" value={form.password} onChange={(v) => set('password', v)} required autoComplete="new-password" />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-xs text-zinc-500 text-center leading-relaxed">
        We&apos;ll email you a link to confirm your address. You can shop straight away.
      </p>
    </form>
  );
}

function Input({
  label, value, onChange, type, required, autoComplete,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">{label}</span>
      <input
        className="input-dark mt-1.5 block w-full"
        type={type ?? 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
      />
    </label>
  );
}
