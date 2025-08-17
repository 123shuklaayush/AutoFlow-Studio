/**
 * @fileoverview Workflow execution routes
 * @author Ayush Shukla
 * @description API routes for executing workflows
 */

import { Router, Request, Response } from "express";
import {
  asyncHandler,
  createSuccessResponse,
  createErrorResponse,
} from "../middleware/error-handler";
import { getDatabaseService } from "../services/database-service";
import { executionEngine, ExecutionConfig } from "../services/execution-engine";
import { Workflow } from "@shared/types/core";
import { logger } from "../utils/logger";

const router = Router();

// Store active executions
const activeExecutions = new Map<string, any>();

/**
 * POST /execute/workflow - Execute workflow
 * Body: { workflowId: string, config?: ExecutionConfig }
 */
router.post(
  "/workflow",
  asyncHandler(async (req: Request, res: Response) => {
    const { workflowId, config } = req.body;

    if (!workflowId) {
      res.status(400).json(createErrorResponse("Workflow ID is required", 400));
      return;
    }

    try {
      // Check if engine is already executing
      if (executionEngine.isCurrentlyExecuting()) {
        res
          .status(409)
          .json(
            createErrorResponse(
              "Another workflow is currently executing",
              409,
              "EXECUTION_IN_PROGRESS"
            )
          );
        return;
      }

      // Get workflow from database
      const dbService = getDatabaseService();
      const workflow = (await dbService.read(
        "workflows",
        workflowId
      )) as Workflow;

      if (!workflow) {
        res.status(404).json(createErrorResponse("Workflow not found", 404));
        return;
      }

      logger.info(`Starting workflow execution: ${workflowId}`);

      // Start execution (non-blocking)
      const executionPromise = executionEngine.executeWorkflow(workflow);

      // Store the execution promise
      activeExecutions.set(workflowId, executionPromise);

      // Set up progress listener
      const progressHandler = (progress: any) => {
        logger.info("Execution progress:", progress);
        // Here you could emit to WebSocket clients
      };

      executionEngine.on("progress", progressHandler);

      // Handle completion
      executionPromise
        .then((result) => {
          logger.info(`Workflow execution completed: ${workflowId}`, {
            success: result.success,
            duration: result.duration,
            stepsExecuted: result.stepsExecuted,
          });
          activeExecutions.delete(workflowId);
          executionEngine.removeListener("progress", progressHandler);
        })
        .catch((error) => {
          logger.error(`Workflow execution failed: ${workflowId}`, error);
          activeExecutions.delete(workflowId);
          executionEngine.removeListener("progress", progressHandler);
        });

      // Return immediate response
      res.json(
        createSuccessResponse(
          {
            executionId: `exec_${Date.now()}`,
            workflowId,
            status: "started",
            message: "Workflow execution started",
            statusUrl: `/api/v1/execute/status/${workflowId}`,
          },
          "Workflow execution started successfully"
        )
      );
    } catch (error: any) {
      logger.error("Error starting workflow execution:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Failed to start workflow execution",
            500,
            "EXECUTION_START_FAILED",
            { details: error.message }
          )
        );
    }
  })
);

/**
 * GET /execute/status/:workflowId - Get execution status
 */
