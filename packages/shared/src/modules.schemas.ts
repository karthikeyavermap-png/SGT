import { z } from 'zod';

// ==========================================
// 1. YARD MAINTENANCE MODULE SCHEMAS
// ==========================================

export const yardAllowanceSchema = z.object({
  id: z.string().optional(),
  staffName: z.string().min(2, 'Staff name is required'),
  role: z.string().min(2, 'Role is required'), // e.g. "Crane Operator", "Rigging Technician"
  allowanceType: z.enum(['OVERTIME', 'HAZARD_PAY', 'NIGHT_SHIFT', 'PER_DIEM', 'SPECIAL_DUTY']),
  amount: z.number().positive('Amount must be positive'),
  shiftDate: z.string(), // ISO date
  approvedBy: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('APPROVED'),
  notes: z.string().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export const diagnosticLogSchema = z.object({
  id: z.string().optional(),
  equipmentCode: z.string().min(2, 'Equipment code required'), // "RMG-01", "RS-02"
  component: z.string(), // "Hydraulic Pump", "Spreader Lock", "Engine"
  faultCode: z.string(), // "HYD-ERR-104", "DTC-0882"
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(3),
  hoursLogged: z.number().nonnegative(),
  telemetryMetric: z.string().optional(), // "Oil Pressure: 42 PSI, Temp: 88°C"
  reportedBy: z.string(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED']).default('OPEN'),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export const oilFillRecordSchema = z.object({
  id: z.string().optional(),
  equipmentCode: z.string().min(2),
  oilType: z.enum([
    'HYDRAULIC_ISO_68',
    'ENGINE_15W40',
    'GEAR_SAE_90',
    'TRANSMISSION_ATF',
    'SYNTHETIC_GREASE',
  ]),
  litersFilled: z.number().positive(),
  readingHours: z.number().nonnegative(),
  costInr: z.number().positive(),
  technicianName: z.string(),
  notes: z.string().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export const yardExpenseSchema = z.object({
  id: z.string().optional(),
  category: z.enum(['SPARE_PARTS', 'PREVENTIVE_MAINTENANCE', 'CONSUMABLES', 'CONTRACTOR_SERVICE']),
  description: z.string(),
  vendorName: z.string(),
  amount: z.number().positive(),
  invoiceRef: z.string().optional(),
  status: z.enum(['PENDING', 'PAID']).default('PAID'),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export type YardAllowance = z.infer<typeof yardAllowanceSchema>;
export type DiagnosticLog = z.infer<typeof diagnosticLogSchema>;
export type OilFillRecord = z.infer<typeof oilFillRecordSchema>;
export type YardExpense = z.infer<typeof yardExpenseSchema>;

// ==========================================
// 2. TRANSPORT & FLEET MODULE SCHEMAS
// ==========================================

export const fleetVehicleSchema = z.object({
  id: z.string().optional(),
  vehicleNumber: z.string().min(3), // "MH-12-QZ-4921"
  vehicleType: z.enum(['PRIME_MOVER_40T', 'TRAILER_MULTI_AXLE', 'TERMINAL_TUG_ITV', 'RIGID_TRUCK']),
  makeModel: z.string(), // "Tata Prima 4928.S", "Ashok Leyland 4220"
  capacityTons: z.number().positive(),
  status: z.enum(['AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', 'INSPECTION']).default('AVAILABLE'),
  fitnessExpiry: z.string(),
  insuranceExpiry: z.string(),
  lastOdometerKm: z.number().nonnegative(),
});

export const driverRecordSchema = z.object({
  id: z.string().optional(),
  driverName: z.string().min(2),
  licenseNumber: z.string(),
  licenseExpiry: z.string(),
  contactNumber: z.string(),
  experienceYears: z.number().nonnegative(),
  safetyRating: z.number().min(1).max(5).default(4.8),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'RESTING', 'ON_LEAVE']).default('AVAILABLE'),
  assignedVehicleNumber: z.string().optional(),
});

export const tripRecordSchema = z.object({
  id: z.string().optional(),
  tripNumber: z.string(), // "TRIP-2026-8801"
  origin: z.string(),
  destination: z.string(),
  vehicleNumber: z.string(),
  driverName: z.string(),
  cargoDescription: z.string(),
  weightTons: z.number().positive(),
  status: z.enum(['PLANNED', 'IN_TRANSIT', 'DELAYED', 'DELIVERED', 'CANCELLED']).default('PLANNED'),
  departureTime: z.string(),
  estimatedArrival: z.string(),
  actualArrival: z.string().optional(),
  driverNotes: z.string().optional(),
  lastOdometerKm: z.number().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export type FleetVehicle = z.infer<typeof fleetVehicleSchema>;
export type DriverRecord = z.infer<typeof driverRecordSchema>;
export type TripRecord = z.infer<typeof tripRecordSchema>;

// ==========================================
// 3. OFFICE & ACCOUNTS MODULE SCHEMAS
// ==========================================

export const accountInvoiceSchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string(), // "INV-GST-2026-1049"
  customerName: z.string(),
  customerGstin: z.string().optional(),
  invoiceType: z.enum(['GST', 'NON_GST']).default('GST'),
  hsnCode: z.string().default('996511'), // Cargo handling & transport service HSN
  taxableAmount: z.number().positive(),
  cgstRate: z.number().default(9), // 9%
  sgstRate: z.number().default(9), // 9%
  igstRate: z.number().default(0),
  totalTaxAmount: z.number().nonnegative(),
  grossAmount: z.number().positive(),
  dueDate: z.string(),
  paymentStatus: z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID']).default('UNPAID'),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export const paymentCollectionSchema = z.object({
  id: z.string().optional(),
  collectionNumber: z.string(), // "COL-2026-309"
  invoiceNumber: z.string(),
  customerName: z.string(),
  amountReceived: z.number().positive(),
  paymentMode: z.enum(['NEFT', 'RTGS', 'CHEQUE', 'UPI', 'CASH']),
  transactionRef: z.string(),
  tdsDeducted: z.number().nonnegative().default(0),
  paymentDate: z.string(),
  recordedBy: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export const accountExpenseSchema = z.object({
  id: z.string().optional(),
  expenseNumber: z.string(), // "EXP-2026-402"
  category: z.enum([
    'DIESEL_FUEL',
    'ELECTRICITY_POWER',
    'YARD_LEASE',
    'SECURITY_SERVICES',
    'MUNICIPAL_TAX',
    'OFFICE_ADMIN',
  ]),
  description: z.string(),
  amount: z.number().positive(),
  payeeName: z.string(),
  paymentMode: z.enum(['BANK_TRANSFER', 'CHEQUE', 'CORPORATE_CARD', 'CASH']),
  paymentDate: z.string(),
  approvedBy: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export const purchaseSaleOrderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string(), // "PO-2026-112" or "SO-2026-441"
  orderType: z.enum(['PURCHASE', 'SALE']),
  counterpartyName: z.string(),
  itemOrCommodity: z.string(),
  quantity: z.number().positive(),
  unitRate: z.number().positive(),
  totalAmount: z.number().positive(),
  status: z.enum(['PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED']).default('APPROVED'),
  orderDate: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export type AccountInvoice = z.infer<typeof accountInvoiceSchema>;
export type PaymentCollection = z.infer<typeof paymentCollectionSchema>;
export type AccountExpense = z.infer<typeof accountExpenseSchema>;
export type PurchaseSaleOrder = z.infer<typeof purchaseSaleOrderSchema>;

