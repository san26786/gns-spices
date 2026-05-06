// Lightweight typed fetch wrapper. Forwards cookies for SSR, throws on non-2xx.

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { cookie?: string; nextTags?: string[]; revalidate?: number } = {},
): Promise<T> {
  const url = `${BASE}/v1${path}`;
  const headers = new Headers(init.headers ?? {});
  headers.set('accept', 'application/json');
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  if (init.cookie) headers.set('cookie', init.cookie);

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
    next: init.nextTags || init.revalidate !== undefined
      ? { tags: init.nextTags, revalidate: init.revalidate }
      : undefined,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body, url);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(public status: number, public body: string, public url: string) {
    super(`API ${status} ${url}: ${body.slice(0, 200)}`);
  }
}

export const money = (amount: string | number, currency: string, locale = 'en-GB') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    typeof amount === 'string' ? Number(amount) : amount,
  );
