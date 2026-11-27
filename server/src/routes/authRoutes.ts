import { Router } from 'express';
import { login, register, resetPassword } from '../controllers/authController.ts';

export const authRoutes = Router();
authRoutes.post('/login', login);
authRoutes.post('/register', register);
authRoutes.post('/reset-password', resetPassword);
