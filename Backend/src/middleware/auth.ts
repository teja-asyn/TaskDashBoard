import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import securityLogger, { SecurityLogger } from '../utils/securityLogger';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const ip = SecurityLogger.getClientIp(req);
    securityLogger.logSuspiciousActivity('MISSING_TOKEN', 'Request without authentication token', ip);
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      const ip = SecurityLogger.getClientIp(req);
      securityLogger.logSuspiciousActivity('INVALID_USER', `Token decoded but user not found: ${decoded.id}`, ip);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    const ip = SecurityLogger.getClientIp(req);
    const errorMessage = error instanceof jwt.TokenExpiredError 
      ? 'Token expired' 
      : error instanceof jwt.JsonWebTokenError 
      ? 'Invalid token' 
      : 'Token verification failed';
    securityLogger.logSuspiciousActivity('TOKEN_VERIFICATION_FAILED', errorMessage, ip);
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};