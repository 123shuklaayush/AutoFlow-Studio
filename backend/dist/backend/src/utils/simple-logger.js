"use strict";
/**
 * @fileoverview Simple console-based logger for AutoFlow Studio Backend
 * @author Ayush Shukla
 * @description Lightweight logger that can be easily replaced with winston later
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
exports.createModuleLogger = createModuleLogger;
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Color codes for console output
 */
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};
/**
 * Simple logger class
 */
class SimpleLogger {
    constructor() {
        this.level = this.getLogLevel();
    }
    /**
     * Determine log level based on environment
     */
    getLogLevel() {
        switch (process.env.NODE_ENV) {
            case 'production':
                return LogLevel.INFO;
            case 'test':
                return LogLevel.ERROR;
            case 'development':
            default:
                return LogLevel.DEBUG;
        }
    }
    /**
     * Format timestamp
     */
    formatTimestamp() {
        return new Date().toISOString();
    }
    /**
     * Format log message with color
     */
    formatMessage(level, message, color) {
        const timestamp = this.formatTimestamp();
        return `${color}${timestamp} [${level}]: ${message}${colors.reset}`;
    }
    /**
     * Log error message
     */
    error(message, error) {
        if (this.level >= LogLevel.ERROR) {
            console.error(this.formatMessage('ERROR', message, colors.red));
            if (error) {
                if (error instanceof Error) {
                    console.error(`${colors.red}${error.stack || error.message}${colors.reset}`);
                }
                else {
                    console.error(`${colors.red}${JSON.stringify(error, null, 2)}${colors.reset}`);
                }
            }
        }
    }
    /**
     * Log warning message
     */
    warn(message, context) {
        if (this.level >= LogLevel.WARN) {
            console.warn(this.formatMessage('WARN', message, colors.yellow));
            if (context) {
                console.warn(`${colors.yellow}${JSON.stringify(context, null, 2)}${colors.reset}`);
            }
        }
    }
    /**
     * Log info message
     */
    info(message, context) {
        if (this.level >= LogLevel.INFO) {
            console.log(this.formatMessage('INFO', message, colors.green));
            if (context) {
                console.log(`${colors.green}${JSON.stringify(context, null, 2)}${colors.reset}`);
            }
        }
    }
    /**
     * Log debug message
     */
    debug(message, context) {
        if (this.level >= LogLevel.DEBUG) {
            console.log(this.formatMessage('DEBUG', message, colors.blue));
            if (context) {
                console.log(`${colors.blue}${JSON.stringify(context, null, 2)}${colors.reset}`);
            }
        }
    }
    /**
     * Log HTTP requests
     */
    http(method, path, statusCode, duration) {
        const color = statusCode >= 400 ? colors.red : colors.cyan;
        this.info(`${method} ${path} - ${statusCode} (${duration}ms)`, { statusCode, duration });
    }
    /**
     * Log performance timing
     */
    performance(label, startTime) {
        const duration = Date.now() - startTime;
        this.debug(`Performance: ${label} took ${duration}ms`, { duration });
    }
    /**
     * Log workflow events
     */
    workflow(workflowId, event, context) {
        this.info(`Workflow ${workflowId}: ${event}`, { workflowId, event, ...context });
    }
    /**
     * Log AI operations
     */
    ai(operation, model, duration, context) {
        this.info(`AI: ${operation} using ${model} (${duration}ms)`, {
            operation,
            model,
            duration,
            ...context
        });
    }
}
/**
 * Default logger instance
 */
exports.logger = new SimpleLogger();
/**
 * Create logger for specific modules
 */
function createModuleLogger(moduleName) {
    const moduleLogger = new SimpleLogger();
    // Override methods to include module name
    const originalInfo = moduleLogger.info.bind(moduleLogger);
    const originalDebug = moduleLogger.debug.bind(moduleLogger);
    const originalWarn = moduleLogger.warn.bind(moduleLogger);
    const originalError = moduleLogger.error.bind(moduleLogger);
    moduleLogger.info = (message, context) => {
        originalInfo(`[${moduleName}] ${message}`, context);
    };
    moduleLogger.debug = (message, context) => {
        originalDebug(`[${moduleName}] ${message}`, context);
    };
    moduleLogger.warn = (message, context) => {
        originalWarn(`[${moduleName}] ${message}`, context);
    };
    moduleLogger.error = (message, error) => {
        originalError(`[${moduleName}] ${message}`, error);
    };
    return moduleLogger;
}
exports.default = exports.logger;
//# sourceMappingURL=simple-logger.js.map