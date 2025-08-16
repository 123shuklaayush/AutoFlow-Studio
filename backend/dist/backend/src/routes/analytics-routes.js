"use strict";
/**
 * @fileoverview Analytics and monitoring routes
 * @author Ayush Shukla
 * @description API routes for analytics and system monitoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../middleware/error-handler");
const router = (0, express_1.Router)();
exports.analyticsRoutes = router;
/**
 * GET /analytics/dashboard - Get dashboard analytics
 */
router.get('/dashboard', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({
        workflows: 0,
        executions: 0,
        sessions: 0
    }, 'Analytics dashboard - Coming soon!'));
}));
/**
 * GET /analytics/workflows - Get workflow analytics
 */
router.get('/workflows', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)([], 'Workflow analytics - Coming soon!'));
}));
//# sourceMappingURL=analytics-routes.js.map