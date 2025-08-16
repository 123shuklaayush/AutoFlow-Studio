/**
 * @fileoverview Workflow compilation routes
 * @author Ayush Shukla
 * @description API routes for compiling sessions to workflows
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, createSuccessResponse } from '../middleware/error-handler';

const router = Router();

/**
 * POST /compile/session - Compile session to workflow
 */
router.post('/session', asyncHandler(async (req: Request, res: Response) => {
  res.json(createSuccessResponse({}, 'Session compilation - Coming soon!'));
}));

/**
 * POST /compile/n8n - Generate n8n workflow JSON
 */
router.post('/n8n', asyncHandler(async (req: Request, res: Response) => {
  res.json(createSuccessResponse({}, 'n8n compilation - Coming soon!'));
}));

export { router as compilerRoutes };
