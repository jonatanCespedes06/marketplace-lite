import type { NextFunction, Request, Response } from 'express';

// Auth stub: accepts any non-empty Bearer token and derives a stable user id.
// Real implementation would verify a JWT (RS256) and inject UserContext.
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (header === undefined || !header.startsWith('Bearer ') || header.slice(7).trim() === '') {
    res.status(401).json({ error: 'Unauthorized: missing or invalid token' });
    return;
  }
  // Deterministic pseudo-user so carts persist per token in dev/test.
  const token = header.slice(7).trim();
  req.userId = `user-${token.slice(0, 8)}`;
  next();
};

export const requireUserId = (req: AuthenticatedRequest, res: Response): string | null => {
  if (req.userId === undefined || req.userId === '') {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return req.userId;
};
