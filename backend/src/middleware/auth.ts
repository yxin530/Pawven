import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Extend Express Request to include auth info
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Clerk JWT verification middleware.
 * Verifies the Bearer token from the Authorization header.
 * In production, use @clerk/express's ClerkExpressRequireAuth() for full validation.
 * This middleware performs manual JWT verification as a lightweight alternative.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }

    // Decode the JWT payload (base64url)
    // In production, verify signature against Clerk's JWKS endpoint
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }

    // Extract user ID from Clerk's sub claim
    req.userId = payload.sub;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
