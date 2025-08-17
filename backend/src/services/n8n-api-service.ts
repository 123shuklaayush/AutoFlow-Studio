/**
 * @fileoverview n8n API Integration Service
 * @author Ayush Shukla
 * @description Service for deploying and managing workflows in n8n via API
 */

import { N8nWorkflowJSON } from "@shared/types/n8n";
import { logger } from "../utils/logger";

export interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

export interface N8nWorkflowResponse {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
}

export interface N8nExecutionResponse {
  id: string;
  workflowId: string;
  status: "running" | "success" | "error" | "waiting";
  startedAt: string;
  finishedAt?: string;
  data?: any;
  error?: string;
}

export interface N8nDeploymentResult {
  success: boolean;
  workflowId?: string;
  n8nWorkflowId?: string;
  error?: string;
  warnings?: string[];
}

/**
 * n8n API Integration Service
 */
export class N8nApiService {
  private config: N8nConfig;

  constructor(config: Partial<N8nConfig> = {}) {
    this.config = {
      baseUrl: "http://localhost:5678",
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Deploy a workflow to n8n
   */
  async deployWorkflow(
    workflowId: string,
    n8nWorkflow: N8nWorkflowJSON
  ): Promise<N8nDeploymentResult> {
    try {
      logger.info(`Deploying workflow ${workflowId} to n8n`);

      // Check if n8n is accessible
      const healthCheck = await this.checkHealth();
      if (!healthCheck) {
        return {
          success: false,
          error: "n8n is not accessible. Please ensure n8n is running.",
        };
      }

      // For now, we'll simulate deployment since we don't have API key setup
      // In a real implementation, you would:
      // 1. Create the workflow in n8n
      // 2. Set up credentials if needed
      // 3. Activate the workflow

      const simulatedResult = await this.simulateDeployment(
        workflowId,
        n8nWorkflow
      );

      return simulatedResult;
    } catch (error: any) {
      logger.error("Error deploying workflow to n8n:", error);
      return {
        success: false,
        workflowId,
        error: error.message,
      };
    }
  }

  /**
   * Execute a workflow in n8n
   */
  async executeWorkflow(
    n8nWorkflowId: string,
    inputData?: any
  ): Promise<N8nExecutionResponse | null> {
    try {
      logger.info(`Executing n8n workflow: ${n8nWorkflowId}`);

      // This would make an actual API call to n8n
      // For now, return a simulated response
      return {
        id: `exec_${Date.now()}`,
        workflowId: n8nWorkflowId,
        status: "success",
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        data: { message: "Simulated execution completed" },
      };
    } catch (error: any) {
      logger.error("Error executing n8n workflow:", error);
      return null;
    }
  }

  /**
   * Get workflow status from n8n
   */
  async getWorkflowStatus(
    n8nWorkflowId: string
  ): Promise<N8nWorkflowResponse | null> {
    try {
      // This would fetch actual workflow status from n8n
      // For now, return a simulated response
      return {
        id: n8nWorkflowId,
        name: "AutoFlow Workflow",
        active: true,
        nodes: [],
        connections: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error("Error getting workflow status from n8n:", error);
      return null;
    }
  }

  /**
   * List all workflows in n8n
   */
  async listWorkflows(): Promise<N8nWorkflowResponse[]> {
    try {
      // This would fetch actual workflows from n8n
      // For now, return empty array
      return [];
    } catch (error: any) {
      logger.error("Error listing n8n workflows:", error);
      return [];
    }
  }

  /**
   * Delete a workflow from n8n
   */
  async deleteWorkflow(n8nWorkflowId: string): Promise<boolean> {
    try {
      logger.info(`Deleting n8n workflow: ${n8nWorkflowId}`);

      // This would delete the actual workflow from n8n
      // For now, return true (simulated success)
      return true;
    } catch (error: any) {
      logger.error("Error deleting n8n workflow:", error);
      return false;
    }
  }

  /**
   * Check if n8n is healthy and accessible
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.config.baseUrl}/healthz`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return response.ok;
    } catch (error: any) {
      logger.warn("n8n health check failed:", error.message);
      return false;
    }
  }

  /**
   * Set up n8n API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    logger.info("n8n API key configured");
  }

  /**
   * Simulate workflow deployment (for demo purposes)
   */
  private async simulateDeployment(
    workflowId: string,
    n8nWorkflow: N8nWorkflowJSON
  ): Promise<N8nDeploymentResult> {
    // Simulate deployment process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const n8nWorkflowId = `n8n_${workflowId}_${Date.now()}`;

    logger.info(`Simulated deployment successful: ${n8nWorkflowId}`);

    return {
      success: true,
      workflowId,
      n8nWorkflowId,
      warnings: [
        "This is a simulated deployment. To enable real n8n deployment:",
        "1. Set up n8n API key authentication",
        "2. Configure proper n8n API endpoints",
        "3. Handle credential management for workflows",
      ],
    };
  }

  /**
   * Make authenticated request to n8n API
   */
  private async makeN8nRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.config.baseUrl}/api/v1${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.config.apiKey) {
      headers["X-N8N-API-KEY"] = this.config.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n API error (${response.status}): ${errorText}`);
    }

    return response;
  }

  /**
   * Real implementation methods (commented out for now)
   */

  /*
  // Uncomment and implement these when n8n API key is available

  async deployWorkflowReal(workflowId: string, n8nWorkflow: N8nWorkflowJSON): Promise<N8nDeploymentResult> {
    try {
      // Create workflow in n8n
      const response = await this.makeN8nRequest('/workflows', {
        method: 'POST',
        body: JSON.stringify(n8nWorkflow)
      });

      const createdWorkflow = await response.json();

      // Activate the workflow
      await this.makeN8nRequest(`/workflows/${createdWorkflow.id}/activate`, {
        method: 'POST'
      });

      return {
        success: true,
        workflowId,
        n8nWorkflowId: createdWorkflow.id
      };

    } catch (error: any) {
      return {
        success: false,
        workflowId,
        error: error.message
      };
    }
  }

  async executeWorkflowReal(n8nWorkflowId: string, inputData?: any): Promise<N8nExecutionResponse | null> {
    try {
      const response = await this.makeN8nRequest(`/workflows/${n8nWorkflowId}/execute`, {
        method: 'POST',
        body: JSON.stringify({ data: inputData || {} })
      });

      return await response.json();

    } catch (error: any) {
      logger.error('Error executing n8n workflow:', error);
      return null;
    }
  }

  async listWorkflowsReal(): Promise<N8nWorkflowResponse[]> {
    try {
      const response = await this.makeN8nRequest('/workflows');
      const data = await response.json();
      return data.data || [];

    } catch (error: any) {
      logger.error('Error listing n8n workflows:', error);
      return [];
    }
  }
  */
}

// Export singleton instance
export const n8nApiService = new N8nApiService();
