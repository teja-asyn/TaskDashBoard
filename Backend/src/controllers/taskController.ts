import { Request, Response } from 'express';
import Task, { ITask, TaskStatus, TaskPriority, ISubtask } from '../models/Task';
import Project from '../models/Project';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  addSubtaskSchema,
  updateTaskStatusSchema,
  updateSubtaskSchema 
} from '../validation/task';
import mongoose from 'mongoose';
import { sanitizeSearchInput } from '../utils/sanitize';
import securityLogger, { SecurityLogger } from '../utils/securityLogger';

interface AuthRequest extends Request {
  userId?: string;
}

// Get all tasks for the current user across all projects
export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, assignee, search, page: rawPage = 1, limit: rawLimit = 50 } = req.query;
    
    // Validate and cap pagination limit to prevent DoS attacks
    const limit = Math.min(Math.max(1, Number(rawLimit)), 100); // Max 100 items per page
    const pageNum = Math.max(1, Number(rawPage));

    // Get all projects the user owns
    // Note: teamMembers field doesn't exist in Project model, so only checking ownerId
    const projects = await Project.find({
      ownerId: req.userId
    }).select('_id');

    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) {
      return res.json({
        tasks: [],
        pagination: {
          page: pageNum,
          limit: limit,
          total: 0,
          pages: 0
        }
      });
    }

    // Build query
    const query: Record<string, unknown> = { projectId: { $in: projectIds } };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (assignee && assignee !== 'all') {
      query.assigneeId = assignee;
    }

    // Sanitize search input to prevent ReDoS attacks
    const sanitizedSearch = sanitizeSearchInput(search as string);
    if (sanitizedSearch) {
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limit;

    // Get tasks with pagination
    const tasks = await Task.find(query)
      .populate('assigneeId', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limit,
        total: totalTasks,
        pages: Math.ceil(totalTasks / Number(limit))
      }
    });
  } catch (error: unknown) {
    const ip = SecurityLogger.getClientIp(req);
    securityLogger.logSuspiciousActivity(
      'GET_ALL_TASKS_ERROR',
      error instanceof Error ? error.message : 'Unknown error',
      ip,
      req.userId
    );
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get tasks by project with filtering and pagination
export const getTasksByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee, search, page: rawPage = 1, limit: rawLimit = 20 } = req.query;
    
    // Validate and cap pagination limit to prevent DoS attacks
    const limit = Math.min(Math.max(1, Number(rawLimit)), 100); // Max 100 items per page
    const pageNum = Math.max(1, Number(rawPage));

    // Verify project belongs to user (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: projectId,
      ownerId: req.userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Build query
    const query: Record<string, unknown> = { projectId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (assignee && assignee !== 'all') {
      query.assigneeId = assignee;
    }

    // Sanitize search input to prevent ReDoS attacks
    const sanitizedSearch = sanitizeSearchInput(search as string);
    if (sanitizedSearch) {
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limit;

    // Get tasks with pagination
    const tasks = await Task.find(query)
      .populate('assigneeId', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limit,
        total: totalTasks,
        pages: Math.ceil(totalTasks / limit)
      }
    });
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body
    const { error } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { 
      projectId, 
      title, 
      description, 
      status = 'todo', 
      priority = 'medium', 
      assigneeId, 
      dueDate,
      estimatedHours,
      labels 
    } = req.body;
    
    // Verify project belongs to user (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: projectId,
      ownerId: req.userId
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      estimatedHours: estimatedHours || null,
      labels: labels || [],
      createdBy: req.userId,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assigneeId', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate({
        path: 'projectId',
        select: 'name color'
      });

    res.status(201).json(populatedTask);
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    // Validate updates
    const { error } = updateTaskSchema.validate(updates);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Get task and verify project belongs to user
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access to this task (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: task.projectId,
      ownerId: req.userId
    });

    if (!project) {
      const ip = SecurityLogger.getClientIp(req);
      const userAgent = SecurityLogger.getUserAgent(req);
      securityLogger.logAuthorizationFailure(
        req.userId || 'unknown',
        `task/${taskId}`,
        'update',
        ip,
        userAgent
      );
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task
    Object.assign(task, updates);
    task.updatedAt = new Date();
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assigneeId', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate({
        path: 'projectId',
        select: 'name color'
      });

    res.json(updatedTask);
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    
    // Validate status update
    const { error } = updateTaskStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { status } = req.body;

    // Get task and verify access
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: task.projectId,
      ownerId: req.userId
    });

    if (!project) {
      const ip = SecurityLogger.getClientIp(req);
      const userAgent = SecurityLogger.getUserAgent(req);
      securityLogger.logAuthorizationFailure(
        req.userId || 'unknown',
        `task/${taskId}`,
        'update',
        ip,
        userAgent
      );
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update status
    task.status = status as TaskStatus;
    task.updatedAt = new Date();
    await task.save();

    res.json({
      _id: task._id,
      status: task.status,
      updatedAt: task.updatedAt
    });
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    // Get task and verify project belongs to user
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: task.projectId,
      ownerId: req.userId
    });

    if (!project) {
      const ip = SecurityLogger.getClientIp(req);
      const userAgent = SecurityLogger.getUserAgent(req);
      securityLogger.logAuthorizationFailure(
        req.userId || 'unknown',
        `task/${taskId}`,
        'update',
        ip,
        userAgent
      );
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete task
    await task.deleteOne();

    res.json({ message: 'Task deleted successfully' });
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getTaskDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('assigneeId', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate({
        path: 'projectId',
        select: 'name description color',
        populate: {
          path: 'ownerId',
          select: 'name email',
        },
      });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access to this task (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: task.projectId,
      ownerId: req.userId
    });

    if (!project) {
      const ip = SecurityLogger.getClientIp(req);
      const userAgent = SecurityLogger.getUserAgent(req);
      securityLogger.logAuthorizationFailure(
        req.userId || 'unknown',
        `task/${taskId}`,
        'update',
        ip,
        userAgent
      );
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const addSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, description, assigneeId, dueDate } = req.body;

    // Validate subtask data
    const { error } = addSubtaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: task.projectId,
      ownerId: req.userId
    });

    if (!project) {
      const ip = SecurityLogger.getClientIp(req);
      const userAgent = SecurityLogger.getUserAgent(req);
      securityLogger.logAuthorizationFailure(
        req.userId || 'unknown',
        `task/${taskId}`,
        'update',
        ip,
        userAgent
      );
      return res.status(403).json({ message: 'Access denied' });
    }

    const subtask: ISubtask = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description: description || '',
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      completed: false,
      createdAt: new Date(),
      createdBy: new mongoose.Types.ObjectId(req.userId!)
    };

    task.subtasks = task.subtasks || [];
    task.subtasks.push(subtask);
    await task.save();

    res.status(201).json(subtask);
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params;
    
    // Validate subtask updates
    const { error } = updateSubtaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { completed, title, description, assigneeId, dueDate } = req.body;

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: task.projectId,
      ownerId: req.userId
    });

    if (!project) {
      const ip = SecurityLogger.getClientIp(req);
      const userAgent = SecurityLogger.getUserAgent(req);
      securityLogger.logAuthorizationFailure(
        req.userId || 'unknown',
        `task/${taskId}`,
        'update',
        ip,
        userAgent
      );
      return res.status(403).json({ message: 'Access denied' });
    }

    const subtask = task.subtasks?.find(st => st._id.toString() === subtaskId);
    
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    // Update subtask fields
    if (completed !== undefined) subtask.completed = completed;
    if (title !== undefined) subtask.title = title;
    if (description !== undefined) subtask.description = description;
    if (assigneeId !== undefined) subtask.assigneeId = assigneeId || null;
    if (dueDate !== undefined) subtask.dueDate = dueDate ? new Date(dueDate) : null;
    
    subtask.updatedAt = new Date();
    await task.save();

    res.json(subtask);
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params;

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: task.projectId,
      ownerId: req.userId
    });

    if (!project) {
      const ip = SecurityLogger.getClientIp(req);
      const userAgent = SecurityLogger.getUserAgent(req);
      securityLogger.logAuthorizationFailure(
        req.userId || 'unknown',
        `task/${taskId}`,
        'update',
        ip,
        userAgent
      );
      return res.status(403).json({ message: 'Access denied' });
    }

    const subtaskIndex = task.subtasks?.findIndex(st => st._id.toString() === subtaskId);
    
    if (subtaskIndex === -1 || subtaskIndex === undefined) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    // Remove subtask
    task.subtasks?.splice(subtaskIndex, 1);
    await task.save();

    res.json({ message: 'Subtask deleted successfully' });
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getTaskStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    // Verify project belongs to user (must be project owner)
    // Note: teamMembers field doesn't exist in Project model
    const project = await Project.findOne({
      _id: projectId,
      ownerId: req.userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get statistics
    const stats = await Task.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      {
        $facet: {
          statusStats: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          priorityStats: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          assigneeStats: [
            { $match: { assigneeId: { $ne: null } } },
            { $group: { _id: '$assigneeId', count: { $sum: 1 } } }
          ],
          totalTasks: [{ $count: 'total' }],
          completedTasks: [
            { $match: { status: 'done' } },
            { $count: 'completed' }
          ]
        }
      }
    ]);

    // Format response
    const result = {
      total: stats[0]?.totalTasks[0]?.total || 0,
      completed: stats[0]?.completedTasks[0]?.completed || 0,
      byStatus: stats[0]?.statusStats || [],
      byPriority: stats[0]?.priorityStats || [],
      byAssignee: stats[0]?.assigneeStats || []
    };

    res.json(result);
  } catch (error: unknown) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};