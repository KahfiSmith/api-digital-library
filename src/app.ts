import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import indexRoutes from '@/routes';
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import bookRoutes from '@/routes/books';
import categoryRoutes from '@/routes/categories';
import loanRoutes from '@/routes/loans';
import adminRoutes from '@/routes/admin';
import reviewRoutes from '@/routes/reviews';
import listRoutes from '@/routes/lists';
import searchRoutes from '@/routes/search';
import notificationRoutes from '@/routes/notifications';
import reservationRoutes from '@/routes/reservations';
import uploadRoutes from '@/routes/upload';
import emailRoutes from '@/routes/email';
import cronRoutes from '@/routes/cron';
import recommendationRoutes from '@/routes/recommendations';
import { openapiSpec, swaggerHtml } from '@/docs/openapi';
import { requestId } from '@/middleware/requestId';

const app: Application = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
// Simple CORS: single origin from env + credentials
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression());
app.use(requestId);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Serve static files (uploaded assets)
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use(limiter);

// trust proxy support for secure cookies behind proxies
if (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

if (process.env.NODE_ENV !== 'test') {
  morgan.token('id', (req) => (req as any).requestId || '-');
  const format = ':id :remote-addr :method :url :status :res[content-length] - :response-time ms';
  app.use(morgan(format, { stream: { write: message => logger.info(message.trim()) } }));
}

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Digital Library API is running',
    timestamp: new Date().toISOString()
  });
});

// OpenAPI docs
app.get('/api/v1/openapi.json', (req, res) => {
  res.json(openapiSpec);
});
app.get('/api/v1/docs', (req, res) => {
  res.type('html').send(swaggerHtml());
});

// Swagger UI
app.use('/api/v1/swagger', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Digital Library API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

app.use('/api/v1', indexRoutes);
const authLimiter = rateLimit({ windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), max: 20 });
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/lists', listRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/email', emailRoutes);
app.use('/api/v1/cron', cronRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
