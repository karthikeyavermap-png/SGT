import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import {
  createTicketSchema,
  updateTicketSchema,
  createCommentSchema,
  UserRole,
  TicketStatus,
  TicketPriority,
} from '@repo/shared';
import { authenticate, getCurrentUser } from '../middleware/auth';

export async function ticketRoutes(server: FastifyInstance) {
  // All ticket routes require authentication
  server.addHook('preHandler', authenticate);

  // GET /api/tickets - List tickets with filtering & role access control
  server.get('/', async (request, reply) => {
    const user = getCurrentUser(request);
    const query = request.query as {
      status?: string;
      priority?: string;
      search?: string;
      assignedToMe?: string;
    };

    const whereClause: any = {};

    // Role-based visibility:
    // CUSTOMER sees only their own tickets
    if (user.role === UserRole.CUSTOMER) {
      whereClause.customerId = user.userId;
    } else if (query.assignedToMe === 'true') {
      whereClause.assignedAgentId = user.userId;
    }

    if (query.status && query.status !== 'ALL') {
      whereClause.status = query.status;
    }

    if (query.priority && query.priority !== 'ALL') {
      whereClause.priority = query.priority;
    }

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedAgent: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return reply.send({
      success: true,
      data: tickets,
    });
  });

  // GET /api/tickets/:id - Get ticket details
  server.get('/:id', async (request, reply) => {
    const user = getCurrentUser(request);
    const { id } = request.params as { id: string };

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedAgent: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        comments: {
          where: user.role === UserRole.CUSTOMER ? { isInternal: false } : undefined,
          include: {
            author: {
              select: { id: true, name: true, email: true, role: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return reply.status(404).send({
        success: false,
        error: { message: 'Ticket not found' },
      });
    }

    // Role check: Customer can only view their own ticket
    if (user.role === UserRole.CUSTOMER && ticket.customerId !== user.userId) {
      return reply.status(403).send({
        success: false,
        error: { message: 'Access denied to this ticket' },
      });
    }

    return reply.send({
      success: true,
      data: ticket,
    });
  });

  // POST /api/tickets - Create ticket
  server.post('/', async (request, reply) => {
    const user = getCurrentUser(request);
    const parseResult = createTicketSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Invalid ticket data',
          details: parseResult.error.format(),
        },
      });
    }

    const { title, description, priority, category } = parseResult.data;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || TicketPriority.MEDIUM,
        category: category || 'General',
        status: TicketStatus.OPEN,
        customerId: user.userId,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedAgent: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return reply.status(201).send({
      success: true,
      data: ticket,
    });
  });

  // PATCH /api/tickets/:id - Update status, priority, or assign agent
  server.patch('/:id', async (request, reply) => {
    const user = getCurrentUser(request);
    const { id } = request.params as { id: string };

    const parseResult = updateTicketSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Invalid update payload',
          details: parseResult.error.format(),
        },
      });
    }

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return reply.status(404).send({
        success: false,
        error: { message: 'Ticket not found' },
      });
    }

    // Customers can only update title / description of their own OPEN tickets
    if (user.role === UserRole.CUSTOMER) {
      if (existingTicket.customerId !== user.userId) {
        return reply.status(403).send({
          success: false,
          error: { message: 'Access denied' },
        });
      }

      // Customer cannot change status or agent assignment
      if (parseResult.data.status || parseResult.data.assignedAgentId !== undefined) {
        return reply.status(403).send({
          success: false,
          error: { message: 'Customers cannot change ticket status or assign agents' },
        });
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: parseResult.data,
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedAgent: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return reply.send({
      success: true,
      data: updatedTicket,
    });
  });

  // POST /api/tickets/:id/comments - Add comment or internal note
  server.post('/:id/comments', async (request, reply) => {
    const user = getCurrentUser(request);
    const { id } = request.params as { id: string };

    const parseResult = createCommentSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Invalid comment payload',
          details: parseResult.error.format(),
        },
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return reply.status(404).send({
        success: false,
        error: { message: 'Ticket not found' },
      });
    }

    if (user.role === UserRole.CUSTOMER) {
      if (ticket.customerId !== user.userId) {
        return reply.status(403).send({
          success: false,
          error: { message: 'Access denied' },
        });
      }
      // Customers cannot post internal notes
      if (parseResult.data.isInternal) {
        return reply.status(403).send({
          success: false,
          error: { message: 'Customers cannot post internal notes' },
        });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: parseResult.data.content,
        isInternal: Boolean(parseResult.data.isInternal),
        ticketId: id,
        authorId: user.userId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
      },
    });

    // Touch ticket updatedAt
    await prisma.ticket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return reply.status(201).send({
      success: true,
      data: comment,
    });
  });
}
