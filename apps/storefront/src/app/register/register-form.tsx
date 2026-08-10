'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Mx', 'Dr', 'Prof', 'Other'] as const;

export function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/account';
  const [form, setForm] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    address: '',
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, formOpenedAt: openedAtRef.current }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || body.ok === false) {
        throw new Error(body.error ?? 'Registration failed');
      }
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
          Please click it to confirm your account before signing in from another device.
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

      <div className="grid grid-cols-[100px_1fr_1fr] gap-3">
        <Select label="Title" value={form.title} onChange={(v) => set('title', v)} options={TITLES as unknown as string[]} />
        <Input label="First name" value={form.firstName} onChange={(v) => set('firstName', v)} required autoComplete="given-name" />
        <Input label="Last name" value={form.lastName} onChange={(v) => set('lastName', v)} required autoComplete="family-name" />
      </div>
      <Input label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} required autoComplete="email" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone" type="tel" value={form.phone} onChange={(v) => set('phone', v)} required autoComplete="tel" />
        <Input label="Location · city / town" value={form.location} onChange={(v) => set('location', v)} required autoComplete="address-level2" />
      </div>
      <Textarea label="Address · street, area, postcode" value={form.address} onChange={(v) => set('address', v)} required autoComplete="street-address" rows={3} />
      <Input label="Password · 8+ chars, letter + digit" type="password" value={form.password} onChange={(v) => set('password', v)} required autoComplete="new-password" />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-xs text-zinc-500 text-center leading-relaxed">
        We&apos;ll send a verification link to your email. Please click it to activate the account.
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

function Textarea({
  label, value, onChange, required, autoComplete, rows,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; autoComplete?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">{label}</span>
      <textarea
        className="input-dark mt-1.5 block w-full resize-none"
        rows={rows ?? 3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">{label}</span>
      <select
        className="input-dark mt-1.5 block w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
