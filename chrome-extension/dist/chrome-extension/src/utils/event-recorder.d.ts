/**
 * @fileoverview Event recording utility for capturing user interactions
 * @author Ayush Shukla
 * @description Handles recording and processing of user events with smart filtering.
 * Implements Observer pattern for event handling.
 */
/**
 * Interface for event listeners
 */
export interface EventListener {
    onEvent(event: RecordedEvent): void;
}
/**
 * Recorded event information
 */
export interface RecordedEvent {
    type: string;
    target: Element;
    timestamp: number;
    data: any;
    shouldRecord: boolean;
}
/**
 * Event recording configuration
 */
export interface EventRecorderConfig {
    /** Whether to record mouse events */
    recordMouse: boolean;
    /** Whether to record keyboard events */
    recordKeyboard: boolean;
    /** Whether to record form events */
    recordForms: boolean;
    /** Whether to record navigation events */
    recordNavigation: boolean;
    /** Minimum time between similar events (ms) */
    throttleTime: number;
    /** Elements to ignore (CSS selectors) */
    ignoreSelectors: string[];
}
/**
 * Event recorder class that handles intelligent event capture
 * Follows Observer pattern for event notification
 */
export declare class EventRecorder {
    private config;
    private listeners;
    private lastEventTime;
    private isActive;
    /**
     * Initialize event recorder with configuration
     * @param config - Event recorder configuration (optional)
     */
    constructor(config?: Partial<EventRecorderConfig>);
    /**
     * Add event listener for recorded events
     * @param listener - Event listener to add
     */
    addListener(listener: EventListener): void;
    /**
     * Remove event listener
     * @param listener - Event listener to remove
     */
    removeListener(listener: EventListener): void;
    /**
     * Start recording events
     */
    startRecording(): void;
    /**
     * Stop recording events
     */
    stopRecording(): void;
    /**
     * Check if an event should be recorded
     * @param event - DOM event to check
     * @returns Whether the event should be recorded
     */
    shouldRecordEvent(event: Event): boolean;
    /**
     * Process and notify listeners about a recorded event
     * @param event - DOM event to process
     */
    processEvent(event: Event): void;
    /**
     * Check if event type is enabled in configuration
     * @param eventType - Type of event to check
     * @returns Whether event type should be recorded
     * @private
     */
    private isEventTypeEnabled;
    /**
     * Check if event should be throttled
     * @param event - Event to check
     * @returns Whether event is throttled
     * @private
     */
    private isEventThrottled;
    /**
     * Generate unique key for event throttling
     * @param event - Event to generate key for
     * @returns Unique event key
     * @private
     */
    private getEventKey;
    /**
     * Apply event-specific filtering logic
     * @param event - Event to filter
     * @returns Whether event should be recorded
     * @private
     */
    private applyEventSpecificFilters;
    /**
     * Check if mouse move should be recorded
     * @param event - Mouse move event
     * @returns Whether to record
     * @private
     */
    private shouldRecordMouseMove;
    /**
     * Check if click should be recorded
     * @param event - Click event
     * @returns Whether to record
     * @private
     */
    private shouldRecordClick;
    /**
     * Check if keyboard event should be recorded
     * @param event - Keyboard event
     * @returns Whether to record
     * @private
     */
    private shouldRecordKeyboard;
    /**
     * Check if input event should be recorded
     * @param event - Input event
     * @returns Whether to record
     * @private
     */
    private shouldRecordInput;
    /**
     * Check if scroll event should be recorded
     * @param event - Scroll event
     * @returns Whether to record
     * @private
     */
    private shouldRecordScroll;
    /**
     * Check if element has click event handlers
     * @param element - Element to check
     * @returns Whether element has click handlers
     * @private
     */
    private elementHasClickHandler;
    /**
     * Extract relevant data from an event
     * @param event - Event to extract data from
     * @returns Event data object
     * @private
     */
    private extractEventData;
}
