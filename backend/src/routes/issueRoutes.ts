import { Router } from 'express';
import { IssueController } from '../controllers/issueController';
import { CommentController } from '../controllers/commentController';
import { authenticateUser, requireRole } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import {
  CreateIssueSchema,
  UpdateIssueSchema,
  UpdateStatusSchema,
  AssignIssueSchema,
  CreateCommentSchema,
  UuidParamSchema,
  IssueQuerySchema,
} from '../utils/validationSchemas';

const router = Router();

// All issue endpoints require authentication
router.use(authenticateUser);

/**
 * @route   GET /issues
 * @desc    Get all accessible issues with optional filtering & search
 * @access  Authenticated (Student: own, Staff: assigned, Admin: all)
 */
router.get('/', validate(IssueQuerySchema, 'query'), IssueController.getIssues);

/**
 * @route   POST /issues
 * @desc    Report a new campus issue
 * @access  Authenticated (Student, Staff, Admin)
 */
router.post('/', validate(CreateIssueSchema, 'body'), IssueController.createIssue);

/**
 * @route   GET /issues/:id
 * @desc    Get single issue details
 * @access  Authenticated (Creator, Assignee, Admin)
 */
router.get('/:id', validate(UuidParamSchema, 'params'), IssueController.getIssueById);

/**
 * @route   PUT /issues/:id
 * @desc    Update issue details
 * @access  Admin, Assignee (Staff), Creator (Student - if Pending)
 */
router.put(
  '/:id',
  validate(UuidParamSchema, 'params'),
  validate(UpdateIssueSchema, 'body'),
  IssueController.updateIssue
);

/**
 * @route   DELETE /issues/:id
 * @desc    Delete an issue
 * @access  Admin, Creator (Student - if Pending)
 */
router.delete('/:id', validate(UuidParamSchema, 'params'), IssueController.deleteIssue);

/**
 * @route   PUT /issues/:id/status
 * @desc    Update status of an issue (Pending -> In Progress -> Resolved -> Closed)
 * @access  Admin, Assigned Staff
 */
router.put(
  '/:id/status',
  validate(UuidParamSchema, 'params'),
  validate(UpdateStatusSchema, 'body'),
  IssueController.updateStatus
);

/**
 * @route   PUT /issues/:id/assign
 * @desc    Assign an issue to a staff member
 * @access  Admin only
 */
router.put(
  '/:id/assign',
  requireRole(['Admin']),
  validate(UuidParamSchema, 'params'),
  validate(AssignIssueSchema, 'body'),
  IssueController.assignIssue
);

/**
 * @route   GET /issues/:id/history
 * @desc    Get status audit history for an issue
 * @access  Authenticated with issue access
 */
router.get(
  '/:id/history',
  validate(UuidParamSchema, 'params'),
  IssueController.getIssueHistory
);

/**
 * @route   GET /issues/:id/comments
 * @desc    Get all comments for an issue
 * @access  Authenticated with issue access
 */
router.get(
  '/:id/comments',
  validate(UuidParamSchema, 'params'),
  CommentController.getComments
);

/**
 * @route   POST /issues/:id/comments
 * @desc    Post a comment to an issue
 * @access  Authenticated with issue access
 */
router.post(
  '/:id/comments',
  validate(UuidParamSchema, 'params'),
  validate(CreateCommentSchema, 'body'),
  CommentController.addComment
);

export default router;
