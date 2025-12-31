import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { prismaMock } from './prismaMock.js';
import app from '../server.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('bcrypt', () => ({
    __esModule: true,
    default: {
        hash: jest.fn(),
        compare: jest.fn(),
    },
}));

jest.mock('jsonwebtoken', () => ({
    __esModule: true,
    default: {
        sign: jest.fn(),
        verify: jest.fn(),
    },
}));

jest.mock('nodemailer', () => ({
    __esModule: true,
    default: {
        createTransport: jest.fn().mockReturnValue({
            sendMail: jest.fn().mockResolvedValue(true)
        })
    }
}));

describe('Auth Endpoints', () => {
    const mockUser = {
        id: '123',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'FREELANCER',
        rating: 0,
        walletBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockAdmin = {
        ...mockUser,
        role: 'ADMIN'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock for jwt.verify (simulate authenticated user for protected routes)
        (jwt.verify as jest.Mock).mockReturnValue({ userId: '123', email: 'test@example.com', role: 'FREELANCER' });
        // Default prisma findUnique response for auth middleware
        prismaMock.users.findUnique.mockResolvedValue(mockUser as any);
    });

    test('POST /api/auth/register should register a new user', async () => {
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        prismaMock.users.create.mockResolvedValue(mockUser as any);

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'FREELANCER'
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
        expect(prismaMock.users.create).toHaveBeenCalled();
    });

    test('POST /api/auth/login should login user', async () => {
        prismaMock.users.findUnique.mockResolvedValue(mockUser as any);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue('mockToken');

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token', 'mockToken');
    });

    test('POST /api/auth/logout should logout user', async () => {
        const res = await request(app)
            .post('/api/auth/logout');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Logout successful');
    });

    test('POST /api/auth/refresh-token should refresh access token', async () => {
        // Mock jwt.verify to return a valid decoded token
        (jwt.verify as jest.Mock).mockReturnValue({ userId: '123', email: 'test@example.com' });
        prismaMock.users.findUnique.mockResolvedValue(mockUser as any);
        (jwt.sign as jest.Mock).mockReturnValue('newAccessToken');

        const res = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken: 'validRefreshToken' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken', 'newAccessToken');
    });

    test('POST /api/auth/delete/:id should delete user (ADMIN only)', async () => {
        // Override mock for ADMIN role
        (jwt.verify as jest.Mock).mockReturnValue({ userId: '123', email: 'test@example.com', role: 'ADMIN' });
        prismaMock.users.findUnique.mockResolvedValue(mockAdmin as any);
        prismaMock.users.delete.mockResolvedValue(mockUser as any);

        const res = await request(app)
            .post('/api/auth/delete/123')
            .set('Authorization', 'Bearer adminToken');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User deleted successfully');
    });
});
