/**
 * Security logging utility for tracking security-related events
 */

interface SecurityEvent {
  type: 'AUTH_ATTEMPT' | 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'AUTHORIZATION_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: string;
  timestamp: Date;
}

export class SecurityLogger {
  /**
   * Log authentication attempt
   */
  logAuthAttempt(email: string, success: boolean, ip: string, userAgent?: string, details?: string) {
    const event: SecurityEvent = {
      type: success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
      email,
      ip,
      userAgent,
      details,
      timestamp: new Date(),
    };
    
    this.logEvent(event);
    
    // Alert on multiple failed attempts
    if (!success) {
      this.checkFailedAttempts(email, ip);
    }
  }

  /**
   * Log authorization failure
   */
  logAuthorizationFailure(userId: string, resource: string, action: string, ip: string, userAgent?: string) {
    const event: SecurityEvent = {
      type: 'AUTHORIZATION_FAILURE',
      userId,
      resource,
      action,
      ip,
      userAgent,
      timestamp: new Date(),
    };
    
    this.logEvent(event);
  }

  /**
   * Log rate limit violation
   */
  logRateLimit(ip: string, endpoint: string, userAgent?: string) {
    const event: SecurityEvent = {
      type: 'RATE_LIMIT',
      ip,
      resource: endpoint,
      details: 'Rate limit exceeded',
      userAgent,
      timestamp: new Date(),
    };
    
    this.logEvent(event);
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(type: string, details: string, ip: string, userId?: string, userAgent?: string) {
    const event: SecurityEvent = {
      type: 'SUSPICIOUS_ACTIVITY',
      userId,
      ip,
      userAgent,
      details: `${type}: ${details}`,
      timestamp: new Date(),
    };
    
    this.logEvent(event);
  }

  /**
   * Internal method to log events
   */
  private logEvent(event: SecurityEvent) {
    const logMessage = `[SECURITY] ${event.type} | ${event.timestamp.toISOString()} | IP: ${event.ip}${event.userId ? ` | User: ${event.userId}` : ''}${event.email ? ` | Email: ${event.email}` : ''}${event.resource ? ` | Resource: ${event.resource}` : ''}${event.action ? ` | Action: ${event.action}` : ''}${event.details ? ` | Details: ${event.details}` : ''}`;
    
    // In production, this should be sent to a logging service (e.g., Winston, CloudWatch, etc.)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with logging service
      console.log(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  /**
   * Check for multiple failed authentication attempts
   */
  private failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();

  private checkFailedAttempts(email: string, ip: string) {
    const key = `${email}:${ip}`;
    const existing = this.failedAttempts.get(key);
    
    if (existing) {
      existing.count++;
      existing.lastAttempt = new Date();
      
      // Alert after 3 failed attempts
      if (existing.count >= 3) {
        this.logSuspiciousActivity(
          'MULTIPLE_FAILED_LOGINS',
          `User ${email} has ${existing.count} failed login attempts from IP ${ip}`,
          ip,
          undefined,
          undefined
        );
      }
      
      // Clear after 15 minutes
      setTimeout(() => {
        this.failedAttempts.delete(key);
      }, 15 * 60 * 1000);
    } else {
      this.failedAttempts.set(key, { count: 1, lastAttempt: new Date() });
    }
  }

  /**
   * Get client IP address from request
   */
  static getClientIp(req: { headers: Record<string, string | string[] | undefined>; connection?: { remoteAddress?: string }; socket?: { remoteAddress?: string } }): string {
    const xForwardedFor = req.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(xForwardedFor) 
      ? xForwardedFor[0]?.split(',')[0] 
      : typeof xForwardedFor === 'string' 
        ? xForwardedFor.split(',')[0] 
        : undefined;
    
    const realIp = req.headers['x-real-ip'];
    const realIpStr = Array.isArray(realIp) ? realIp[0] : realIp;
    
    return (
      forwardedIp ||
      realIpStr ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Get user agent from request
   */
  static getUserAgent(req: { headers: Record<string, string | string[] | undefined> }): string | undefined {
    const userAgent = req.headers['user-agent'];
    return Array.isArray(userAgent) ? userAgent[0] : userAgent;
  }
}

export const securityLogger = new SecurityLogger();
export default securityLogger;

