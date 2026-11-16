'use client';

// Browser-side client for the /v1/admin API. Uses the API's httpOnly session
// cookies (gns_at / gns_rt); on a 401 it refreshes the session once and retries.

const BASE = `${process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'}/v1`;

export class AdminApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

let refreshing: Promise<boolean> | null = null;
function refreshSession() {
  refreshing ??= fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

const FRIENDLY: Record<string, string> = {
  slug_taken: 'Another product already uses this web address (slug).',
  category_exists: 'A category with this name already exists.',
  category_has_products: 'Move or delete the products in this category first.',
  coupon_exists: 'A coupon with this code already exists.',
  barcode_must_be_valid_ean13: 'The barcode must be a valid 13-digit EAN-13 (GTIN) number.',
  barcode_in_use: 'Another pack already uses this barcode.',
  invalid_credentials: 'Email or password is incorrect.',
  staff_only: 'This account does not have admin access.',
  validation_failed: 'Some fields are missing or invalid.',
};

export async function adminFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include', cache: 'no-store' });

  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    if (await refreshSession()) return adminFetch<T>(path, init, false);
  }
  if (!res.ok) {
    let code = `http_${res.status}`;
    let detail = '';
    let fields: string[] = [];
    try {
      const body = await res.json();
      code = body.code ?? code;
      detail = body.detail ?? '';
      fields = Object.keys(body.errors?.fieldErrors ?? {});
    } catch { /* not json */ }
    const key = String(detail || code).toLowerCase();
    const message =
      code === 'validation_error'
        ? `Please check: ${fields.join(', ') || 'the form fields'}.`
        : FRIENDLY[key] ?? (detail || `Request failed (${res.status})`);
    throw new AdminApiError(res.status, key, message);
  }
  if (res.status === 204) return undefined as T;
  const type = res.headers.get('content-type') ?? '';
  return (type.includes('json') ? res.json() : res.text()) as Promise<T>;
}

export const adminApi = {
  get: <T>(p: string) => adminFetch<T>(p),
  post: <T>(p: string, body: unknown) => adminFetch<T>(p, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(p: string, body: unknown) => adminFetch<T>(p, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(p: string) => adminFetch<T>(p, { method: 'DELETE' }),
  base: BASE,
};

export const gbp = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);

export const fmtDate = (d: string | Date | null | undefined, withTime = false) =>
  d
    ? new Date(d).toLocaleString('en-GB', withTime ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

export const fmtWeight = (g: number) => (g >= 1000 ? `${g / 1000}kg` : `${g}g`);

export const humanize = (s: string) => s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
