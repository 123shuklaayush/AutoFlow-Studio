/**
 * @fileoverview Webhook routes for external integrations
 * @author Ayush Shukla
 * @description API routes for webhook endpoints
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, createSuccessResponse } from '../middleware/error-handler';

const router = Router();

/**
 * POST /webhooks/whatsapp - WhatsApp webhook
 */
router.post('/whatsapp', asyncHandler(async (req: Request, res: Response) => {
  res.json(createSuccessResponse({}, 'WhatsApp webhook - Coming soon!'));
}));

/**
 * GET /webhooks/whatsapp - WhatsApp webhook verification
 */
router.get('/whatsapp', asyncHandler(async (req: Request, res: Response) => {
  const { 'hub.challenge': challenge, 'hub.verify_token': verifyToken } = req.query;
  
  // For now, just return the challenge
  res.send(challenge);
}));

/**
 * POST /webhooks/n8n - n8n webhook
 */
router.post('/n8n', asyncHandler(async (req: Request, res: Response) => {
  res.json(createSuccessResponse({}, 'n8n webhook - Coming soon!'));
}));

export { router as webhookRoutes };
