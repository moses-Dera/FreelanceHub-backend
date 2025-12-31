import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import userRoutes from '../routes/userRoutes.js';
import { createTestUser } from './utils.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', userRoutes);

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'FREELANCER'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.userId).toBeDefined();
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'CLIENT'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    test('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User'
          // Missing email and password
        })
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      // Create test user
      const user = await createTestUser({
        email: 'login@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.id).toBe(user.id);
      expect(response.body.user.email).toBe(user.email);
    });

    test('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should fail with invalid password', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: await bcrypt.hash('correctpassword', 10)
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logout successful');
    });
  });
});