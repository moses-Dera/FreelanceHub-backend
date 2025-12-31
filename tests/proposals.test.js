import request from 'supertest';
import express from 'express';
import proposalRoutes from '../routes/proposalRoutes.js';
import { 
  createTestUser, 
  createTestClient, 
  createTestJob, 
  createTestProposal,
  generateTestToken, 
  makeAuthenticatedRequest 
} from './utils.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api', proposalRoutes);

describe('Proposal Endpoints', () => {
  let freelancer, client, job, freelancerToken, clientToken;

  beforeEach(async () => {
    freelancer = await createTestUser();
    client = await createTestClient();
    job = await createTestJob(client.id);
    freelancerToken = generateTestToken(freelancer.id, freelancer.email);
    clientToken = generateTestToken(client.id, client.email);
  });

  describe('POST /api/jobs/:id/proposals', () => {
    test('should create a proposal successfully', async () => {
      const proposalData = {
        coverLetter: 'I am interested in this project',
        expectedSalary: 2500,
        resumeUrl: 'https://example.com/resume.pdf',
        portfolioLinks: ['https://portfolio.com', 'https://github.com/user'],
        attachments: ['document1.pdf', 'document2.pdf']
      };

      // Mock req.user for authentication
      const response = await request(app)
        .post(`/api/jobs/${job.id}/proposals`)
        .set(makeAuthenticatedRequest(freelancerToken).headers)
        .send(proposalData)
        .expect(201);

      expect(response.body.message).toBe('Proposal added successfully');
      expect(response.body.proposal).toBeDefined();
      expect(response.body.proposal.coverLetter).toBe(proposalData.coverLetter);
    });

    test('should fail with invalid job ID', async () => {
      const proposalData = {
        coverLetter: 'Test proposal',
        expectedSalary: 1000
      };

      const response = await request(app)
        .post('/api/jobs/99999/proposals')
        .set(makeAuthenticatedRequest(freelancerToken).headers)
        .send(proposalData)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/jobs/:id/proposals', () => {
    test('should get all proposals for a job', async () => {
      // Create test proposals
      await createTestProposal(freelancer.id, job.id);
      const anotherFreelancer = await createTestUser({ email: 'freelancer2@example.com' });
      await createTestProposal(anotherFreelancer.id, job.id);

      const response = await request(app)
        .get(`/api/jobs/${job.id}/proposals`)
        .set(makeAuthenticatedRequest(clientToken).headers)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].user).toBeDefined();
      expect(response.body[0].user.fullName).toBeDefined();
    });

    test('should return empty array for job with no proposals', async () => {
      const response = await request(app)
        .get(`/api/jobs/${job.id}/proposals`)
        .set(makeAuthenticatedRequest(clientToken).headers)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/proposals/:id', () => {
    test('should get a specific proposal', async () => {
      const proposal = await createTestProposal(freelancer.id, job.id);

      const response = await request(app)
        .get(`/api/proposals/${proposal.id}`)
        .set(makeAuthenticatedRequest(freelancerToken).headers)
        .expect(200);

      expect(response.body.id).toBe(proposal.id);
      expect(response.body.user).toBeDefined();
      expect(response.body.job).toBeDefined();
      expect(response.body.user.fullName).toBe(freelancer.fullName);
    });

    test('should return 404 for non-existent proposal', async () => {
      const response = await request(app)
        .get('/api/proposals/non-existent-id')
        .set(makeAuthenticatedRequest(freelancerToken).headers)
        .expect(404);

      expect(response.body.error).toBe('Proposal not found');
    });
  });

  describe('Proposal Status Updates', () => {
    test('should update proposal status to ACCEPTED', async () => {
      const proposal = await createTestProposal(freelancer.id, job.id);

      // This would typically be done through a separate endpoint
      // For now, we'll test the database update directly
      const updatedProposal = await global.prisma.proposals.update({
        where: { id: proposal.id },
        data: { status: 'ACCEPTED' }
      });

      expect(updatedProposal.status).toBe('ACCEPTED');
    });

    test('should update proposal status to REJECTED', async () => {
      const proposal = await createTestProposal(freelancer.id, job.id);

      const updatedProposal = await global.prisma.proposals.update({
        where: { id: proposal.id },
        data: { status: 'REJECTED', reviewNotes: 'Not a good fit' }
      });

      expect(updatedProposal.status).toBe('REJECTED');
      expect(updatedProposal.reviewNotes).toBe('Not a good fit');
    });
  });
});