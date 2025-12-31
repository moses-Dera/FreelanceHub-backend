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

describe('Proposal Endpoints', () => {
    const mockProposal = {
        id: 'prop-uuid',
        jobId: 1,
        userId: 'freelancer-uuid',
        coverLetter: 'Hire me',
        expectedSalary: 1500,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Mock auth middleware for protected routes
    beforeEach(() => {
        console.log('JWT Object:', jwt);
        console.log('JWT Verify:', jwt.verify);
        (jwt.verify as jest.Mock).mockReturnValue({ userId: 'freelancer-uuid', role: 'FREELANCER' });
        prismaMock.Users.findUnique.mockResolvedValue({ id: 'freelancer-uuid', role: 'FREELANCER' } as any);
    });

    test('POST /api/jobs/:id/proposals should create proposal', async () => {
        prismaMock.Proposals.create.mockResolvedValue(mockProposal as any);

        const res = await request(app)
            .post('/api/jobs/1/proposals')
            .set('Authorization', 'Bearer validtoken')
            .send({
                coverLetter: 'Hire me',
                expectedSalary: 1500
            });

        expect(res.status).toBe(201);
        expect(res.body.proposal.id).toBe('prop-uuid');
    });

    test('GET /api/proposals/:id should return proposal', async () => {
        prismaMock.Proposals.findUnique.mockResolvedValue(mockProposal as any);

        const res = await request(app)
            .get('/api/proposals/prop-uuid')
            .set('Authorization', 'Bearer validtoken');

        expect(res.status).toBe(200);
        expect(res.body.id).toBe('prop-uuid');
    });
});
