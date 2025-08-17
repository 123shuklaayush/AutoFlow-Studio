/**
 * @fileoverview n8n Workflow Types
 * @author Ayush Shukla
 * @description TypeScript interfaces for n8n workflow JSON structure
 */

export interface N8nWorkflowJSON {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: N8nConnections;
  active: boolean;
  settings: N8nWorkflowSettings;
  staticData?: Record<string, any>;
  tags?: string[];
  meta?: {
    templateCredsSetupCompleted?: boolean;
    instanceId?: string;
  };
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhookId?: string;
  onError?: "stopWorkflow" | "continueRegularOutput" | "continueErrorOutput";
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  continueOnFail?: boolean;
}

export interface N8nConnections {
  [sourceNodeName: string]: {
    [outputType: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}

export interface N8nWorkflowSettings {
  executionOrder: "v0" | "v1";
  saveManualExecutions?: boolean;
  callerPolicy?: "workflowsFromSameOwner" | "workflowsFromAList" | "any";
  errorWorkflow?: string;
  timezone?: string;
  saveExecutionProgress?: boolean;
  saveDataErrorExecution?: "all" | "none";
  saveDataSuccessExecution?: "all" | "none";
}

// Common n8n node types we'll use
export type N8nNodeType =
  | "n8n-nodes-base.start" // Trigger node
  | "n8n-nodes-base.httpRequest" // HTTP requests
  | "n8n-nodes-base.set" // Set variables
  | "n8n-nodes-base.if" // Conditional logic
  | "n8n-nodes-base.wait" // Wait/delay
  | "n8n-nodes-base.code" // Custom JavaScript
  | "n8n-nodes-base.webhook" // Webhook trigger
  | "n8n-nodes-base.cron" // Scheduled trigger
  | "n8n-nodes-base.function" // Function node
  | "n8n-nodes-base.merge" // Merge data
  | "n8n-nodes-base.itemLists" // Process lists
  | "n8n-nodes-base.stopAndError"; // Error handling

// Browser automation specific (if using n8n-nodes-playwright or similar)
export type BrowserNodeType =
  | "n8n-nodes-playwright.browser" // Browser control
  | "n8n-nodes-playwright.page" // Page navigation
  | "n8n-nodes-playwright.click" // Click actions
  | "n8n-nodes-playwright.input" // Input actions
  | "n8n-nodes-playwright.wait"; // Wait conditions

// Compilation context for step mapping
export interface CompilationContext {
  workflowId: string;
  sessionId: string;
  baseUrl: string;
  variables: Record<string, any>;
  credentials: Record<string, string>;
  nodeCounter: number;
  position: { x: number; y: number };
}

// Result of compilation process
export interface CompilationResult {
  success: boolean;
  workflow?: N8nWorkflowJSON;
  errors?: string[];
  warnings?: string[];
  metadata: {
    originalSteps: number;
    generatedNodes: number;
    compilationTime: number;
    features: string[];
  };
}

// Step mapping configuration
export interface StepMappingConfig {
  enableRetries: boolean;
  maxRetries: number;
  waitBetweenRetries: number;
  enableScreenshots: boolean;
  enableErrorRecovery: boolean;
  timeoutMs: number;
  selectorStrategy: "css" | "xpath" | "text" | "auto";
}
