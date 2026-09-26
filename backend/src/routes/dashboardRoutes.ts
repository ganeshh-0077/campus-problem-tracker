import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

/**
 * @route   GET /dashboard/statistics
 * @desc    Get counts and metrics aggregated by status, priority, and category
 * @access  Authenticated
 */
router.get('/statistics', DashboardController.getStatistics);

export default router;
