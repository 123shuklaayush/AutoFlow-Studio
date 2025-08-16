/**
 * @fileoverview Environment variables validation and configuration
 * @author Ayush Shukla
 * @description Validates required environment variables and provides type-safe access
 * Follows configuration management best practices
 */
/**
 * Required environment variables for different environments
 */
interface EnvironmentConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;
    GEMINI_API_KEY: string;
    WHATSAPP_ACCESS_TOKEN?: string;
    WHATSAPP_PHONE_NUMBER_ID?: string;
    WHATSAPP_VERIFY_TOKEN?: string;
    GMAIL_CLIENT_ID?: string;
    GMAIL_CLIENT_SECRET?: string;
    GMAIL_REDIRECT_URI?: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;
    FRONTEND_URL?: string;
    N8N_WEBHOOK_URL?: string;
    ENABLE_ANALYTICS?: string;
    ENABLE_WEBHOOKS?: string;
    ENABLE_RATE_LIMITING?: string;
}
/**
 * Validate environment variables based on current NODE_ENV
 * @throws Error if required variables are missing or invalid
 */
export declare function validateEnvironment(): void;
/**
 * Get validated environment configuration
 * @throws Error if environment hasn't been validated
 */
export declare function getEnvironmentConfig(): EnvironmentConfig;
/**
 * Get a specific environment variable with type safety
 * @param key - Environment variable key
 * @returns Environment variable value or undefined
 */
export declare function getEnvVar(key: keyof EnvironmentConfig): string | undefined;
/**
 * Get a required environment variable
 * @param key - Environment variable key
 * @throws Error if variable is not set
 */
export declare function getRequiredEnvVar(key: keyof EnvironmentConfig): string;
/**
 * Get boolean environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns Boolean value
 */
export declare function getBooleanEnvVar(key: keyof EnvironmentConfig, defaultValue?: boolean): boolean;
/**
 * Get numeric environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set or invalid
 * @returns Numeric value
 */
export declare function getNumericEnvVar(key: keyof EnvironmentConfig, defaultValue?: number): number;
/**
 * Check if we're in development mode
 */
export declare function isDevelopment(): boolean;
/**
 * Check if we're in production mode
 */
export declare function isProduction(): boolean;
/**
 * Check if we're in test mode
 */
export declare function isTest(): boolean;
/**
 * Get database configuration
 */
export declare function getDatabaseConfig(): {
    projectId: string;
    privateKey: string;
    clientEmail: string;
};
/**
 * Get AI service configuration
 */
export declare function getAIConfig(): {
    geminiApiKey: string;
};
/**
 * Get WhatsApp configuration
 */
export declare function getWhatsAppConfig(): {
    accessToken: string | undefined;
    phoneNumberId: string | undefined;
    verifyToken: string | undefined;
    enabled: boolean;
};
/**
 * Get JWT configuration
 */
export declare function getJWTConfig(): {
    secret: string;
    expiresIn: string;
};
/**
 * Print environment summary (excluding sensitive data)
 */
export declare function printEnvironmentSummary(): void;
export {};
//# sourceMappingURL=environment.d.ts.map