import { PrismaClient } from '../generated/prisma/index.js';

// Test database setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

// Clean database before each test
beforeEach(async () => {
  // Clean up in reverse order due to foreign key constraints
  await prisma.reviews.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.milestones.deleteMany();
  await prisma.contracts.deleteMany();
  await prisma.proposals.deleteMany();
  await prisma.jobs.deleteMany();
  await prisma.notifications.deleteMany();
  await prisma.files.deleteMany();
  await prisma.users.deleteMany();
});

// Close database connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

global.prisma = prisma;