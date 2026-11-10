import { spawn } from 'child_process';

const API_PORT = 4055;
const BASE_URL = `http://127.0.0.1:${API_PORT}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startServer() {
  console.log(`Starting Fastify server on port ${API_PORT}...`);
  const serverProcess = spawn('node', ['apps/api/dist/server.mjs'], {
    env: {
      ...process.env,
      PORT: String(API_PORT),
      DATABASE_URL: 'file:./dev.db',
      JWT_SECRET: 'test-secret-key-1234567890',
    },
    stdio: 'inherit',
  });

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) {
        console.log('✅ Server online!');
        return serverProcess;
      }
    } catch (e) {
      // waiting
    }
    await sleep(400);
  }
  throw new Error('Server failed to start');
}

async function login(email, password = 'Password123!') {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  }
  return { token: data.data.accessToken, user: data.data.user };
}

async function testAccess(token, endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.status;
}

async function run() {
  let serverProcess;
  try {
    serverProcess = await startServer();

    console.log('\n--- 1. Testing Role Authentication ---');
    const sa = await login('superadmin@sgt.com');
    console.log(`✅ Super Admin logged in: ${sa.user.name} (${sa.user.role})`);

    const ym = await login('yardmgr@sgt.com');
    console.log(`✅ Yard Manager logged in: ${ym.user.name} (${ym.user.role})`);

    const fd = await login('dispatcher@sgt.com');
    console.log(`✅ Fleet Dispatcher logged in: ${fd.user.name} (${fd.user.role})`);

    const ae = await login('accounts@sgt.com');
    console.log(`✅ Accounts Exec logged in: ${ae.user.name} (${ae.user.role})`);

    const au = await login('auditor@sgt.com');
    console.log(`✅ Auditor logged in: ${au.user.name} (${au.user.role})`);

    const dr = await login('driver@sgt.com');
    console.log(`✅ Driver logged in: ${dr.user.name} (${dr.user.role})`);

    console.log('\n--- 2. Testing Module Authorization & RBAC Matrix ---');

    // Super Admin: All 3 modules should return 200
    const saYard = await testAccess(sa.token, '/api/modules/yard-maintenance/allowances');
    const saFleet = await testAccess(sa.token, '/api/modules/transport-fleet/vehicles');
    const saAccounts = await testAccess(sa.token, '/api/modules/office-accounts/invoices');
    console.log(`Super Admin access: Yard=${saYard}, Fleet=${saFleet}, Accounts=${saAccounts}`);
    if (saYard !== 200 || saFleet !== 200 || saAccounts !== 200) {
      throw new Error('Super Admin access test failed');
    }

    // Yard Manager: Yard=200, Fleet=403, Accounts=403
    const ymYard = await testAccess(ym.token, '/api/modules/yard-maintenance/allowances');
    const ymFleet = await testAccess(ym.token, '/api/modules/transport-fleet/vehicles');
    const ymAccounts = await testAccess(ym.token, '/api/modules/office-accounts/invoices');
    console.log(`Yard Manager access: Yard=${ymYard} (expected 200), Fleet=${ymFleet} (expected 403), Accounts=${ymAccounts} (expected 403)`);
    if (ymYard !== 200 || ymFleet !== 403 || ymAccounts !== 403) {
      throw new Error('Yard Manager RBAC isolation test failed');
    }

    // Fleet Dispatcher: Yard=403, Fleet=200, Accounts=403
    const fdYard = await testAccess(fd.token, '/api/modules/yard-maintenance/allowances');
    const fdFleet = await testAccess(fd.token, '/api/modules/transport-fleet/vehicles');
    const fdAccounts = await testAccess(fd.token, '/api/modules/office-accounts/invoices');
    console.log(`Fleet Dispatcher access: Yard=${fdYard} (expected 403), Fleet=${fdFleet} (expected 200), Accounts=${fdAccounts} (expected 403)`);
    if (fdYard !== 403 || fdFleet !== 200 || fdAccounts !== 403) {
      throw new Error('Fleet Dispatcher RBAC isolation test failed');
    }

    // Driver: Fleet=200, Yard=403, Accounts=403
    const drFleet = await testAccess(dr.token, '/api/modules/transport-fleet/trips');
    const drYard = await testAccess(dr.token, '/api/modules/yard-maintenance/allowances');
    console.log(`Driver access: Fleet Trips=${drFleet} (expected 200), Yard=${drYard} (expected 403)`);
    if (drFleet !== 200 || drYard !== 403) {
      throw new Error('Driver RBAC isolation test failed');
    }

    // Accounts Executive: Accounts=200, Yard=403, Fleet=403
    const aeAccounts = await testAccess(ae.token, '/api/modules/office-accounts/invoices');
    const aeYard = await testAccess(ae.token, '/api/modules/yard-maintenance/allowances');
    console.log(`Accounts Exec access: Accounts=${aeAccounts} (expected 200), Yard=${aeYard} (expected 403)`);
    if (aeAccounts !== 200 || aeYard !== 403) {
      throw new Error('Accounts Exec RBAC isolation test failed');
    }

    // Auditor: All=200
    const auYard = await testAccess(au.token, '/api/modules/yard-maintenance/allowances');
    const auFleet = await testAccess(au.token, '/api/modules/transport-fleet/vehicles');
    const auAccounts = await testAccess(au.token, '/api/modules/office-accounts/invoices');
    console.log(`Auditor access: Yard=${auYard}, Fleet=${auFleet}, Accounts=${auAccounts} (all expected 200)`);
    if (auYard !== 200 || auFleet !== 200 || auAccounts !== 200) {
      throw new Error('Auditor RBAC test failed');
    }

    console.log('\n--- 3. Testing Driver Trip Status Update ---');
    const tripsRes = await (await fetch(`${BASE_URL}/api/modules/transport-fleet/trips`, {
      headers: { Authorization: `Bearer ${dr.token}` },
    })).json();
    const tripToUpdate = tripsRes.data[0];

    const updateRes = await fetch(`${BASE_URL}/api/modules/transport-fleet/trips/${tripToUpdate.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dr.token}`,
      },
      body: JSON.stringify({
        status: 'DELIVERED',
        driverNotes: 'Delivered at terminal dock. Received signed physical gate pass.',
        odometerKm: 98520,
      }),
    });
    const updateData = await updateRes.json();
    console.log(`✅ Trip update status: ${updateRes.status}, New Status: ${updateData.data.status}`);
    if (updateRes.status !== 200 || updateData.data.status !== 'DELIVERED') {
      throw new Error('Trip status update failed');
    }

    console.log('\n🎉 ALL ROLE & OPERATIONAL MODULE TESTS PASSED 100%!');
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
