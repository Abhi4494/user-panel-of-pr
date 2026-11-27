import type { Request, Response } from 'express';
import { authenticate, NotImplementedError, registerUser, requestPasswordReset } from '../services/authService.ts';

const REQUIRED_REGISTRATION_FIELDS = ['fullName', 'phone', 'company', 'email', 'password', 'captcha'];

export function resetPassword(req: Request, res: Response) {
  const { email } = (req.body ?? {}) as { email?: unknown };
  if (typeof email !== 'string' || !email) {
    res.status(400).json({ message: 'Email is required.' });
    return;
  }
  try {
    requestPasswordReset(email);
  } catch (error) {
    if (error instanceof NotImplementedError) {
      res.status(501).json({ message: error.message });
      return;
    }
    throw error;
  }
}

export function register(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const missing = REQUIRED_REGISTRATION_FIELDS.filter((key) => typeof body[key] !== 'string' || !body[key]);
  if (missing.length > 0) {
    res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}.` });
    return;
  }
  if (!Array.isArray(body.ProductIds) || body.ProductIds.length === 0) {
    res.status(400).json({ message: 'Missing required fields: ProductIds.' });
    return;
  }
  try {
    registerUser();
  } catch (error) {
    if (error instanceof NotImplementedError) {
      res.status(501).json({ message: error.message });
      return;
    }
    throw error;
  }
}

export function login(req: Request, res: Response) {
  const { email, password } = (req.body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }
  try {
    authenticate(email, password);
  } catch (error) {
    if (error instanceof NotImplementedError) {
      res.status(501).json({ message: error.message });
      return;
    }
    throw error;
  }
}
