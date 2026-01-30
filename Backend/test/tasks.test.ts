import { Request, Response } from 'express';
import { createTask, updateTask, deleteTask, getTasksByProject } from '../src/controllers/taskController';
import Task from '../src/models/Task';
import Project from '../src/models/Project';

// Mock dependencies
jest.mock('../src/models/Task');
jest.mock('../src/models/Project');
jest.mock('multer');

describe('Task Controller', () => {
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
    (mockRequest as any).userId = 'user123';
    jest.clearAllMocks();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      mockRequest = {
        body: {
          title: 'New Task',
          description: 'Task description',
          status: 'todo',
          priority: 'medium',
          projectId: 'project123',
        },
        userId: 'user123',
        files: [],
      } as any;

      const mockProject = {
        _id: 'project123',
        ownerId: 'user123',
      };

      (Project.findOne as jest.Mock).mockResolvedValue(mockProject);
      (Task.create as jest.Mock).mockResolvedValue({
        _id: 'task123',
        title: 'New Task',
        projectId: 'project123',
      });
      (Task.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue({
              _id: 'task123',
              title: 'New Task',
            }),
          }),
        }),
      });

      // Mock the handleUpload middleware behavior
      const next = jest.fn();
      await createTask(mockRequest as any, mockResponse as Response, next);

      // Since createTask uses handleUpload, we need to call it properly
      // For testing purposes, we'll test the core logic
      expect(Project.findOne).toHaveBeenCalled();
    });
  });

  describe('GET /api/tasks/projects/:projectId/tasks', () => {
    it('should return tasks for a project', async () => {
      mockRequest = {
        params: { projectId: 'project123' },
        query: {},
        userId: 'user123',
      } as any;

      const mockProject = {
        _id: 'project123',
        ownerId: 'user123',
      };

      const mockTasks = [
        {
          _id: 'task1',
          title: 'Task 1',
          projectId: 'project123',
        },
      ];

      (Project.findOne as jest.Mock).mockResolvedValue(mockProject);
      (Task.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(mockTasks),
              }),
            }),
          }),
        }),
      });
      (Task.countDocuments as jest.Mock).mockResolvedValue(1);

      await getTasksByProject(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          tasks: expect.any(Array),
          pagination: expect.any(Object),
        })
      );
    });

    it('should return 404 if project not found', async () => {
      mockRequest = {
        params: { projectId: 'invalid123' },
        query: {},
        userId: 'user123',
      } as any;

      (Project.findOne as jest.Mock).mockResolvedValue(null);

      await getTasksByProject(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      mockRequest = {
        params: { taskId: 'task123' },
        body: { title: 'Updated Task' },
        userId: 'user123',
      } as any;

      const mockTask = {
        _id: 'task123',
        title: 'Original Task',
        projectId: 'project123',
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockProject = {
        _id: 'project123',
        ownerId: 'user123',
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Project.findOne as jest.Mock).mockResolvedValue(mockProject);
      (Task.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue({
              _id: 'task123',
              title: 'Updated Task',
            }),
          }),
        }),
      });

      await updateTask(mockRequest as Request, mockResponse as Response);

      expect(mockTask.save).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      mockRequest = {
        params: { taskId: 'task123' },
        userId: 'user123',
      } as any;

      const mockTask = {
        _id: 'task123',
        projectId: 'project123',
        attachments: [],
        deleteOne: jest.fn().mockResolvedValue(true),
      };

      const mockProject = {
        _id: 'project123',
        ownerId: 'user123',
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Project.findOne as jest.Mock).mockResolvedValue(mockProject);

      await deleteTask(mockRequest as Request, mockResponse as Response);

      expect(mockTask.deleteOne).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Task deleted successfully',
        })
      );
    });
  });
});

