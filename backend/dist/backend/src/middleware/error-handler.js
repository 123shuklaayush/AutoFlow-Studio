"use strict";
/**
 * @fileoverview Error handling middleware for AutoFlow Studio Backend
 * @author Ayush Shukla
 * @description Centralized error handling following Express best practices
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.TooManyRequestsError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.APIError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
exports.handleValidationError = handleValidationError;
exports.handleDatabaseError = handleDatabaseError;
exports.handleAIError = handleAIError;
exports.handleExternalAPIError = handleExternalAPIError;
exports.createErrorResponse = createErrorResponse;
exports.createSuccessResponse = createSuccessResponse;
const simple_logger_1 = require("../utils/simple-logger");
const environment_1 = require("../utils/environment");
/**
 * Custom error class with additional properties
 */
class APIError extends Error {
    constructor(message, statusCode = 500, isOperational = true, code) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.APIError = APIError;
/**
 * Common error types
 */
class ValidationError extends APIError {
    constructor(message, field) {
        super(message, 400, true, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends APIError {
    constructor(resource) {
        super(`${resource} not found`, 404, true, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends APIError {
    constructor(message = 'Unauthorized') {
        super(message, 401, true, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends APIError {
    constructor(message = 'Forbidden') {
        super(message, 403, true, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends APIError {
    constructor(message) {
        super(message, 409, true, 'CONFLICT');
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class TooManyRequestsError extends APIError {
    constructor(message = 'Too many requests') {
        super(message, 429, true, 'TOO_MANY_REQUESTS');
        this.name = 'TooManyRequestsError';
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class InternalServerError extends APIError {
    constructor(message = 'Internal server error') {
        super(message, 500, false, 'INTERNAL_SERVER_ERROR');
        this.name = 'InternalServerError';
    }
}
exports.InternalServerError = InternalServerError;
/**
 * Global error handler middleware
 * Should be the last middleware in the chain
 */
function errorHandler(error, req, res, next) {
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
        simple_logger_1.logger.warn('Operational error occurred', {
            message: error.message,
            statusCode,
            code,
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    }
    else {
        simple_logger_1.logger.error('System error occurred', error);
    }
    // Build error response
    const errorResponse = {
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
    if (!(0, environment_1.isProduction)() && error.stack) {
        errorResponse.error.stack = error.stack;
    }
    // Include additional details for certain error types
    if (error instanceof ValidationError && error.details) {
        errorResponse.error.details = error.details;
    }
    // Send error response
    res.status(statusCode).json(errorResponse);
}
/**
 * 404 handler for unmatched routes
 */
function notFoundHandler(req, res, next) {
    const error = new NotFoundError(`Route ${req.method} ${req.path}`);
    next(error);
}
/**
 * Async error handler wrapper
 * Wraps async route handlers to catch promise rejections
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
/**
 * Validation error handler for Joi validation
 */
function handleValidationError(error) {
    if (error.isJoi) {
        const message = error.details.map((detail) => detail.message).join(', ');
        const validationError = new ValidationError(message);
        validationError.details = error.details;
        return validationError;
    }
    return error;
}
/**
 * MongoDB/Firebase error handler
 */
function handleDatabaseError(error) {
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
function handleAIError(error) {
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
function handleExternalAPIError(error, serviceName) {
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
function createErrorResponse(message, statusCode = 500, code, details) {
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
function createSuccessResponse(data, message) {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
}
//# sourceMappingURL=error-handler.js.map