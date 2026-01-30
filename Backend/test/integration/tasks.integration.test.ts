import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import User from '../../src/models/User';
import Project from '../../src/models/Project';
import Task from '../../src/models/Task';

describe('Tasks API Integration Tests', () => {
  let testUser: any;
  let testProject: any;
  let authToken: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({ email: /test.*@example\.com/ });

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!@#',
    });

    // Create test project
    testProject = await Project.create({
      name: 'Test Project',
      description: 'Test Description',
      ownerId: testUser._id,
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

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Task',
          description: 'Task description',
          status: 'todo',
          priority: 'high',
          projectId: testProject._id.toString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('New Task');
      expect(response.body.status).toBe('todo');
      expect(response.body.priority).toBe('high');
    });

    it('should reject task creation without required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Task description',
          // Missing title, status, priority, projectId
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject task creation with invalid projectId', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Task',
          status: 'todo',
          priority: 'high',
          projectId: fakeId,
        })
        .expect(404);

      expect(response.body.message).toContain('Project not found');
    });
  });

  describe('GET /api/tasks/projects/:projectId/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create([
        {
          title: 'Task 1',
          status: 'todo',
          priority: 'high',
          projectId: testProject._id,
          createdBy: testUser._id,
        },
        {
          title: 'Task 2',
          status: 'in-progress',
          priority: 'medium',
          projectId: testProject._id,
          createdBy: testUser._id,
        },
        {
          title: 'Task 3',
          status: 'done',
          priority: 'low',
          projectId: testProject._id,
          createdBy: testUser._id,
        },
      ]);
    });

    it('should return all tasks for a project', async () => {
      const response = await request(app)
        .get(`/api/tasks/projects/${testProject._id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get(`/api/tasks/projects/${testProject._id}/tasks`)
        .query({ status: 'todo' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].status).toBe('todo');
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get(`/api/tasks/projects/${testProject._id}/tasks`)
        .query({ priority: 'high' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].priority).toBe('high');
    });

    it('should search tasks by title', async () => {
      const response = await request(app)
        .get(`/api/tasks/projects/${testProject._id}/tasks`)
        .query({ search: 'Task 1' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Task 1');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Original Task',
        status: 'todo',
        priority: 'medium',
        projectId: testProject._id,
        createdBy: testUser._id,
      });
      taskId = task._id.toString();
    });

    it('should update task', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task',
          status: 'in-progress',
          priority: 'high',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Task');
      expect(response.body.status).toBe('in-progress');
      expect(response.body.priority).toBe('high');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task',
        })
        .expect(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Task to Delete',
        status: 'todo',
        priority: 'medium',
        projectId: testProject._id,
        createdBy: testUser._id,
      });
      taskId = task._id.toString();
    });

    it('should delete task', async () => {
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify task is deleted
      const task = await Task.findById(taskId);
      expect(task).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

