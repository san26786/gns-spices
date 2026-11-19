'use client';

import { useState } from 'react';
import { PUBLIC_API_V1 } from '@/lib/api-base';

// One form component for every public enquiry (B2B application, quote,
// private label brief, contact). Submissions go to POST /v1/enquiries and land
// in the admin inbox at /admin/enquiries.

const API = PUBLIC_API_V1;

type Top = 'name' | 'email' | 'phone' | 'company' | 'city' | 'country' | 'message';
type Detail = 'businessType' | 'brandName' | 'productType' | 'quantity' | 'topic' | 'products';

export interface FieldSpec {
  name: Top | Detail;
  label: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  options?: string[];
  placeholder?: string;
  autoComplete?: string;
  wide?: boolean;
}

const DETAIL_KEYS = new Set<string>(['businessType', 'brandName', 'productType', 'quantity', 'topic', 'products']);

export function EnquiryForm({
  type, fields, submitLabel, successTitle,
}: {
  type: 'b2b_application' | 'quote_request' | 'private_label' | 'contact';
  fields: FieldSpec[];
  submitLabel: string;
  successTitle: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'done' | 'error'; message?: string; reference?: string }>({ status: 'idle' });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: 'sending' });
    const top: Record<string, string> = {};
    const details: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) if (v.trim()) (DETAIL_KEYS.has(k) ? details : top)[k] = v.trim();
    const website = (new FormData(e.currentTarget).get('website') as string) || undefined;
    try {
      const res = await fetch(`${API}/enquiries`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type, ...top, details, website }),
      });
      if (res.status === 429) throw new Error('Too many submissions from your connection. Please try again in a few minutes.');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const bad = Object.keys(body?.errors?.fieldErrors ?? {});
        const labels = bad.map((b) => fields.find((f) => f.name === b)?.label ?? b);
        throw new Error(labels.length ? `Please check: ${labels.join(', ')}.` : 'Something went wrong. Please try again or email us.');
      }
      const body = await res.json();
      setState({ status: 'done', reference: body.reference });
    } catch (err) {
      setState({ status: 'error', message: (err as Error).message || 'Could not send. Check your connection and try again.' });
    }
  }

  if (state.status === 'done') {
    return (
      <div className="glass-card p-8 text-center" role="status">
        <span className="gold-rule">Received</span>
        <h2 className="text-3xl font-bold mt-4">{successTitle}</h2>
        <p className="mt-3 text-zinc-300">
          Your reference is <b className="text-amber-300 font-mono">{state.reference}</b>. We&apos;ve emailed you a copy.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-card p-6 md:p-8 grid sm:grid-cols-2 gap-5" noValidate={false}>
      {fields.map((f) => {
        const id = `enq-${f.name}`;
        const common = {
          id, name: f.name, required: f.required, placeholder: f.placeholder, autoComplete: f.autoComplete,
          value: values[f.name] ?? '',
          className: 'input-dark w-full',
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues((s) => ({ ...s, [f.name]: e.target.value })),
        };
        return (
          <label key={f.name} htmlFor={id} className={`grid gap-1.5 min-w-0 ${f.wide || f.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
              {f.label}{f.required ? <span className="text-amber-400"> *</span> : <span className="normal-case tracking-normal font-normal text-zinc-500"> (optional)</span>}
            </span>
            {f.type === 'textarea' ? (
              <textarea rows={5} maxLength={4000} {...common} />
            ) : f.type === 'select' ? (
              <select {...common}>
                <option value="">Choose…</option>
                {f.options?.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input type={f.type ?? 'text'} maxLength={f.name === 'phone' ? 32 : 200} {...common} />
            )}
          </label>
        );
      })}
      {/* Honeypot for bots: hidden from people and screen readers */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      {state.status === 'error' && <p role="alert" className="sm:col-span-2 text-sm text-red-300">{state.message}</p>}
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state.status === 'sending'} className="btn-primary">{state.status === 'sending' ? 'Sending…' : submitLabel}</button>
        <span className="text-xs text-zinc-500">We use your details only to reply to this enquiry.</span>
      </div>
    </form>
  );
}
