/**
 * @fileoverview Execution and runtime type definitions
 * @author Ayush Shukla
 * @description Types for workflow execution, AI healing, and runtime operations
 */
import { TraceStep, Workflow, ElementSelector, BoundingBox } from './core';
/**
 * Runtime execution context for a workflow
 * @interface ExecutionContext
 */
export interface ExecutionContext {
    /** Unique execution run identifier */
    runId: string;
    /** Workflow being executed */
    workflow: Workflow;
    /** Current step being executed */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
    /** Execution start time */
    startedAt: number;
    /** Browser context information */
    browserContext: BrowserContext;
    /** Variable values for this execution */
    variables: Record<string, any>;
    /** Execution status */
    status: ExecutionStatus;
    /** Error information if any */
    error?: ExecutionError;
    /** Progress callback for updates */
    onProgress?: (event: ExecutionEvent) => void;
}
/**
 * Browser context information
 * @interface BrowserContext
 */
export interface BrowserContext {
    /** Browser instance identifier */
    browserId: string;
    /** Active page/tab information */
    page: PageContext;
    /** Browser type (chromium, firefox, webkit) */
    browserType: 'chromium' | 'firefox' | 'webkit';
    /** Whether browser is running in headless mode */
    headless: boolean;
    /** Browser window size */
    viewport?: {
        width: number;
        height: number;
    };
}
/**
 * Page context within browser
 * @interface PageContext
 */
export interface PageContext {
    /** Current page URL */
    url: string;
    /** Page title */
    title?: string;
    /** Whether page is fully loaded */
    isLoaded: boolean;
    /** Current scroll position */
    scrollPosition: {
        x: number;
        y: number;
    };
    /** Page dimensions */
    dimensions: {
        width: number;
        height: number;
    };
}
/**
 * Workflow execution status
 */
export type ExecutionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'waiting_for_input';
/**
 * Execution error information
 * @interface ExecutionError
 */
export interface ExecutionError {
    /** Error type/category */
    type: ErrorType;
    /** Human-readable error message */
    message: string;
    /** Step where error occurred */
    stepIndex: number;
    /** Technical error details */
    details?: any;
    /** Screenshot at time of error */
    screenshot?: string;
    /** Suggested recovery actions */
    recovery?: RecoveryAction[];
    /** Whether this error is retryable */
    retryable: boolean;
}
/**
 * Types of execution errors
 */
export type ErrorType = 'element_not_found' | 'timeout' | 'network_error' | 'navigation_failed' | 'captcha_detected' | 'otp_required' | 'permission_denied' | 'unknown_page_state' | 'browser_crash' | 'user_intervention_required';
/**
 * Recovery actions for errors
 * @interface RecoveryAction
 */
export interface RecoveryAction {
    /** Type of recovery action */
    type: RecoveryType;
    /** Description of the action */
    description: string;
    /** Parameters for the action */
    params?: Record<string, any>;
    /** Confidence that this action will work */
    confidence: number;
}
/**
 * Types of recovery actions
 */
export type RecoveryType = 'retry_with_delay' | 'try_alternative_selector' | 'visual_element_search' | 'scroll_and_retry' | 'refresh_page' | 'wait_for_element' | 'human_intervention' | 'skip_step' | 'abort_execution';
/**
 * Execution event for progress tracking
 * @interface ExecutionEvent
 */
export interface ExecutionEvent {
    /** Event type */
    type: ExecutionEventType;
    /** Run ID this event belongs to */
    runId: string;
    /** Step index if applicable */
    stepIndex?: number;
    /** Event timestamp */
    timestamp: number;
    /** Event message */
    message: string;
    /** Additional event data */
    data?: Record<string, any>;
    /** Screenshot reference if applicable */
    screenshot?: string;
}
/**
 * Types of execution events
 */
export type ExecutionEventType = 'execution_started' | 'step_started' | 'step_completed' | 'step_failed' | 'step_retried' | 'selector_healed' | 'user_intervention_requested' | 'execution_paused' | 'execution_resumed' | 'execution_completed' | 'execution_failed' | 'execution_cancelled';
/**
 * AI selector healing context
 * @interface SelectorHealingContext
 */
