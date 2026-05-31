import dotenv from 'dotenv';
import { createApp } from './app';
import { initializeDatabase } from './services/database';
import { startRuntimeLogGenerator } from './services/logGenerator';

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

async function main(): Promise<void> {
  await initializeDatabase();

  const app = createApp();
  app.listen(port, '0.0.0.0', () => {
    console.log(`INFO ${process.env.APP_NAME ?? 'SOBP Validation App'} listening on port ${port}`);
    console.log(`INFO Environment ${process.env.ENVIRONMENT ?? 'unknown'}`);
  });

  startRuntimeLogGenerator();
}

main().catch((error) => {
  console.error('ERROR Application failed to start', error);
  process.exit(1);
});
