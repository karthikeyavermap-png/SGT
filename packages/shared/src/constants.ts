export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const TICKET_CATEGORIES = [
  'General',
  'Technical',
  'Billing',
  'Feature Request',
  'Bug Report',
  'Account',
] as const;

export const AUTH_COOKIE_NAME = 'refresh_token';
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
