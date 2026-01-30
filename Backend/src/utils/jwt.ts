import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';

// Interface for JWT payload
export interface TokenPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// Validate environment variables on startup
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set');
  process.exit(1);
}

// Generate a strong secret if not provided (for development only)
const generateFallbackSecret = (): string => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  console.warn('⚠️  Using auto-generated JWT secret for development only');
  return crypto.randomBytes(64).toString('hex');
};

// Get JWT secret from env or generate fallback
const JWT_SECRET = process.env.JWT_SECRET || generateFallbackSecret();

// JWT configuration
const SIGN_OPTIONS: SignOptions = {
  algorithm: 'HS256', // Strong algorithm
  expiresIn: process.env.JWT_EXPIRE || '7d', // Shorter expiry for better security
  issuer: 'task-management-api',
  audience: 'task-management-client',
} as any;

const VERIFY_OPTIONS: VerifyOptions = {
  algorithms: ['HS256'],
  issuer: 'task-management-api',
  audience: 'task-management-client',
  ignoreExpiration: false,
  complete: false,
};

/**
 * Generate JWT token for user authentication
 * @param userId - User ID to encode in token
 * @returns Signed JWT token
 */
export const generateToken = (userId: string): string => {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    const payload: TokenPayload = { id: userId };
    
    return jwt.sign(payload, JWT_SECRET, SIGN_OPTIONS);
  } catch (error) {
    console.error('❌ Failed to generate JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Token is required and must be a string');
    }

    // Remove 'Bearer ' prefix if present
    const actualToken = token.replace(/^Bearer\s+/i, '');

    const decoded = jwt.verify(actualToken, JWT_SECRET, VERIFY_OPTIONS) as JwtPayload;
    
    // Validate payload structure
    if (!decoded.id || typeof decoded.id !== 'string') {
      throw new Error('Invalid token payload');
    }

    return decoded as TokenPayload;
  } catch (error) {
    console.error('❌ JWT verification failed:', error);
    
    // Provide specific error messages
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    
    throw new Error('Token verification failed');
  }
};

/**
 * Decode token without verification (for debugging only)
 * @param token - JWT token
 * @returns Decoded payload or null
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload | null;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Get token expiry time
 * @param token - JWT token
 * @returns Expiry date or null
 */
export const getTokenExpiry = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000); // Convert from Unix timestamp
    }
    
    return null;
  } catch {
    return null;
  }
};

/**
 * Check if token is about to expire (within threshold)
 * @param token - JWT token
 * @param thresholdSeconds - Threshold in seconds (default: 1 hour)
 * @returns Boolean indicating if token needs refresh
 */
export const isTokenExpiringSoon = (token: string, thresholdSeconds: number = 3600): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    
    if (!decoded?.exp) {
      return true; // Treat as expiring if no expiry found
    }
    
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    
    return timeUntilExpiry <= (thresholdSeconds * 1000);
  } catch {
    return true; // Treat as expiring on error
  }
};

/**
 * Generate refresh token (for implementing refresh token flow)
 * @param userId - User ID
 * @returns Refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    // Use different secret for refresh tokens (optional but recommended)
    const refreshSecret = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh';
    
    const payload = { 
      id: userId,
      type: 'refresh' // Distinguish from access tokens
    };
    
    const options: SignOptions = {
      ...SIGN_OPTIONS,
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d', // Longer expiry for refresh tokens
    } as any;
    
    return jwt.sign(payload, refreshSecret, options);
  } catch (error) {
    console.error('❌ Failed to generate refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

// Token blacklist for logout functionality (in-memory, use Redis in production)
const tokenBlacklist = new Set<string>();

/**
 * Add token to blacklist (for logout)
 * @param token - Token to blacklist
 */
export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
  
  // Auto-cleanup: Remove token from blacklist after it expires
  const expiry = getTokenExpiry(token);
  if (expiry) {
    const ttl = expiry.getTime() - Date.now();
    if (ttl > 0) {
      setTimeout(() => {
        tokenBlacklist.delete(token);
      }, ttl);
    }
  }
};

/**
 * Check if token is blacklisted
 * @param token - Token to check
 * @returns Boolean indicating if token is blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

/**
 * Generate token pair (access + refresh tokens)
 * @param userId - User ID
 * @returns Object containing access and refresh tokens
 */
export const generateTokenPair = (userId: string): { 
  accessToken: string; 
  refreshToken: string;
  expiresIn: number;
} => {
  const accessToken = generateToken(userId);
  const refreshToken = generateRefreshToken(userId);
  
  const decoded = decodeToken(accessToken);
  const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 604800; // 7 days default
  
  return {
    accessToken,
    refreshToken,
    expiresIn
  };
};