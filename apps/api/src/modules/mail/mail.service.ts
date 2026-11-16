import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { config } from '../../config';

export const escapeHtml = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Branded wrapper for transactional emails. `bodyHtml` must already be escaped. */
export function emailLayout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#FBF5EA;font-family:Arial,Helvetica,sans-serif;color:#2A0806">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #EEDDC0">
<tr><td style="background:#971010;padding:18px 24px;color:#ffffff;font-weight:bold;letter-spacing:4px;font-size:13px">GNS SPICES</td></tr>
<tr><td style="padding:24px"><h1 style="margin:0 0 16px;font-size:20px;color:#4F0A06">${escapeHtml(title)}</h1>${bodyHtml}</td></tr>
<tr><td style="padding:16px 24px;background:#F6E6CA;font-size:12px;color:#7A5A4E">GNS Kitchens Limited · 71–75 Shelton Street, Covent Garden, London, WC2H 9JQ</td></tr>
</table></td></tr></table></body></html>`;
}

/** Two-column table of label/value rows, values escaped. */
export function detailsTable(rows: Array<[string, unknown]>) {
  const tr = rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#7A5A4E;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px">${tr}</table>`;
}

@Injectable()
export class MailService {
  private readonly log = new Logger('Mail');

  get adminAddress() {
    return config.mail.adminNotify;
  }

  /** Sends via Resend's REST API. Never throws: a failed email must not fail the request. */
  async send(msg: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
    const to = Array.isArray(msg.to) ? msg.to : [msg.to];
    if (!to.length) return;
    if (!config.mail.resendApiKey) {
      this.log.warn(`RESEND_API_KEY not set — not sending "${msg.subject}" to ${to.join(', ')}`);
      return;
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${config.mail.resendApiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: config.mail.from, to, subject: msg.subject, html: msg.html, reply_to: msg.replyTo }),
      });
      if (!res.ok) this.log.error(`Resend ${res.status} for "${msg.subject}": ${(await res.text()).slice(0, 300)}`);
    } catch (e) {
      this.log.error(`Resend request failed for "${msg.subject}": ${(e as Error).message}`);
    }
  }
}

@Global()
@Module({ providers: [MailService], exports: [MailService] })
export class MailModule {}
