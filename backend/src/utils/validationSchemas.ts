import { z } from 'zod';

export const CategoryEnum = z.enum([
  'Computer',
  'Internet',
  'Electricity',
  'Classroom',
  'Cleaning',
  'Furniture',
  'Other',
]);

export const PriorityEnum = z.enum(['Low', 'Medium', 'High', 'Critical']);

export const StatusEnum = z.enum(['Pending', 'In Progress', 'Resolved', 'Closed']);

export const RoleEnum = z.enum(['Student', 'Staff', 'Admin']);

export const UuidParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid ID format: must be a valid UUID' }),
});

export const CreateIssueSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' })
    .max(150, { message: 'Title cannot exceed 150 characters' }),
  description: z
    .string()
    .min(3, { message: 'Description must be at least 3 characters long' })
    .max(3000, { message: 'Description cannot exceed 3000 characters' }),
  category: CategoryEnum,
  priority: PriorityEnum.default('Medium'),
  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters long' })
    .max(150, { message: 'Location cannot exceed 150 characters' }),
});

export const UpdateIssueSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' })
    .max(150, { message: 'Title cannot exceed 150 characters' })
    .optional(),
  description: z
    .string()
    .min(3, { message: 'Description must be at least 3 characters long' })
    .max(3000, { message: 'Description cannot exceed 3000 characters' })
    .optional(),
  category: CategoryEnum.optional(),
  priority: PriorityEnum.optional(),
  status: StatusEnum.optional(),
  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters long' })
    .max(150, { message: 'Location cannot exceed 150 characters' })
    .optional(),
});

export const UpdateStatusSchema = z.object({
  status: StatusEnum,
});

export const AssignIssueSchema = z.object({
  assigned_to: z.string().nullable().optional(),
  staff_id: z.string().nullable().optional(),
});

export const CreateCommentSchema = z.object({
  comment: z
    .string()
    .min(1, { message: 'Comment cannot be empty' })
    .max(1000, { message: 'Comment cannot exceed 1000 characters' }),
});

export const IssueQuerySchema = z.object({
  status: StatusEnum.optional(),
  priority: PriorityEnum.optional(),
  category: CategoryEnum.optional(),
  search: z.string().optional(),
  scope: z.enum(['assigned', 'all']).optional(),
});
