import express from 'express';
import { authRoutes } from './routes/authRoutes.ts';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
