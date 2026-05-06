'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/account';
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? 'Registration failed');
      }
      router.push(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-white">
      <span className="gold-rule">Join the family</span>
      <h1 className="text-4xl font-bold tracking-tight mt-4 mb-8">Create an account</h1>
      <div className="glass-card p-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
            <Input label="Last name"  value={form.lastName}  onChange={(v) => setForm({ ...form, lastName: v })} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Input label="Password (min 12 chars)" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
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
      />
    </label>
  );
}
