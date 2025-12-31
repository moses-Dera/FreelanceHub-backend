import request from 'supertest';
import express from 'express';
import jobRoutes from '../routes/jobRoutes.js';
import { createTestClient, createTestJob, generateTestToken, makeAuthenticatedRequest } from './utils.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/jobs', jobRoutes);

describe('Job Endpoints', () => {
  let client, clientToken;

  beforeEach(async () => {
    client = await createTestClient();
    clientToken = generateTestToken(client.id, client.email);
  });

  describe('POST /api/jobs', () => {
    test('should create a new job successfully', async () => {
      const jobData = {
        title: 'Web Development Project',
        description: 'Build a modern web application',
        budgetMin: '1000',
        budgetMax: '5000',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        clientId: client.id
      };

      const response = await request(app)
        .post('/api/jobs')
        .set(makeAuthenticatedRequest(clientToken).headers)
        .send(jobData)
        .expect(201);

      expect(response.body.message).toBe('Job added successfully');
      expect(response.body.jobId).toBeDefined();
    });

    test('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set(makeAuthenticatedRequest(clientToken).headers)
        .send({
          title: 'Incomplete Job'
          // Missing required fields
        })
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/jobs', () => {
    test('should get all jobs', async () => {
      // Create test jobs
      await createTestJob(client.id, { title: 'Job 1' });
      await createTestJob(client.id, { title: 'Job 2' });

      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    test('should search jobs by title', async () => {
      await createTestJob(client.id, { title: 'React Developer' });
      await createTestJob(client.id, { title: 'Python Developer' });

      const response = await request(app)
        .get('/api/jobs?search=React')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('React Developer');
    });

    test('should filter jobs by description', async () => {
      await createTestJob(client.id, { 
        title: 'Job 1', 
        description: 'Frontend development with React' 
      });
      await createTestJob(client.id, { 
        title: 'Job 2', 
        description: 'Backend development with Node.js' 
      });

      const response = await request(app)
        .get('/api/jobs?filter=React')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].description).toContain('React');
    });
  });

  describe('GET /api/jobs/:id', () => {
    test('should get a specific job', async () => {
      const job = await createTestJob(client.id);

      const response = await request(app)
        .get(`/api/jobs/${job.id}`)
        .expect(200);

      expect(response.body.id).toBe(job.id);
      expect(response.body.title).toBe(job.title);
    });

    test('should return null for non-existent job', async () => {
      const response = await request(app)
        .get('/api/jobs/99999')
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('PUT /api/jobs/:id', () => {
    test('should update a job successfully', async () => {
      const job = await createTestJob(client.id);
      const updateData = {
        title: 'Updated Job Title',
        description: 'Updated description',
        budgetMin: '2000',
        budgetMax: '8000'
      };

      const response = await request(app)
        .put(`/api/jobs/${job.id}`)
        .set(makeAuthenticatedRequest(clientToken).headers)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Job updated successfully');
      expect(response.body.job.title).toBe('Updated Job Title');
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    test('should delete a job successfully', async () => {
      const job = await createTestJob(client.id);

      const response = await request(app)
        .delete(`/api/jobs/${job.id}`)
        .set(makeAuthenticatedRequest(clientToken).headers)
        .expect(200);

      expect(response.body.message).toBe('Job deleted successfully');
    });
  });
});