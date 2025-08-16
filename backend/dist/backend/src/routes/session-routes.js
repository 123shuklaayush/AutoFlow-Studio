"use strict";
/**
 * @fileoverview Recording session routes
 * @author Ayush Shukla
 * @description API routes for managing recording sessions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../middleware/error-handler");
const router = (0, express_1.Router)();
exports.sessionRoutes = router;
/**
 * GET /sessions - List recording sessions
 */
router.get('/', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)([], 'Sessions endpoint - Coming soon!'));
}));
/**
 * POST /sessions - Create new recording session
 */
router.post('/', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'Create session endpoint - Coming soon!'));
}));
/**
 * GET /sessions/:id - Get session by ID
 */
router.get('/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'Get session endpoint - Coming soon!'));
}));
//# sourceMappingURL=session-routes.js.map