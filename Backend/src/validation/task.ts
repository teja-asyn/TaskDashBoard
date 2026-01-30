import Joi from 'joi';
import mongoose from 'mongoose';

// Task status and priority enums
const taskStatus = ['todo', 'in-progress', 'done'] as const;
const taskPriority = ['low', 'medium', 'high'] as const;

// Base task schema
export const createTaskSchema = Joi.object({
  projectId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .message('Invalid project ID'),
  
  title: Joi.string()
    .required()
    .max(200)
    .messages({
      'string.empty': 'Task title is required',
      'string.max': 'Task title must be less than 200 characters',
    }),
  
  description: Joi.string()
    .allow('')
    .max(10000)
    .messages({
      'string.max': 'Description must be less than 10000 characters',
    }),
  
  status: Joi.string()
    .valid(...taskStatus)
    .default('todo'),
  
  priority: Joi.string()
    .valid(...taskPriority)
    .default('medium'),
  
  assigneeId: Joi.string()
    .allow(null, '')
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .message('Invalid assignee ID'),
  
  dueDate: Joi.date()
    .allow(null, '')
    .messages({
      'date.base': 'Invalid due date',
    }),
  
  estimatedHours: Joi.number()
    .min(0)
    .max(1000)
    .allow(null),
  
  labels: Joi.array()
    .items(Joi.string().max(20))
    .default([]),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string()
    .max(200)
    .messages({
      'string.max': 'Task title must be less than 200 characters',
    }),
  
  description: Joi.string()
    .allow('')
    .max(10000)
    .messages({
      'string.max': 'Description must be less than 10000 characters',
    }),
  
  status: Joi.string()
    .valid(...taskStatus),
  
  priority: Joi.string()
    .valid(...taskPriority),
  
  assigneeId: Joi.string()
    .allow(null, '')
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .message('Invalid assignee ID'),
  
  dueDate: Joi.date()
    .allow(null, '')
    .messages({
      'date.base': 'Invalid due date',
    }),
  
  estimatedHours: Joi.number()
    .min(0)
    .max(1000)
    .allow(null),
  
  labels: Joi.array()
    .items(Joi.string().max(20)),
  
  actualHours: Joi.number()
    .min(0)
    .allow(null),
}).min(1);

// Subtask schema
export const addSubtaskSchema = Joi.object({
  title: Joi.string()
    .required()
    .max(200)
    .messages({
      'string.empty': 'Subtask title is required',
      'string.max': 'Subtask title must be less than 200 characters',
    }),
  
  description: Joi.string()
    .allow('')
    .max(500)
    .messages({
      'string.max': 'Description must be less than 500 characters',
    }),
  
  assigneeId: Joi.string()
    .allow(null, '')
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .message('Invalid assignee ID'),
  
  dueDate: Joi.date()
    .allow(null, '')
    .messages({
      'date.base': 'Invalid due date',
    }),
  
  completed: Joi.boolean()
    .default(false),
});

// Update task status schema
export const updateTaskStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...taskStatus)
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: todo, in-progress, done',
    }),
});

// Update subtask schema
export const updateSubtaskSchema = Joi.object({
  completed: Joi.boolean(),
  title: Joi.string().max(200),
  description: Joi.string().allow('').max(500),
  assigneeId: Joi.string()
    .allow(null, '')
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  dueDate: Joi.date().allow(null, ''),
}).min(1);