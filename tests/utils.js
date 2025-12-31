import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Test data factories
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 10),
    role: 'FREELANCER',
    ...overrides
  };

  return await prisma.users.create({
    data: defaultUser
  });
};

export const createTestClient = async (overrides = {}) => {
  return await createTestUser({
    fullName: 'Test Client',
    email: 'client@example.com',
    role: 'CLIENT',
    ...overrides
  });
};

export const createTestJob = async (clientId, overrides = {}) => {
  const defaultJob = {
    title: 'Test Job',
    description: 'Test job description',
    budgetMin: '100',
    budgetMax: '500',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    clientId,
    ...overrides
  };

  return await prisma.jobs.create({
    data: defaultJob
  });
};

export const createTestProposal = async (userId, jobId, overrides = {}) => {
  const defaultProposal = {
    userId,
    jobId,
    coverLetter: 'Test cover letter',
    expectedSalary: 300,
    ...overrides
  };

  return await prisma.proposals.create({
    data: defaultProposal
  });
};

// JWT token generation for testing
export const generateTestToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// API request helpers
export const makeAuthenticatedRequest = (token) => {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};