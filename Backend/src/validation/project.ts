import Joi from 'joi';

export const createProjectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional(),
}).min(1); // At least one field must be provided for update
