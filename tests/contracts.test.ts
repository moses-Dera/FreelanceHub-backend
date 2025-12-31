import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { prismaMock } from './prismaMock.js';
import app from '../server.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
    __esModule: true,
    default: {
        verify: jest.fn(),
    },
}));

describe('Contract Endpoints', () => {
    const mockContract = {
        id: 1,
        jobId: 1,
        clientId: 'client-uuid',
        freelancerId: 'freelancer-uuid',
        startDate: new Date(),
        endDate: new Date(),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        (jwt.verify as jest.Mock).mockReturnValue({ userId: 'client-uuid', role: 'CLIENT' });
        prismaMock.Users.findUnique.mockResolvedValue({ id: 'client-uuid', role: 'CLIENT' } as any);
    });

    test('POST /api/contracts should create contract', async () => {
        // Mock successful proposal lookup check
        prismaMock.Proposals.findUnique.mockResolvedValue({
            id: 'prop-id',
            job: { clientId: 'client-uuid' }
        } as any);

        prismaMock.Contracts.create.mockResolvedValue(mockContract as any);
        prismaMock.Proposals.update.mockResolvedValue({} as any);
        prismaMock.Jobs.update.mockResolvedValue({} as any);

        const res = await request(app)
            .post('/api/contracts')
            .set('Authorization', 'Bearer validtoken')
            .send({
                proposalId: 'prop-id',
                jobId: 1,
                freelancerId: 'freelancer-uuid',
                startDate: '2025-01-01',
                endDate: '2025-02-01'
            });

        expect(res.status).toBe(201);
        expect(res.body.contract.id).toBe(1);
    });
});
