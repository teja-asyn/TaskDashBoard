import Joi from 'joi';

// Strong password pattern: at least 8 chars, with uppercase, lowercase, number, and special char
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/;

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required()
    .messages({
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name must be less than 50 characters',
      'any.required': 'Name is required',
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)',
      'any.required': 'Password is required',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Password is required',
    }),
});