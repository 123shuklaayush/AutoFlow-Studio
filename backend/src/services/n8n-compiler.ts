/**
 * @fileoverview n8n Workflow Compiler Service
 * @author Ayush Shukla
 * @description Converts recorded TraceStep[] into executable n8n workflow JSON
 */

import { TraceStep, Workflow } from "@shared/types/core";
import {
  N8nWorkflowJSON,
  N8nNode,
  N8nConnections,
  CompilationContext,
  CompilationResult,
  StepMappingConfig,
  N8nNodeType,
} from "@shared/types/n8n";
import { logger } from "../utils/logger";

export class N8nCompiler {
  private config: StepMappingConfig;

  constructor(config: Partial<StepMappingConfig> = {}) {
    this.config = {
      enableRetries: true,
      maxRetries: 3,
      waitBetweenRetries: 2000,
      enableScreenshots: true,
      enableErrorRecovery: true,
      timeoutMs: 30000,
      selectorStrategy: "auto",
      ...config,
    };
  }

  /**
   * Compile a workflow into n8n JSON format
   */
  async compileWorkflow(workflow: Workflow): Promise<CompilationResult> {
    const startTime = Date.now();

    try {
      logger.info(`Starting n8n compilation for workflow: ${workflow.id}`);

      // Initialize compilation context
      const context: CompilationContext = {
        workflowId: workflow.id,
        sessionId: workflow.sourceSessionId || "unknown",
        baseUrl: this.extractBaseUrl(workflow.steps),
        variables: {},
        credentials: {},
        nodeCounter: 0,
        position: { x: 100, y: 100 },
      };

      // Generate n8n workflow
      const n8nWorkflow = await this.generateN8nWorkflow(workflow, context);

      const compilationTime = Date.now() - startTime;

      return {
        success: true,
        workflow: n8nWorkflow,
        metadata: {
          originalSteps: workflow.steps.length,
          generatedNodes: n8nWorkflow.nodes.length,
          compilationTime,
          features: this.extractFeatures(workflow.steps),
        },
      };
    } catch (error: any) {
      logger.error("n8n compilation failed:", error);

      return {
        success: false,
        errors: [error.message],
        metadata: {
          originalSteps: workflow.steps.length,
          generatedNodes: 0,
          compilationTime: Date.now() - startTime,
          features: [],
        },
      };
    }
  }

  /**
   * Generate the complete n8n workflow JSON
   */
  private async generateN8nWorkflow(
    workflow: Workflow,
    context: CompilationContext
  ): Promise<N8nWorkflowJSON> {
    const nodes: N8nNode[] = [];
    const connections: N8nConnections = {};

    // 1. Add trigger node (manual start)
    const triggerNode = this.createTriggerNode(context);
    nodes.push(triggerNode);

    // 2. Add initialization node (set variables, open browser)
    const initNode = this.createInitializationNode(workflow, context);
    nodes.push(initNode);
    this.addConnection(connections, triggerNode.name, initNode.name);

    // 3. Convert each step to n8n nodes
    let previousNode = initNode;

    for (const step of workflow.steps) {
      const stepNodes = await this.convertStepToNodes(step, context);

      for (const stepNode of stepNodes) {
        nodes.push(stepNode);

        // Connect to previous node
        this.addConnection(connections, previousNode.name, stepNode.name);
        previousNode = stepNode;
      }
    }

    // 4. Add completion node
    const completionNode = this.createCompletionNode(context);
    nodes.push(completionNode);
    this.addConnection(connections, previousNode.name, completionNode.name);

    return {
      name: workflow.name || `AutoFlow Workflow ${workflow.id}`,
      nodes,
      connections,
      active: false, // User can activate manually
      settings: {
        executionOrder: "v1",
        saveManualExecutions: true,
        saveExecutionProgress: true,
        saveDataErrorExecution: "all",
        saveDataSuccessExecution: "all",
      },
      tags: workflow.tags || ["autoflow", "automation"],
      meta: {
        templateCredsSetupCompleted: false,
        instanceId: workflow.id,
      },
    };
  }

