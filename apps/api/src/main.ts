import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { config } from './config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: config.corsOrigin,
    credentials: true,
  });
  app.setGlobalPrefix('v1');
  // Validation is handled per-controller via Zod schemas — no global pipe needed.
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(config.apiPort, config.apiHost);
  Logger.log(`GNS API listening on http://${config.apiHost}:${config.apiPort}/v1`, 'Bootstrap');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error', err);
  process.exit(1);
});
