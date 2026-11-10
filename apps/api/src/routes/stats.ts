import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { UserRole, TicketStatus, TicketPriority } from '@repo/shared';
import { authenticate, getCurrentUser } from '../middleware/auth';

export async function statsRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate);

  server.get('/', async (request, reply) => {
    const user = getCurrentUser(request);

    const baseWhere: any = {};
    if (user.role === UserRole.CUSTOMER) {
      baseWhere.customerId = user.userId;
    }

    const [total, open, inProgress, resolved, closed, urgent] = await Promise.all([
      prisma.ticket.count({ where: baseWhere }),
      prisma.ticket.count({ where: { ...baseWhere, status: TicketStatus.OPEN } }),
      prisma.ticket.count({ where: { ...baseWhere, status: TicketStatus.IN_PROGRESS } }),
      prisma.ticket.count({ where: { ...baseWhere, status: TicketStatus.RESOLVED } }),
      prisma.ticket.count({ where: { ...baseWhere, status: TicketStatus.CLOSED } }),
      prisma.ticket.count({ where: { ...baseWhere, priority: TicketPriority.URGENT } }),
    ]);

    let assignedCount = 0;
    if (user.role === UserRole.AGENT || user.role === UserRole.ADMIN) {
      assignedCount = await prisma.ticket.count({
        where: { assignedAgentId: user.userId },
      });
    }

    return reply.send({
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved,
        closed,
        urgent,
        assignedToMe: assignedCount,
      },
    });
  });
}
