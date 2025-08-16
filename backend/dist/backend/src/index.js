"use strict";
/**
 * @fileoverview Main entry point for AutoFlow Studio Backend Server
 * @author Ayush Shukla
 * @description Express server with TypeScript, following SOLID principles
 * and clean architecture patterns for maintainable and scalable code.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoFlowServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
const error_handler_1 = require("./middleware/error-handler");
const firebase_service_1 = require("./services/firebase-service");
const simple_logger_1 = require("./utils/simple-logger");
const environment_1 = require("./utils/environment");
const database_service_1 = require("./services/database-service");
const websocket_service_1 = require("./services/websocket-service");
// Load environment variables
dotenv_1.default.config();
/**
 * Main application class following Single Responsibility Principle
 * Handles server lifecycle and dependency injection
 */
class AutoFlowServer {
    /**
     * Initialize the AutoFlow Studio backend server
     */
    constructor() {
        this.server = null;
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || "3000", 10);
        this.databaseService = new database_service_1.DatabaseService();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    /**
     * Set up Express middleware following security best practices
     * @private
     */
    initializeMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: [
                        "'self'",
                        "https://api.openai.com",
                        "https://generativelanguage.googleapis.com",
                    ],
                },
            },
            crossOriginEmbedderPolicy: false,
        }));
        // CORS configuration for Chrome extension and web UI
        this.app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                // Allow Chrome extension and localhost for development
                const allowedOrigins = [
                    /^chrome-extension:\/\/.*$/,
                    /^http:\/\/localhost:\d+$/,
                    /^https:\/\/localhost:\d+$/,
                    process.env.FRONTEND_URL,
                ].filter(Boolean);
                if (!origin ||
                    allowedOrigins.some((pattern) => typeof pattern === "string"
                        ? pattern === origin
                        : pattern.test(origin))) {
                    callback(null, true);
                }
                else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        }));
        // Request parsing middleware
        this.app.use(express_1.default.json({ limit: "50mb" })); // Large limit for screenshots
        this.app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
        // Logging middleware
        this.app.use((0, morgan_1.default)("combined", {
            stream: { write: (message) => simple_logger_1.logger.info(message.trim()) },
        }));
        // Health check endpoint
        this.app.get("/health", (req, res) => {
            res.json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || "1.0.0",
                environment: process.env.NODE_ENV || "development",
            });
        });
        // API info endpoint
        this.app.get("/", (req, res) => {
            res.json({
                name: "AutoFlow Studio API",
                description: "AI-Enhanced Browser Automation Platform API",
                version: "1.0.0",
                author: "Ayush Shukla",
                endpoints: {
                    health: "/health",
                    api: "/api/v1",
                    docs: "/api/v1/docs",
                },
            });
        });
    }
    /**
     * Initialize API routes following RESTful conventions
     * @private
     */
    initializeRoutes() {
        (0, routes_1.setupRoutes)(this.app);
    }
    /**
     * Set up error handling middleware
     * @private
     */
    initializeErrorHandling() {
        // 404 handler (must be before error handler)
        this.app.use(error_handler_1.notFoundHandler);
        // Global error handler (must be last)
        this.app.use(error_handler_1.errorHandler);
    }
    /**
     * Initialize all services required by the application
     * @private
     */
    async initializeServices() {
        simple_logger_1.logger.info("Initializing services...");
        try {
            // Validate environment variables
            (0, environment_1.validateEnvironment)();
            // Initialize Firebase
            await (0, firebase_service_1.setupFirebase)();
            simple_logger_1.logger.info("✅ Firebase initialized");
            // Initialize Database service
            await this.databaseService.initialize();
            simple_logger_1.logger.info("✅ Database service initialized");
            // Set global database service for routes
            const { setDatabaseService } = require("./services/database-service");
            setDatabaseService(this.databaseService);
            simple_logger_1.logger.info("✅ All services initialized successfully");
        }
        catch (error) {
            simple_logger_1.logger.error("❌ Service initialization failed:", error);
            throw error;
        }
    }
    /**
     * Validate server is actually accessible
     */
    validateServerStatus() {
        // Wait a moment for server to be fully ready
        setTimeout(async () => {
            try {
                const http = require("http");
                const options = {
                    hostname: "localhost",
                    port: this.port,
                    path: "/health",
                    method: "GET",
                    timeout: 3000,
                };
                const req = http.request(options, (res) => {
                    if (res.statusCode === 200) {
                        simple_logger_1.logger.info("✅ SERVER VALIDATION: Server is responding correctly");
                        simple_logger_1.logger.info("🎯 STATUS: Ready for development and testing!");
                        simple_logger_1.logger.info('📋 TIP: Run "./check-server.sh" to validate all components');
                    }
                    else {
                        simple_logger_1.logger.warn(`⚠️  SERVER VALIDATION: Unexpected status code: ${res.statusCode}`);
                    }
                    req.destroy(); // Clear timeout handler
                });
                req.setTimeout(3000);
                req.on("error", (error) => {
                    simple_logger_1.logger.warn("⚠️  SERVER VALIDATION: Could not validate server status:", error.message);
                });
                req.on("timeout", () => {
                    simple_logger_1.logger.warn("⚠️  SERVER VALIDATION: Server validation timed out");
                    req.destroy();
                });
                req.end();
            }
            catch (error) {
                simple_logger_1.logger.warn("⚠️  SERVER VALIDATION: Error during validation:", error);
            }
        }, 500);
    }
    /**
     * Start the Express server and all associated services
     */
    async start() {
        try {
            // Initialize all services first
            await this.initializeServices();
            // Start HTTP server
            this.server = this.app.listen(this.port, () => {
                simple_logger_1.logger.info(`🚀 AutoFlow Studio Backend Server started successfully`);
                simple_logger_1.logger.info(`🌐 Server running on port ${this.port}`);
                simple_logger_1.logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
                simple_logger_1.logger.info(`📚 API Base URL: http://localhost:${this.port}/api/v1`);
                simple_logger_1.logger.info(`🛡️  Environment: ${process.env.NODE_ENV || "development"}`);
                // Validate server is actually accessible
                this.validateServerStatus();
            });
            // Set up WebSocket server for real-time communication
            (0, websocket_service_1.setupWebSocket)(this.server);
            simple_logger_1.logger.info("🔌 WebSocket server initialized");
            // Handle server shutdown gracefully
            this.setupGracefulShutdown();
        }
        catch (error) {
            simple_logger_1.logger.error("❌ Failed to start server:", error);
            process.exit(1);
        }
    }
    /**
     * Set up graceful shutdown handlers
     * @private
     */
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            simple_logger_1.logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);
            if (this.server) {
                this.server.close(async (err) => {
                    if (err) {
                        simple_logger_1.logger.error("❌ Error during server shutdown:", err);
                        process.exit(1);
                    }
                    try {
                        // Clean up services
                        await this.databaseService.disconnect();
                        simple_logger_1.logger.info("✅ Database connections closed");
                        simple_logger_1.logger.info("✅ Graceful shutdown completed");
                        process.exit(0);
                    }
                    catch (error) {
                        simple_logger_1.logger.error("❌ Error during cleanup:", error);
                        process.exit(1);
                    }
                });
                // Force shutdown after 30 seconds
                setTimeout(() => {
                    simple_logger_1.logger.error("⚠️  Forced shutdown after 30 seconds");
                    process.exit(1);
                }, 30000);
            }
            else {
                process.exit(0);
            }
        };
        // Handle different shutdown signals
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
        // Handle uncaught exceptions and unhandled rejections
        process.on("uncaughtException", (error) => {
            simple_logger_1.logger.error("🚨 Uncaught Exception:", error);
            gracefulShutdown("uncaughtException");
        });
        process.on("unhandledRejection", (reason, promise) => {
            simple_logger_1.logger.error("🚨 Unhandled Rejection at promise:", { promise, reason });
            gracefulShutdown("unhandledRejection");
        });
    }
    /**
     * Get the Express application instance (useful for testing)
     */
    getApp() {
        return this.app;
    }
    /**
     * Stop the server (useful for testing)
     */
    async stop() {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
    }
}
exports.AutoFlowServer = AutoFlowServer;
/**
 * Create and start the server if this file is run directly
 */
if (require.main === module) {
    const server = new AutoFlowServer();
    server.start().catch((error) => {
        simple_logger_1.logger.error("💥 Fatal error starting server:", error);
        process.exit(1);
    });
}
exports.default = AutoFlowServer;
//# sourceMappingURL=index.js.map