import { z } from 'zod';
import { UserRole } from './constants';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const authResponseSchema = z.object({
  user: userProfileSchema,
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
