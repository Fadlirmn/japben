import type { Request, Response, NextFunction } from 'express';

// Tiny in-memory fixed-window limiter — no dependency, single-process only.
// ponytail: resets on restart and doesn't share state across instances;
// fine for a single small deployment, swap for a shared store (Redis) if
// this ever runs behind multiple instances.
export function rateLimit(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (entry.count >= max) {
      res.status(429).json({ error: 'too many requests' });
      return;
    }
    entry.count++;
    next();
  };
}
