import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.ts';
import { syncRouter } from './routes/sync.ts';
import { aiProxyRouter } from './routes/aiProxy.ts';
import { rateLimit } from './rateLimit.ts';

const app = express();
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', rateLimit(10, 60_000), authRouter);
app.use('/sync', syncRouter);
app.use('/ai', rateLimit(30, 60_000), aiProxyRouter);

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => console.log(`japben-server listening on :${port}`));
