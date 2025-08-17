"use strict";
/**
 * @fileoverview Session management routes for AutoFlow Studio
 * @author Ayush Shukla
 * @description Handles recording session data, trace steps, and session lifecycle.
 * Follows SOLID principles with proper error handling and validation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_service_1 = require("../services/database-service");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
/**
 * POST /api/sessions/steps
 * Save a trace step to the current recording session
 */
router.post("/steps", async (req, res) => {
    try {
        const { sessionId, step, timestamp } = req.body;
        // Validate required fields
        if (!sessionId || !step) {
            res.status(400).json({
                success: false,
                error: "Missing required fields: sessionId and step",
            });
            return;
        }
        // Validate step structure
        if (!step.id || !step.action || !step.url) {
            res.status(400).json({
                success: false,
                error: "Invalid step structure: missing id, action, or url",
            });
            return;
        }
        const dbService = (0, database_service_1.getDatabaseService)();
        // Get or create session
        let session;
        const existingSession = (await dbService.read("sessions", sessionId));
        if (existingSession) {
            session = existingSession;
        }
        else {
            // Session doesn't exist, create new one
            session = {
                id: sessionId,
                startTime: timestamp || Date.now(),
                stepCount: 0,
                status: "active",
                metadata: {
                    initialUrl: step.url,
                    tabId: step.tabId,
                    // Future-ready fields for multi-user support
                    deviceId: req.get("X-Device-ID") || "anonymous",
                    userAgent: req.get("User-Agent"),
                    // userId: null, // Will be added when auth is implemented
                },
                steps: [],
                lastUpdated: Date.now(),
                // Future-ready fields
                version: "1.0", // For schema migrations
                tags: [], // For workflow organization
            };
            logger_1.logger.info(`Creating new session: ${sessionId}`);
        }
        // Ensure steps array exists (defensive programming)
        if (!session.steps) {
            session.steps = [];
        }
        // Add step to session
        session.steps.push(step);
        session.stepCount = session.steps.length;
        session.lastUpdated = Date.now();
        session.metadata.userAgent = req.get("User-Agent");
        // Save session to Firebase (create if new, update if existing)
        if (existingSession) {
            await dbService.update("sessions", sessionId, session);
        }
        else {
            await dbService.create("sessions", session, sessionId);
        }
        // Also save individual step for easier querying
        const stepDoc = {
            sessionId: sessionId,
            stepIndex: session.stepCount - 1,
            savedAt: Date.now(),
            ...step,
        };
        await dbService.create("steps", stepDoc, step.id);
        logger_1.logger.info(`Step saved: ${step.id} for session: ${sessionId}`);
        res.json({
            success: true,
            stepId: step.id,
            sessionId: sessionId,
            stepIndex: session.stepCount - 1,
            totalSteps: session.stepCount,
        });
    }
    catch (error) {
        logger_1.logger.error("Error saving trace step:", error);
        res.status(500).json({
            success: false,
            error: "Failed to save trace step",
            details: error.message,
        });
    }
});
/**
 * GET /api/sessions/:sessionId
 * Get session data and all steps
 */
router.get("/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            res.status(400).json({
                success: false,
                error: "Session ID is required",
            });
            return;
        }
        const dbService = (0, database_service_1.getDatabaseService)();
        const session = (await dbService.read("sessions", sessionId));
        if (!session) {
            res.status(404).json({
                success: false,
                error: "Session not found",
            });
            return;
        }
        logger_1.logger.info(`Retrieved session: ${sessionId} with ${session.stepCount} steps`);
        res.json({
            success: true,
            session: session,
        });
    }
    catch (error) {
        logger_1.logger.error("Error retrieving session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve session",
            details: error.message,
        });
    }
});
/**
 * GET /api/sessions
 * List all sessions (with pagination)
 */
router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const dbService = (0, database_service_1.getDatabaseService)();
        const sessions = await dbService.list("sessions", {
            limit,
            offset,
            orderBy: "lastUpdated",
            orderDirection: "desc",
        });
        logger_1.logger.info(`Retrieved ${sessions.length} sessions`);
        res.json({
            success: true,
            sessions: sessions,
            pagination: {
                limit: limit,
                offset: offset,
                hasMore: sessions.length === limit,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Error listing sessions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to list sessions",
            details: error.message,
        });
    }
});
/**
 * POST /api/sessions/:sessionId/complete
 * Mark session as completed
 */
