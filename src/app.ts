import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import bookRoutes from '@/routes/books';
import categoryRoutes from '@/routes/categories';
import loanRoutes from '@/routes/loans';
import adminRoutes from '@/routes/admin';

const app: Application = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Digital Library API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;