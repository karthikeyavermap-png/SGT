import fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { ticketRoutes } from './routes/tickets';
import { statsRoutes } from './routes/stats';
import { yardMaintenanceRoutes } from './routes/modules/yard-maintenance';
import { transportFleetRoutes } from './routes/modules/transport-fleet';
import { officeAccountsRoutes } from './routes/modules/office-accounts';
import { prisma } from './db';
import { UserRole } from '@repo/shared';
import { authenticate, requireRole } from './middleware/auth';

dotenv.config();

const server = fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function main() {
  // Register CORS
  await server.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return cb(null, true);

      // In development allow localhost, 127.0.0.1, Expo dev tunnels
      const allowed = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8081',
        'http://127.0.0.1:8081',
      ];
      if (allowed.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
        return cb(null, true);
      }
      return cb(null, true); // Dev-friendly permissive
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Register Cookie plugin
  await server.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'ticketing-cookie-secret-key-32chars!!',
    parseOptions: {},
  });

  // Register JWT plugin
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'ticketing-jwt-super-secret-key-for-local-dev-1234567890',
  });

  // Root and Health routes
  server.get('/', async () => ({
    name: 'Ticketing Management System API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
  }));

  server.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
  }));

  server.get('/api/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
  }));

  // GET /api/agents - List agents & admins for assignment dropdown
  server.get('/api/agents', { preHandler: [authenticate] }, async (request, reply) => {
    const agents = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.AGENT, UserRole.ADMIN] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });

    return reply.send({
      success: true,
      data: agents,
    });
  });

  // Register API Routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(ticketRoutes, { prefix: '/api/tickets' });
  await server.register(statsRoutes, { prefix: '/api/stats' });

  // Register Core SGT Operational Modules (Role & Module RBAC protected)
  await server.register(yardMaintenanceRoutes, { prefix: '/api/modules/yard-maintenance' });
  await server.register(transportFleetRoutes, { prefix: '/api/modules/transport-fleet' });
  await server.register(officeAccountsRoutes, { prefix: '/api/modules/office-accounts' });

  // Global Error Handler
  server.setErrorHandler((error: any, request, reply) => {
    server.log.error(error);
    reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code,
      },
    });
  });

  const port = Number(process.env.PORT) || 4000;
  const host = '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`🚀 API Server running at http://${host}:${port}`);
    console.log(`   - Auth:    http://localhost:${port}/api/auth`);
    console.log(`   - Tickets: http://localhost:${port}/api/tickets`);
    console.log(`   - Stats:   http://localhost:${port}/api/stats`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
