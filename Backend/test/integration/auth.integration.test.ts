import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import User from '../../src/models/User';

describe('Authentication API Integration Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({ email: /test.*@example\.com/ });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test123!@#',
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Test123!@#',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test2@example.com',
          password: 'weak',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('password');
    });

    it('should reject duplicate email registration', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'duplicate@example.com',
          password: 'Test123!@#',
        })
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'duplicate@example.com',
          password: 'Test123!@#',
        })
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // Missing name and password
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        name: 'Test User',
        email: 'login@example.com',
        password: 'Test123!@#',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Test123!@#',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('login@example.com');
      expect(response.body).not.toHaveProperty('password');
      authToken = response.body.token;
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!@#',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          // Missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Create user and get token
      testUser = await User.create({
        name: 'Test User',
        email: 'me@example.com',
        password: 'Test123!@#',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me@example.com',
          password: 'Test123!@#',
        });

      authToken = loginResponse.body.token;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe('me@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toContain('Not authorized');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toContain('Not authorized');
    });
  });
});

