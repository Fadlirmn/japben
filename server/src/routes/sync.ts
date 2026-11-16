import { Router } from 'express';
import { db } from '../db.ts';
import { requireAuth, type AuthedRequest } from '../auth.ts';

export const syncRouter = Router();
syncRouter.use(requireAuth);

syncRouter.get('/:key', (req: AuthedRequest, res) => {
  const row = db
    .prepare('SELECT data, updated_at FROM sync_blobs WHERE user_id = ? AND key = ?')
    .get(req.userId, req.params.key) as { data: string; updated_at: number } | undefined;
  if (!row) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json({ data: JSON.parse(row.data), updatedAt: row.updated_at });
});

syncRouter.put('/:key', (req: AuthedRequest, res) => {
  const { data } = req.body ?? {};
  if (data === undefined) {
    res.status(400).json({ error: 'data wajib diisi' });
    return;
  }
  const updatedAt = Date.now();
  db.prepare(
    `INSERT INTO sync_blobs (user_id, key, data, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  ).run(req.userId, req.params.key, JSON.stringify(data), updatedAt);
  res.json({ updatedAt });
});
