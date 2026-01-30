import { Request, Response } from 'express';
import { getProjects, createProject, getProject, updateProject, deleteProject } from '../src/controllers/projectController';
import Project from '../src/models/Project';
import Task from '../src/models/Task';

// Mock dependencies
jest.mock('../src/models/Project');
jest.mock('../src/models/Task');

describe('Project Controller', () => {
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

  describe('GET /api/projects', () => {
    it('should return all projects for authenticated user', async () => {
      const mockProjects = [
        {
          _id: 'project1',
          name: 'Project 1',
          description: 'Description 1',
          ownerId: 'user123',
          toObject: () => ({
            _id: 'project1',
            name: 'Project 1',
            description: 'Description 1',
            ownerId: 'user123',
          }),
        },
      ];

      (Project.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProjects),
      });
      (Task.aggregate as jest.Mock).mockResolvedValue([
        { _id: 'todo', count: 2 },
        { _id: 'in-progress', count: 1 },
        { _id: 'done', count: 3 },
      ]);

      await getProjects(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalled();
      expect(Array.isArray(mockJson.mock.calls[0][0])).toBe(true);
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      mockRequest = {
        body: {
          name: 'New Project',
          description: 'Project description',
        },
        userId: 'user123',
      } as any;

      const mockProject = {
        _id: 'project123',
        name: 'New Project',
        description: 'Project description',
        ownerId: 'user123',
      };

      (Project.create as jest.Mock).mockResolvedValue(mockProject);

      await createProject(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockProject);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a single project', async () => {
      mockRequest = {
        params: { id: 'project123' },
        userId: 'user123',
      } as any;

      const mockProject = {
        _id: 'project123',
        name: 'Test Project',
        toObject: () => ({
          _id: 'project123',
          name: 'Test Project',
        }),
      };

      (Project.findOne as jest.Mock).mockResolvedValue(mockProject);
      (Task.aggregate as jest.Mock).mockResolvedValue([]);

      await getProject(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalled();
    });

    it('should return 404 if project not found', async () => {
      mockRequest = {
        params: { id: 'invalid123' },
        userId: 'user123',
      } as any;

      (Project.findOne as jest.Mock).mockResolvedValue(null);

      await getProject(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update a project', async () => {
      mockRequest = {
        params: { id: 'project123' },
        body: { name: 'Updated Project' },
        userId: 'user123',
      } as any;

      const mockProject = {
        _id: 'project123',
        name: 'Updated Project',
        save: jest.fn().mockResolvedValue(true),
      };

      (Project.findOne as jest.Mock).mockResolvedValue(mockProject);

      await updateProject(mockRequest as Request, mockResponse as Response);

      expect(mockProject.save).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project and its tasks', async () => {
      mockRequest = {
        params: { id: 'project123' },
        userId: 'user123',
      } as any;

      const mockProject = {
        _id: 'project123',
        name: 'Test Project',
      };

      (Project.findOne as jest.Mock).mockResolvedValue(mockProject);
      (Task.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 5 });
      (Project.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      await deleteProject(mockRequest as Request, mockResponse as Response);

      expect(Task.deleteMany).toHaveBeenCalledWith({ projectId: 'project123' });
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project deleted successfully',
        })
      );
    });
  });
});