  /**
   * Create the trigger node (manual start)
   */
  private createTriggerNode(context: CompilationContext): N8nNode {
    return {
      id: this.generateNodeId(context),
      name: "Manual Trigger",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: [context.position.x, context.position.y],
      parameters: {},
    };
  }

  /**
   * Create initialization node (browser setup, variables)
   */
  private createInitializationNode(
    workflow: Workflow,
    context: CompilationContext
  ): N8nNode {
    this.advancePosition(context);

    return {
      id: this.generateNodeId(context),
      name: "Initialize Browser",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [context.position.x, context.position.y],
      parameters: {
        jsCode: `
// AutoFlow Initialization
const { chromium } = require('playwright');

// Launch browser
const browser = await chromium.launch({ 
  headless: false,  // Visible for debugging
  slowMo: 1000     // Slow down for reliability
});

const page = await browser.newPage();

// Set viewport
await page.setViewportSize({ width: 1920, height: 1080 });

// Navigate to starting URL
await page.goto('${context.baseUrl}');

// Wait for page load
await page.waitForLoadState('networkidle');

return {
  browser: browser,
  page: page,
  success: true,
  message: 'Browser initialized successfully'
};
        `.trim(),
      },
      onError: "stopWorkflow",
      retryOnFail: this.config.enableRetries,
      maxTries: this.config.maxRetries,
      waitBetweenTries: this.config.waitBetweenRetries,
    };
  }

  /**
   * Convert a single TraceStep to n8n nodes
   */
  private async convertStepToNodes(
    step: TraceStep,
    context: CompilationContext
  ): Promise<N8nNode[]> {
    const nodes: N8nNode[] = [];

    switch (step.action) {
      case "click":
        nodes.push(this.createClickNode(step, context));
        break;

      case "input":
        nodes.push(this.createInputNode(step, context));
        break;

      case "scroll":
        nodes.push(this.createScrollNode(step, context));
        break;

      case "navigation":
        nodes.push(this.createNavigationNode(step, context));
        break;

      case "wait":
        nodes.push(this.createWaitNode(step, context));
        break;

      default:
        logger.warn(
          `Unknown step action: ${step.action}, creating generic node`
        );
        nodes.push(this.createGenericStepNode(step, context));
    }

    return nodes;
  }

  /**
   * Create a click action node
   */
  private createClickNode(
    step: TraceStep,
    context: CompilationContext
  ): N8nNode {
    this.advancePosition(context);

    const selector = this.getBestSelector(step);

    return {
      id: this.generateNodeId(context),
      name: `Click: ${step.metadata?.description || "Element"}`,
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [context.position.x, context.position.y],
      parameters: {
        jsCode: `
// AutoFlow Click Action
const page = $input.first().page;

try {
  // Wait for element to be visible
  await page.waitForSelector('${selector}', { 
    timeout: ${this.config.timeoutMs},
    state: 'visible' 
  });
  
  // Scroll element into view
  await page.locator('${selector}').scrollIntoViewIfNeeded();
  
  // Click the element
  await page.click('${selector}');
  
  // Wait for any navigation or loading
  await page.waitForTimeout(1000);
  
  ${
    this.config.enableScreenshots
      ? `
  // Take screenshot for verification
  const screenshot = await page.screenshot({ 
    path: 'step_${step.id}_click.png',
    fullPage: false 
  });
  `
      : ""
  }
  
  return {
    success: true,
    action: 'click',
    selector: '${selector}',
    stepId: '${step.id}',
    ${this.config.enableScreenshots ? "screenshot: screenshot," : ""}
    timestamp: new Date().toISOString()
  };
  
} catch (error) {
  console.error('Click failed:', error);
  
  ${
    this.config.enableErrorRecovery
      ? `
  // Try alternative selectors
  const alternativeSelectors = ${JSON.stringify(step.selectors.slice(1))};
  
  for (const altSelector of alternativeSelectors) {
    try {
      await page.waitForSelector(altSelector, { timeout: 5000 });
      await page.click(altSelector);
      
      return {
        success: true,
        action: 'click',
        selector: altSelector,
        stepId: '${step.id}',
        recovered: true,
        timestamp: new Date().toISOString()
      };
    } catch (altError) {
      continue;
    }
  }
  `
      : ""
  }
  
  throw new Error(\`Click failed on element: \${error.message}\`);
}
        `.trim(),
      },
      onError: "stopWorkflow",
      retryOnFail: this.config.enableRetries,
      maxTries: this.config.maxRetries,
      waitBetweenTries: this.config.waitBetweenRetries,
    };
  }

