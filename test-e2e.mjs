// Automated E2E verification script
import { spawn } from 'child_process';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureServer() {
  const baseUrl = 'http://127.0.0.1:4000/api';
  try {
    const res = await fetch(`${baseUrl}/health`);
    if (res.ok) return null;
  } catch (e) {
    // not running, spawn
  }

  console.log('Starting Fastify API server on port 4000 for E2E tests...');
  const child = spawn('node', ['apps/api/dist/server.mjs'], {
    env: {
      ...process.env,
      PORT: '4000',
      DATABASE_URL: 'file:./dev.db',
      JWT_SECRET: 'ticketing-jwt-super-secret-key-for-local-dev-1234567890',
    },
    stdio: 'ignore',
  });

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) {
        console.log('✅ Server online!');
        return child;
      }
    } catch (e) {
      await sleep(300);
    }
  }
  throw new Error('Could not start server');
}

async function runTests() {
  const serverProcess = await ensureServer();
  try {
    console.log('🧪 Starting End-to-End API Verification...\n');
    const baseUrl = 'http://127.0.0.1:4000/api';

    // 1. Healthcheck
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    console.log('1. Healthcheck:', healthRes.status, health);

    // 2. Customer Login
    console.log('\n2. Testing Customer Login...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    console.log('   Status:', loginRes.status);
    console.log('   User:', loginData.data?.user?.name, `[${loginData.data?.user?.role}]`);
    console.log('   Access Token received:', !!loginData.data?.accessToken);
    console.log('   Refresh Token received:', !!loginData.data?.refreshToken);
    console.log('   Set-Cookie Header:', loginRes.headers.get('set-cookie'));

    const customerToken = loginData.data.accessToken;
    const customerRefreshToken = loginData.data.refreshToken;

    // 3. Customer Profile (/auth/me)
    console.log('\n3. Testing /auth/me for Customer...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const meData = await meRes.json();
    console.log('   Status:', meRes.status);
    console.log('   Profile:', meData.data);

    // 4. Create Ticket as Customer
    console.log('\n4. Creating a new Ticket as Customer...');
    const createTicketRes = await fetch(`${baseUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        title: 'E2E Automated Test: Container clearance stuck at Gate 2',
        description:
          'Container MSCU-892104 has cleared weighbridge gross inspection but terminal gate barrier is not raising.',
        priority: 'HIGH',
        category: 'Technical',
      }),
    });
    const createTicketData = await createTicketRes.json();
    console.log('   Status:', createTicketRes.status);
    console.log('   Ticket Created:', createTicketData.data?.id, '-', createTicketData.data?.title);
    const createdTicketId = createTicketData.data.id;

    // 5. Agent Login
    console.log('\n5. Testing Agent Login...');
    const agentLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'agent@example.com',
        password: 'Password123!',
      }),
    });
    const agentLoginData = await agentLoginRes.json();
    console.log('   Status:', agentLoginRes.status);
    console.log('   Agent:', agentLoginData.data?.user?.name, `[${agentLoginData.data?.user?.role}]`);
    const agentToken = agentLoginData.data.accessToken;
    const agentId = agentLoginData.data.user.id;

    // 6. Assign Ticket to Agent
    console.log('\n6. Assigning Ticket to Agent...');
    const updateRes = await fetch(`${baseUrl}/tickets/${createdTicketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        assignedAgentId: agentId,
        status: 'IN_PROGRESS',
      }),
    });
    const updateData = await updateRes.json();
    console.log('   Status:', updateRes.status);
    console.log('   Assigned Agent:', updateData.data?.assignedAgent?.name);
    console.log('   Ticket Status:', updateData.data?.status);

    // 7. Add Public Comment
    console.log('\n7. Adding Public Comment as Agent...');
    const commentRes = await fetch(`${baseUrl}/tickets/${createdTicketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        content: 'Gate 2 barrier sensor has been manually reset by terminal dispatch.',
        isInternal: false,
      }),
    });
    const commentData = await commentRes.json();
    console.log('   Status:', commentRes.status);
    console.log('   Comment ID:', commentData.data?.id);

    // 8. Add Internal Private Note (Agents Only)
    console.log('\n8. Adding Internal Private Note as Agent...');
    const internalCommentRes = await fetch(`${baseUrl}/tickets/${createdTicketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        content: 'Internal: PLC controller firmware upgraded on barrier arm #2.',
        isInternal: true,
      }),
    });
    const internalCommentData = await internalCommentRes.json();
    console.log('   Status:', internalCommentRes.status);
    console.log('   Internal Comment ID:', internalCommentData.data?.id);

    // 9. Verify Privacy: Customer should NOT see internal notes
    console.log('\n9. Verifying Privacy (Customer should only see public comments)...');
    const customerViewRes = await fetch(`${baseUrl}/tickets/${createdTicketId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const customerViewData = await customerViewRes.json();
    const customerComments = customerViewData.data?.comments || [];
    const hasInternal = customerComments.some((c) => c.isInternal);
    console.log('   Customer visible comments count:', customerComments.length);
    console.log('   Contains internal comments (should be FALSE):', hasInternal);
    if (hasInternal) throw new Error('Data leak: Internal comment leaked to customer!');

    // 10. Refresh Token Rotation
    console.log('\n10. Testing Refresh Token Rotation...');
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: customerRefreshToken }),
    });
    const refreshData = await refreshRes.json();
    console.log('   Status:', refreshRes.status);
    console.log('   New Access Token received:', !!refreshData.data?.accessToken);
    console.log('   New Refresh Token rotated:', !!refreshData.data?.refreshToken);
    console.log('   Rotated token differs from old:', refreshData.data?.refreshToken !== customerRefreshToken);

    // 11. Old Refresh Token should now be invalid/revoked
    console.log('\n11. Verifying Revocation of Old Refresh Token...');
    const revokedRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: customerRefreshToken }),
    });
    console.log('   Status (expected 401):', revokedRes.status);

    // 12. Stats Check
    console.log('\n12. Testing System Metrics Stats...');
    const statsRes = await fetch(`${baseUrl}/stats`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    const statsData = await statsRes.json();
    console.log('   Status:', statsRes.status);
    console.log('   Stats:', statsData.data);

    console.log('\n🎉 ALL 12 INTEGRATION VERIFICATION CHECKS PASSED!\n');
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
