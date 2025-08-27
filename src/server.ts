import dotenv from 'dotenv';
import { Server } from 'http';

dotenv.config();

import app from '@/app';
import { logger } from '@/utils/logger';
import { prisma } from '@/database/prisma';
import { validateEnv } from '@/utils/env';

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server: Server;

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    }
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

async function startServer(): Promise<Server> {
  try {
    validateEnv();
    await prisma.$connect();
    logger.info('Database connected successfully');

    server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`📚 Digital Library API is ready!`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default app;
