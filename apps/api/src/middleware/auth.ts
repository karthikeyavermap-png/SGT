import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole, JwtTokenPayload } from '@repo/shared';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtTokenPayload;
    user: JwtTokenPayload;
  }
}

export function getCurrentUser(request: FastifyRequest): JwtTokenPayload {
  return request.user as unknown as JwtTokenPayload;
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Missing or invalid authorization token' },
      });
    }

    const token = authHeader.substring(7);
    const decoded = (await request.server.jwt.verify(token)) as JwtTokenPayload;
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: { message: 'Invalid or expired token' },
    });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as unknown as JwtTokenPayload | undefined;
    if (!user) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Unauthorized' },
      });
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return reply.status(403).send({
        success: false,
        error: { message: 'Forbidden: insufficient role permissions' },
      });
    }
  };
}
