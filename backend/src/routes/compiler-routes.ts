/**
 * @fileoverview Workflow compilation routes
 * @author Ayush Shukla
 * @description API routes for compiling sessions to workflows
 */

import { Router, Request, Response } from "express";
import {
  asyncHandler,
  createSuccessResponse,
  createErrorResponse,
} from "../middleware/error-handler";
import { getDatabaseService } from "../services/database-service";
import { n8nCompiler } from "../services/n8n-compiler";
import { Workflow } from "@shared/types/core";
import { StepMappingConfig } from "@shared/types/n8n";
import { logger } from "../utils/logger";

const router = Router();

/**
 * POST /compile/session - Compile session to workflow
 */
router.post(
  "/session",
  asyncHandler(async (req: Request, res: Response) => {
    res.json(createSuccessResponse({}, "Session compilation - Coming soon!"));
  })
);

/**
 * POST /compile/n8n - Generate n8n workflow JSON
 * Body: { workflowId: string, config?: StepMappingConfig }
 */
router.post(
  "/n8n",
  asyncHandler(async (req: Request, res: Response) => {
    const { workflowId, config } = req.body;

    if (!workflowId) {
      res.status(400).json(createErrorResponse("Workflow ID is required", 400));
      return;
    }

    try {
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

      logger.info(`Compiling workflow ${workflowId} to n8n format`);

      // Create compiler instance with custom config if provided
      const compiler = config
        ? new (await import("../services/n8n-compiler")).N8nCompiler(config)
        : n8nCompiler;

      // Compile workflow to n8n JSON
      const result = await compiler.compileWorkflow(workflow);

      if (result.success) {
        logger.info(`n8n compilation successful for workflow ${workflowId}`, {
          originalSteps: result.metadata.originalSteps,
          generatedNodes: result.metadata.generatedNodes,
          compilationTime: result.metadata.compilationTime,
          features: result.metadata.features,
        });

        res.json(
          createSuccessResponse(
            {
              n8nWorkflow: result.workflow,
              metadata: result.metadata,
              downloadUrl: `/api/v1/compile/n8n/${workflowId}/download`,
            },
            "n8n workflow compiled successfully"
          )
        );
      } else {
        logger.error(
          `n8n compilation failed for workflow ${workflowId}`,
          result.errors
        );

        res.status(500).json(
          createErrorResponse(
            "n8n compilation failed",
            500,
            "COMPILATION_FAILED",
            {
              errors: result.errors,
              warnings: result.warnings,
              metadata: result.metadata,
            }
          )
        );
      }
    } catch (error: any) {
      logger.error("Error during n8n compilation:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Internal server error during compilation",
            500,
            "INTERNAL_ERROR",
            { details: error.message }
          )
        );
    }
  })
);

/**
 * GET /compile/n8n/:workflowId/download - Download n8n workflow JSON file
 */
router.get(
  "/n8n/:workflowId/download",
  asyncHandler(async (req: Request, res: Response) => {
    const { workflowId } = req.params;

    try {
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

      // Compile to n8n format
      const result = await n8nCompiler.compileWorkflow(workflow);

      if (!result.success) {
        res
          .status(500)
          .json(
            createErrorResponse(
              "Compilation failed",
              500,
              "COMPILATION_FAILED",
              { errors: result.errors }
            )
          );
        return;
      }

      // Set headers for file download
      const filename = `${workflow.name.replace(/[^a-zA-Z0-9]/g, "_")}_n8n_workflow.json`;
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      // Send the n8n workflow JSON
      res.json(result.workflow);
    } catch (error: any) {
      logger.error("Error downloading n8n workflow:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Failed to download workflow",
            500,
            "DOWNLOAD_FAILED",
            { details: error.message }
          )
        );
    }
  })
);

/**
 * GET /compile/workflows - List all workflows available for compilation
 */
router.get(
  "/workflows",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const dbService = getDatabaseService();
      const workflows = await dbService.list("workflows", {
        limit: 50,
        orderBy: "createdAt",
        orderDirection: "desc",
      });

      const workflowSummaries = workflows.map((workflow: Workflow) => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        stepCount: workflow.stepCount,
        createdAt: workflow.createdAt,
        lastUsed: workflow.lastUsed,
        tags: workflow.tags,
        sourceSessionId: workflow.sourceSessionId,
      }));

      res.json(
        createSuccessResponse(
          {
            workflows: workflowSummaries,
            total: workflows.length,
          },
          "Workflows retrieved successfully"
        )
      );
    } catch (error: any) {
      logger.error("Error listing workflows:", error);
      res.status(500).json(
        createErrorResponse("Failed to list workflows", 500, "LIST_FAILED", {
          details: error.message,
        })
      );
    }
  })
);

export { router as compilerRoutes };
