import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { prismaMock } from './prismaMock.js';
import app from '../server.js';

describe('Job Endpoints', () => {
    const mockJob = {
        id: 1,
        title: 'Frontend Developer',
        description: 'React expert needed',
        clientId: 'client-uuid',
        budgetMin: '1000',
        budgetMax: '2000',
        deadline: new Date(),
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    test('GET /api/jobs should return list of jobs', async () => {
        prismaMock.Jobs.findMany.mockResolvedValue([mockJob] as any);

        const res = await request(app).get('/api/jobs');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].title).toBe('Frontend Developer');
    });

    test('GET /api/jobs/:id should return single job', async () => {
        prismaMock.Jobs.findUnique.mockResolvedValue(mockJob as any);

        const res = await request(app).get('/api/jobs/1');

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Frontend Developer');
    });
});