router.post("/:sessionId/complete", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { duration, stepCount, name, description, createWorkflow = false, } = req.body;
        if (!sessionId) {
            res.status(400).json({
                success: false,
                error: "Session ID is required",
            });
            return;
        }
        const dbService = (0, database_service_1.getDatabaseService)();
        const session = (await dbService.read("sessions", sessionId));
        if (!session) {
            res.status(404).json({
                success: false,
                error: "Session not found",
            });
            return;
        }
        // Update session status
        session.status = "completed";
        session.endTime = Date.now();
        session.lastUpdated = Date.now();
        if (stepCount !== undefined) {
            session.stepCount = stepCount;
        }
        // Add workflow metadata if provided
        if (name)
            session.metadata.workflowName = name;
        if (description)
            session.metadata.workflowDescription = description;
        await dbService.update("sessions", sessionId, session);
        let workflowId = null;
        // Create workflow if requested (future-ready for workflow management)
        if (createWorkflow && name) {
            workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const workflow = {
                id: workflowId,
                name: name,
                description: description || "",
                sourceSessionId: sessionId,
                deviceId: session.metadata.deviceId || "anonymous",
                // userId: session.metadata.userId, // Future: when auth is added
                steps: session.steps,
                stepCount: session.stepCount,
                createdAt: Date.now(),
                lastUsed: null,
                usageCount: 0,
                version: "1.0",
                tags: session.tags || [],
                metadata: {
                    originalUrl: session.metadata.initialUrl,
                    duration: session.endTime - session.startTime,
                    browser: session.metadata.userAgent,
                },
            };
            await dbService.create("workflows", workflow, workflowId);
            logger_1.logger.info(`Workflow created: ${workflowId} from session: ${sessionId}`);
        }
        logger_1.logger.info(`Session completed: ${sessionId} with ${session.stepCount} steps`);
        res.json({
            success: true,
            sessionId: sessionId,
            workflowId: workflowId,
            status: "completed",
            stepCount: session.stepCount,
            duration: session.endTime - session.startTime,
        });
    }
    catch (error) {
        logger_1.logger.error("Error completing session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to complete session",
            details: error.message,
        });
    }
});
/**
 * DELETE /api/sessions/:sessionId
 * Delete a session and all its steps
 */
router.delete("/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            res.status(400).json({
                success: false,
                error: "Session ID is required",
            });
            return;
        }
        const dbService = (0, database_service_1.getDatabaseService)();
        // Get session to check if it exists
        const session = (await dbService.read("sessions", sessionId));
        if (!session) {
            res.status(404).json({
                success: false,
                error: "Session not found",
            });
            return;
        }
        // Delete all steps for this session
        for (const step of session.steps) {
            try {
                await dbService.delete("steps", step.id);
            }
            catch (error) {
                logger_1.logger.warn(`Failed to delete step ${step.id}:`, error);
            }
        }
        // Delete the session
        await dbService.delete("sessions", sessionId);
        logger_1.logger.info(`Session deleted: ${sessionId} with ${session.stepCount} steps`);
        res.json({
            success: true,
            sessionId: sessionId,
            deletedSteps: session.stepCount,
        });
    }
    catch (error) {
        logger_1.logger.error("Error deleting session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete session",
            details: error.message,
        });
    }
});
/**
 * GET /api/sessions/:sessionId/export
 * Export session data in various formats
 */
router.get("/:sessionId/export", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const format = req.query.format || "json";
        if (!sessionId) {
            res.status(400).json({
                success: false,
                error: "Session ID is required",
            });
            return;
        }
        const dbService = (0, database_service_1.getDatabaseService)();
        const session = (await dbService.read("sessions", sessionId));
        if (!session) {
            res.status(404).json({
                success: false,
                error: "Session not found",
            });
            return;
        }
        // Prepare export data
        const exportData = {
            sessionId: session.id,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.endTime ? session.endTime - session.startTime : null,
            stepCount: session.stepCount,
            status: session.status,
            metadata: session.metadata,
            steps: session.steps.map((step, index) => ({
                index: index + 1,
                id: step.id,
                action: step.action,
                url: step.url,
                selectors: step.selectors,
                timestamp: step.timestamp,
                description: step.metadata?.description,
                tags: step.metadata?.tags,
            })),
            exportedAt: Date.now(),
        };
        switch (format.toLowerCase()) {
            case "json":
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Content-Disposition", `attachment; filename="session_${sessionId}.json"`);
                res.json(exportData);
                break;
            case "csv":
                // Simple CSV export of steps
                const csvHeaders = "Index,Action,URL,Description,Timestamp\n";
                const csvRows = exportData.steps
                    .map((step) => `${step.index},"${step.action}","${step.url}","${step.description || ""}","${new Date(step.timestamp).toISOString()}"`)
                    .join("\n");
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", `attachment; filename="session_${sessionId}.csv"`);
                res.send(csvHeaders + csvRows);
                break;
            default:
                res.status(400).json({
                    success: false,
                    error: "Unsupported format. Use json or csv.",
                });
                return;
        }
        logger_1.logger.info(`Session exported: ${sessionId} as ${format}`);
    }
    catch (error) {
        logger_1.logger.error("Error exporting session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to export session",
            details: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=session-routes.js.map