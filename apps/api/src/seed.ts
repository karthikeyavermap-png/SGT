import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, TicketStatus, TicketPriority } from '@repo/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.comment.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      name: 'System Admin',
      role: UserRole.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: 'agent@example.com',
      passwordHash,
      name: 'Agent James',
      role: UserRole.AGENT,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'sarah.agent@example.com',
      passwordHash,
      name: 'Agent Sarah Connor',
      role: UserRole.AGENT,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash,
      name: 'Alex Rivera',
      role: UserRole.CUSTOMER,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'elena@example.com',
      passwordHash,
      name: 'Elena Rostova',
      role: UserRole.CUSTOMER,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
  });

  console.log('✅ Created users:');
  console.log('   - Admin:    admin@example.com / Password123!');
  console.log('   - Agent:    agent@example.com / Password123!');
  console.log('   - Customer: customer@example.com / Password123!');

  // 2. Create Tickets
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

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'SSO Integration SAML assertion timeout',
      description:
        'Our Okta enterprise identity provider reports sporadic SAML validation handshake timeouts during peak morning login spikes (around 9:00 AM UTC).',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: 'Technical',
      customerId: customer1.id,
      assignedAgentId: agent2.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Dark mode preference not persisting across sessions',
      description:
        'Whenever I reload the browser or clear cookies, the theme reverts from dark to light mode automatically.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      category: 'Bug Report',
      customerId: customer2.id,
      assignedAgentId: agent1.id,
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: 'Requesting bulk CSV export of resolved tickets',
      description:
        'We need an automated monthly export of all resolved tickets with customer satisfaction scores and resolution times for compliance review.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      category: 'Feature Request',
      customerId: customer2.id,
    },
  });

  const ticket5 = await prisma.ticket.create({
    data: {
      title: 'Two-Factor authentication reset for locked account',
      description:
        'Customer lost access to their authenticator device while traveling overseas and requires identity verification to reset 2FA.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.URGENT,
      category: 'Account',
      customerId: customer1.id,
      assignedAgentId: agent1.id,
    },
  });

  // 3. Create Sample Comments
  await prisma.comment.create({
    data: {
      content:
        'Thank you for reporting this issue. I have escalated this to our payment gateway provider and verified your merchant ID.',
      ticketId: ticket1.id,
      authorId: agent1.id,
      isInternal: false,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        'Internal note: Gateway webhook responded with ERR_REAUTH_REQUIRED. Cleared cached auth token on payment worker.',
      ticketId: ticket1.id,
      authorId: agent1.id,
      isInternal: true,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        'Here is the screenshot of the console log showing the certificate handshake timing out after 15000ms.',
      ticketId: ticket2.id,
      authorId: customer1.id,
      isInternal: false,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        'We applied hotfix 2.14.1 which stores theme preference in localStorage and synchronizes with user profile on login.',
      ticketId: ticket3.id,
      authorId: agent1.id,
      isInternal: false,
    },
  });

  console.log('✅ Created sample tickets and conversation timelines.');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
