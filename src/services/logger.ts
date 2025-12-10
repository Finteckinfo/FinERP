/**
 * Secure Logger Service
 * 
 * Provides environment-aware logging with automatic sanitization in production.
 * Only logs detailed information in development mode to prevent information leakage.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Sanitize sensitive data from context
   */
  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };
    const sensitiveKeys = [
      'token', 'password', 'secret', 'apiKey', 'privateKey',
      'authorization', 'cookie', 'session', 'jwt'
    ];

    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        if (typeof sanitized[key] === 'string') {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = '[REDACTED]';
        }
      }
    });

    return sanitized;
  }

  /**
   * Debug logging - only in development
   */
  public debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const sanitized = context ? this.sanitizeContext(context) : undefined;
      console.debug(`[DEBUG] ${message}`, sanitized || '');
    }
  }

  /**
   * Info logging - limited in production
   */
  public info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const sanitized = context ? this.sanitizeContext(context) : undefined;
      console.log(`[INFO] ${message}`, sanitized || '');
    } else {
      // In production, log minimal info without context
      console.log(`[INFO] ${message}`);
    }
  }

  /**
   * Warning logging - sanitized in production
   */
  public warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const sanitized = context ? this.sanitizeContext(context) : undefined;
      console.warn(`[WARN] ${message}`, sanitized || '');
    } else {
      // In production, log warning without sensitive context
      console.warn(`[WARN] ${message}`);
    }
  }

  /**
   * Error logging - sanitized in production
   */
  public error(message: string, error?: any, context?: LogContext): void {
    if (this.isDevelopment) {
      const sanitized = context ? this.sanitizeContext(context) : undefined;
      console.error(`[ERROR] ${message}`, error, sanitized || '');
    } else {
      // In production, log generic error without exposing system details
      console.error(`[ERROR] ${message}`);
      // Optionally send to error tracking service here
    }
  }

  /**
   * Security-sensitive logging - never logs in production
   */
  public security(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const sanitized = context ? this.sanitizeContext(context) : undefined;
      console.log(`[SECURITY] ${message}`, sanitized || '');
    }
    // Never log security details in production
  }

  /**
   * Check if running in development mode
   */
  public isDev(): boolean {
    return this.isDevelopment;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export class for testing
export { Logger };
