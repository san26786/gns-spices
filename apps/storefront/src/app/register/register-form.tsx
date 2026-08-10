'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || body.ok === false) {
        throw new Error(body.error ?? 'Registration failed');
      }
      setDone(true);
      // Give the toast a moment before redirecting
      setTimeout(() => {
        router.push(next);
        router.refresh();
      }, 1200);
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
          Please click it to confirm your address. You&apos;re already signed in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
        <Input label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
      </div>
      <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
      <Input label="Phone (optional)" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      <Input
        label="Password (8+ chars, letter + digit)"
        type="password"
        value={form.password}
        onChange={(v) => setForm({ ...form, password: v })}
        required
      />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Creating…' : 'Create account'}
      </button>
      <p className="text-xs text-zinc-500 text-center">
        By creating an account you agree to receive a verification email.
      </p>
    </form>
  );
}

function Input({
  label, value, onChange, type, required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">{label}</span>
      <input
        className="input-dark mt-1.5 block w-full"
        type={type ?? 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={type === 'password' ? 'new-password' : type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'off'}
      />
    </label>
  );
}
