import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { IssueService } from '../services/issueService';

export class IssueController {
  static async getIssues(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query as any;
      const issues = await IssueService.getIssues(filters, req.profile!);
      res.json({
        success: true,
        count: issues.length,
        data: issues,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getIssueById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const issue = await IssueService.getIssueById(id, req.profile!);
      res.json({
        success: true,
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createIssue(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const issue = await IssueService.createIssue(req.body, req.profile!);
      res.status(201).json({
        success: true,
        message: 'Issue created successfully',
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateIssue(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await IssueService.updateIssue(id, req.body, req.profile!);
      res.json({
        success: true,
        message: 'Issue updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const updated = await IssueService.updateStatus(id, status, req.profile!);
      res.json({
        success: true,
        message: `Issue status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignIssue(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const rawAssignee = req.body.assigned_to !== undefined ? req.body.assigned_to : req.body.staff_id;
      const assigned_to = rawAssignee && rawAssignee.trim() !== '' ? rawAssignee : null;
      const updated = await IssueService.assignIssue(id, assigned_to, req.profile!);
      res.json({
        success: true,
        message: assigned_to ? 'Issue assigned successfully' : 'Issue unassigned',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteIssue(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      await IssueService.deleteIssue(id, req.profile!);
      res.json({
        success: true,
        message: 'Issue deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getIssueHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const history = await IssueService.getIssueHistory(id, req.profile!);
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}
