import { UserRole } from './constants';

export interface JwtTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface TicketFilterQuery {
  status?: string;
  priority?: string;
  search?: string;
  assignedToMe?: boolean;
}
