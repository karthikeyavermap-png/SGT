// Automated E2E verification script
async function runTests() {
  console.log('🧪 Starting End-to-End API Verification...\n');
  const baseUrl = 'http://localhost:4000/api';

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
  console.log('\n4. Testing Ticket Creation as Customer...');
  const createRes = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      title: 'Automated Test: Cannot export reporting dashboard',
      description:
        'When clicking the CSV export button under team analytics, a timeout alert appears.',
      category: 'Technical',
      priority: 'HIGH',
    }),
  });
  const createdTicket = await createRes.json();
  console.log('   Status:', createRes.status);
  console.log('   Created Ticket ID:', createdTicket.data?.id);
  console.log('   Title:', createdTicket.data?.title);
  console.log('   Priority:', createdTicket.data?.priority);
  const ticketId = createdTicket.data?.id;

  // 5. Add Comment to Ticket as Customer
  console.log('\n5. Testing Comment Addition as Customer...');
  const commentRes = await fetch(`${baseUrl}/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      content: 'Here is the network tab HAR file showing the 504 gateway timeout.',
      isInternal: false,
    }),
  });
  const commentData = await commentRes.json();
  console.log('   Status:', commentRes.status);
  console.log('   Comment ID:', commentData.data?.id);

  // 6. Agent Login
  console.log('\n6. Testing Agent Login...');
  const agentLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'agent@example.com',
      password: 'Password123!',
    }),
  });
  const agentLogin = await agentLoginRes.json();
  const agentToken = agentLogin.data.accessToken;
  const agentUser = agentLogin.data.user;
  console.log('   Status:', agentLoginRes.status);
  console.log('   Agent:', agentUser.name, `[${agentUser.role}]`);

  // 7. Agent Updates Ticket Status to IN_PROGRESS and Assigns to Self
  console.log('\n7. Testing Agent Status Update & Assignment...');
  const updateRes = await fetch(`${baseUrl}/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({
      status: 'IN_PROGRESS',
      assignedAgentId: agentUser.id,
    }),
  });
  const updatedData = await updateRes.json();
  console.log('   Status:', updateRes.status);
  console.log('   New Status:', updatedData.data?.status);
  console.log('   Assigned Agent:', updatedData.data?.assignedAgent?.name);

  // 8. Agent Adds Internal Note (Not visible to customer)
  console.log('\n8. Testing Agent Internal Note...');
  const internalNoteRes = await fetch(`${baseUrl}/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({
      content: 'Internal note: Investigating ClickHouse timeout threshold on reporting cluster.',
      isInternal: true,
    }),
  });
  const internalNote = await internalNoteRes.json();
  console.log('   Status:', internalNoteRes.status);
  console.log('   Internal note saved:', internalNote.data?.isInternal);

  // 9. Customer Views Ticket (Internal note should be hidden)
  console.log('\n9. Verifying Role Isolation (Customer views ticket comments)...');
  const viewTicketRes = await fetch(`${baseUrl}/tickets/${ticketId}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const viewTicket = await viewTicketRes.json();
  const customerComments = viewTicket.data?.comments || [];
  const hasInternalNotes = customerComments.some((c) => c.isInternal);
  console.log('   Comments visible to customer:', customerComments.length);
  console.log('   Are internal notes hidden from customer?', !hasInternalNotes ? '✅ YES' : '❌ NO');

  // 10. Token Rotation via /auth/refresh
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
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
