import { Resend } from "resend";

/** Resend client singleton. Lazily instantiated so build-time import
 *  doesn't require the env var to be present. */
let _resend: Resend | null = null;
function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY env var missing.");
  _resend = new Resend(key);
  return _resend;
}

function getFrom(): string {
  return (
    process.env.MAIL_FROM ??
    "GNS Spices <no-reply@gnsspices.com>"
  );
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://www.gnsspices.com"
  );
}

async function send(to: string, subject: string, html: string, text: string) {
  const from = getFrom();
  const res = await getResend().emails.send({ from, to, subject, html, text });
  if ((res as { error?: unknown }).error) {
    // eslint-disable-next-line no-console
    console.error("[mailer] resend error:", (res as { error: unknown }).error);
    throw new Error("Failed to send email.");
  }
}

// ─── Template: verification email ─────────────────────────────────

export async function sendVerificationEmail(to: string, token: string, firstName?: string | null) {
  const site = getSiteUrl();
  const url = `${site}/verify-email?token=${encodeURIComponent(token)}`;
  const hello = firstName ? `Hi ${firstName},` : "Hi,";
  const subject = "Confirm your GNS Spices account";
  const text = `${hello}

Please confirm your GNS Spices account by opening this link:

${url}

This link is valid for 24 hours. If you didn't create an account, you can safely ignore this email.

— GNS Spices`;
  const html = wrap(`
    <p style="margin:0 0 16px">${hello}</p>
    <p style="margin:0 0 16px">Welcome to <strong>GNS Spices</strong>. Please confirm your email address to activate your account:</p>
    <p style="margin:24px 0"><a href="${url}" style="background:linear-gradient(180deg,#DDB84A,#C59B27);color:#08172C;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:800;display:inline-block">Confirm my account →</a></p>
    <p style="margin:0 0 8px;font-size:13px;color:#4B554F">Or paste this link into your browser:</p>
    <p style="margin:0 0 24px;font-size:12px;color:#6B7570;word-break:break-all">${url}</p>
    <p style="margin:0;font-size:12px;color:#6B7570">This link is valid for 24 hours. If you didn't create an account, you can safely ignore this email.</p>
  `);
  await send(to, subject, html, text);
}

// ─── Template: password reset ─────────────────────────────────────

export async function sendPasswordResetEmail(to: string, token: string, firstName?: string | null) {
  const site = getSiteUrl();
  const url = `${site}/reset-password?token=${encodeURIComponent(token)}`;
  const hello = firstName ? `Hi ${firstName},` : "Hi,";
  const subject = "Reset your GNS Spices password";
  const text = `${hello}

We received a request to reset your GNS Spices password. Open this link within the next hour:

${url}

If you didn't request this, you can safely ignore this email — your password will not change.

— GNS Spices`;
  const html = wrap(`
    <p style="margin:0 0 16px">${hello}</p>
    <p style="margin:0 0 16px">We received a request to reset the password on your <strong>GNS Spices</strong> account:</p>
    <p style="margin:24px 0"><a href="${url}" style="background:linear-gradient(180deg,#DDB84A,#C59B27);color:#08172C;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:800;display:inline-block">Choose a new password →</a></p>
    <p style="margin:0 0 8px;font-size:13px;color:#4B554F">Or paste this link into your browser:</p>
    <p style="margin:0 0 24px;font-size:12px;color:#6B7570;word-break:break-all">${url}</p>
    <p style="margin:0;font-size:12px;color:#6B7570">This link is valid for 1 hour. If you didn't request a reset, ignore this email — your password will not change.</p>
  `);
  await send(to, subject, html, text);
}

// ─── Shared HTML wrapper ─────────────────────────────────────────

function wrap(inner: string): string {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF9F6;font-family:'Helvetica Neue',Arial,sans-serif;color:#1B211F">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAF9F6">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E9E5DA;border-radius:16px;overflow:hidden">
        <tr><td style="padding:20px 24px;background:linear-gradient(160deg,#0A3D26,#0F5132)">
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-weight:900;font-size:18px;letter-spacing:0.5px;color:#EFD37A">GNS SPICES</div>
        </td></tr>
        <tr><td style="padding:24px">${inner}</td></tr>
        <tr><td style="padding:16px 24px;background:#F1EFE7;border-top:1px solid #E9E5DA;font-size:11px;color:#6B7570">
          GNS Spices is a trading name of GNS Kitchens Limited (CRN 14295740) · 71–75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
