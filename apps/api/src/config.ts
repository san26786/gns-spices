import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Look up the .env from apps/api, then fall back to repo root.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(4000),
  API_HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_TTL_SEC: z.coerce.number().default(900),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_TTL_SEC: z.coerce.number().default(60 * 60 * 24 * 30),
  // Leave empty for host-only cookies (recommended when the site proxies /v1 to the API).
  COOKIE_DOMAIN: z.string().optional(),
  // Email (Resend). Without RESEND_API_KEY emails are logged instead of sent.
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default('GNS Spices <no-reply@gnsspices.com>'),
  ADMIN_NOTIFY_EMAIL: z.string().optional(),
  SITE_URL: z.string().default('http://localhost:3100'),
  // Payments (Stripe Checkout). Without STRIPE_SECRET_KEY checkout is switched off.
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SHIPPING_FLAT_GBP: z.coerce.number().min(0).default(4.95),
  FREE_SHIPPING_OVER_GBP: z.coerce.number().min(0).default(40),
  COOKIE_SECURE: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true')
    .default('false'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  apiPort: env.API_PORT,
  apiHost: env.API_HOST,
  corsOrigin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
  databaseUrl: env.DATABASE_URL,
  redisUrl: env.REDIS_URL,
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    accessTtlSec: env.JWT_ACCESS_TTL_SEC,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshTtlSec: env.JWT_REFRESH_TTL_SEC,
  },
  cookie: {
    domain: env.COOKIE_DOMAIN || undefined,
    secure: env.COOKIE_SECURE,
  },
  mail: {
    resendApiKey: env.RESEND_API_KEY || undefined,
    from: env.MAIL_FROM,
    adminNotify: env.ADMIN_NOTIFY_EMAIL || undefined,
  },
  siteUrl: env.SITE_URL.replace(/\/+$/, ''),
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY || undefined,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || undefined,
  },
  shipping: {
    flat: env.SHIPPING_FLAT_GBP,
    freeOver: env.FREE_SHIPPING_OVER_GBP,
  },
} as const;
