/**
 * @fileoverview Integration routes (WhatsApp, Gmail, n8n)
 * @author Ayush Shukla
 * @description API routes for external service integrations
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, createSuccessResponse } from '../middleware/error-handler';

const router = Router();

/**
 * GET /integrations/whatsapp/status - WhatsApp integration status
 */
router.get('/whatsapp/status', asyncHandler(async (req: Request, res: Response) => {
  res.json(createSuccessResponse({ status: 'not_configured' }, 'WhatsApp integration - Coming soon!'));
}));

/**
 * POST /integrations/whatsapp/send - Send WhatsApp message
 */
router.post('/whatsapp/send', asyncHandler(async (req: Request, res: Response) => {
  res.json(createSuccessResponse({}, 'WhatsApp send - Coming soon!'));
}));

/**
 * GET /integrations/gmail/status - Gmail integration status
 */
router.get('/gmail/status', asyncHandler(async (req: Request, res: Response) => {
  res.json(createSuccessResponse({ status: 'not_configured' }, 'Gmail integration - Coming soon!'));
}));

export { router as integrationRoutes };
