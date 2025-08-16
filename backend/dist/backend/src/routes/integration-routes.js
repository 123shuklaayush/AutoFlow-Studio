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
const router = (0, express_1.Router)();
exports.integrationRoutes = router;
/**
 * GET /integrations/whatsapp/status - WhatsApp integration status
 */
router.get('/whatsapp/status', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({ status: 'not_configured' }, 'WhatsApp integration - Coming soon!'));
}));
/**
 * POST /integrations/whatsapp/send - Send WhatsApp message
 */
router.post('/whatsapp/send', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'WhatsApp send - Coming soon!'));
}));
/**
 * GET /integrations/gmail/status - Gmail integration status
 */
router.get('/gmail/status', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({ status: 'not_configured' }, 'Gmail integration - Coming soon!'));
}));
//# sourceMappingURL=integration-routes.js.map