export interface SelectorHealingContext {
    /** Original step being executed */
    originalStep: TraceStep;
    /** Current page state */
    currentPageState: PageState;
    /** Original page state when recorded */
    recordedPageState?: PageState;
    /** Failed selectors that need healing */
    failedSelectors: ElementSelector[];
    /** Previous healing attempts */
    previousAttempts: HealingAttempt[];
}
/**
 * Page state for comparison and healing
 * @interface PageState
 */
export interface PageState {
    /** Page URL */
    url: string;
    /** DOM structure hash */
    domHash: string;
    /** Page title */
    title: string;
    /** Screenshot for visual comparison */
    screenshot?: string;
    /** Extracted text content */
    textContent?: string;
    /** Available elements with selectors */
    elements?: ElementInfo[];
}
/**
 * Information about a page element
 * @interface ElementInfo
 */
export interface ElementInfo {
    /** Element selectors */
    selectors: ElementSelector[];
    /** Element text content */
    text?: string;
    /** Element attributes */
    attributes: Record<string, string>;
    /** Element position and size */
    boundingBox: BoundingBox;
    /** Element visibility state */
    visible: boolean;
    /** Element type/tag */
    tagName: string;
}
/**
 * Previous healing attempt record
 * @interface HealingAttempt
 */
export interface HealingAttempt {
    /** Timestamp of attempt */
    timestamp: number;
    /** Healing strategy used */
    strategy: HealingStrategy;
    /** Selectors that were tried */
    attemptedSelectors: ElementSelector[];
    /** Whether the attempt succeeded */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** Confidence score of the healing */
    confidence?: number;
}
/**
 * AI healing strategies
 */
export type HealingStrategy = 'dom_similarity' | 'text_matching' | 'visual_matching' | 'attribute_matching' | 'position_matching' | 'ai_inference';
/**
 * Result of selector healing operation
 * @interface SelectorHealingResult
 */
export interface SelectorHealingResult {
    /** Whether healing was successful */
    success: boolean;
    /** New working selectors */
    healedSelectors?: ElementSelector[];
    /** Healing strategy used */
    strategy?: HealingStrategy;
    /** Confidence in the healing */
    confidence: number;
    /** Error message if healing failed */
    error?: string;
    /** Time taken for healing (ms) */
    duration: number;
    /** Whether this healing should be saved for future use */
    shouldPersist: boolean;
}
/**
 * Conditional execution context
 * @interface ConditionalContext
 */
export interface ConditionalContext {
    /** Current step being evaluated */
    currentStep: TraceStep;
    /** Page state at evaluation time */
    pageState: PageState;
    /** Available conditions to check */
    conditions: ConditionCheck[];
    /** Variables available for condition evaluation */
    variables: Record<string, any>;
    /** Previous condition results in this execution */
    history: ConditionResult[];
}
/**
 * Condition check definition
 * @interface ConditionCheck
 */
export interface ConditionCheck {
    /** Unique condition identifier */
    id: string;
    /** Condition type */
    type: ConditionType;
    /** Target for the condition check */
    target: string;
    /** Expected value or pattern */
    expected: any;
    /** Comparison operator */
    operator: ComparisonOperator;
    /** Next step to execute if condition is true */
    onTrue?: string;
    /** Next step to execute if condition is false */
    onFalse?: string;
    /** Timeout for condition evaluation */
    timeout?: number;
}
/**
 * Types of conditions
 */
export type ConditionType = 'page_contains_text' | 'element_exists' | 'element_visible' | 'url_matches' | 'page_title_contains' | 'variable_equals' | 'custom_javascript';
/**
 * Comparison operators for conditions
 */
export type ComparisonOperator = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'matches_regex' | 'greater_than' | 'less_than' | 'not_equals';
/**
 * Result of condition evaluation
 * @interface ConditionResult
 */
export interface ConditionResult {
    /** Condition that was evaluated */
    conditionId: string;
    /** Evaluation result */
    result: boolean;
    /** Actual value found during evaluation */
    actualValue?: any;
    /** Timestamp of evaluation */
    timestamp: number;
    /** Time taken for evaluation (ms) */
    duration: number;
    /** Error if evaluation failed */
    error?: string;
}
//# sourceMappingURL=execution.d.ts.map