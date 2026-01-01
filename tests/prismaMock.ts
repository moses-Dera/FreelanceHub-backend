import { jest, beforeEach } from '@jest/globals';
import { mockDeep, type DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient } from '../generated/prisma/client';
import { prisma } from '../lib/prisma.js';

jest.mock('../lib/prisma.js', () => ({
    __esModule: true,
    prisma: mockDeep<PrismaClient>(),
}));

jest.mock('../lib/prisma.ts', () => ({
    __esModule: true,
    prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
    jest.clearAllMocks();
});



