"use strict";
/**
 * @fileoverview Authentication routes
 * @author Ayush Shukla
 * @description API routes for user authentication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../middleware/error-handler");
const router = (0, express_1.Router)();
exports.authRoutes = router;
/**
 * POST /auth/login - User login
 */
router.post('/login', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({ token: 'demo-token' }, 'Auth login - Coming soon!'));
}));
/**
 * POST /auth/logout - User logout
 */
router.post('/logout', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'Auth logout - Coming soon!'));
}));
/**
 * GET /auth/me - Get current user
 */
router.get('/me', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({ id: 'demo-user' }, 'Auth me - Coming soon!'));
}));
//# sourceMappingURL=auth-routes.js.map