router.get(
  "/status/:workflowId",
  asyncHandler(async (req: Request, res: Response) => {
    const { workflowId } = req.params;

    try {
      const currentExecution = executionEngine.getCurrentExecution();
      const isExecuting = executionEngine.isCurrentlyExecuting();
      const hasActiveExecution = activeExecutions.has(workflowId);

      if (currentExecution && currentExecution.workflowId === workflowId) {
        // Currently executing this workflow
        res.json(
          createSuccessResponse(
            {
              executionId: currentExecution.executionId,
              workflowId: currentExecution.workflowId,
              status: isExecuting
                ? "running"
                : currentExecution.success
                  ? "completed"
                  : "failed",
              progress: Math.round(
                (currentExecution.stepsExecuted / currentExecution.totalSteps) *
                  100
              ),
              currentStep: currentExecution.stepsExecuted,
              totalSteps: currentExecution.totalSteps,
              startTime: currentExecution.startTime,
              endTime: currentExecution.endTime,
              duration: currentExecution.duration,
              error: currentExecution.error,
              screenshots: currentExecution.screenshots,
              stepResults: currentExecution.stepResults.map((step) => ({
                stepId: step.stepId,
                stepIndex: step.stepIndex,
                action: step.action,
                success: step.success,
                duration: step.duration,
                error: step.error,
                retryCount: step.retryCount,
              })),
            },
            "Execution status retrieved"
          )
        );
      } else if (hasActiveExecution) {
        // Execution exists but not current (shouldn't happen normally)
        res.json(
          createSuccessResponse(
            {
              workflowId,
              status: "running",
              message: "Execution in progress",
            },
            "Execution in progress"
          )
        );
      } else {
        // No active execution
        res.json(
          createSuccessResponse(
            {
              workflowId,
              status: "not_running",
              message: "No active execution for this workflow",
            },
            "No active execution"
          )
        );
      }
    } catch (error: any) {
      logger.error("Error getting execution status:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Failed to get execution status",
            500,
            "STATUS_RETRIEVAL_FAILED",
            { details: error.message }
          )
        );
    }
  })
);

/**
 * POST /execute/stop/:workflowId - Stop workflow execution
 */
router.post(
  "/stop/:workflowId",
  asyncHandler(async (req: Request, res: Response) => {
    const { workflowId } = req.params;

    try {
      const currentExecution = executionEngine.getCurrentExecution();

      if (!currentExecution || currentExecution.workflowId !== workflowId) {
        res
          .status(404)
          .json(
            createErrorResponse(
              "No active execution found for this workflow",
              404
            )
          );
        return;
      }

      if (!executionEngine.isCurrentlyExecuting()) {
        res
          .status(400)
          .json(
            createErrorResponse("Workflow is not currently executing", 400)
          );
        return;
      }

      logger.info(`Stopping workflow execution: ${workflowId}`);

      await executionEngine.stopExecution();
      activeExecutions.delete(workflowId);

      res.json(
        createSuccessResponse(
          {
            workflowId,
            status: "stopped",
            message: "Workflow execution stopped",
          },
          "Workflow execution stopped successfully"
        )
      );
    } catch (error: any) {
      logger.error("Error stopping workflow execution:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Failed to stop workflow execution",
            500,
            "EXECUTION_STOP_FAILED",
            { details: error.message }
          )
        );
    }
  })
);

/**
 * GET /execute/history - Get execution history
 */
router.get(
  "/history",
  asyncHandler(async (req: Request, res: Response) => {
    // This would typically come from a database
    // For now, return empty history
    res.json(
      createSuccessResponse(
        {
          executions: [],
          total: 0,
        },
        "Execution history retrieved"
      )
    );
  })
);

/**
 * POST /execute/test - Test execution engine
 */
router.post(
  "/test",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      // Create a simple test workflow
      const testWorkflow: Workflow = {
        id: "test-workflow",
        name: "Test Workflow",
        description: "Simple test workflow",
        steps: [
          {
            id: "test-step-1",
            tabId: 1,
            url: "https://example.com",
            action: "navigate",
            selectors: [],
            timestamp: Date.now(),
            metadata: { description: "Navigate to example.com" },
          },
          {
            id: "test-step-2",
            tabId: 1,
            url: "https://example.com",
            action: "wait",
            selectors: [],
            timestamp: Date.now(),
            waitTime: 2000,
            metadata: { description: "Wait 2 seconds" },
          },
        ],
        stepCount: 2,
        createdAt: Date.now(),
        version: "1.0",
      };

      const result = await executionEngine.executeWorkflow(testWorkflow);

      res.json(
        createSuccessResponse(
          {
            testResult: result,
            message: "Test execution completed",
          },
          "Execution engine test completed"
        )
      );
    } catch (error: any) {
      logger.error("Error testing execution engine:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Execution engine test failed",
            500,
            "TEST_FAILED",
            { details: error.message }
          )
        );
    }
  })
);

export { router as executionRoutes };
