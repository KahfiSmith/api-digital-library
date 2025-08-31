import { Router } from 'express';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import * as RecommendationsController from '@/controllers/recommendations.controller';
import { 
  personalizedRecommendationsRules, 
  similarBooksRules, 
  trendingBooksRules,
  categoryRecommendationsRules 
} from '@/validators/recommendations';

const router: Router = Router();

// Public endpoints (no authentication required)
router.get('/trending', trendingBooksRules, validateRequest, RecommendationsController.getTrendingBooks);
router.get('/similar/:bookId', similarBooksRules, validateRequest, RecommendationsController.getSimilarBooks);
router.get('/category/:categoryId', categoryRecommendationsRules, validateRequest, RecommendationsController.getRecommendationsByCategory);

// Protected endpoints (authentication required)
router.get('/personalized', authenticateJWT, personalizedRecommendationsRules, validateRequest, RecommendationsController.getPersonalizedRecommendations);

// Admin endpoints
router.get('/analytics', authenticateJWT, requireRoles('ADMIN'), RecommendationsController.getRecommendationAnalytics);

// Health check endpoint
router.get('/health', (_req, res) => res.json({ status: 'OK', service: 'recommendations' }));

export default router;