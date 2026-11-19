import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { config } from './config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

/** Builds the configured Nest app. Used by the local server (main.ts) and the Vercel function (api/index.js). */
export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: config.nodeEnv === 'production' ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug'],
    rawBody: true, // Stripe webhook signatures are checked against the raw body
  });

  app.set('trust proxy', 1); // real client IP behind Vercel / proxies (rate limits)
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: config.corsOrigin, credentials: true });
  app.setGlobalPrefix('v1');
  // Validation is handled per-controller via Zod schemas — no global pipe needed.
  app.useGlobalFilters(new GlobalExceptionFilter());
  return app;
}
