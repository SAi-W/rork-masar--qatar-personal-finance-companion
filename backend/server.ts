import app from './hono';
import { serve } from '@hono/node-server';

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`API listening on :${port}`);
