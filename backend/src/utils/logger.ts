/**
 * @fileoverview Centralized logging utility for AutoFlow Studio Backend
 * @author Ayush Shukla
 * @description Winston-based logger with different log levels and formats
 * Following Single Responsibility Principle for logging concerns
 */

import { createLogger, format, transports, Logger } from 'winston';
import path from 'path';

/**
 * Log levels with priorities
 */
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  HTTP = 3,
  VERBOSE = 4,
  DEBUG = 5,
  SILLY = 6
}

/**
 * Custom log colors for console output
 */
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  verbose: 'cyan'
};

/**
 * Create custom format for console logging
 */
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize({ all: true, colors: logColors }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

/**
 * Create custom format for file logging
 */
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

/**
 * Determine log level based on environment
 */
const getLogLevel = (): string => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'info';
    case 'test':
      return 'error';
    case 'development':
    default:
      return 'debug';
  }
};

/**
 * Create Winston logger instance with appropriate transports
 */
const createLoggerInstance = (): Logger => {
  const logLevel = getLogLevel();
  const logDir = process.env.LOG_DIR || 'logs';

  // Ensure log directory exists in production
  if (process.env.NODE_ENV === 'production') {
    const fs = require('fs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  const loggerTransports: any[] = [
    // Console transport for all environments
    new transports.Console({
      level: logLevel,
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    })
  ];

  // Add file transports for production
  if (process.env.NODE_ENV === 'production') {
    loggerTransports.push(
      // Error log file
      new transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      
      // Combined log file
      new transports.File({
        filename: path.join(logDir, 'combined.log'),
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );
  }

  return createLogger({
    level: logLevel,
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
      verbose: 5
    },
    transports: loggerTransports,
    exitOnError: false
  });
};

/**
 * Main logger instance
 */
export const logger = createLoggerInstance();

/**
 * Enhanced logger with additional utility methods
 */
export class EnhancedLogger {
  private logger: Logger;

  constructor(loggerInstance: Logger) {
    this.logger = loggerInstance;
  }

  /**
   * Log error with context
   * @param message - Error message
   * @param error - Error object
   * @param context - Additional context
   */
  error(message: string, error?: Error | any, context?: any): void {
    this.logger.error(message, {
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      } : undefined,
      context
    });
  }

  /**
   * Log warning with context
   * @param message - Warning message
   * @param context - Additional context
   */
  warn(message: string, context?: any): void {
    this.logger.warn(message, { context });
  }

  /**
   * Log info with context
   * @param message - Info message
   * @param context - Additional context
   */
  info(message: string, context?: any): void {
    this.logger.info(message, { context });
  }

  /**
   * Log debug information
   * @param message - Debug message
   * @param context - Additional context
   */
  debug(message: string, context?: any): void {
    this.logger.debug(message, { context });
  }

  /**
   * Log HTTP requests
   * @param message - HTTP message
   * @param context - Request context
   */
  http(message: string, context?: any): void {
    this.logger.http(message, { context });
  }

  /**
   * Create child logger with additional context
   * @param defaultContext - Default context for all logs
   * @returns Child logger instance
   */
  child(defaultContext: any): EnhancedLogger {
    return new EnhancedLogger(this.logger.child(defaultContext));
  }

  /**
   * Log performance timing
   * @param label - Performance label
   * @param startTime - Start time
   * @param context - Additional context
   */
  performance(label: string, startTime: number, context?: any): void {
    const duration = Date.now() - startTime;
    this.info(`Performance: ${label} took ${duration}ms`, {
      performance: { label, duration },
      ...context
    });
  }

  /**
   * Log API request/response
   * @param method - HTTP method
   * @param path - Request path
   * @param statusCode - Response status code
   * @param duration - Request duration
   * @param context - Additional context
   */
  apiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: any
  ): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this[level](`${method} ${path} - ${statusCode} (${duration}ms)`, {
      api: { method, path, statusCode, duration },
      ...context
    });
  }

  /**
   * Log database operations
   * @param operation - Database operation
   * @param table - Database table
   * @param duration - Operation duration
   * @param context - Additional context
   */
  database(
    operation: string,
    table: string,
    duration: number,
    context?: any
  ): void {
    this.debug(`Database: ${operation} on ${table} (${duration}ms)`, {
      database: { operation, table, duration },
      ...context
    });
  }

  /**
   * Log workflow execution events
   * @param workflowId - Workflow ID
   * @param event - Event type
   * @param context - Additional context
   */
  workflow(workflowId: string, event: string, context?: any): void {
    this.info(`Workflow ${workflowId}: ${event}`, {
      workflow: { id: workflowId, event },
      ...context
    });
  }

  /**
   * Log AI/ML operations
   * @param operation - AI operation
   * @param model - Model used
   * @param duration - Operation duration
   * @param context - Additional context
   */
  ai(operation: string, model: string, duration: number, context?: any): void {
    this.info(`AI: ${operation} using ${model} (${duration}ms)`, {
      ai: { operation, model, duration },
      ...context
    });
  }
}

/**
 * Enhanced logger instance
 */
export const enhancedLogger = new EnhancedLogger(logger);

/**
 * Create logger for specific modules
 * @param moduleName - Name of the module
 * @returns Module-specific logger
 */
export function createModuleLogger(moduleName: string): EnhancedLogger {
  return enhancedLogger.child({ module: moduleName });
}

/**
 * Middleware for logging HTTP requests
 */
export function createHttpLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      enhancedLogger.apiRequest(
        req.method,
        req.path,
        res.statusCode,
        duration,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: req.user?.id
        }
      );
    });
    
    next();
  };
}

// Export default logger for backward compatibility
export default logger;
