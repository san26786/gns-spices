'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApi, fmtDate, humanize } from '@/lib/admin-api';
import { Badge, Field, Loading, Notice, PageHeader, btnGhostSm, btnPrimarySm, inputCls, useAdminData } from '../_ui';

const TYPES = [
  ['', 'All'], ['b2b_application', 'B2B applications'], ['quote_request', 'Quote requests'], ['private_label', 'Private label'], ['contact', 'Contact'],
] as const;
const STATUSES = ['new', 'in_review', 'contacted', 'approved', 'rejected', 'closed'];

interface Enquiry {
  id: string; reference: string; type: string; status: string; name: string; email: string; phone: string | null;
  company: string | null; country: string | null; city: string | null; message: string | null;
  details: Record<string, string>; adminNotes: string | null; createdAt: string; updatedAt: string;
}
interface ListRes { data: Enquiry[]; counts: Array<{ type: string; status: string; count: number }> }

const DETAIL_LABELS: Record<string, string> = {
  businessType: 'Business type', brandName: 'Brand name', productType: 'Product type', quantity: 'Estimated quantity', topic: 'Topic', products: 'Products',
};

function Inbox() {
  const sp = useSearchParams();
  const router = useRouter();
  const type = sp?.get('type') ?? '';
  const status = sp?.get('status') ?? '';
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(sp?.get('open') ?? null);
  const params = new URLSearchParams({ ...(type ? { type } : {}), ...(status ? { status } : {}), ...(q ? { q } : {}) }).toString();
  const { data, error, loading, reload } = useAdminData(() => adminApi.get<ListRes>(`/admin/enquiries?${params}`), [params]);

  const setFilter = (k: 'type' | 'status', v: string) => {
    const next = new URLSearchParams(sp?.toString());
    if (v) next.set(k, v); else next.delete(k);
    next.delete('open');
    router.replace(`/admin/enquiries?${next}`);
  };
  const countFor = (t: string) => (data?.counts ?? []).filter((c) => (!t || c.type === t) && c.status === 'new').reduce((n, c) => n + c.count, 0);
  const open = data?.data.find((e) => e.id === openId) ?? null;

  return (
    <>
      <PageHeader title="Enquiries" sub="B2B applications, quote requests, private label briefs and contact messages from the website." />
      <div className="flex flex-wrap gap-2 mb-4" role="tablist">
        {TYPES.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={type === k} onClick={() => setFilter('type', k)}
            className={`${type === k ? 'bg-amber-500 text-amber-950' : 'bg-white/5 text-zinc-300 hover:bg-white/10'} rounded-full px-4 py-1.5 text-sm font-semibold`}>
            {label}{countFor(k) > 0 && <span className="ml-1.5 opacity-80">({countFor(k)} new)</span>}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mb-5">
        <select id="enq-status" value={status} onChange={(e) => setFilter('status', e.target.value)} className={`${inputCls} max-w-[180px]`} aria-label="Status">
          <option value="">Any status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
        </select>
        <input id="enq-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, company or reference…" className={`${inputCls} max-w-sm`} aria-label="Search enquiries" />
      </div>
      {error && <Notice>{error}</Notice>}
      {loading && !data && <Loading />}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 items-start">
        <ul className="glass-card !p-0 divide-y divide-white/5 overflow-hidden">
          {data?.data.length === 0 && <li className="px-4 py-10 text-center text-sm text-zinc-500">Nothing here yet.</li>}
          {data?.data.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => setOpenId(e.id)} className={`w-full text-left px-4 py-3 hover:bg-white/5 ${openId === e.id ? 'bg-amber-500/10' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold truncate">{e.company ?? e.name}</span>
                  <Badge status={e.status} />
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 truncate">{humanize(e.type)} · {e.reference} · {fmtDate(e.createdAt, true)}</div>
              </button>
            </li>
          ))}
        </ul>
        {open ? <Detail key={open.id} e={open} onSaved={reload} /> : <p className="text-sm text-zinc-500 lg:pt-4">Select an enquiry to read it.</p>}
      </div>
    </>
  );
}

function Detail({ e, onSaved }: { e: Enquiry; onSaved: () => Promise<void> }) {
  const [notes, setNotes] = useState(e.adminNotes ?? '');
  const [notify, setNotify] = useState(true);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => setNotes(e.adminNotes ?? ''), [e.adminNotes]);

  async function save(body: Record<string, unknown>, okText: string) {
    setBusy(true);
    setMsg(null);
    try {
      await adminApi.patch(`/admin/enquiries/${e.id}`, body);
      await onSaved();
      setMsg({ kind: 'ok', text: okText });
    } catch (err) {
      setMsg({ kind: 'error', text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const rows: Array<[string, string | null | undefined]> = [
    ['Email', e.email], ['Phone', e.phone], ['Company', e.company], ['City', e.city], ['Country', e.country],
    ...Object.entries(e.details ?? {}).map(([k, v]) => [DETAIL_LABELS[k] ?? k, v] as [string, string]),
  ];

  return (
    <article className="glass-card p-6 grid gap-5 lg:sticky lg:top-6">
      <header>
        <div className="flex flex-wrap items-center gap-2"><Badge status={e.status} /><span className="text-xs text-zinc-500">{humanize(e.type)} · {e.reference}</span></div>
        <h2 className="text-2xl font-bold mt-2">{e.name}</h2>
        <p className="text-xs text-zinc-500">Received {fmtDate(e.createdAt, true)}</p>
      </header>
      <dl className="grid grid-cols-[130px_minmax(0,1fr)] gap-y-1.5 text-sm">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="contents"><dt className="text-zinc-500">{k}</dt><dd className="break-words">{k === 'Email' ? <a className="text-amber-300 hover:underline" href={`mailto:${v}?subject=${encodeURIComponent(`Your GNS Spices enquiry ${e.reference}`)}`}>{v}</a> : v}</dd></div>
        ))}
      </dl>
      {e.message && <blockquote className="border-l-2 border-amber-500/60 pl-4 text-sm text-zinc-200 whitespace-pre-line">{e.message}</blockquote>}

      <div className="grid gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Set status</span>
        <div className="flex flex-wrap gap-2">
          {STATUSES.filter((s) => s !== 'new').map((s) => (
            <button key={s} type="button" disabled={busy || s === e.status} onClick={() => save({ status: s, notifyCustomer: notify }, `Marked as ${humanize(s)}${notify ? ' and emailed the customer' : ''}.`)}
              className={s === 'approved' ? btnPrimarySm : btnGhostSm}>
              {humanize(s)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300"><input id="enq-notify" type="checkbox" checked={notify} onChange={(ev) => setNotify(ev.target.checked)} /> Email the customer about the change</label>
      </div>

      <Field label="Internal notes" hint="Only staff can see these.">
        <textarea id="enq-notes" rows={4} value={notes} onChange={(ev) => setNotes(ev.target.value)} className={inputCls} />
      </Field>
      <div><button type="button" disabled={busy || notes === (e.adminNotes ?? '')} onClick={() => save({ adminNotes: notes || null }, 'Notes saved.')} className={btnGhostSm}>Save notes</button></div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    </article>
  );
}

export default function EnquiriesPage() {
  return <Suspense fallback={<Loading />}><Inbox /></Suspense>;
}
