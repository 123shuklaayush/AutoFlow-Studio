/**
 * @fileoverview Centralized logging utility for AutoFlow Studio Backend
 * @author Ayush Shukla
 * @description Re-export simple logger for consistency
 */

// For now, re-export the simple logger to avoid winston complexity
export * from './simple-logger';
export { logger as default } from './simple-logger';