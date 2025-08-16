/**
 * @fileoverview Error handling middleware for AutoFlow Studio Backend
 * @author Ayush Shukla
 * @description Centralized error handling following Express best practices
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/simple-logger';
import { isProduction } from '../utils/environment';

/**
 * Custom error class with additional properties
 */
export class APIError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  
  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error types
 */
export class ValidationError extends APIError {
  constructor(message: string, field?: string) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class TooManyRequestsError extends APIError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'TOO_MANY_REQUESTS');
    this.name = 'TooManyRequestsError';
  }
}

export class InternalServerError extends APIError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, false, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    stack?: string;
    details?: any;
  };
}

/**
 * Global error handler middleware
 * Should be the last middleware in the chain
 */
export function errorHandler(
  error: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If response is already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  // Determine if this is an operational error
  const isOperational = error instanceof APIError ? error.isOperational : false;
  const statusCode = error instanceof APIError ? error.statusCode : 500;
  const code = error instanceof APIError ? error.code : 'UNKNOWN_ERROR';

  // Log the error
  if (isOperational) {
    logger.warn('Operational error occurred', {
      message: error.message,
      statusCode,
      code,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else {
    logger.error('System error occurred', error);
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    error: {
      message: isOperational ? error.message : 'Internal server error',
      code: code || 'UNKNOWN_ERROR',
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  };

  // Include stack trace in development
  if (!isProduction() && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  // Include additional details for certain error types
  if (error instanceof ValidationError && (error as any).details) {
    errorResponse.error.details = (error as any).details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
}

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/**
 * Validation error handler for Joi validation
 */
export function handleValidationError(error: any): ValidationError {
  if (error.isJoi) {
    const message = error.details.map((detail: any) => detail.message).join(', ');
    const validationError = new ValidationError(message);
    (validationError as any).details = error.details;
    return validationError;
  }
  
  return error;
}

/**
 * MongoDB/Firebase error handler
 */
export function handleDatabaseError(error: any): APIError {
  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return new ConflictError(`${field} already exists`);
  }

  // Firebase errors
  if (error.code && error.code.startsWith('firestore/')) {
    switch (error.code) {
      case 'firestore/permission-denied':
        return new ForbiddenError('Access denied to database resource');
      case 'firestore/not-found':
        return new NotFoundError('Database resource');
      case 'firestore/already-exists':
        return new ConflictError('Resource already exists');
      default:
        return new InternalServerError('Database operation failed');
    }
  }

  return error;
}

/**
 * AI service error handler
 */
export function handleAIError(error: any): APIError {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.error?.message || error.message;

    switch (status) {
      case 401:
        return new UnauthorizedError('AI service authentication failed');
      case 403:
        return new ForbiddenError('AI service access denied');
      case 429:
        return new TooManyRequestsError('AI service rate limit exceeded');
      case 400:
        return new ValidationError(`AI service error: ${message}`);
      default:
        return new InternalServerError(`AI service error: ${message}`);
    }
  }

  return new InternalServerError('AI service connection failed');
}

/**
 * External API error handler
 */
export function handleExternalAPIError(error: any, serviceName: string): APIError {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;

    switch (status) {
      case 401:
        return new UnauthorizedError(`${serviceName} authentication failed`);
      case 403:
        return new ForbiddenError(`${serviceName} access denied`);
      case 429:
        return new TooManyRequestsError(`${serviceName} rate limit exceeded`);
      case 400:
        return new ValidationError(`${serviceName} error: ${message}`);
      default:
        return new InternalServerError(`${serviceName} error: ${message}`);
    }
  }

  return new InternalServerError(`${serviceName} connection failed`);
}

/**
 * Create error response helper
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): ErrorResponse {
  return {
    error: {
      message,
      code: code || 'UNKNOWN_ERROR',
      statusCode,
      timestamp: new Date().toISOString(),
      path: '',
      method: '',
      details
    }
  };
}

/**
 * Success response helper
 */
export function createSuccessResponse(data: any, message?: string) {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}
