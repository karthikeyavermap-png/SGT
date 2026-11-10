export enum UserRole {
  // Global & System Level
  SUPER_ADMIN = 'SUPER_ADMIN',
  REGIONAL_DIRECTOR = 'REGIONAL_DIRECTOR',

  // Branch & Operational Management
  YARD_MANAGER = 'YARD_MANAGER',
  FLEET_DISPATCHER = 'FLEET_DISPATCHER',
  ACCOUNTS_EXECUTIVE = 'ACCOUNTS_EXECUTIVE',
  AUDITOR = 'AUDITOR',

  // Field Level
  DRIVER = 'DRIVER',

  // Core / Legacy Platform Roles
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER',
}

export enum SystemModule {
  YARD_MAINTENANCE = 'YARD_MAINTENANCE',
  TRANSPORT_FLEET = 'TRANSPORT_FLEET',
  OFFICE_ACCOUNTS = 'OFFICE_ACCOUNTS',
}

export const MODULE_DESCRIPTIONS: Record<SystemModule, { title: string; description: string; scope: string }> = {
  [SystemModule.YARD_MAINTENANCE]: {
    title: 'Yard Maintenance Module',
    description: 'Allowances, Diagnostics, Oil Fills, and Yard Maintenance Accounts',
    scope: 'Yard Operations & Engineering Maintenance',
  },
  [SystemModule.TRANSPORT_FLEET]: {
    title: 'Transport & Fleet Module',
    description: 'Vehicles, Drivers, and Trip Details & Execution',
    scope: 'Fleet Logistics, Truck Dispatches & Trip Management',
  },
  [SystemModule.OFFICE_ACCOUNTS]: {
    title: 'Office & Accounts Module',
    description: 'Invoices (GST & Non-GST), Collections, Expenses, Purchases & Sales',
    scope: 'Commercial Billing, Payment Reconciliation & Operational Ledger',
  },
};

/**
 * Access Matrix:
 * - Super Admin (SA): Global System Control -> All Modules
 * - Regional Director (RD): Multi-Yard & Regional Oversight -> All Modules
 * - Auditor (AU): Compliance & Audit Review -> All Modules (Audit Scope)
 * - Yard Manager (YM): Yard Operations & Maintenance -> Yard Maintenance Module
 * - Fleet Dispatcher (FD): Transport & Driver Logistics -> Transport & Fleet Module
 * - Driver (DR): Trip Execution & Updates -> Transport & Fleet Module
 * - Accounts Executive (AE): Office Finance & Billing -> Office & Accounts Module
 * - Admin: Legacy Superuser -> All Modules
 */
export const MODULE_ACCESS_MAP: Record<UserRole, SystemModule[]> = {
  [UserRole.SUPER_ADMIN]: [
    SystemModule.YARD_MAINTENANCE,
    SystemModule.TRANSPORT_FLEET,
    SystemModule.OFFICE_ACCOUNTS,
  ],
  [UserRole.REGIONAL_DIRECTOR]: [
    SystemModule.YARD_MAINTENANCE,
    SystemModule.TRANSPORT_FLEET,
    SystemModule.OFFICE_ACCOUNTS,
  ],
  [UserRole.AUDITOR]: [
    SystemModule.YARD_MAINTENANCE,
    SystemModule.TRANSPORT_FLEET,
    SystemModule.OFFICE_ACCOUNTS,
  ],
  [UserRole.ADMIN]: [
    SystemModule.YARD_MAINTENANCE,
    SystemModule.TRANSPORT_FLEET,
    SystemModule.OFFICE_ACCOUNTS,
  ],
  [UserRole.YARD_MANAGER]: [SystemModule.YARD_MAINTENANCE],
  [UserRole.FLEET_DISPATCHER]: [SystemModule.TRANSPORT_FLEET],
  [UserRole.DRIVER]: [SystemModule.TRANSPORT_FLEET],
  [UserRole.ACCOUNTS_EXECUTIVE]: [SystemModule.OFFICE_ACCOUNTS],
  [UserRole.AGENT]: [],
  [UserRole.CUSTOMER]: [],
};

export function hasModuleAccess(role: UserRole | string, module: SystemModule): boolean {
  const allowed = MODULE_ACCESS_MAP[role as UserRole];
  if (!allowed) return false;
  return allowed.includes(module);
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
