// Smart Goods Terminal (SGT) Microservices Client
// Connects to unified API Gateway (or individual services) with graceful client-side fallback

const GATEWAY_BASE = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';

export interface YardBlock {
  id: number;
  blockCode: string;
  name: string;
  totalBays: number;
  totalRows: number;
  maxTier: number;
  totalCapacity: number;
  currentOccupancy: number;
}

export interface YardSlot {
  id: number;
  blockCode: string;
  bay: number;
  rowNumber: number;
  tier: number;
  containerNumber?: string;
  status: 'EMPTY' | 'OCCUPIED' | 'RESERVED';
}

export interface Rake {
  id: number;
  rakeNumber: string;
  trainOperator: string;
  totalWagons: number;
  status: 'ARRIVED' | 'INSPECTION' | 'DISCHARGING' | 'LOADING' | 'COMPLETED' | 'DEPARTED';
  freeDetentionHours: number;
  actualDetentionHours: number;
  arrivalTime: string;
}

export interface TruckVisit {
  id: number;
  truckNumber: string;
  driverName: string;
  transporterName: string;
  stage: 'GATE_IN' | 'WEIGH_IN' | 'YARD_TRANSFER' | 'WEIGH_OUT' | 'GATE_OUT';
  tareWeightTons?: number;
  grossWeightTons?: number;
  netCargoTons?: number;
  gateInTime: string;
  gateOutTime?: string;
  tatMinutes?: number;
}

export interface CustomerOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerCode: string;
  commodity: string;
  quantityTons: number;
  ratePerTon: number;
  totalContractValue: number;
  status: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerCode: string;
  handlingCharges: number;
  storageCharges: number;
  demurrageCharges: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  issueDate: string;
}

export interface DemurrageRecord {
  id: number;
  referenceId: string;
  referenceType: string;
  customerCode: string;
  freeHoursAllowed: number;
  totalHoursHeld: number;
  billableDemurrageHours: number;
  hourlyRate: number;
  totalDemurrageAmount: number;
  status: string;
}

export interface AnalyticsSummary {
  yard: {
    totalSlots: number;
    occupiedSlots: number;
    occupancyPercentage: number;
    totalCapacityTons: number;
    currentTons: number;
  };
  transport: {
    averageRakeTatHours: number;
    targetRakeTatHours: number;
    rakesHandledToday: number;
    rakesDetained: number;
    averageTruckTatMinutes: number;
    targetTruckTatMinutes: number;
  };
  commercial: {
    totalRevenueInr: number;
    handledTonnageMT: number;
    totalDemurrageBilledInr: number;
  };
}

// Fallback baseline data when backend services are offline
const MOCK_YARD_BLOCKS: YardBlock[] = [
  { id: 1, blockCode: 'BLOCK-A', name: 'Heavy Steel & HR Coils Yard', totalBays: 10, totalRows: 4, maxTier: 3, totalCapacity: 120, currentOccupancy: 94 },
  { id: 2, blockCode: 'BLOCK-B', name: 'Bulk Minerals & Pellets', totalBays: 12, totalRows: 4, maxTier: 4, totalCapacity: 160, currentOccupancy: 118 },
  { id: 3, blockCode: 'BLOCK-C', name: 'Cement & Dry Bulk Clinker', totalBays: 8, totalRows: 4, maxTier: 3, totalCapacity: 80, currentOccupancy: 41 },
  { id: 4, blockCode: 'BLOCK-D', name: 'Empty Container Staging', totalBays: 10, totalRows: 3, maxTier: 4, totalCapacity: 100, currentOccupancy: 32 },
];

const MOCK_RAKES: Rake[] = [
  { id: 1, rakeNumber: 'RK-2026-ER-01', trainOperator: 'Indian Railways (East Coast)', totalWagons: 45, status: 'DISCHARGING', freeDetentionHours: 8.0, actualDetentionHours: 6.8, arrivalTime: 'Today, 06:15 AM' },
  { id: 2, rakeNumber: 'RK-2026-SER-14', trainOperator: 'South Eastern Freight', totalWagons: 58, status: 'COMPLETED', freeDetentionHours: 8.0, actualDetentionHours: 11.5, arrivalTime: 'Yesterday, 02:20 PM' },
  { id: 3, rakeNumber: 'RK-2026-WR-09', trainOperator: 'Western Railway Logistics', totalWagons: 50, status: 'INSPECTION', freeDetentionHours: 8.0, actualDetentionHours: 2.1, arrivalTime: 'Today, 10:45 AM' },
];

const MOCK_TRUCKS: TruckVisit[] = [
  { id: 1, truckNumber: 'MH-12-QZ-4921', driverName: 'Rajesh Sharma', transporterName: 'Om Logistics', stage: 'WEIGH_OUT', tareWeightTons: 15.6, grossWeightTons: 44.2, netCargoTons: 28.6, gateInTime: '10:15 AM', tatMinutes: 47 },
  { id: 2, truckNumber: 'KA-04-AK-8119', driverName: 'Manjunath Gowda', transporterName: 'VRL Logistics', stage: 'GATE_OUT', tareWeightTons: 16.6, grossWeightTons: 48.0, netCargoTons: 31.4, gateInTime: '10:30 AM', gateOutTime: '11:12 AM', tatMinutes: 42 },
  { id: 3, truckNumber: 'OD-05-BX-2204', driverName: 'Bikash Mahapatra', transporterName: 'Blue Dart Surface', stage: 'YARD_TRANSFER', tareWeightTons: 15.7, grossWeightTons: 42.5, netCargoTons: 26.8, gateInTime: '11:00 AM', tatMinutes: 58 },
  { id: 4, truckNumber: 'TS-09-EA-3341', driverName: 'K. Venkatesh', transporterName: 'Gati Cargo', stage: 'WEIGH_IN', tareWeightTons: 15.8, grossWeightTons: 45.1, netCargoTons: 29.3, gateInTime: '11:45 AM', tatMinutes: 40 },
];

