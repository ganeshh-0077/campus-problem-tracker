import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  static async getStatistics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await DashboardService.getStatistics(req.profile!);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