  /**
   * Create an input action node
   */
  private createInputNode(
    step: TraceStep,
    context: CompilationContext
  ): N8nNode {
    this.advancePosition(context);

    const selector = this.getBestSelector(step);
    const inputValue = (
      step.inputValue ??
      step.inputData?.value ??
      ""
    ).toString();
    const isSensitive =
      Boolean(step.inputData?.sensitive) || step.inputData?.type === "password";

    return {
      id: this.generateNodeId(context),
      name: `Input: ${step.metadata?.description || "Text"}`,
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [context.position.x, context.position.y],
      parameters: {
        jsCode: `
// AutoFlow Input Action
const page = $input.first().page;

try {
  // Wait for input field
  await page.waitForSelector('${selector}', { 
    timeout: ${this.config.timeoutMs},
    state: 'visible' 
  });
  
  // Clear existing content
  await page.fill('${selector}', '');
  
  // Type the value
  await page.type('${selector}', '${inputValue}'.toString(), { delay: 100 });
  
  // Wait for any auto-complete or validation
  await page.waitForTimeout(500);
  
  return {
    success: true,
    action: 'input',
    selector: '${selector}',
    value: ${isSensitive ? "'***'" : `'${inputValue}'`},
    stepId: '${step.id}',
    timestamp: new Date().toISOString()
  };
  
} catch (error) {
  console.error('Input failed:', error);
  throw new Error(\`Input failed on field: \${error.message}\`);
}
        `.trim(),
      },
      onError: "stopWorkflow",
      retryOnFail: this.config.enableRetries,
      maxTries: this.config.maxRetries,
      waitBetweenTries: this.config.waitBetweenRetries,
    };
  }

  /**
   * Create a scroll action node
   */
  private createScrollNode(
    step: TraceStep,
    context: CompilationContext
  ): N8nNode {
    this.advancePosition(context);

    const scrollX = step.scrollPosition?.x || 0;
    const scrollY = step.scrollPosition?.y || 0;

    return {
      id: this.generateNodeId(context),
      name: `Scroll: ${step.metadata?.description || "Page"}`,
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [context.position.x, context.position.y],
      parameters: {
        jsCode: `
// AutoFlow Scroll Action
const page = $input.first().page;

try {
  // Scroll to position
  await page.evaluate(({ x, y }) => {
    window.scrollTo(x, y);
  }, { x: ${scrollX}, y: ${scrollY} });
  
  // Wait for scroll to complete
  await page.waitForTimeout(500);
  
  return {
    success: true,
    action: 'scroll',
    position: { x: ${scrollX}, y: ${scrollY} },
    stepId: '${step.id}',
    timestamp: new Date().toISOString()
  };
  
} catch (error) {
  console.error('Scroll failed:', error);
  throw new Error(\`Scroll failed: \${error.message}\`);
}
        `.trim(),
      },
      onError: "continueRegularOutput",
      retryOnFail: false, // Scrolling failures are usually not critical
    };
  }

  /**
   * Create a navigation action node
   */
  private createNavigationNode(
    step: TraceStep,
    context: CompilationContext
  ): N8nNode {
    this.advancePosition(context);

    return {
      id: this.generateNodeId(context),
      name: `Navigate: ${step.url}`,
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [context.position.x, context.position.y],
      parameters: {
        jsCode: `
// AutoFlow Navigation Action
const page = $input.first().page;

try {
  // Navigate to URL
  await page.goto('${step.url}', { 
    waitUntil: 'networkidle',
    timeout: ${this.config.timeoutMs}
  });
  
  return {
    success: true,
    action: 'navigation',
    url: '${step.url}',
    stepId: '${step.id}',
    timestamp: new Date().toISOString()
  };
  
} catch (error) {
  console.error('Navigation failed:', error);
  throw new Error(\`Navigation failed to \${step.url}: \${error.message}\`);
}
        `.trim(),
      },
      onError: "stopWorkflow",
      retryOnFail: this.config.enableRetries,
      maxTries: this.config.maxRetries,
      waitBetweenTries: this.config.waitBetweenRetries,
    };
  }

