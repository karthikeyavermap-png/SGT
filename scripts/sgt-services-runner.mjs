// SGT Standalone Microservices Runner
// Hosts the microservices REST endpoints on their native ports (8081, 8082, 8083, 8000, 8080)
// providing full API responses and cross-service communication for standalone dev/preview.

import http from 'http';

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

// -----------------------------------------------------------------
// 1. Yard Microservice (Port 8081)
// -----------------------------------------------------------------
const yardBlocks = [
  { id: 1, blockCode: 'BLOCK-A', name: 'Heavy Steel & HR Coils Yard', totalBays: 10, totalRows: 4, maxTier: 3, totalCapacity: 120, currentOccupancy: 94 },
  { id: 2, blockCode: 'BLOCK-B', name: 'Bulk Minerals & Pellets', totalBays: 12, totalRows: 4, maxTier: 4, totalCapacity: 160, currentOccupancy: 118 },
  { id: 3, blockCode: 'BLOCK-C', name: 'Cement & Dry Bulk Clinker', totalBays: 8, totalRows: 4, maxTier: 3, totalCapacity: 80, currentOccupancy: 41 },
  { id: 4, blockCode: 'BLOCK-D', name: 'Empty Container Staging', totalBays: 10, totalRows: 3, maxTier: 4, totalCapacity: 100, currentOccupancy: 32 },
];

const yardMovements = [
  { id: 1, containerNumber: 'MSCU-892104', fromLocation: 'RAKE-SIDING-2', toLocation: 'BLOCK-A-BAY-02-T2', equipmentCode: 'RMG-01', operatorName: 'Rajesh Kumar', timestamp: new Date().toISOString() },
];

const yardServer = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/v1/yard/health' || url.pathname === '/health') {
    return sendJson(res, 200, { status: 'UP', service: 'yard-service', port: 8081, timestamp: Date.now() });
  }
  if (url.pathname === '/api/v1/yard/blocks') {
    return sendJson(res, 200, yardBlocks);
  }
  if (url.pathname === '/api/v1/yard/movements') {
    return sendJson(res, 200, yardMovements);
  }
  if (url.pathname === '/api/v1/yard/containers/assign-slot' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const movement = {
          id: yardMovements.length + 1,
          containerNumber: data.containerNumber || 'MSCU-NEW-01',
          fromLocation: 'GATE-IN-STAGING',
          toLocation: `${data.blockCode || 'BLOCK-A'}-B${data.bay || 1}-T${data.tier || 1}`,
          equipmentCode: 'RS-01',
          operatorName: 'Suresh More',
          timestamp: new Date().toISOString()
        };
        yardMovements.unshift(movement);
        return sendJson(res, 200, { success: true, movement });
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }
  return sendJson(res, 404, { error: 'Yard endpoint not found' });
});

// -----------------------------------------------------------------
// 2. Transport Microservice (Port 8082)
// -----------------------------------------------------------------
const rakes = [
  { id: 1, rakeNumber: 'RK-2026-ER-01', trainOperator: 'Indian Railways (East Coast)', totalWagons: 45, status: 'DISCHARGING', freeDetentionHours: 8.0, actualDetentionHours: 6.8, arrivalTime: 'Today, 06:15 AM' },
  { id: 2, rakeNumber: 'RK-2026-SER-14', trainOperator: 'South Eastern Freight', totalWagons: 58, status: 'COMPLETED', freeDetentionHours: 8.0, actualDetentionHours: 11.5, arrivalTime: 'Yesterday, 02:20 PM' },
  { id: 3, rakeNumber: 'RK-2026-WR-09', trainOperator: 'Western Railway Logistics', totalWagons: 50, status: 'INSPECTION', freeDetentionHours: 8.0, actualDetentionHours: 2.1, arrivalTime: 'Today, 10:45 AM' },
];

const transportServer = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/v1/transport/health' || url.pathname === '/health') {
    return sendJson(res, 200, { status: 'UP', service: 'transport-service', port: 8082, timestamp: Date.now() });
  }
  if (url.pathname === '/api/v1/transport/rakes') {
    return sendJson(res, 200, rakes);
  }
  return sendJson(res, 404, { error: 'Transport endpoint not found' });
});

// -----------------------------------------------------------------
// 3. Commercial Microservice (Port 8083)
// -----------------------------------------------------------------
const orders = [
  { id: 1, orderNumber: 'ORD-2026-901', customerName: 'Tata Steel Ltd.', customerCode: 'CUST-TATA', commodity: 'Cold Rolled Steel', quantityTons: 3500.0, ratePerTon: 180.0, totalContractValue: 630000.0, status: 'PROCESSING' },
  { id: 2, orderNumber: 'ORD-2026-902', customerName: 'JSW Infrastructure', customerCode: 'CUST-JSW', commodity: 'Iron Ore Pellets', quantityTons: 4200.0, ratePerTon: 140.0, totalContractValue: 588000.0, status: 'CONFIRMED' },
  { id: 3, orderNumber: 'ORD-2026-899', customerName: 'UltraTech Cement Ltd.', customerCode: 'CUST-ULTRA', commodity: 'Dry Flyash & Clinker', quantityTons: 2800.0, ratePerTon: 125.0, totalContractValue: 350000.0, status: 'BILLED' },
];

