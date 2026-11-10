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

export const activityLogResponseSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  details: z.string(),
  ticketId: z.string().uuid(),
  actorId: z.string().uuid(),
  actor: userProfileSchema.pick({ id: true, name: true, email: true, role: true }).optional(),
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
  activityLogs: z.array(activityLogResponseSchema).optional(),
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
  assignedToMe: z.number().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentResponse = z.infer<typeof commentResponseSchema>;
export type ActivityLogResponse = z.infer<typeof activityLogResponseSchema>;
export type TicketResponse = z.infer<typeof ticketResponseSchema>;
export type TicketStats = z.infer<typeof ticketStatsSchema>;

// SLA Helpers
export const SLA_HOURS_BY_PRIORITY: Record<TicketPriority, number> = {
  [TicketPriority.URGENT]: 4,
  [TicketPriority.HIGH]: 8,
  [TicketPriority.MEDIUM]: 24,
  [TicketPriority.LOW]: 48,
};

export interface SlaInfo {
  dueAt: string;
  isBreached: boolean;
  remainingHours: number;
  badgeText: string;
}

export function calculateSla(
  createdAt: string | Date,
  priority: TicketPriority,
  status: TicketStatus
): SlaInfo {
  const created = new Date(createdAt);
  const hoursAllowed = SLA_HOURS_BY_PRIORITY[priority] || 24;
  const dueAt = new Date(created.getTime() + hoursAllowed * 60 * 60 * 1000);
  const now = new Date();

  const isResolvedOrClosed = status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED;
  const isBreached = !isResolvedOrClosed && now > dueAt;
  const diffMs = dueAt.getTime() - now.getTime();
  const remainingHours = Math.round(diffMs / (1000 * 60 * 60));

  let badgeText = '';
  if (isResolvedOrClosed) {
    badgeText = 'SLA Met';
  } else if (isBreached) {
    badgeText = `SLA Breached (${Math.abs(remainingHours)}h overdue)`;
  } else if (remainingHours < 1) {
    badgeText = 'Due in < 1h';
  } else {
    badgeText = `Due in ${remainingHours}h`;
  }

  return {
    dueAt: dueAt.toISOString(),
    isBreached,
    remainingHours,
    badgeText,
  };
}
