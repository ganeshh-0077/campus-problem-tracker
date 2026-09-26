import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { CommentService } from '../services/commentService';

export class CommentController {
  static async getComments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const issueId = req.params.id as string;
      const comments = await CommentService.getComments(issueId, req.profile!);
      res.json({
        success: true,
        count: comments.length,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const issueId = req.params.id as string;
      const { comment } = req.body;
      const created = await CommentService.addComment(issueId, comment, req.profile!);
      res.status(201).json({
        success: true,
        message: 'Comment posted successfully',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }
}
