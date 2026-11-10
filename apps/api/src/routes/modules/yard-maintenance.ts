import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../db';
import { authenticate, requireModule, getCurrentUser } from '../../middleware/auth';
import { SystemModule, yardAllowanceSchema, diagnosticLogSchema, oilFillRecordSchema, yardExpenseSchema } from '@repo/shared';

export const yardMaintenanceRoutes: FastifyPluginAsync = async (server) => {
  // Enforce authentication & Module Access
  server.addHook('preHandler', authenticate);
  server.addHook('preHandler', requireModule(SystemModule.YARD_MAINTENANCE));

  // --- 1. Allowances ---
  server.get('/allowances', async (request, reply) => {
    const allowances = await prisma.yardAllowance.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: allowances });
  });

  server.post('/allowances', async (request, reply) => {
    const user = getCurrentUser(request);
    const parsed = yardAllowanceSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const allowance = await prisma.yardAllowance.create({
      data: {
        staffName: parsed.data.staffName,
        role: parsed.data.role,
        allowanceType: parsed.data.allowanceType,
        amount: parsed.data.amount,
        shiftDate: parsed.data.shiftDate,
        approvedBy: parsed.data.approvedBy || user.name,
        status: parsed.data.status,
        notes: parsed.data.notes,
      },
    });
    return reply.status(201).send({ success: true, data: allowance });
  });

  // --- 2. Diagnostics Telemetry ---
  server.get('/diagnostics', async (request, reply) => {
    const logs = await prisma.diagnosticLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: logs });
  });

  server.post('/diagnostics', async (request, reply) => {
    const user = getCurrentUser(request);
    const parsed = diagnosticLogSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const log = await prisma.diagnosticLog.create({
      data: {
        equipmentCode: parsed.data.equipmentCode,
        component: parsed.data.component,
        faultCode: parsed.data.faultCode,
        severity: parsed.data.severity,
        description: parsed.data.description,
        hoursLogged: parsed.data.hoursLogged,
        telemetryMetric: parsed.data.telemetryMetric,
        reportedBy: parsed.data.reportedBy || user.name,
        status: parsed.data.status,
      },
    });
    return reply.status(201).send({ success: true, data: log });
  });

  // --- 3. Oil Fills ---
  server.get('/oil-fills', async (request, reply) => {
    const records = await prisma.oilFillRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: records });
  });

  server.post('/oil-fills', async (request, reply) => {
    const user = getCurrentUser(request);
    const parsed = oilFillRecordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const record = await prisma.oilFillRecord.create({
      data: {
        equipmentCode: parsed.data.equipmentCode,
        oilType: parsed.data.oilType,
        litersFilled: parsed.data.litersFilled,
        readingHours: parsed.data.readingHours,
        costInr: parsed.data.costInr,
        technicianName: parsed.data.technicianName || user.name,
        notes: parsed.data.notes,
      },
    });
    return reply.status(201).send({ success: true, data: record });
  });

  // --- 4. Yard Maintenance Accounts & Expenses ---
  server.get('/expenses', async (request, reply) => {
    const expenses = await prisma.yardExpense.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: expenses });
  });

  server.post('/expenses', async (request, reply) => {
    const parsed = yardExpenseSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const expense = await prisma.yardExpense.create({
      data: {
        category: parsed.data.category,
        description: parsed.data.description,
        vendorName: parsed.data.vendorName,
        amount: parsed.data.amount,
        invoiceRef: parsed.data.invoiceRef,
        status: parsed.data.status,
      },
    });
    return reply.status(201).send({ success: true, data: expense });
  });
};

