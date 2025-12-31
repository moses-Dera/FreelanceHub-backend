import { jest, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { prismaMock } from './prismaMock.js'; // Ensure .js extension
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

    test('POST /api/auth/register should register a new user', async () => {
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        prismaMock.Users.create.mockResolvedValue(mockUser as any);

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
        expect(prismaMock.Users.create).toHaveBeenCalled();
    });

    test('POST /api/auth/login should login user', async () => {
        prismaMock.Users.findUnique.mockResolvedValue(mockUser as any);
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
});
