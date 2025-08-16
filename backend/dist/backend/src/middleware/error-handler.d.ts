/**
 * @fileoverview Error handling middleware for AutoFlow Studio Backend
 * @author Ayush Shukla
 * @description Centralized error handling following Express best practices
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Custom error class with additional properties
 */
export declare class APIError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: string;
    constructor(message: string, statusCode?: number, isOperational?: boolean, code?: string);
}
/**
 * Common error types
 */
export declare class ValidationError extends APIError {
    constructor(message: string, field?: string);
}
export declare class NotFoundError extends APIError {
    constructor(resource: string);
}
export declare class UnauthorizedError extends APIError {
    constructor(message?: string);
}
export declare class ForbiddenError extends APIError {
    constructor(message?: string);
}
export declare class ConflictError extends APIError {
    constructor(message: string);
}
export declare class TooManyRequestsError extends APIError {
    constructor(message?: string);
}
export declare class InternalServerError extends APIError {
    constructor(message?: string);
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
export declare function errorHandler(error: Error | APIError, req: Request, res: Response, next: NextFunction): void;
/**
 * 404 handler for unmatched routes
 */
export declare function notFoundHandler(req: Request, res: Response, next: NextFunction): void;
/**
 * Async error handler wrapper
 * Wraps async route handlers to catch promise rejections
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validation error handler for Joi validation
 */
export declare function handleValidationError(error: any): ValidationError;
/**
 * MongoDB/Firebase error handler
 */
export declare function handleDatabaseError(error: any): APIError;
/**
 * AI service error handler
 */
export declare function handleAIError(error: any): APIError;
/**
 * External API error handler
 */
export declare function handleExternalAPIError(error: any, serviceName: string): APIError;
/**
 * Create error response helper
 */
export declare function createErrorResponse(message: string, statusCode?: number, code?: string, details?: any): ErrorResponse;
/**
 * Success response helper
 */
export declare function createSuccessResponse(data: any, message?: string): {
    success: boolean;
    message: string | undefined;
    data: any;
    timestamp: string;
};
export {};
//# sourceMappingURL=error-handler.d.ts.map