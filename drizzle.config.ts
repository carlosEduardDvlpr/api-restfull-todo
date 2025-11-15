import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infra/schema.ts',
  out: './src/infra/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './src/infra/database.db',
  },
});
