import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import mongoose from 'mongoose';
import { createProjectSchema, updateProjectSchema } from '../validation/project';
import { sanitizeSearchInput } from '../utils/sanitize';
import securityLogger, { SecurityLogger } from '../utils/securityLogger';


export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({ ownerId: req.userId });
    
    if (projects.length === 0) {
      return res.json([]);
    }
    
    // Optimize: Single aggregation query for all projects instead of N+1 queries
    const projectIds = projects.map(p => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: { projectId: '$projectId', status: '$status' }, count: { $sum: 1 } } },
    ]) as Array<{ _id: { projectId: mongoose.Types.ObjectId; status: string }; count: number }>;
    
    // Create a map for quick lookup
    const countsMap = new Map<string, { todo: number; 'in-progress': number; done: number }>();
    
    taskCounts.forEach((item) => {
      const projectIdStr = item._id.projectId.toString();
      if (!countsMap.has(projectIdStr)) {
        countsMap.set(projectIdStr, { todo: 0, 'in-progress': 0, done: 0 });
      }
      const counts = countsMap.get(projectIdStr)!;
      const status = item._id.status as keyof typeof counts;
      if (status in counts) {
        counts[status] = item.count;
      }
    });
    
    // Build response with task counts
    const projectsWithCounts = projects.map((project) => {
      const projectIdStr = project._id.toString();
      const counts = countsMap.get(projectIdStr) || { todo: 0, 'in-progress': 0, done: 0 };
      
      return {
        ...project.toObject(),
        taskCounts: counts,
        totalTasks: counts.todo + counts['in-progress'] + counts.done,
      };
    });
    
    res.json(projectsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findOne({
      _id: id,
      ownerId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get task counts
    const taskCounts = await Task.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]) as Array<{ _id: string; count: number }>;

    const counts = {
      todo: 0,
      'in-progress': 0,
      done: 0,
    };

    taskCounts.forEach((item) => {
      counts[item._id as keyof typeof counts] = item.count;
    });

    res.json({
      ...project.toObject(),
      taskCounts: counts,
      totalTasks: counts.todo + counts['in-progress'] + counts.done,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { error } = updateProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;

    // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findOne({
      _id: id,
      ownerId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update only provided fields
    const updates = req.body;
    Object.assign(project, updates);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findOne({
      _id: id,
      ownerId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all tasks associated with the project
    await Task.deleteMany({ projectId: id });

    // Delete the project
    await Project.deleteOne({ _id: id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    const project = await Project.create({
      name,
      description: description || '',
      ownerId: req.userId,
    });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

// GET /api/projects/:id/tasks - Get all tasks for a project (Required endpoint)
export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, assignee, search, page = 1, limit: rawLimit = 20 } = req.query;
    
    // Validate and cap pagination limit to prevent DoS attacks
    const limit = Math.min(Math.max(1, Number(rawLimit)), 100); // Max 100 items per page
    const pageNum = Math.max(1, Number(page));

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: id,
      ownerId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Build query
    const query: Record<string, unknown> = { projectId: id };

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
        pages: Math.ceil(totalTasks / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};