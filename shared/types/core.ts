/**
 * @fileoverview Core type definitions for AutoFlow Studio
 * @author Ayush Shukla
 * @description Shared interfaces and types used across all modules
 * Following SOLID principles for maintainable and extensible code
 */

/**
 * Represents a single step in a recorded workflow
 * @interface TraceStep
 */
export interface TraceStep {
  /** Unique identifier for this step */
  id: string;
  /** Chrome tab ID where this step occurred */
  tabId: number;
  /** URL where this step was recorded */
  url: string;
  /** Type of action performed */
  action: ActionType;
  /** Target element selectors (multiple for robustness) */
  selectors: ElementSelector[];
  /** Input data if applicable (form fields, etc.) */
  inputData?: InputData;
  /** Screenshot reference for visual verification */
  thumbnailRef?: string;
  /** DOM snapshot hash for page state verification */
  domHash?: string;
  /** Scroll position when this step was recorded */
  scrollPosition?: ScrollPosition;
  /** Timestamp of when this step was recorded */
  timestamp: number;
  /** Additional metadata for this step */
  metadata?: StepMetadata;
  /** Input value for input actions */
  inputValue?: string;
  /** Wait time for wait actions (ms) */
  waitTime?: number;
}

/**
 * Types of actions that can be recorded
 */
export type ActionType =
  | "click"
  | "input"
  | "navigate"
  | "navigation"
  | "scroll"
  | "wait"
  | "screenshot"
  | "download"
  | "upload"
  | "conditional_checkpoint";

/**
 * Element selector with multiple strategies for robustness
 * @interface ElementSelector
 */
export interface ElementSelector {
  /** Primary CSS selector */
  css?: string;
  /** XPath selector as fallback */
  xpath?: string;
  /** ARIA role-based selector */
  role?: string;
  /** Text content based selector */
  text?: string;
  /** Element attributes for verification */
  attributes?: Record<string, string>;
  /** Confidence score for this selector */
  confidence?: number;
  /** Visual bounding box for element */
  boundingBox?: BoundingBox;
}

/**
 * Input data for form fields and interactive elements
 * @interface InputData
 */
export interface InputData {
  /** The value to be input */
  value: string;
  /** Type of input (text, password, email, etc.) */
  type: InputType;
  /** Source of the data (static, variable, secret) */
  source: DataSource;
  /** Key reference for variables or secrets */
  key?: string;
  /** Whether this data should be masked in logs */
  sensitive?: boolean;
}

/**
 * Types of input data
 */
export type InputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "date"
  | "file"
  | "select";

/**
 * Sources of data for automation
 */
export type DataSource = "static" | "variable" | "secret" | "dynamic";

/**
 * Scroll position information
 * @interface ScrollPosition
 */
export interface ScrollPosition {
  x: number;
  y: number;
  /** Total page height at time of recording */
  pageHeight?: number;
  /** Total page width at time of recording */
  pageWidth?: number;
  /** Scroll percentage horizontally (0-100) */
  percentX?: number;
  /** Scroll percentage vertically (0-100) */
  percentY?: number;
}

/**
 * Bounding box for element positioning
 * @interface BoundingBox
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Additional metadata for workflow steps
 * @interface StepMetadata
 */
export interface StepMetadata {
  /** Human-readable description of this step */
  description?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Whether this step is critical for workflow success */
  critical?: boolean;
  /** Expected outcome verification rules */
  verification?: VerificationRule[];
  /** Retry configuration for this step */
  retryConfig?: RetryConfig;
  /** Scroll direction for scroll events */
  scrollDirection?: string;
}

/**
 * Verification rules for step validation
 * @interface VerificationRule
 */
export interface VerificationRule {
  /** Type of verification to perform */
  type: VerificationType;
  /** Expected value or condition */
  expected: string | number | boolean;
  /** Timeout for this verification */
  timeout?: number;
}

/**
 * Types of verification checks
 */
export type VerificationType =
  | "url_contains"
  | "element_visible"
  | "element_text"
  | "page_title"
  | "download_complete"
  | "network_response";

/**
 * Retry configuration for failed steps
 * @interface RetryConfig
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Delay between retry attempts (ms) */
  delay: number;
  /** Backoff strategy for retry delays */
  backoffStrategy: "linear" | "exponential";
  /** Conditions that should trigger a retry */
  retryConditions: string[];
}

