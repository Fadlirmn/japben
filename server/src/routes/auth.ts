import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.ts';
import { hashPassword, verifyPassword, signToken } from '../auth.ts';

export const authRouter = Router();

function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

authRouter.post('/register', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!isValidEmail(email) || typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'email tidak valid atau password kurang dari 8 karakter' });
    return;
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'email sudah terdaftar' });
    return;
  }
  const id = randomUUID();
  const passwordHash = await hashPassword(password);
  db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
    id, email, passwordHash, Date.now(),
  );
  res.status(201).json({ token: signToken(id) });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!isValidEmail(email) || typeof password !== 'string') {
    res.status(400).json({ error: 'email atau password tidak valid' });
    return;
  }
  const user = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email) as
    | { id: string; password_hash: string }
    | undefined;
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !ok) {
    res.status(401).json({ error: 'email atau password salah' });
    return;
  }
  res.json({ token: signToken(user.id) });
});
