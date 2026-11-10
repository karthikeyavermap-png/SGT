import { z } from 'zod';
import { TicketPriority, TicketStatus } from './constants';
import { userProfileSchema } from './auth.schemas';

export const createTicketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
  category: z.string().min(2, 'Category is required').default('General'),
});

export const updateTicketSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  category: z.string().min(2).optional(),
  assignedAgentId: z.string().uuid().nullable().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  isInternal: z.boolean().default(false),
});

export const commentResponseSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  isInternal: z.boolean(),
  ticketId: z.string().uuid(),
  authorId: z.string().uuid(),
  author: userProfileSchema.pick({ id: true, name: true, email: true, role: true, avatarUrl: true }),
  createdAt: z.union([z.string(), z.date()]),
});

export const ticketResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: z.nativeEnum(TicketStatus),
  priority: z.nativeEnum(TicketPriority),
  category: z.string(),
  customerId: z.string().uuid(),
  customer: userProfileSchema.pick({ id: true, name: true, email: true, avatarUrl: true }),
  assignedAgentId: z.string().uuid().nullable().optional(),
  assignedAgent: userProfileSchema.pick({ id: true, name: true, email: true, avatarUrl: true }).nullable().optional(),
  comments: z.array(commentResponseSchema).optional(),
  _count: z.object({ comments: z.number() }).optional(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const ticketStatsSchema = z.object({
  total: z.number(),
  open: z.number(),
  inProgress: z.number(),
  resolved: z.number(),
  closed: z.number(),
  urgent: z.number(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentResponse = z.infer<typeof commentResponseSchema>;
export type TicketResponse = z.infer<typeof ticketResponseSchema>;
export type TicketStats = z.infer<typeof ticketStatsSchema>;
