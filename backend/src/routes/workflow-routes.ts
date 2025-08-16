/**
 * @fileoverview Workflow management routes
 * @author Ayush Shukla
 * @description RESTful API routes for workflow CRUD operations
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, createSuccessResponse, NotFoundError, ValidationError } from '../middleware/error-handler';
import { DatabaseService } from '../services/database-service';
import { logger } from '../utils/simple-logger';
import { Workflow } from '@shared/types/core';

const router = Router();
const dbService = new DatabaseService();

/**
 * GET /workflows - List user workflows
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search, tags } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Build query conditions
  const whereConditions: any[] = [];
  
  // Add user filter (when authentication is implemented)
  // whereConditions.push({ field: 'ownerId', operator: '==', value: req.user?.id });

  // Add search filter
  if (search) {
    whereConditions.push({ field: 'name', operator: '>=', value: search });
  }

  // Add tags filter
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    whereConditions.push({ field: 'tags', operator: 'array-contains-any', value: tagArray });
  }

  const workflows = await dbService.list('workflows', {
    limit: Number(limit),
    offset,
    orderBy: 'updatedAt',
    orderDirection: 'desc',
    where: whereConditions.length > 0 ? whereConditions : undefined
  });

  const total = await dbService.count('workflows', whereConditions.length > 0 ? whereConditions : undefined);

  res.json(createSuccessResponse({
    workflows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  }));
}));

/**
 * GET /workflows/:id - Get workflow by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const workflow = await dbService.read('workflows', id);
  
  if (!workflow) {
    throw new NotFoundError('Workflow');
  }

  res.json(createSuccessResponse(workflow));
}));

/**
 * POST /workflows - Create new workflow
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const workflowData = req.body;

  // Basic validation
  if (!workflowData.name) {
    throw new ValidationError('Workflow name is required');
  }

  // Create workflow
  const workflowId = await dbService.create('workflows', {
    ...workflowData,
    // ownerId: req.user?.id, // Set when auth is implemented
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const createdWorkflow = await dbService.read('workflows', workflowId);

  logger.info('Workflow created:', { workflowId, name: workflowData.name });

  res.status(201).json(createSuccessResponse(createdWorkflow, 'Workflow created successfully'));
}));

/**
 * PUT /workflows/:id - Update workflow
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if workflow exists
  const existingWorkflow = await dbService.read('workflows', id);
  if (!existingWorkflow) {
    throw new NotFoundError('Workflow');
  }

  // Update workflow
  await dbService.update('workflows', id, {
    ...updateData,
    updatedAt: new Date()
  });

  const updatedWorkflow = await dbService.read('workflows', id);

  logger.info('Workflow updated:', { workflowId: id });

  res.json(createSuccessResponse(updatedWorkflow, 'Workflow updated successfully'));
}));

/**
 * DELETE /workflows/:id - Delete workflow
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if workflow exists
  const existingWorkflow = await dbService.read('workflows', id);
  if (!existingWorkflow) {
    throw new NotFoundError('Workflow');
  }

  // Delete workflow
  await dbService.delete('workflows', id);

  logger.info('Workflow deleted:', { workflowId: id });

  res.json(createSuccessResponse(null, 'Workflow deleted successfully'));
}));

/**
 * POST /workflows/:id/duplicate - Duplicate workflow
 */
router.post('/:id/duplicate', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  // Get original workflow
  const originalWorkflow = await dbService.read('workflows', id);
  if (!originalWorkflow) {
    throw new NotFoundError('Workflow');
  }

  // Create duplicate
  const duplicateData = {
    ...originalWorkflow,
    name: name || `${originalWorkflow.name} (Copy)`,
    version: '1.0.0'
  };

  // Remove original ID and timestamps
  delete duplicateData.id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;

  const duplicateId = await dbService.create('workflows', duplicateData);
  const duplicatedWorkflow = await dbService.read('workflows', duplicateId);

  logger.info('Workflow duplicated:', { 
    originalId: id, 
    duplicateId, 
    name: duplicatedWorkflow.name 
  });

  res.status(201).json(createSuccessResponse(
    duplicatedWorkflow, 
    'Workflow duplicated successfully'
  ));
}));

export { router as workflowRoutes };