const invoices = [
  { id: 1, invoiceNumber: 'INV-SGT-2026-0042', customerName: 'UltraTech Cement Ltd.', customerCode: 'CUST-ULTRA', handlingCharges: 350000.0, storageCharges: 24000.0, demurrageCharges: 4500.0, taxAmount: 68130.0, totalAmount: 446630.0, status: 'PAID', issueDate: '2026-11-07' },
  { id: 2, invoiceNumber: 'INV-SGT-2026-0043', customerName: 'Tata Steel Ltd.', customerCode: 'CUST-TATA', handlingCharges: 630000.0, storageCharges: 45000.0, demurrageCharges: 6750.0, taxAmount: 122715.0, totalAmount: 804465.0, status: 'PENDING', issueDate: '2026-11-09' },
];

const demurrageRecords = [
  { id: 1, referenceId: 'RK-2026-ER-01', referenceType: 'RAKE', customerCode: 'CUST-TATA', freeHoursAllowed: 8.0, totalHoursHeld: 17.0, billableDemurrageHours: 9.0, hourlyRate: 750.0, totalDemurrageAmount: 6750.0, status: 'INVOICED' },
  { id: 2, referenceId: 'TRK-MH12-4921', referenceType: 'TRUCK', customerCode: 'CUST-JSW', freeHoursAllowed: 6.0, totalHoursHeld: 9.5, billableDemurrageHours: 3.5, hourlyRate: 600.0, totalDemurrageAmount: 2100.0, status: 'ACCRUING' },
];

const commercialServer = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/v1/commercial/health' || url.pathname === '/health') {
    return sendJson(res, 200, { status: 'UP', service: 'commercial-service', port: 8083, timestamp: Date.now() });
  }
  if (url.pathname === '/api/v1/commercial/orders') {
    return sendJson(res, 200, orders);
  }
  if (url.pathname === '/api/v1/commercial/invoices') {
    return sendJson(res, 200, invoices);
  }
  if (url.pathname === '/api/v1/commercial/demurrage') {
    return sendJson(res, 200, demurrageRecords);
  }
  return sendJson(res, 404, { error: 'Commercial endpoint not found' });
});

// -----------------------------------------------------------------
// 4. Analytics & Report Engine (Port 8000)
// -----------------------------------------------------------------
const analyticsServer = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/health' || url.pathname === '/api/v1/analytics/health') {
    return sendJson(res, 200, { status: 'UP', service: 'analytics-report-engine', port: 8000 });
  }
  if (url.pathname === '/api/v1/analytics/yard/summary') {
    return sendJson(res, 200, {
      totalSlots: 460,
      occupiedSlots: 285,
      occupancyPercentage: 62.0,
      totalCapacityTons: 85000,
      currentTons: 56100,
      blocks: yardBlocks,
      equipments: [
        { equipmentCode: 'RMG-01', type: 'RAIL_MOUNTED_GANTRY', status: 'ACTIVE', utilizationRate: 84.5 },
        { equipmentCode: 'RS-01', type: 'REACH_STACKER', status: 'ACTIVE', utilizationRate: 68.2 },
      ]
    });
  }
  if (url.pathname === '/api/v1/analytics/transport/summary') {
    return sendJson(res, 200, {
      averageRakeTatHours: 7.2,
      targetRakeTatHours: 8.0,
      rakesHandledToday: 4,
      rakesDetained: 1,
      averageTruckTatMinutes: 46.8,
      targetTruckTatMinutes: 45.0,
      truckGatePassesIssuedToday: 142
    });
  }
  if (url.pathname === '/api/v1/analytics/commercial/summary') {
    return sendJson(res, 200, {
      totalRevenueInr: 28450000.0,
      handledTonnageMT: 148500.0,
      totalDemurrageBilledInr: 384000.0,
      customerBreakdown: [
        { customerCode: 'CUST-TATA', customerName: 'Tata Steel Ltd.', revenueInr: 12400000.0, tonnageMT: 62000.0, demurrageInr: 182000.0 },
        { customerCode: 'CUST-JSW', customerName: 'JSW Infrastructure', revenueInr: 9650000.0, tonnageMT: 51000.0, demurrageInr: 126000.0 },
      ]
    });
  }
  return sendJson(res, 404, { error: 'Analytics endpoint not found' });
});

// -----------------------------------------------------------------
// 5. Unified API Gateway Proxy (Port 8080)
// -----------------------------------------------------------------
const gatewayServer = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  let targetPort = null;
  if (pathname.startsWith('/api/v1/yard')) targetPort = 8081;
  else if (pathname.startsWith('/api/v1/transport')) targetPort = 8082;
  else if (pathname.startsWith('/api/v1/commercial')) targetPort = 8083;
  else if (pathname.startsWith('/api/v1/analytics')) targetPort = 8000;
  else if (pathname.startsWith('/api/')) targetPort = 4000;
  else targetPort = 3000; // Web UI

  const proxyReq = http.request(
    {
      hostname: '127.0.0.1',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${targetPort}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    sendJson(res, 502, {
      error: `Gateway upstream connection failed to port ${targetPort}`,
      message: err.message,
    });
  });

  req.pipe(proxyReq);
});

// Start All Microservices
const ports = [
  { name: 'Yard Service', server: yardServer, port: 8081 },
  { name: 'Transport Service', server: transportServer, port: 8082 },
  { name: 'Commercial Service', server: commercialServer, port: 8083 },
  { name: 'Analytics Engine', server: analyticsServer, port: 8000 },
  { name: 'Unified API Gateway', server: gatewayServer, port: 8080 },
];

console.log('🚀 Starting Smart Goods Terminal (SGT) Microservices...');
for (const { name, server, port } of ports) {
  server.listen(port, '0.0.0.0', () => {
    console.log(`  ✓ ${name.padEnd(24)} running on http://localhost:${port}`);
  });
}

