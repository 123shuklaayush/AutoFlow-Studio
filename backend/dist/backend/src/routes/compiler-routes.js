"use strict";
/**
 * @fileoverview Workflow compilation routes
 * @author Ayush Shukla
 * @description API routes for compiling sessions to workflows
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.compilerRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../middleware/error-handler");
const database_service_1 = require("../services/database-service");
const n8n_compiler_1 = require("../services/n8n-compiler");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.compilerRoutes = router;
/**
 * POST /compile/session - Compile session to workflow
 */
router.post("/session", (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, "Session compilation - Coming soon!"));
}));
/**
 * POST /compile/n8n - Generate n8n workflow JSON
 * Body: { workflowId: string, config?: StepMappingConfig }
 */
router.post("/n8n", (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { workflowId, config } = req.body;
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
        logger_1.logger.info(`Compiling workflow ${workflowId} to n8n format`);
        // Create compiler instance with custom config if provided
        const compiler = config
            ? new (await Promise.resolve().then(() => __importStar(require("../services/n8n-compiler")))).N8nCompiler(config)
            : n8n_compiler_1.n8nCompiler;
        // Compile workflow to n8n JSON
        const result = await compiler.compileWorkflow(workflow);
        if (result.success) {
            logger_1.logger.info(`n8n compilation successful for workflow ${workflowId}`, {
                originalSteps: result.metadata.originalSteps,
                generatedNodes: result.metadata.generatedNodes,
                compilationTime: result.metadata.compilationTime,
                features: result.metadata.features,
            });
            res.json((0, error_handler_1.createSuccessResponse)({
                n8nWorkflow: result.workflow,
                metadata: result.metadata,
                downloadUrl: `/api/v1/compile/n8n/${workflowId}/download`,
            }, "n8n workflow compiled successfully"));
        }
        else {
            logger_1.logger.error(`n8n compilation failed for workflow ${workflowId}`, result.errors);
            res.status(500).json((0, error_handler_1.createErrorResponse)("n8n compilation failed", 500, "COMPILATION_FAILED", {
                errors: result.errors,
                warnings: result.warnings,
                metadata: result.metadata,
            }));
        }
    }
    catch (error) {
        logger_1.logger.error("Error during n8n compilation:", error);
        res
            .status(500)
            .json((0, error_handler_1.createErrorResponse)("Internal server error during compilation", 500, "INTERNAL_ERROR", { details: error.message }));
    }
}));
/**
 * GET /compile/n8n/:workflowId/download - Download n8n workflow JSON file
 */
router.get("/n8n/:workflowId/download", (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { workflowId } = req.params;
    try {
        // Get workflow from database
        const dbService = (0, database_service_1.getDatabaseService)();
        const workflow = (await dbService.read("workflows", workflowId));
        if (!workflow) {
            res.status(404).json((0, error_handler_1.createErrorResponse)("Workflow not found", 404));
            return;
        }
        // Compile to n8n format
        const result = await n8n_compiler_1.n8nCompiler.compileWorkflow(workflow);
        if (!result.success) {
            res
                .status(500)
                .json((0, error_handler_1.createErrorResponse)("Compilation failed", 500, "COMPILATION_FAILED", { errors: result.errors }));
            return;
        }
        // Set headers for file download
        const filename = `${workflow.name.replace(/[^a-zA-Z0-9]/g, "_")}_n8n_workflow.json`;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        // Send the n8n workflow JSON
        res.json(result.workflow);
    }
    catch (error) {
        logger_1.logger.error("Error downloading n8n workflow:", error);
        res
            .status(500)
            .json((0, error_handler_1.createErrorResponse)("Failed to download workflow", 500, "DOWNLOAD_FAILED", { details: error.message }));
    }
}));
/**
 * GET /compile/workflows - List all workflows available for compilation
 */
router.get("/workflows", (0, error_handler_1.asyncHandler)(async (req, res) => {
    try {
        const dbService = (0, database_service_1.getDatabaseService)();
        const workflows = await dbService.list("workflows", {
            limit: 50,
            orderBy: "createdAt",
            orderDirection: "desc",
        });
        const workflowSummaries = workflows.map((workflow) => ({
            id: workflow.id,
            name: workflow.name,
            description: workflow.description,
            stepCount: workflow.stepCount,
            createdAt: workflow.createdAt,
            lastUsed: workflow.lastUsed,
            tags: workflow.tags,
            sourceSessionId: workflow.sourceSessionId,
        }));
        res.json((0, error_handler_1.createSuccessResponse)({
            workflows: workflowSummaries,
            total: workflows.length,
        }, "Workflows retrieved successfully"));
    }
    catch (error) {
        logger_1.logger.error("Error listing workflows:", error);
        res.status(500).json((0, error_handler_1.createErrorResponse)("Failed to list workflows", 500, "LIST_FAILED", {
            details: error.message,
        }));
    }
}));
//# sourceMappingURL=compiler-routes.js.map