import { Request, Response } from 'express';
import { register, login } from '../src/controllers/authController';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../src/models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Authentication Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      mockRequest = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        },
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (User.create as jest.Mock).mockResolvedValue({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        toObject: () => ({
          _id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
        }),
      });
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          token: 'mockToken',
        })
      );
    });

    it('should return error if email already exists', async () => {
      mockRequest = {
        body: {
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        },
      };

      (User.findOne as jest.Mock).mockResolvedValue({
        email: 'existing@example.com',
      });

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Email already registered'),
        })
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };

      (User.findOne as jest.Mock).mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        password: hashedPassword,
        toObject: () => ({
          _id: 'user123',
          email: 'test@example.com',
        }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'mockToken',
        })
      );
    });

    it('should return error for invalid credentials', async () => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      };

      (User.findOne as jest.Mock).mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid credentials'),
        })
      );
    });
  });
});

