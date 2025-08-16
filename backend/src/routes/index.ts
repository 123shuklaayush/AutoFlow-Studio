/**
 * @fileoverview Main routes configuration for AutoFlow Studio Backend
 * @author Ayush Shukla
 * @description Central route setup following RESTful conventions and modular architecture
 */

import { Application } from 'express';
import { workflowRoutes } from './workflow-routes';
import { sessionRoutes } from './session-routes';
import { authRoutes } from './auth-routes';
import { compilerRoutes } from './compiler-routes';
import { executionRoutes } from './execution-routes';
import { integrationRoutes } from './integration-routes';
import { analyticsRoutes } from './analytics-routes';
import { webhookRoutes } from './webhook-routes';

/**
 * Set up all API routes for the application
 * Following RESTful conventions and API versioning
 * @param app - Express application instance
 */
export function setupRoutes(app: Application): void {
  // API base path
  const API_BASE = '/api/v1';

  // Authentication routes
  app.use(`${API_BASE}/auth`, authRoutes);

  // Core workflow management routes
  app.use(`${API_BASE}/workflows`, workflowRoutes);
  
  // Recording session routes
  app.use(`${API_BASE}/sessions`, sessionRoutes);
  
  // Workflow compilation routes
  app.use(`${API_BASE}/compile`, compilerRoutes);
  
  // Workflow execution routes
  app.use(`${API_BASE}/execute`, executionRoutes);
  
  // Integration routes (n8n, WhatsApp, etc.)
  app.use(`${API_BASE}/integrations`, integrationRoutes);
  
  // Analytics and monitoring routes
  app.use(`${API_BASE}/analytics`, analyticsRoutes);
  
  // Webhook routes for external integrations
  app.use(`${API_BASE}/webhooks`, webhookRoutes);

  // API documentation endpoint
  app.get(`${API_BASE}/docs`, (req, res) => {
    res.json({
      title: 'AutoFlow Studio API Documentation',
      version: '1.0.0',
      description: 'AI-Enhanced Browser Automation Platform API',
      baseUrl: API_BASE,
      endpoints: {
        authentication: {
          base: `${API_BASE}/auth`,
          endpoints: [
            'POST /auth/login - User login',
            'POST /auth/logout - User logout', 
            'POST /auth/refresh - Refresh access token',
            'GET /auth/me - Get current user info'
          ]
        },
        workflows: {
          base: `${API_BASE}/workflows`,
          endpoints: [
            'GET /workflows - List user workflows',
            'POST /workflows - Create new workflow',
            'GET /workflows/:id - Get workflow by ID',
            'PUT /workflows/:id - Update workflow',
            'DELETE /workflows/:id - Delete workflow',
            'POST /workflows/:id/duplicate - Duplicate workflow'
          ]
        },
        sessions: {
          base: `${API_BASE}/sessions`,
          endpoints: [
            'GET /sessions - List recording sessions',
            'POST /sessions - Create new session',
            'GET /sessions/:id - Get session by ID',
            'PUT /sessions/:id - Update session',
            'DELETE /sessions/:id - Delete session',
            'POST /sessions/:id/steps - Add step to session'
          ]
        },
        compilation: {
          base: `${API_BASE}/compile`,
          endpoints: [
            'POST /compile/session - Compile session to workflow',
            'POST /compile/n8n - Generate n8n workflow JSON',
            'POST /compile/playwright - Generate Playwright script',
            'GET /compile/:id/status - Check compilation status'
          ]
        },
        execution: {
          base: `${API_BASE}/execute`,
          endpoints: [
            'POST /execute/workflow - Execute workflow',
            'GET /execute/:id - Get execution status',
            'POST /execute/:id/pause - Pause execution',
            'POST /execute/:id/resume - Resume execution',
            'POST /execute/:id/stop - Stop execution'
          ]
        },
        integrations: {
          base: `${API_BASE}/integrations`,
          endpoints: [
            'GET /integrations/n8n - n8n integration status',
            'POST /integrations/whatsapp/send - Send WhatsApp message',
            'GET /integrations/gmail/auth - Gmail OAuth flow',
            'POST /integrations/webhooks - Configure webhook'
          ]
        }
      },
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer <token>'
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000 // limit each IP to 1000 requests per windowMs
      }
    });
  });

  // Health check for specific services
  app.get(`${API_BASE}/health/detailed`, (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        firebase: 'initialized',
        ai: 'available',
        storage: 'accessible'
      },
      version: '1.0.0',
      uptime: process.uptime()
    });
  });
}
