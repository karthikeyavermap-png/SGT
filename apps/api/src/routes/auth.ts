import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { prisma } from '../db';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  UserRole,
  AUTH_COOKIE_NAME,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from '@repo/shared';
import { authenticate, getCurrentUser } from '../middleware/auth';

export async function authRoutes(server: FastifyInstance) {
  // POST /api/auth/register
  server.post('/register', async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Validation failed',
          details: parseResult.error.format(),
        },
      });
    }

    const { name, email, password, role } = parseResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return reply.status(409).send({
        success: false,
        error: { message: 'A user with this email already exists' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role || UserRole.CUSTOMER,
      },
    });

    // Create JWT Access Token
    const accessToken = server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        name: user.name,
      },
      { expiresIn: '15m' }
    );

    // Create Refresh Token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set HTTP-Only Cookie for Web clients
    reply.setCookie(AUTH_COOKIE_NAME, refreshToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return reply.status(201).send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken, // Returned for Mobile (stored in Expo SecureStore)
      },
    });
  });

  // POST /api/auth/login
  server.post('/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Invalid credentials format',
          details: parseResult.error.format(),
        },
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Invalid email or password' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Invalid email or password' },
      });
    }

    // Sign Access Token
    const accessToken = server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        name: user.name,
      },
      { expiresIn: '15m' }
    );

    // Create Refresh Token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set HTTP-Only Cookie for Web
    reply.setCookie(AUTH_COOKIE_NAME, refreshToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return reply.send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken, // Returned for Mobile (Expo SecureStore)
      },
    });
  });

  // POST /api/auth/refresh
  server.post('/refresh', async (request, reply) => {
    // 1. Try to read from cookie (Web)
    let token = request.cookies[AUTH_COOKIE_NAME];

    // 2. Fallback to request body (Mobile / API clients)
    if (!token && request.body) {
      const bodyResult = refreshTokenSchema.safeParse(request.body);
      if (bodyResult.success && bodyResult.data.refreshToken) {
        token = bodyResult.data.refreshToken;
      }
    }

    if (!token) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Refresh token is required' },
      });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      // Clear cookie if invalid
      reply.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
      return reply.status(401).send({
        success: false,
        error: { message: 'Invalid, revoked or expired refresh token' },
      });
    }

    // Token rotation: Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new refresh token
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: newExpiresAt,
      },
    });

    // Issue new access token
    const accessToken = server.jwt.sign(
      {
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role as UserRole,
        name: storedToken.user.name,
      },
      { expiresIn: '15m' }
    );

    // Update cookie
    reply.setCookie(AUTH_COOKIE_NAME, newRefreshToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return reply.send({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          name: storedToken.user.name,
          role: storedToken.user.role,
          avatarUrl: storedToken.user.avatarUrl,
          createdAt: storedToken.user.createdAt,
          updatedAt: storedToken.user.updatedAt,
        },
      },
    });
  });

  // POST /api/auth/logout
  server.post('/logout', async (request, reply) => {
    let token = request.cookies[AUTH_COOKIE_NAME];
    if (!token && request.body) {
      const bodyResult = refreshTokenSchema.safeParse(request.body);
      if (bodyResult.success && bodyResult.data.refreshToken) {
        token = bodyResult.data.refreshToken;
      }
    }

    if (token) {
      await prisma.refreshToken
        .updateMany({
          where: { token, revokedAt: null },
          data: { revokedAt: new Date() },
        })
        .catch(() => {});
    }

    reply.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
    return reply.send({
      success: true,
      message: 'Logged out successfully',
    });
  });

  // GET /api/auth/me
  server.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const currentUser = getCurrentUser(request);
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: { message: 'User not found' },
      });
    }

    return reply.send({
      success: true,
      data: user,
    });
  });
}
