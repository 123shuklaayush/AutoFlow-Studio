/**
 * @fileoverview Main entry point for AutoFlow Studio Backend Server
 * @author Ayush Shukla
 * @description Express server with TypeScript, following SOLID principles
 * and clean architecture patterns for maintainable and scalable code.
 */
import express from "express";
/**
 * Main application class following Single Responsibility Principle
 * Handles server lifecycle and dependency injection
 */
declare class AutoFlowServer {
    private app;
    private server;
    private port;
    private databaseService;
    /**
     * Initialize the AutoFlow Studio backend server
     */
    constructor();
    /**
     * Set up Express middleware following security best practices
     * @private
     */
    private initializeMiddleware;
    /**
     * Initialize API routes following RESTful conventions
     * @private
     */
    private initializeRoutes;
    /**
     * Set up error handling middleware
     * @private
     */
    private initializeErrorHandling;
    /**
     * Initialize all services required by the application
     * @private
     */
    private initializeServices;
    /**
     * Validate server is actually accessible
     */
    private validateServerStatus;
    /**
     * Start the Express server and all associated services
     */
    start(): Promise<void>;
    /**
     * Set up graceful shutdown handlers
     * @private
     */
    private setupGracefulShutdown;
    /**
     * Get the Express application instance (useful for testing)
     */
    getApp(): express.Application;
    /**
     * Stop the server (useful for testing)
     */
    stop(): Promise<void>;
}
export { AutoFlowServer };
export default AutoFlowServer;
//# sourceMappingURL=index.d.ts.map