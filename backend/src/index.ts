/**
 * @fileoverview Main entry point for AutoFlow Studio Backend Server
 * @author Ayush Shukla
 * @description Express server with TypeScript, following SOLID principles
 * and clean architecture patterns for maintainable and scalable code.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server } from 'http';
import { setupRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { setupFirebase } from './services/firebase-service';
import { logger } from './utils/simple-logger';
import { validateEnvironment } from './utils/environment';
import { DatabaseService } from './services/database-service';
import { setupWebSocket } from './services/websocket-service';

// Load environment variables
dotenv.config();

/**
 * Main application class following Single Responsibility Principle
 * Handles server lifecycle and dependency injection
 */
class AutoFlowServer {
  private app: express.Application;
  private server: Server | null = null;
  private port: number;
  private databaseService: DatabaseService;

  /**
   * Initialize the AutoFlow Studio backend server
   */
  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.databaseService = new DatabaseService();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Set up Express middleware following security best practices
   * @private
   */
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com"]
        }
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration for Chrome extension and web UI
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow Chrome extension and localhost for development
        const allowedOrigins = [
          /^chrome-extension:\/\/.*$/,
          /^http:\/\/localhost:\d+$/,
          /^https:\/\/localhost:\d+$/,
          process.env.FRONTEND_URL
        ].filter(Boolean);

        if (!origin || allowedOrigins.some(pattern => 
          typeof pattern === 'string' ? pattern === origin : (pattern as RegExp).test(origin)
        )) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Request parsing middleware
    this.app.use(express.json({ limit: '50mb' })); // Large limit for screenshots
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API info endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'AutoFlow Studio API',
        description: 'AI-Enhanced Browser Automation Platform API',
        version: '1.0.0',
        author: 'Ayush Shukla',
        endpoints: {
          health: '/health',
          api: '/api/v1',
          docs: '/api/v1/docs'
        }
      });
    });
  }

  /**
   * Initialize API routes following RESTful conventions
   * @private
   */
  private initializeRoutes(): void {
    setupRoutes(this.app);
  }

  /**
   * Set up error handling middleware
   * @private
   */
  private initializeErrorHandling(): void {
    // 404 handler (must be before error handler)
    this.app.use(notFoundHandler);
    
    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  /**
   * Initialize all services required by the application
   * @private
   */
  private async initializeServices(): Promise<void> {
    logger.info('Initializing services...');

    try {
      // Validate environment variables
      validateEnvironment();
      
      // Initialize Firebase
      await setupFirebase();
      logger.info('✅ Firebase initialized');

      // Initialize Database service
      await this.databaseService.initialize();
      logger.info('✅ Database service initialized');

      logger.info('✅ All services initialized successfully');
    } catch (error) {
      logger.error('❌ Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start the Express server and all associated services
   */
  public async start(): Promise<void> {
    try {
      // Initialize all services first
      await this.initializeServices();

      // Start HTTP server
      this.server = this.app.listen(this.port, () => {
        logger.info(`🚀 AutoFlow Studio Backend Server started successfully`);
        logger.info(`🌐 Server running on port ${this.port}`);
        logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
        logger.info(`📚 API Base URL: http://localhost:${this.port}/api/v1`);
        logger.info(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
      });

      // Set up WebSocket server for real-time communication
      setupWebSocket(this.server);
      logger.info('🔌 WebSocket server initialized');

      // Handle server shutdown gracefully
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Set up graceful shutdown handlers
   * @private
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close(async (err) => {
          if (err) {
            logger.error('❌ Error during server shutdown:', err);
            process.exit(1);
          }

          try {
            // Clean up services
            await this.databaseService.disconnect();
            logger.info('✅ Database connections closed');

            logger.info('✅ Graceful shutdown completed');
            process.exit(0);
          } catch (error) {
            logger.error('❌ Error during cleanup:', error);
            process.exit(1);
          }
        });

        // Force shutdown after 30 seconds
        setTimeout(() => {
          logger.error('⚠️  Forced shutdown after 30 seconds');
          process.exit(1);
        }, 30000);
      } else {
        process.exit(0);
      }
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
      logger.error('🚨 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('🚨 Unhandled Rejection at promise:', { promise, reason });
      gracefulShutdown('unhandledRejection');
    });
  }

  /**
   * Get the Express application instance (useful for testing)
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Stop the server (useful for testing)
   */
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

/**
 * Create and start the server if this file is run directly
 */
if (require.main === module) {
  const server = new AutoFlowServer();
  
  server.start().catch((error) => {
    logger.error('💥 Fatal error starting server:', error);
    process.exit(1);
  });
}

// Export for testing and external usage
export { AutoFlowServer };
export default AutoFlowServer;
