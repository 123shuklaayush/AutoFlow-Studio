"use strict";
/**
 * @fileoverview Workflow compilation routes
 * @author Ayush Shukla
 * @description API routes for compiling sessions to workflows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compilerRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../middleware/error-handler");
const router = (0, express_1.Router)();
exports.compilerRoutes = router;
/**
 * POST /compile/session - Compile session to workflow
 */
router.post('/session', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'Session compilation - Coming soon!'));
}));
/**
 * POST /compile/n8n - Generate n8n workflow JSON
 */
router.post('/n8n', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'n8n compilation - Coming soon!'));
}));
//# sourceMappingURL=compiler-routes.js.map