/**
 * Complete workflow definition
 * @interface Workflow
 */
export interface Workflow {
  /** Unique workflow identifier */
  id: string;
  /** Human-readable workflow name */
  name: string;
  /** Workflow description */
  description?: string;
  /** User who created this workflow */
  ownerId?: string;
  /** Recorded steps that make up this workflow */
  steps: TraceStep[];
  /** Variables used in this workflow */
  variables?: WorkflowVariable[];
  /** Credentials required for this workflow */
  credentials?: CredentialReference[];
  /** Trigger configuration */
  triggers?: TriggerConfig[];
  /** Workflow settings */
  settings?: WorkflowSettings;
  /** Creation timestamp */
  createdAt: number;
  /** Last modification timestamp */
  updatedAt?: number;
  /** Current version of the workflow */
  version: string;
  /** Tags for workflow organization */
  tags?: string[];
  /** Number of steps in workflow */
  stepCount: number;
  /** Source session ID this workflow was created from */
  sourceSessionId?: string;
  /** Last time this workflow was used */
  lastUsed?: number | null;
  /** How many times this workflow has been executed */
  usageCount?: number;
  /** Device ID that created this workflow */
  deviceId?: string;
  /** Workflow metadata */
  metadata?: {
    originalUrl?: string;
    duration?: number;
    browser?: string;
  };
}

/**
 * Variable definition for workflows
 * @interface WorkflowVariable
 */
export interface WorkflowVariable {
  /** Variable key/name */
  key: string;
  /** Variable display name */
  displayName: string;
  /** Variable type */
  type: VariableType;
  /** Default value if any */
  defaultValue?: string;
  /** Whether this variable is required */
  required: boolean;
  /** Variable description for users */
  description?: string;
}

/**
 * Types of workflow variables
 */
export type VariableType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "email"
  | "url"
  | "file";

/**
 * Reference to a credential needed by the workflow
 * @interface CredentialReference
 */
export interface CredentialReference {
  /** Credential key/identifier */
  key: string;
  /** Display name for this credential */
  displayName: string;
  /** Type of credential */
  type: CredentialType;
  /** Domain/scope where this credential is used */
  domain?: string;
  /** Whether this credential is required */
  required: boolean;
}

/**
 * Types of credentials
 */
export type CredentialType =
  | "username_password"
  | "api_key"
  | "oauth2"
  | "custom";

/**
 * Trigger configuration for automated workflow execution
 * @interface TriggerConfig
 */
export interface TriggerConfig {
  /** Trigger type */
  type: TriggerType;
  /** Trigger configuration specific to the type */
  config: Record<string, any>;
  /** Whether this trigger is active */
  enabled: boolean;
  /** Trigger name/description */
  name: string;
}

/**
 * Types of workflow triggers
 */
export type TriggerType =
  | "manual"
  | "schedule"
  | "webhook"
  | "email"
  | "file_change";

/**
 * Workflow execution settings
 * @interface WorkflowSettings
 */
export interface WorkflowSettings {
  /** Execution mode (visible browser vs headless) */
  executionMode: ExecutionMode;
  /** Timeout for entire workflow (ms) */
  timeout: number;
  /** Whether to take screenshots during execution */
  captureScreenshots: boolean;
  /** Notification settings */
  notifications: NotificationSettings;
  /** Error handling strategy */
  errorHandling: ErrorHandlingStrategy;
}

/**
 * Execution modes for workflows
 */
export type ExecutionMode = "visible" | "headless" | "debug";

/**
 * Notification configuration
 * @interface NotificationSettings
 */
export interface NotificationSettings {
  /** Whether notifications are enabled */
  enabled: boolean;
  /** Notification channels to use */
  channels: NotificationChannel[];
  /** Events that should trigger notifications */
  events: NotificationEvent[];
}

/**
 * Notification delivery channels
 */
export type NotificationChannel = "whatsapp" | "email" | "webhook" | "browser";

/**
 * Events that can trigger notifications
 */
export type NotificationEvent =
  | "start"
  | "success"
  | "failure"
  | "pause"
  | "resume"
  | "step_complete";

/**
 * Error handling strategies
 */
export type ErrorHandlingStrategy =
  | "stop"
  | "continue"
  | "retry"
  | "notify_and_stop"
  | "notify_and_continue";
