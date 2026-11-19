import { Logger } from '@nestjs/common';
import { createApp } from './app-factory';
import { config } from './config';

async function bootstrap() {
  const app = await createApp();
  await app.listen(config.apiPort, config.apiHost);
  Logger.log(`GNS API listening on http://${config.apiHost}:${config.apiPort}/v1`, 'Bootstrap');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error', err);
  process.exit(1);
});
