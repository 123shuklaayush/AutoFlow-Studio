/**
 * @fileoverview Integration routes (WhatsApp, Gmail, n8n)
 * @author Ayush Shukla
 * @description API routes for external service integrations
 */

import { Router, Request, Response } from "express";
import {
  asyncHandler,
  createSuccessResponse,
  createErrorResponse,
} from "../middleware/error-handler";
import { getDatabaseService } from "../services/database-service";
import { n8nCompiler } from "../services/n8n-compiler";
import { n8nApiService } from "../services/n8n-api-service";
import { Workflow } from "@shared/types/core";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /integrations/whatsapp/status - WhatsApp integration status
 */
router.get(
  "/whatsapp/status",
  asyncHandler(async (req: Request, res: Response) => {
    res.json(
      createSuccessResponse(
        { status: "not_configured" },
        "WhatsApp integration - Coming soon!"
      )
    );
  })
);

/**
 * POST /integrations/whatsapp/send - Send WhatsApp message
 */
router.post(
  "/whatsapp/send",
  asyncHandler(async (req: Request, res: Response) => {
    res.json(createSuccessResponse({}, "WhatsApp send - Coming soon!"));
  })
);

/**
 * GET /integrations/gmail/status - Gmail integration status
 */
router.get(
  "/gmail/status",
  asyncHandler(async (req: Request, res: Response) => {
    res.json(
      createSuccessResponse(
        { status: "not_configured" },
        "Gmail integration - Coming soon!"
      )
    );
  })
);

/**
 * GET /integrations/n8n/status - Get n8n integration status
 */
router.get(
  "/n8n/status",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const isHealthy = await n8nApiService.checkHealth();

      res.json(
        createSuccessResponse(
          {
            status: isHealthy ? "connected" : "disconnected",
            healthy: isHealthy,
            baseUrl: "http://localhost:5678",
            message: isHealthy
              ? "n8n is running and accessible"
              : "n8n is not accessible. Please ensure n8n is running.",
          },
          "n8n status retrieved"
        )
      );
    } catch (error: any) {
      logger.error("Error checking n8n status:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Failed to check n8n status",
            500,
            "N8N_STATUS_CHECK_FAILED",
            { details: error.message }
          )
        );
    }
  })
);

/**
 * POST /integrations/n8n/deploy - Deploy workflow to n8n
 * Body: { workflowId: string }
 */
router.post(
  "/n8n/deploy",
  asyncHandler(async (req: Request, res: Response) => {
    const { workflowId } = req.body;

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

      logger.info(`Deploying workflow ${workflowId} to n8n`);

      // Compile workflow to n8n format
      const compilationResult = await n8nCompiler.compileWorkflow(workflow);

      if (!compilationResult.success) {
        res.status(500).json(
          createErrorResponse(
            "Failed to compile workflow for n8n",
            500,
            "COMPILATION_FAILED",
            {
              errors: compilationResult.errors,
              warnings: compilationResult.warnings,
            }
          )
        );
        return;
      }

      // Deploy to n8n
      const deploymentResult = await n8nApiService.deployWorkflow(
        workflowId,
        compilationResult.workflow!
      );

      if (deploymentResult.success) {
        logger.info(`Workflow deployed to n8n successfully: ${workflowId}`, {
          n8nWorkflowId: deploymentResult.n8nWorkflowId,
        });

        res.json(
          createSuccessResponse(
            {
              workflowId,
              n8nWorkflowId: deploymentResult.n8nWorkflowId,
              status: "deployed",
              warnings: deploymentResult.warnings,
              compilationMetadata: compilationResult.metadata,
            },
            "Workflow deployed to n8n successfully"
          )
        );
      } else {
        res.status(500).json(
          createErrorResponse(
            "Failed to deploy workflow to n8n",
            500,
            "DEPLOYMENT_FAILED",
            {
              error: deploymentResult.error,
              warnings: deploymentResult.warnings,
            }
          )
        );
      }
    } catch (error: any) {
      logger.error("Error deploying workflow to n8n:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Internal server error during n8n deployment",
            500,
            "INTERNAL_ERROR",
            { details: error.message }
          )
        );
    }
  })
);

export { router as integrationRoutes };
