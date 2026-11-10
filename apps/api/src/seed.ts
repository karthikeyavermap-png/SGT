import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, TicketStatus, TicketPriority } from '@repo/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive SGT database seeding...');

  // Clean existing data
  await prisma.comment.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.yardAllowance.deleteMany({});
  await prisma.diagnosticLog.deleteMany({});
  await prisma.oilFillRecord.deleteMany({});
  await prisma.yardExpense.deleteMany({});
  await prisma.tripRecord.deleteMany({});
  await prisma.fleetVehicle.deleteMany({});
  await prisma.driverRecord.deleteMany({});
  await prisma.paymentCollection.deleteMany({});
  await prisma.accountInvoice.deleteMany({});
  await prisma.accountExpense.deleteMany({});
  await prisma.purchaseSaleOrder.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // -------------------------------------------------------------
  // 1. Create Users for all Hierarchical Roles
  // -------------------------------------------------------------
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@sgt.com',
      passwordHash,
      name: 'Victoria Vance (Super Admin)',
      role: UserRole.SUPER_ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const regionalDirector = await prisma.user.create({
    data: {
      email: 'regional@sgt.com',
      passwordHash,
      name: 'Capt. Arvind Nair (Regional Director)',
      role: UserRole.REGIONAL_DIRECTOR,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const yardManager = await prisma.user.create({
    data: {
      email: 'yardmgr@sgt.com',
      passwordHash,
      name: 'Dinesh Rathore (Yard Manager)',
      role: UserRole.YARD_MANAGER,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const fleetDispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@sgt.com',
      passwordHash,
      name: 'Karan Mehra (Fleet Dispatcher)',
      role: UserRole.FLEET_DISPATCHER,
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
  });

  const accountsExec = await prisma.user.create({
    data: {
      email: 'accounts@sgt.com',
      passwordHash,
      name: 'Pooja Iyer (Accounts Executive)',
      role: UserRole.ACCOUNTS_EXECUTIVE,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  const auditor = await prisma.user.create({
    data: {
      email: 'auditor@sgt.com',
      passwordHash,
      name: 'Raghavan Swamy (Senior Auditor)',
      role: UserRole.AUDITOR,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const driver = await prisma.user.create({
    data: {
      email: 'driver@sgt.com',
      passwordHash,
      name: 'Rajesh Sharma (Lead Driver)',
      role: UserRole.DRIVER,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // Legacy platform accounts
  const legacyAdmin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      name: 'System Admin',
      role: UserRole.ADMIN,
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: 'agent@example.com',
      passwordHash,
      name: 'Agent James',
      role: UserRole.AGENT,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash,
      name: 'Alex Rivera',
      role: UserRole.CUSTOMER,
    },
  });

  console.log('✅ Created role-mapped users:');
  console.log('   - Super Admin:        superadmin@sgt.com');
  console.log('   - Regional Director:  regional@sgt.com');
  console.log('   - Yard Manager:       yardmgr@sgt.com');
  console.log('   - Fleet Dispatcher:   dispatcher@sgt.com');
  console.log('   - Accounts Exec:      accounts@sgt.com');
  console.log('   - Auditor:            auditor@sgt.com');
  console.log('   - Driver:             driver@sgt.com');

  // -------------------------------------------------------------
  // 2. Seed Yard Maintenance Module
  // -------------------------------------------------------------
  await prisma.yardAllowance.createMany({
    data: [
      {
        staffName: 'Rajesh Kumar',
        role: 'Crane Operator',
        allowanceType: 'OVERTIME',
        amount: 1800,
        shiftDate: '2026-11-09',
        approvedBy: 'Dinesh Rathore',
        status: 'APPROVED',
        notes: 'Extended night operations for urgent Rake RK-2026-ER-01 discharge',
      },
      {
        staffName: 'Suresh More',
        role: 'Rigging Tech',
        allowanceType: 'HAZARD_PAY',
        amount: 2500,
        shiftDate: '2026-11-09',
        approvedBy: 'Dinesh Rathore',
        status: 'APPROVED',
        notes: 'High-elevation inspection of RMG-01 trolley boom cable',
      },
      {
        staffName: 'David Dsouza',
        role: 'Maintenance Crew',
        allowanceType: 'NIGHT_SHIFT',
        amount: 1200,
        shiftDate: '2026-11-10',
        approvedBy: 'Dinesh Rathore',
        status: 'PENDING',
        notes: 'Scheduled night maintenance and greasing of rail bogies',
      },
    ],
  });

  await prisma.diagnosticLog.createMany({
    data: [
      {
        equipmentCode: 'RMG-01',
        component: 'Hydraulic Hoist Pump',
        faultCode: 'HYD-ERR-104',
        severity: 'CRITICAL',
        description: 'Cavitation and intermittent pressure drop below 180 bar on hoist circuit',
        hoursLogged: 4850,
        telemetryMetric: 'Pressure: 165 Bar (Nominal 210), Temp: 84°C',
        reportedBy: 'Suresh More',
        status: 'INVESTIGATING',
      },
      {
        equipmentCode: 'RS-02',
        component: 'Spreader Twistlock Solenoid',
        faultCode: 'TWL-WARN-02',
        severity: 'MEDIUM',
        description: 'Twistlock engaged signal flickering intermittently during 40ft box lift',
        hoursLogged: 3200,
        telemetryMetric: 'Resistance: 14.2 Ohms (Nominal 12.0)',
        reportedBy: 'David Dsouza',
        status: 'OPEN',
      },
      {
        equipmentCode: 'FL-01',
        component: 'Engine Air Intake Filter',
        faultCode: 'ENG-WARN-09',
        severity: 'LOW',
        description: 'Differential vacuum switch triggered; dust accumulation from clinker yard',
        hoursLogged: 1120,
        telemetryMetric: 'Differential Vac: 4.8 kPa',
        reportedBy: 'David Dsouza',
        status: 'RESOLVED',
      },
    ],
  });

  await prisma.oilFillRecord.createMany({
    data: [
      {
        equipmentCode: 'RMG-01',
        oilType: 'HYDRAULIC_ISO_68',
        litersFilled: 120,
        readingHours: 4850,
        costInr: 28800,
        technicianName: 'David Dsouza',
        notes: 'Semi-annual hydraulic reservoir flush and refill',
      },
      {
        equipmentCode: 'RS-01',
        oilType: 'ENGINE_15W40',
        litersFilled: 35,
        readingHours: 3120,
        costInr: 11200,
        technicianName: 'Suresh More',
        notes: 'Routine scheduled 500-hour engine oil service',
      },
      {
        equipmentCode: 'RMG-02',
        oilType: 'GEAR_SAE_90',
        litersFilled: 45,
        readingHours: 4100,
        costInr: 14400,
        technicianName: 'David Dsouza',
        notes: 'Gantry wheel travel gearbox oil replenishment',
      },
    ],
  });

  await prisma.yardExpense.createMany({
    data: [
      {
        category: 'SPARE_PARTS',
        description: 'High-pressure hydraulic seals & O-ring overhaul kit for RMG-01',
        vendorName: 'Parker Hannifin India Ltd.',
        amount: 45000,
        invoiceRef: 'PH-INV-9921',
        status: 'PAID',
      },
      {
        category: 'CONTRACTOR_SERVICE',
        description: 'Annual third-party statutory load & magnetic particle weld testing',
        vendorName: 'Bureau Veritas India Pvt Ltd',
        amount: 85000,
        invoiceRef: 'BV-2026-4410',
        status: 'PAID',
      },
      {
        category: 'CONSUMABLES',
        description: 'Heavy duty EP-2 lithium complex grease drums (180kg x 2)',
        vendorName: 'Castrol Industrial Lubricants',
        amount: 54000,
        invoiceRef: 'CAS-IND-8012',
        status: 'PENDING',
      },
    ],
  });

  console.log('✅ Seeded Yard Maintenance Module records.');

  // -------------------------------------------------------------
  // 3. Seed Transport & Fleet Module
  // -------------------------------------------------------------
  await prisma.fleetVehicle.createMany({
    data: [
      {
        vehicleNumber: 'MH-12-QZ-4921',
        vehicleType: 'PRIME_MOVER_40T',
        makeModel: 'Tata Prima 4928.S 6x4',
        capacityTons: 40.0,
        status: 'AVAILABLE',
        fitnessExpiry: '2027-04-15',
        insuranceExpiry: '2027-03-30',
        lastOdometerKm: 142500,
      },
      {
        vehicleNumber: 'KA-04-AK-8119',
        vehicleType: 'TRAILER_MULTI_AXLE',
        makeModel: 'Ashok Leyland 4220 8x2',
        capacityTons: 42.0,
        status: 'IN_TRANSIT',
        fitnessExpiry: '2027-08-20',
        insuranceExpiry: '2027-07-15',
        lastOdometerKm: 98400,
      },
      {
        vehicleNumber: 'OD-05-BX-2204',
        vehicleType: 'TERMINAL_TUG_ITV',
        makeModel: 'Kalmar T2 Internal Tractor',
        capacityTons: 35.0,
        status: 'AVAILABLE',
        fitnessExpiry: '2028-01-10',
        insuranceExpiry: '2027-11-25',
        lastOdometerKm: 34200,
      },
      {
        vehicleNumber: 'TS-09-EA-3341',
        vehicleType: 'RIGID_TRUCK',
        makeModel: 'BharatBenz 2823C 6x4',
        capacityTons: 28.0,
        status: 'MAINTENANCE',
        fitnessExpiry: '2026-12-31',
        insuranceExpiry: '2026-11-30',
        lastOdometerKm: 184600,
      },
    ],
  });

  await prisma.driverRecord.createMany({
    data: [
      {
        driverName: 'Rajesh Sharma',
        licenseNumber: 'MH12-2015-004921',
        licenseExpiry: '2030-05-18',
        contactNumber: '+91 98230 49211',
        experienceYears: 12.0,
        safetyRating: 4.9,
        status: 'AVAILABLE',
        assignedVehicleNumber: 'MH-12-QZ-4921',
      },
      {
        driverName: 'Manjunath Gowda',
        licenseNumber: 'KA04-2018-091124',
        licenseExpiry: '2029-08-22',
        contactNumber: '+91 97410 81192',
        experienceYears: 8.5,
        safetyRating: 4.8,
        status: 'ON_TRIP',
        assignedVehicleNumber: 'KA-04-AK-8119',
      },
      {
        driverName: 'Bikash Mahapatra',
        licenseNumber: 'OD05-2019-112048',
        licenseExpiry: '2031-01-14',
        contactNumber: '+91 94370 22041',
        experienceYears: 6.0,
        safetyRating: 4.7,
        status: 'AVAILABLE',
        assignedVehicleNumber: 'OD-05-BX-2204',
      },
    ],
  });

  await prisma.tripRecord.createMany({
    data: [
      {
        tripNumber: 'TRIP-2026-8801',
        origin: 'Yard Bay A-02 (SGT Hub)',
        destination: 'JNPT Port Terminal Gate 3',
        vehicleNumber: 'KA-04-AK-8119',
        driverName: 'Manjunath Gowda',
        cargoDescription: 'Cold Rolled Steel Coils (High Value Export)',
        weightTons: 28.5,
        status: 'IN_TRANSIT',
        departureTime: '2026-11-10 09:30',
        estimatedArrival: '2026-11-10 14:00',
        driverNotes: 'Clear traffic on expressway; green corridor maintained',
        lastOdometerKm: 98450,
      },
      {
        tripNumber: 'TRIP-2026-8802',
        origin: 'Rail Rake Siding Track 2',
        destination: 'Bulk Minerals Staging Yard B',
        vehicleNumber: 'OD-05-BX-2204',
        driverName: 'Bikash Mahapatra',
        cargoDescription: 'Direct Discharged Clinker & Pellets',
        weightTons: 32.0,
        status: 'DELIVERED',
        departureTime: '2026-11-10 07:15',
        estimatedArrival: '2026-11-10 08:00',
        actualArrival: '2026-11-10 07:55',
        driverNotes: 'Discharge completed within target time',
        lastOdometerKm: 34225,
      },
      {
        tripNumber: 'TRIP-2026-8803',
        origin: 'Yard Bay C-04',
        destination: 'UltraTech Cement Grinding Plant (Talegaon)',
        vehicleNumber: 'MH-12-QZ-4921',
        driverName: 'Rajesh Sharma',
        cargoDescription: 'Dry Flyash Silo Tankers',
        weightTons: 26.8,
        status: 'PLANNED',
        departureTime: '2026-11-10 15:00',
        estimatedArrival: '2026-11-10 17:30',
        driverNotes: 'Pre-trip vehicle check passed',
        lastOdometerKm: 142500,
      },
    ],
  });

  console.log('✅ Seeded Transport & Fleet Module records.');

  // -------------------------------------------------------------
  // 4. Seed Office & Accounts Module
  // -------------------------------------------------------------
  await prisma.accountInvoice.createMany({
    data: [
      {
        invoiceNumber: 'INV-GST-2026-1049',
        customerName: 'Tata Steel Ltd.',
        customerGstin: '27AAACT2727Q1ZW',
        invoiceType: 'GST',
        hsnCode: '996511',
        taxableAmount: 630000,
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 0,
        totalTaxAmount: 113400,
        grossAmount: 743400,
        dueDate: '2026-12-08',
        paymentStatus: 'PAID',
      },
      {
        invoiceNumber: 'INV-GST-2026-1050',
        customerName: 'JSW Infrastructure Ltd.',
        customerGstin: '27AAACJ8119M1ZL',
        invoiceType: 'GST',
        hsnCode: '996511',
        taxableAmount: 420000,
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 0,
        totalTaxAmount: 75600,
        grossAmount: 495600,
        dueDate: '2026-12-10',
        paymentStatus: 'PARTIALLY_PAID',
      },
      {
        invoiceNumber: 'INV-NGST-2026-0081',
        customerName: 'Local Terminal Logistics Trust',
        customerGstin: '',
        invoiceType: 'NON_GST',
        hsnCode: '996511',
        taxableAmount: 85000,
        cgstRate: 0,
        sgstRate: 0,
        igstRate: 0,
        totalTaxAmount: 0,
        grossAmount: 85000,
        dueDate: '2026-11-25',
        paymentStatus: 'UNPAID',
      },
    ],
  });

  await prisma.paymentCollection.createMany({
    data: [
      {
        collectionNumber: 'COL-2026-309',
        invoiceNumber: 'INV-GST-2026-1049',
        customerName: 'Tata Steel Ltd.',
        amountReceived: 730800,
        paymentMode: 'RTGS',
        transactionRef: 'UTR-HDFC2699104',
        tdsDeducted: 12600, // 2% TDS section 194C
        paymentDate: '2026-11-09',
        recordedBy: 'Pooja Iyer',
      },
      {
        collectionNumber: 'COL-2026-310',
        invoiceNumber: 'INV-GST-2026-1050',
        customerName: 'JSW Infrastructure Ltd.',
        amountReceived: 250000,
        paymentMode: 'NEFT',
        transactionRef: 'UTR-ICIC811904',
        tdsDeducted: 5000,
        paymentDate: '2026-11-09',
        recordedBy: 'Pooja Iyer',
      },
    ],
  });

  await prisma.accountExpense.createMany({
    data: [
      {
        expenseNumber: 'EXP-2026-402',
        category: 'DIESEL_FUEL',
        description: 'Bulk diesel bunkering for yard reach stackers (1,500 Ltrs)',
        amount: 142500,
        payeeName: 'Indian Oil Corporation Terminal Depot',
        paymentMode: 'BANK_TRANSFER',
        paymentDate: '2026-11-08',
        approvedBy: 'Pooja Iyer',
      },
      {
        expenseNumber: 'EXP-2026-403',
        category: 'ELECTRICITY_POWER',
        description: 'Monthly high-tension 33kV substation electric power utility',
        amount: 88400,
        payeeName: 'State Electricity Distribution Co Ltd',
        paymentMode: 'BANK_TRANSFER',
        paymentDate: '2026-11-05',
        approvedBy: 'Pooja Iyer',
      },
      {
        expenseNumber: 'EXP-2026-404',
        category: 'SECURITY_SERVICES',
        description: 'Round-the-clock terminal gate security guards deployment',
        amount: 48000,
        payeeName: 'SIS Security India Ltd',
        paymentMode: 'CHEQUE',
        paymentDate: '2026-11-02',
        approvedBy: 'Pooja Iyer',
      },
    ],
  });

  await prisma.purchaseSaleOrder.createMany({
    data: [
      {
        orderNumber: 'PO-2026-112',
        orderType: 'PURCHASE',
        counterpartyName: 'Bharat Petroleum Corp Ltd',
        itemOrCommodity: 'High-Speed Diesel for Yard Equipment',
        quantity: 4000,
        unitRate: 92.5,
        totalAmount: 370000,
        status: 'FULFILLED',
        orderDate: '2026-11-01',
      },
      {
        orderNumber: 'SO-2026-441',
        orderType: 'SALE',
        counterpartyName: 'Tata Steel Ltd.',
        itemOrCommodity: 'Rake Loading & Yard Warehousing Services',
        quantity: 3500,
        unitRate: 180.0,
        totalAmount: 630000,
        status: 'FULFILLED',
        orderDate: '2026-11-04',
      },
    ],
  });

  console.log('✅ Seeded Office & Accounts Module records.');

  // -------------------------------------------------------------
  // 5. Seed Core Tickets for PulseDesk
  // -------------------------------------------------------------
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Cannot access billing portal after card update',
      description:
        'When trying to view our latest monthly invoice, the page gives a 403 Forbidden error immediately after updating our corporate MasterCard.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.URGENT,
      category: 'Billing',
      customerId: customer1.id,
      assignedAgentId: agent1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Thank you for reporting. Investigating payment gateway token.',
      ticketId: ticket1.id,
      authorId: agent1.id,
      isInternal: false,
    },
  });

  console.log('🎉 Full database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
