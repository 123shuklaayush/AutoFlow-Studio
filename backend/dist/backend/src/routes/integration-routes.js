"use strict";
/**
 * @fileoverview Integration routes (WhatsApp, Gmail, n8n)
 * @author Ayush Shukla
 * @description API routes for external service integrations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../middleware/error-handler");
const database_service_1 = require("../services/database-service");
const n8n_compiler_1 = require("../services/n8n-compiler");
const n8n_api_service_1 = require("../services/n8n-api-service");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.integrationRoutes = router;
/**
 * GET /integrations/whatsapp/status - WhatsApp integration status
 */
router.get("/whatsapp/status", (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({ status: "not_configured" }, "WhatsApp integration - Coming soon!"));
}));
/**
 * POST /integrations/whatsapp/send - Send WhatsApp message
 */
router.post("/whatsapp/send", (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, "WhatsApp send - Coming soon!"));
}));
/**
 * GET /integrations/gmail/status - Gmail integration status
 */
router.get("/gmail/status", (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({ status: "not_configured" }, "Gmail integration - Coming soon!"));
}));
/**
 * GET /integrations/n8n/status - Get n8n integration status
 */
router.get("/n8n/status", (0, error_handler_1.asyncHandler)(async (req, res) => {
    try {
        const isHealthy = await n8n_api_service_1.n8nApiService.checkHealth();
        res.json((0, error_handler_1.createSuccessResponse)({
            status: isHealthy ? "connected" : "disconnected",
            healthy: isHealthy,
            baseUrl: "http://localhost:5678",
            message: isHealthy
                ? "n8n is running and accessible"
                : "n8n is not accessible. Please ensure n8n is running.",
        }, "n8n status retrieved"));
    }
    catch (error) {
        logger_1.logger.error("Error checking n8n status:", error);
        res
            .status(500)
            .json((0, error_handler_1.createErrorResponse)("Failed to check n8n status", 500, "N8N_STATUS_CHECK_FAILED", { details: error.message }));
    }
}));
/**
 * POST /integrations/n8n/deploy - Deploy workflow to n8n
 * Body: { workflowId: string }
 */
router.post("/n8n/deploy", (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { workflowId } = req.body;
    if (!workflowId) {
        res.status(400).json((0, error_handler_1.createErrorResponse)("Workflow ID is required", 400));
        return;
    }
    try {
        // Get workflow from database
        const dbService = (0, database_service_1.getDatabaseService)();
        const workflow = (await dbService.read("workflows", workflowId));
        if (!workflow) {
            res.status(404).json((0, error_handler_1.createErrorResponse)("Workflow not found", 404));
            return;
        }
        logger_1.logger.info(`Deploying workflow ${workflowId} to n8n`);
        // Compile workflow to n8n format
        const compilationResult = await n8n_compiler_1.n8nCompiler.compileWorkflow(workflow);
        if (!compilationResult.success) {
            res.status(500).json((0, error_handler_1.createErrorResponse)("Failed to compile workflow for n8n", 500, "COMPILATION_FAILED", {
                errors: compilationResult.errors,
                warnings: compilationResult.warnings,
            }));
            return;
        }
        // Deploy to n8n
        const deploymentResult = await n8n_api_service_1.n8nApiService.deployWorkflow(workflowId, compilationResult.workflow);
        if (deploymentResult.success) {
            logger_1.logger.info(`Workflow deployed to n8n successfully: ${workflowId}`, {
                n8nWorkflowId: deploymentResult.n8nWorkflowId,
            });
            res.json((0, error_handler_1.createSuccessResponse)({
                workflowId,
                n8nWorkflowId: deploymentResult.n8nWorkflowId,
                status: "deployed",
                warnings: deploymentResult.warnings,
                compilationMetadata: compilationResult.metadata,
            }, "Workflow deployed to n8n successfully"));
        }
        else {
            res.status(500).json((0, error_handler_1.createErrorResponse)("Failed to deploy workflow to n8n", 500, "DEPLOYMENT_FAILED", {
                error: deploymentResult.error,
                warnings: deploymentResult.warnings,
            }));
        }
    }
    catch (error) {
        logger_1.logger.error("Error deploying workflow to n8n:", error);
        res
            .status(500)
            .json((0, error_handler_1.createErrorResponse)("Internal server error during n8n deployment", 500, "INTERNAL_ERROR", { details: error.message }));
    }
}));
//# sourceMappingURL=integration-routes.js.map