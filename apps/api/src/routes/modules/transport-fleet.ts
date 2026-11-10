import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../db';
import { authenticate, requireModule, getCurrentUser } from '../../middleware/auth';
import { SystemModule, fleetVehicleSchema, driverRecordSchema, tripRecordSchema, UserRole } from '@repo/shared';
import { z } from 'zod';

export const transportFleetRoutes: FastifyPluginAsync = async (server) => {
  // Enforce authentication & Module Access
  server.addHook('preHandler', authenticate);
  server.addHook('preHandler', requireModule(SystemModule.TRANSPORT_FLEET));

  // --- 1. Vehicles ---
  server.get('/vehicles', async (request, reply) => {
    const vehicles = await prisma.fleetVehicle.findMany({
      orderBy: { vehicleNumber: 'asc' },
    });
    return reply.send({ success: true, data: vehicles });
  });

  server.post('/vehicles', async (request, reply) => {
    const parsed = fleetVehicleSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const vehicle = await prisma.fleetVehicle.create({
      data: parsed.data,
    });
    return reply.status(201).send({ success: true, data: vehicle });
  });

  // --- 2. Drivers ---
  server.get('/drivers', async (request, reply) => {
    const drivers = await prisma.driverRecord.findMany({
      orderBy: { driverName: 'asc' },
    });
    return reply.send({ success: true, data: drivers });
  });

  server.post('/drivers', async (request, reply) => {
    const parsed = driverRecordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const driver = await prisma.driverRecord.create({
      data: parsed.data,
    });
    return reply.status(201).send({ success: true, data: driver });
  });

  // --- 3. Trip Details & Dispatches ---
  server.get('/trips', async (request, reply) => {
    const user = getCurrentUser(request);
    
    // If user is DRIVER, prioritize trips where driverName matches or returns all
    const trips = await prisma.tripRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: trips });
  });

  server.post('/trips', async (request, reply) => {
    const parsed = tripRecordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const trip = await prisma.tripRecord.create({
      data: {
        tripNumber: parsed.data.tripNumber || `TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        origin: parsed.data.origin,
        destination: parsed.data.destination,
        vehicleNumber: parsed.data.vehicleNumber,
        driverName: parsed.data.driverName,
        cargoDescription: parsed.data.cargoDescription,
        weightTons: parsed.data.weightTons,
        status: parsed.data.status,
        departureTime: parsed.data.departureTime,
        estimatedArrival: parsed.data.estimatedArrival,
        actualArrival: parsed.data.actualArrival,
        driverNotes: parsed.data.driverNotes,
        lastOdometerKm: parsed.data.lastOdometerKm,
      },
    });

    // Mark vehicle as in transit
    await prisma.fleetVehicle.updateMany({
      where: { vehicleNumber: parsed.data.vehicleNumber },
      data: { status: 'IN_TRANSIT' },
    });

    return reply.status(201).send({ success: true, data: trip });
  });

  // Update Trip Status (Accessible by Driver & Fleet Dispatcher)
  const updateStatusSchema = z.object({
    status: z.enum(['PLANNED', 'IN_TRANSIT', 'DELAYED', 'DELIVERED', 'CANCELLED']),
    driverNotes: z.string().optional(),
    actualArrival: z.string().optional(),
    odometerKm: z.number().optional(),
  });

  server.patch<{ Params: { id: string } }>('/trips/:id/status', async (request, reply) => {
    const { id } = request.params;
    const parsed = updateStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.format() });
    }

    const existingTrip = await prisma.tripRecord.findUnique({ where: { id } });
    if (!existingTrip) {
      return reply.status(404).send({ success: false, error: { message: 'Trip not found' } });
    }

    const updated = await prisma.tripRecord.update({
      where: { id },
      data: {
        status: parsed.data.status,
        driverNotes: parsed.data.driverNotes ?? existingTrip.driverNotes,
        actualArrival: parsed.data.actualArrival ?? (parsed.data.status === 'DELIVERED' ? new Date().toISOString() : existingTrip.actualArrival),
        lastOdometerKm: parsed.data.odometerKm ?? existingTrip.lastOdometerKm,
      },
    });

    // If delivered, mark vehicle as available
    if (parsed.data.status === 'DELIVERED') {
      await prisma.fleetVehicle.updateMany({
        where: { vehicleNumber: existingTrip.vehicleNumber },
        data: {
          status: 'AVAILABLE',
          lastOdometerKm: parsed.data.odometerKm ?? existingTrip.lastOdometerKm ?? 0,
        },
      });
    }

    return reply.send({ success: true, data: updated });
  });
};

