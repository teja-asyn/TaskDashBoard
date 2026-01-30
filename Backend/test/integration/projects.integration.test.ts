import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import User from '../../src/models/User';
import Project from '../../src/models/Project';

describe('Projects API Integration Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await Project.deleteMany({});
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Project.deleteMany({});
    await User.deleteMany({ email: /test.*@example\.com/ });

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!@#',
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

    authToken = loginResponse.body.token;
  });

  describe('GET /api/projects', () => {
    it('should return empty array when user has no projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return user projects', async () => {
      // Create test projects
      await Project.create([
        { name: 'Project 1', description: 'Desc 1', ownerId: testUser._id },
        { name: 'Project 2', description: 'Desc 2', ownerId: testUser._id },
      ]);

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('_id');
    });

    it('should reject request without authentication', async () => {
      await request(app)
        .get('/api/projects')
        .expect(401);
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Project',
          description: 'Project description',
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('New Project');
      expect(response.body.description).toBe('Project description');
      expect(response.body.ownerId).toBe(testUser._id.toString());
    });

    it('should reject project creation without name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Project description',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject project creation with name too long', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A'.repeat(101), // Exceeds maxlength
          description: 'Project description',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test Description',
        ownerId: testUser._id,
      });
      projectId = project._id.toString();
    });

    it('should return project by id', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body._id).toBe(projectId);
      expect(response.body.name).toBe('Test Project');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .get(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject request without authentication', async () => {
      await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(401);
    });
  });

  describe('PUT /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await Project.create({
        name: 'Original Project',
        description: 'Original Description',
        ownerId: testUser._id,
      });
      projectId = project._id.toString();
    });

    it('should update project', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Project',
          description: 'Updated Description',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Project');
      expect(response.body.description).toBe('Updated Description');
    });

    it('should reject update for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .put(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Project',
        })
        .expect(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await Project.create({
        name: 'Project to Delete',
        description: 'Description',
        ownerId: testUser._id,
      });
      projectId = project._id.toString();
    });

    it('should delete project', async () => {
      await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify project is deleted
      const project = await Project.findById(projectId);
      expect(project).toBeNull();
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .delete(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

