"use strict";
/**
 * @fileoverview Webhook routes for external integrations
 * @author Ayush Shukla
 * @description API routes for webhook endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../middleware/error-handler");
const router = (0, express_1.Router)();
exports.webhookRoutes = router;
/**
 * POST /webhooks/whatsapp - WhatsApp webhook
 */
router.post('/whatsapp', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'WhatsApp webhook - Coming soon!'));
}));
/**
 * GET /webhooks/whatsapp - WhatsApp webhook verification
 */
router.get('/whatsapp', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { 'hub.challenge': challenge, 'hub.verify_token': verifyToken } = req.query;
    // For now, just return the challenge
    res.send(challenge);
}));
/**
 * POST /webhooks/n8n - n8n webhook
 */
router.post('/n8n', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json((0, error_handler_1.createSuccessResponse)({}, 'n8n webhook - Coming soon!'));
}));
//# sourceMappingURL=webhook-routes.js.map