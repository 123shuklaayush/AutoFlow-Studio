/**
 * @fileoverview Simple console-based logger for AutoFlow Studio Backend
 * @author Ayush Shukla
 * @description Lightweight logger that can be easily replaced with winston later
 */
/**
 * Log levels
 */
export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
/**
 * Simple logger class
 */
declare class SimpleLogger {
    private level;
    constructor();
    /**
     * Determine log level based on environment
     */
    private getLogLevel;
    /**
     * Format timestamp
     */
    private formatTimestamp;
    /**
     * Format log message with color
     */
    private formatMessage;
    /**
     * Log error message
     */
    error(message: string, error?: Error | any): void;
    /**
     * Log warning message
     */
    warn(message: string, context?: any): void;
    /**
     * Log info message
     */
    info(message: string, context?: any): void;
    /**
     * Log debug message
     */
    debug(message: string, context?: any): void;
    /**
     * Log HTTP requests
     */
    http(method: string, path: string, statusCode: number, duration: number): void;
    /**
     * Log performance timing
     */
    performance(label: string, startTime: number): void;
    /**
     * Log workflow events
     */
    workflow(workflowId: string, event: string, context?: any): void;
    /**
     * Log AI operations
     */
    ai(operation: string, model: string, duration: number, context?: any): void;
}
/**
 * Default logger instance
 */
export declare const logger: SimpleLogger;
/**
 * Create logger for specific modules
 */
export declare function createModuleLogger(moduleName: string): SimpleLogger;
export default logger;
//# sourceMappingURL=simple-logger.d.ts.map