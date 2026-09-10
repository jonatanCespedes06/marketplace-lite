import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

// Zod-first validation middleware: no handler touches unvalidated input.
export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', issues: parsed.error.issues });
      return;
    }
    req.body = parsed.data;
    next();
  };