  /**
   * Create a wait action node
   */
  private createWaitNode(
    step: TraceStep,
    context: CompilationContext
  ): N8nNode {
    this.advancePosition(context);

    const waitTime = step.waitTime || 1000;

    return {
      id: this.generateNodeId(context),
      name: `Wait: ${waitTime}ms`,
      type: "n8n-nodes-base.wait",
      typeVersion: 1,
      position: [context.position.x, context.position.y],
      parameters: {
        amount: waitTime,
        unit: "ms",
      },
    };
  }

  /**
   * Create a generic step node for unknown actions
   */
  private createGenericStepNode(
    step: TraceStep,
    context: CompilationContext
  ): N8nNode {
    this.advancePosition(context);

    return {
      id: this.generateNodeId(context),
      name: `Generic: ${step.action}`,
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [context.position.x, context.position.y],
      parameters: {
        jsCode: `
// AutoFlow Generic Action
console.log('Executing step:', ${JSON.stringify(step, null, 2)});

return {
  success: true,
  action: '${step.action}',
  stepId: '${step.id}',
  note: 'Generic step - may need manual implementation',
  timestamp: new Date().toISOString()
};
        `.trim(),
      },
      onError: "continueRegularOutput",
    };
  }

  /**
   * Create completion node (cleanup, close browser)
   */
  private createCompletionNode(context: CompilationContext): N8nNode {
    this.advancePosition(context);

    return {
      id: this.generateNodeId(context),
      name: "Complete Workflow",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [context.position.x, context.position.y],
      parameters: {
        jsCode: `
// AutoFlow Completion
const browser = $input.first().browser;

try {
  // Close browser
  if (browser) {
    await browser.close();
  }
  
  return {
    success: true,
    message: 'Workflow completed successfully',
    completedAt: new Date().toISOString()
  };
  
} catch (error) {
  console.error('Cleanup failed:', error);
  return {
    success: false,
    error: error.message,
    completedAt: new Date().toISOString()
  };
}
        `.trim(),
      },
      onError: "continueRegularOutput",
    };
  }

  // Helper methods

  private generateNodeId(context: CompilationContext): string {
    return `autoflow_${context.nodeCounter++}`;
  }

  private advancePosition(context: CompilationContext): void {
    context.position.y += 150; // Move down for next node
  }

  private addConnection(
    connections: N8nConnections,
    fromNode: string,
    toNode: string
  ): void {
    if (!connections[fromNode]) {
      connections[fromNode] = {};
    }
    if (!connections[fromNode].main) {
      connections[fromNode].main = [];
    }
    connections[fromNode].main.push({
      node: toNode,
      type: "main",
      index: 0,
    });
  }

  private getBestSelector(step: TraceStep): string {
    // Return the first (most reliable) selector as string
    const firstSelector = step.selectors[0];
    if (typeof firstSelector === "string") {
      return firstSelector;
    } else if (firstSelector && typeof firstSelector === "object") {
      // If it's an ElementSelector object, use the selector property
      return (firstSelector as any).selector || `[data-step-id="${step.id}"]`;
    }
    return `[data-step-id="${step.id}"]`;
  }

  private extractBaseUrl(steps: TraceStep[]): string {
    const firstStep = steps.find((s) => s.url);
    if (!firstStep) return "https://example.com";

    try {
      const url = new URL(firstStep.url);
      return `${url.protocol}//${url.host}`;
    } catch {
      return "https://example.com";
    }
  }

  private extractFeatures(steps: TraceStep[]): string[] {
    const features = new Set<string>();

    steps.forEach((step) => {
      features.add(step.action);

      if (step.inputValue) features.add("form-input");
      if (step.scrollPosition) features.add("scrolling");
      if (step.url !== steps[0]?.url) features.add("navigation");
    });

    return Array.from(features);
  }
}

// Export singleton instance
export const n8nCompiler = new N8nCompiler();
