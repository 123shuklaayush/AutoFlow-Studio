/**
 * @fileoverview Content script for AutoFlow Studio
 * @author Ayush Shukla
 * @description Main content script that handles DOM event recording, selector extraction,
 * and screenshot capture. Follows SOLID principles for maintainable code.
 */
/**
 * Main content script class following Single Responsibility Principle
 * Handles coordination between different recording components
 */
declare class AutoFlowContentScript {
    private isRecording;
    private recordingSessionId;
    private selectorExtractor;
    private screenshotCapture;
    private eventRecorder;
    private stepCounter;
    private stepCounterSyncInterval;
    /**
     * Initialize the content script with all dependencies
     */
    constructor();
    /**
     * Set up DOM event listeners for recording user interactions
     * @private
     */
    private setupEventListeners;
    /**
     * Set up message handlers for communication with background script
     * @private
     */
    private setupMessageHandlers;
    /**
     * Initialize recording state from storage
     * @private
     */
    private initializeRecordingState;
    /**
     * Handle messages from background script or popup
     * @param message - The message received
     * @param sender - Message sender information
     * @param sendResponse - Response callback
     * @private
     */
    private handleMessage;
    /**
     * Start recording user interactions
     * @param sessionId - Unique session identifier
     */
    private startRecording;
    /**
     * Stop recording user interactions
     */
    private stopRecording;
    /**
     * Handle click events on the page
     * @param event - The click event
     * @private
     */
    private handleClickEvent;
    /**
     * Handle input events (typing, form filling)
     * @param event - The input event
     * @private
     */
    private handleInputEvent;
    /**
     * Handle scroll events on the page
     * @private
     */
    private handleScrollEvent;
    /**
     * Handle form submission events
     * @param event - The submit event
     * @private
     */
    private handleSubmitEvent;
    /**
     * Handle navigation events
     * @private
     */
    private handleNavigationEvent;
    /**
     * Handle focus events for form fields
     * @param event - The focus event
     * @private
     */
    private handleFocusEvent;
    /**
     * Record initial page load
     * @private
     */
    private recordPageLoad;
    /**
     * Create a trace step from an event and element
     * @param element - The target element
     * @param action - The action type
     * @param event - The original event
     * @returns Promise resolving to a TraceStep
     * @private
     */
    private createTraceStep;
    /**
     * Extract input data from form elements
     * @param element - The input element
     * @returns InputData object
     * @private
     */
    private extractInputData;
    /**
     * Map HTML input types to our InputType enum
     * @param htmlType - HTML input type
     * @returns Mapped input type
     * @private
     */
    private mapInputType;
    /**
     * Generate a descriptive text for the step
     * @param element - Target element
     * @param action - Action type
     * @returns Human-readable description
     * @private
     */
    private generateStepDescription;
    /**
     * Generate relevant tags for the step
     * @param element - Target element
     * @param action - Action type
     * @returns Array of tags
     * @private
     */
    private generateStepTags;
    /**
     * Save a trace step to storage
     * @param step - The step to save
     * @private
     */
    private saveTraceStep;
    /**
     * Save screenshot to storage
     * @param screenshot - Base64 screenshot data
     * @returns Promise resolving to screenshot reference
     * @private
     */
    private saveScreenshot;
    /**
     * Generate a unique step ID
     * @returns Unique step identifier
     * @private
     */
    private generateStepId;
    /**
     * Get current tab ID
     * @returns Promise resolving to tab ID
     * @private
     */
    private getCurrentTabId;
    /**
     * Generate a hash of the current DOM structure
     * @returns Promise resolving to DOM hash
     * @private
     */
    private generateDOMHash;
    /**
     * Show visual recording indicator with step counter
     * @private
     */
    private showRecordingIndicator;
    /**
     * Update the step counter in the recording indicator with real count from background
     * @private
     */
    private updateStepCounter;
    /**
     * Highlight an element briefly to show it was recorded
     * @param element - Element to highlight
     * @private
     */
    private highlightElement;
    /**
     * Hide visual recording indicator
     * @private
     */
    private hideRecordingIndicator;
    /**
     * Start periodic step counter synchronization with background script
     * @private
     */
    private startStepCounterSync;
    /**
     * Stop periodic step counter synchronization
     * @private
     */
    private stopStepCounterSync;
}
export default AutoFlowContentScript;
