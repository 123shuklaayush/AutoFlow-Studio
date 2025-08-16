/**
 * @fileoverview Environment variables validation and configuration
 * @author Ayush Shukla
 * @description Validates required environment variables and provides type-safe access
 * Follows configuration management best practices
 */

import { logger } from './simple-logger';

/**
 * Required environment variables for different environments
 */
interface EnvironmentConfig {
  // Server configuration
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  
  // Firebase configuration
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  
  // AI service configuration
  GEMINI_API_KEY: string;
  
  // WhatsApp integration (optional)
  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_VERIFY_TOKEN?: string;
  
  // Gmail integration (optional)
  GMAIL_CLIENT_ID?: string;
  GMAIL_CLIENT_SECRET?: string;
  GMAIL_REDIRECT_URI?: string;
  
  // Security
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string;
  
  // External URLs
  FRONTEND_URL?: string;
  N8N_WEBHOOK_URL?: string;
  
  // Feature flags
  ENABLE_ANALYTICS?: string;
  ENABLE_WEBHOOKS?: string;
  ENABLE_RATE_LIMITING?: string;
}

/**
 * Default values for optional environment variables
 */
const DEFAULT_VALUES: Partial<EnvironmentConfig> = {
  PORT: '3000',
  JWT_EXPIRES_IN: '7d',
  ENABLE_ANALYTICS: 'true',
  ENABLE_WEBHOOKS: 'true',
  ENABLE_RATE_LIMITING: 'true'
};

/**
 * Environment-specific required variables
 */
const REQUIRED_BY_ENV: Record<string, string[]> = {
  development: [
    'NODE_ENV',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'GEMINI_API_KEY',
    'JWT_SECRET'
  ],
  production: [
    'NODE_ENV',
    'PORT',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'GEMINI_API_KEY',
    'JWT_SECRET',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_VERIFY_TOKEN'
  ],
  test: [
    'NODE_ENV',
    'JWT_SECRET'
  ]
};

/**
 * Validated and parsed environment configuration
 */
let environmentConfig: EnvironmentConfig | null = null;

/**
 * Validate environment variables based on current NODE_ENV
 * @throws Error if required variables are missing or invalid
 */
export function validateEnvironment(): void {
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvironmentConfig['NODE_ENV'];
  const requiredVars = REQUIRED_BY_ENV[nodeEnv] || REQUIRED_BY_ENV.development;
  
  logger.info(`Validating environment for: ${nodeEnv}`);
  
  const missingVars: string[] = [];
  const invalidVars: string[] = [];
  
  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      missingVars.push(varName);
      continue;
    }
    
    // Validate specific formats
    if (varName === 'PORT') {
      const port = parseInt(value, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        invalidVars.push(`${varName} (must be a valid port number)`);
      }
    }
    
    if (varName === 'NODE_ENV') {
      if (!['development', 'production', 'test'].includes(value)) {
        invalidVars.push(`${varName} (must be 'development', 'production', or 'test')`);
      }
    }
    
    if (varName.endsWith('_URL')) {
      try {
        new URL(value);
      } catch {
        invalidVars.push(`${varName} (must be a valid URL)`);
      }
    }
  }
  
  // Check for issues
  if (missingVars.length > 0 || invalidVars.length > 0) {
    const errorMessage = [
      'Environment validation failed:',
      missingVars.length > 0 ? `Missing variables: ${missingVars.join(', ')}` : '',
      invalidVars.length > 0 ? `Invalid variables: ${invalidVars.join(', ')}` : ''
    ].filter(Boolean).join('\n');
    
    logger.error('Environment validation failed', { missingVars, invalidVars });
    throw new Error(errorMessage);
  }
  
  // Build validated configuration
  environmentConfig = {} as EnvironmentConfig;
  
  // Add all environment variables
  Object.keys(process.env).forEach(key => {
    if (process.env[key] !== undefined) {
      (environmentConfig as any)[key] = process.env[key];
    }
  });
  
  // Apply defaults
  Object.entries(DEFAULT_VALUES).forEach(([key, value]) => {
    if (!(key in environmentConfig!)) {
      (environmentConfig as any)[key] = value;
    }
  });
  
  logger.info('✅ Environment validation completed successfully');
}

/**
 * Get validated environment configuration
 * @throws Error if environment hasn't been validated
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (!environmentConfig) {
    throw new Error('Environment has not been validated. Call validateEnvironment() first.');
  }
  
  return environmentConfig;
}

/**
 * Get a specific environment variable with type safety
 * @param key - Environment variable key
 * @returns Environment variable value or undefined
 */
export function getEnvVar(key: keyof EnvironmentConfig): string | undefined {
  return getEnvironmentConfig()[key];
}

/**
 * Get a required environment variable
 * @param key - Environment variable key
 * @throws Error if variable is not set
 */
export function getRequiredEnvVar(key: keyof EnvironmentConfig): string {
  const value = getEnvVar(key);
  
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  
  return value;
}

/**
 * Get boolean environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns Boolean value
 */
export function getBooleanEnvVar(key: keyof EnvironmentConfig, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key);
  
  if (!value) {
    return defaultValue;
  }
  
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

/**
 * Get numeric environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set or invalid
 * @returns Numeric value
 */
export function getNumericEnvVar(key: keyof EnvironmentConfig, defaultValue: number = 0): number {
  const value = getEnvVar(key);
  
  if (!value) {
    return defaultValue;
  }
  
  const numValue = parseInt(value, 10);
  return isNaN(numValue) ? defaultValue : numValue;
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return getEnvVar('NODE_ENV') === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return getEnvVar('NODE_ENV') === 'production';
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return getEnvVar('NODE_ENV') === 'test';
}

/**
 * Get database configuration
 */
export function getDatabaseConfig() {
  return {
    projectId: getRequiredEnvVar('FIREBASE_PROJECT_ID'),
    privateKey: getRequiredEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    clientEmail: getRequiredEnvVar('FIREBASE_CLIENT_EMAIL')
  };
}

/**
 * Get AI service configuration
 */
export function getAIConfig() {
  return {
    geminiApiKey: getRequiredEnvVar('GEMINI_API_KEY')
  };
}

/**
 * Get WhatsApp configuration
 */
export function getWhatsAppConfig() {
  return {
    accessToken: getEnvVar('WHATSAPP_ACCESS_TOKEN'),
    phoneNumberId: getEnvVar('WHATSAPP_PHONE_NUMBER_ID'),
    verifyToken: getEnvVar('WHATSAPP_VERIFY_TOKEN'),
    enabled: !!(getEnvVar('WHATSAPP_ACCESS_TOKEN') && getEnvVar('WHATSAPP_PHONE_NUMBER_ID'))
  };
}

/**
 * Get JWT configuration
 */
export function getJWTConfig() {
  return {
    secret: getRequiredEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN') || '7d'
  };
}

/**
 * Print environment summary (excluding sensitive data)
 */
export function printEnvironmentSummary(): void {
  const config = getEnvironmentConfig();
  
  const summary = {
    environment: config.NODE_ENV,
    port: config.PORT,
    features: {
      analytics: getBooleanEnvVar('ENABLE_ANALYTICS'),
      webhooks: getBooleanEnvVar('ENABLE_WEBHOOKS'),
      rateLimiting: getBooleanEnvVar('ENABLE_RATE_LIMITING'),
      whatsapp: !!config.WHATSAPP_ACCESS_TOKEN,
      gmail: !!config.GMAIL_CLIENT_ID
    }
  };
  
  logger.info('Environment configuration:', summary);
}
