import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../db';
import { authenticate, requireModule, getCurrentUser } from '../../middleware/auth';
import {
  SystemModule,
  accountInvoiceSchema,
  paymentCollectionSchema,
  accountExpenseSchema,
  purchaseSaleOrderSchema,
} from '@repo/shared';

export const officeAccountsRoutes: FastifyPluginAsync = async (server) => {
  // Enforce authentication & Module Access
  server.addHook('preHandler', authenticate);
  server.addHook('preHandler', requireModule(SystemModule.OFFICE_ACCOUNTS));

  // --- 1. Invoices (GST / Non-GST) ---
  server.get('/invoices', async (request, reply) => {
    const invoices = await prisma.accountInvoice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: invoices });
  });

  server.post('/invoices', async (request, reply) => {
    const parsed = accountInvoiceSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const { taxableAmount, cgstRate, sgstRate, igstRate, invoiceType } = parsed.data;

    let totalTax = 0;
    if (invoiceType === 'GST') {
      if (igstRate > 0) {
        totalTax = (taxableAmount * igstRate) / 100;
      } else {
        totalTax = (taxableAmount * (cgstRate + sgstRate)) / 100;
      }
    }
    const grossAmount = taxableAmount + totalTax;

    const invoice = await prisma.accountInvoice.create({
      data: {
        invoiceNumber: parsed.data.invoiceNumber || `INV-${invoiceType}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: parsed.data.customerName,
        customerGstin: parsed.data.customerGstin,
        invoiceType: parsed.data.invoiceType,
        hsnCode: parsed.data.hsnCode,
        taxableAmount,
        cgstRate,
        sgstRate,
        igstRate,
        totalTaxAmount: totalTax,
        grossAmount,
        dueDate: parsed.data.dueDate,
        paymentStatus: parsed.data.paymentStatus,
      },
    });

    return reply.status(201).send({ success: true, data: invoice });
  });

  // --- 2. Payment Collections ---
  server.get('/collections', async (request, reply) => {
    const collections = await prisma.paymentCollection.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: collections });
  });

  server.post('/collections', async (request, reply) => {
    const user = getCurrentUser(request);
    const parsed = paymentCollectionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const collection = await prisma.paymentCollection.create({
      data: {
        collectionNumber: parsed.data.collectionNumber || `COL-2026-${Math.floor(100 + Math.random() * 900)}`,
        invoiceNumber: parsed.data.invoiceNumber,
        customerName: parsed.data.customerName,
        amountReceived: parsed.data.amountReceived,
        paymentMode: parsed.data.paymentMode,
        transactionRef: parsed.data.transactionRef,
        tdsDeducted: parsed.data.tdsDeducted,
        paymentDate: parsed.data.paymentDate,
        recordedBy: parsed.data.recordedBy || user.name,
      },
    });

    // Automatically update invoice status
    const inv = await prisma.accountInvoice.findUnique({
      where: { invoiceNumber: parsed.data.invoiceNumber },
    });
    if (inv) {
      const allPayments = await prisma.paymentCollection.findMany({
        where: { invoiceNumber: parsed.data.invoiceNumber },
      });
      const totalPaid = allPayments.reduce((acc, curr) => acc + curr.amountReceived + curr.tdsDeducted, 0);

      const status = totalPaid >= inv.grossAmount ? 'PAID' : 'PARTIALLY_PAID';
      await prisma.accountInvoice.update({
        where: { invoiceNumber: parsed.data.invoiceNumber },
        data: { paymentStatus: status },
      });
    }

    return reply.status(201).send({ success: true, data: collection });
  });

  // --- 3. Office & Operational Expenses ---
  server.get('/expenses', async (request, reply) => {
    const expenses = await prisma.accountExpense.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: expenses });
  });

  server.post('/expenses', async (request, reply) => {
    const user = getCurrentUser(request);
    const parsed = accountExpenseSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const expense = await prisma.accountExpense.create({
      data: {
        expenseNumber: parsed.data.expenseNumber || `EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
        category: parsed.data.category,
        description: parsed.data.description,
        amount: parsed.data.amount,
        payeeName: parsed.data.payeeName,
        paymentMode: parsed.data.paymentMode,
        paymentDate: parsed.data.paymentDate,
        approvedBy: parsed.data.approvedBy || user.name,
      },
    });

    return reply.status(201).send({ success: true, data: expense });
  });

  // --- 4. Purchases & Sales Ledger ---
  server.get('/orders', async (request, reply) => {
    const orders = await prisma.purchaseSaleOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: orders });
  });

  server.post('/orders', async (request, reply) => {
    const parsed = purchaseSaleOrderSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const order = await prisma.purchaseSaleOrder.create({
      data: {
        orderNumber: parsed.data.orderNumber || `${parsed.data.orderType === 'PURCHASE' ? 'PO' : 'SO'}-2026-${Math.floor(100 + Math.random() * 900)}`,
        orderType: parsed.data.orderType,
        counterpartyName: parsed.data.counterpartyName,
        itemOrCommodity: parsed.data.itemOrCommodity,
        quantity: parsed.data.quantity,
        unitRate: parsed.data.unitRate,
        totalAmount: parsed.data.quantity * parsed.data.unitRate,
        status: parsed.data.status,
        orderDate: parsed.data.orderDate,
      },
    });

    return reply.status(201).send({ success: true, data: order });
  });
};