const MOCK_ORDERS: CustomerOrder[] = [
  { id: 1, orderNumber: 'ORD-2026-901', customerName: 'Tata Steel Ltd.', customerCode: 'CUST-TATA', commodity: 'Cold Rolled Steel', quantityTons: 3500.0, ratePerTon: 180.0, totalContractValue: 630000.0, status: 'PROCESSING' },
  { id: 2, orderNumber: 'ORD-2026-902', customerName: 'JSW Infrastructure', customerCode: 'CUST-JSW', commodity: 'Iron Ore Pellets', quantityTons: 4200.0, ratePerTon: 140.0, totalContractValue: 588000.0, status: 'CONFIRMED' },
  { id: 3, orderNumber: 'ORD-2026-899', customerName: 'UltraTech Cement Ltd.', customerCode: 'CUST-ULTRA', commodity: 'Dry Flyash & Clinker', quantityTons: 2800.0, ratePerTon: 125.0, totalContractValue: 350000.0, status: 'BILLED' },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 1, invoiceNumber: 'INV-SGT-2026-0042', customerName: 'UltraTech Cement Ltd.', customerCode: 'CUST-ULTRA', handlingCharges: 350000.0, storageCharges: 24000.0, demurrageCharges: 4500.0, taxAmount: 68130.0, totalAmount: 446630.0, status: 'PAID', issueDate: '2026-11-07' },
  { id: 2, invoiceNumber: 'INV-SGT-2026-0043', customerName: 'Tata Steel Ltd.', customerCode: 'CUST-TATA', handlingCharges: 630000.0, storageCharges: 45000.0, demurrageCharges: 6750.0, taxAmount: 122715.0, totalAmount: 804465.0, status: 'PENDING', issueDate: '2026-11-09' },
];

const MOCK_DEMURRAGE: DemurrageRecord[] = [
  { id: 1, referenceId: 'RK-2026-ER-01', referenceType: 'RAKE', customerCode: 'CUST-TATA', freeHoursAllowed: 8.0, totalHoursHeld: 17.0, billableDemurrageHours: 9.0, hourlyRate: 750.0, totalDemurrageAmount: 6750.0, status: 'INVOICED' },
  { id: 2, referenceId: 'TRK-MH12-4921', referenceType: 'TRUCK', customerCode: 'CUST-JSW', freeHoursAllowed: 6.0, totalHoursHeld: 9.5, billableDemurrageHours: 3.5, hourlyRate: 600.0, totalDemurrageAmount: 2100.0, status: 'ACCRUING' },
];

export async function fetchYardBlocks(): Promise<YardBlock[]> {
  try {
    const res = await fetch(`${GATEWAY_BASE}/api/v1/yard/blocks`, { next: { revalidate: 10 } });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }
  return MOCK_YARD_BLOCKS;
}

export async function fetchRakes(): Promise<Rake[]> {
  try {
    const res = await fetch(`${GATEWAY_BASE}/api/v1/transport/rakes`, { next: { revalidate: 10 } });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }
  return MOCK_RAKES;
}

export async function fetchTrucks(): Promise<TruckVisit[]> {
  return MOCK_TRUCKS;
}

export async function fetchOrders(): Promise<CustomerOrder[]> {
  try {
    const res = await fetch(`${GATEWAY_BASE}/api/v1/commercial/orders`, { next: { revalidate: 10 } });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }
  return MOCK_ORDERS;
}

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const res = await fetch(`${GATEWAY_BASE}/api/v1/commercial/invoices`, { next: { revalidate: 10 } });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }
  return MOCK_INVOICES;
}

export async function fetchDemurrageRecords(): Promise<DemurrageRecord[]> {
  try {
    const res = await fetch(`${GATEWAY_BASE}/api/v1/commercial/demurrage`, { next: { revalidate: 10 } });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }
  return MOCK_DEMURRAGE;
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const [yardRes, transportRes, commRes] = await Promise.all([
      fetch(`${GATEWAY_BASE}/api/v1/analytics/yard/summary`),
      fetch(`${GATEWAY_BASE}/api/v1/analytics/transport/summary`),
      fetch(`${GATEWAY_BASE}/api/v1/analytics/commercial/summary`)
    ]);

    if (yardRes.ok && transportRes.ok && commRes.ok) {
      const yard = await yardRes.json();
      const transport = await transportRes.json();
      const commercial = await commRes.json();
      return { yard, transport, commercial };
    }
  } catch (e) {
    // fallback
  }

  return {
    yard: {
      totalSlots: 460,
      occupiedSlots: 285,
      occupancyPercentage: 62.0,
      totalCapacityTons: 85000,
      currentTons: 56100,
    },
    transport: {
      averageRakeTatHours: 7.2,
      targetRakeTatHours: 8.0,
      rakesHandledToday: 4,
      rakesDetained: 1,
      averageTruckTatMinutes: 46.8,
      targetTruckTatMinutes: 45.0,
    },
    commercial: {
      totalRevenueInr: 28450000.0,
      handledTonnageMT: 148500.0,
      totalDemurrageBilledInr: 384000.0,
    }
  };
}

