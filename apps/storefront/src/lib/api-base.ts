// Where code running in the BROWSER sends API requests.
//
// Production: NEXT_PUBLIC_API_BASE="same-origin" — the browser calls /v1/... on
// the site itself and next.config.mjs forwards it to the API (API_ORIGIN). The
// API's login cookies are then first-party cookies on the shop's own domain.
// Local dev: http://localhost:4000 (the API's own port).
const raw = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
export const PUBLIC_API_BASE = raw === 'same-origin' ? '' : raw.replace(/\/+$/, '');
export const PUBLIC_API_V1 = `${PUBLIC_API_BASE}/v1`;
