"use strict";
/**
 * @fileoverview Workflow execution routes
 * @author Ayush Shukla
 * @description API routes for executing workflows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executionRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../middleware/error-handler");
const router = (0, express_1.Router)();
exports.executionRoutes = router;
/**
 * POST /execute/workflow - Execute workflow
 */
router.post('/workflow', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'Workflow execution - Coming soon!'));
}));
/**
 * GET /execute/:id - Get execution status
 */
router.get('/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'Execution status - Coming soon!'));
}));
//# sourceMappingURL=execution-routes.js.map