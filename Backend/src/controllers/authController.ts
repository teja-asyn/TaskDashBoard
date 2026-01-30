import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../validation/auth';
import securityLogger, { SecurityLogger } from '../utils/securityLogger';

export const register = async (req: Request, res: Response) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = req.body;
    const ip = SecurityLogger.getClientIp(req);
    const userAgent = SecurityLogger.getUserAgent(req);

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      securityLogger.logSuspiciousActivity('DUPLICATE_REGISTRATION', `Attempt to register with existing email: ${email}`, ip);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user._id.toString());

    // Log successful registration
    securityLogger.logAuthAttempt(email, true, ip, userAgent, 'Registration successful');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    const ip = SecurityLogger.getClientIp(req);
    securityLogger.logSuspiciousActivity('REGISTRATION_ERROR', error instanceof Error ? error.message : String(error), ip);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const ip = SecurityLogger.getClientIp(req);
    const userAgent = SecurityLogger.getUserAgent(req);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      securityLogger.logAuthAttempt(email, false, ip, userAgent, 'User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      securityLogger.logAuthAttempt(email, false, ip, userAgent, 'Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Log successful login
    securityLogger.logAuthAttempt(email, true, ip, userAgent, 'Login successful');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    const ip = SecurityLogger.getClientIp(req);
    securityLogger.logSuspiciousActivity('LOGIN_ERROR', error instanceof Error ? error.message : String(error), ip);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

// GET /api/auth/me - Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User is already attached by protect middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};