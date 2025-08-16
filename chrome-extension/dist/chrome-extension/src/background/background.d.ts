/**
 * @fileoverview Background service worker for AutoFlow Studio Chrome Extension
 * @author Ayush Shukla
 * @description Central coordinator for the extension, handles tab management,
 * storage operations, and communication between components.
 * Follows SOLID principles and acts as a message broker.
 */
/**
 * Main background script class
 * Follows Single Responsibility Principle - manages extension coordination
 */
declare class AutoFlowBackground {
    private state;
    private readonly STORAGE_KEYS;
    /**
     * Initialize the background script
     */
    constructor();
    /**
     * Set up all event listeners for the background script
     * @private
     */
    private setupEventListeners;
    /**
     * Initialize extension on startup
     * @private
     */
    private initializeExtension;
    /**
     * Handle messages from content scripts and popup
     * @param message - Message received
     * @param sender - Message sender information
     * @param sendResponse - Response callback function
     * @returns Whether response will be sent asynchronously
     * @private
     */
    private handleMessage;
    /**
     * Toggle sidebar visibility on a specific tab
     * @param tabId - Tab ID to toggle sidebar on (optional, will use current active tab)
     * @returns Promise resolving to success status
     * @private
     */
    private toggleSidebar;
    /**
     * Start a new recording session
     * @param config - Recording configuration
     * @param tabId - Tab ID to record (optional)
     * @returns Promise resolving to session information
     * @private
     */
    private startRecording;
    /**
     * Stop the current recording session
     * @returns Promise resolving to session summary
     * @private
     */
    private stopRecording;
    /**
     * Get current recording state
     * @returns Current recording state
     * @private
     */
    private getRecordingState;
    /**
     * Save a trace step from content script
     * @param step - Trace step to save
     * @returns Promise resolving to save result
     * @private
     */
    private saveTraceStep;
    /**
     * Capture screenshot of visible tab area
     * @param tabId - Tab ID to capture (optional)
     * @returns Promise resolving to screenshot data
     * @private
     */
    private captureVisibleTab;
    /**
     * Capture full page screenshot (placeholder - requires additional implementation)
     * @param tabId - Tab ID to capture
     * @returns Promise resolving to screenshot data
     * @private
     */
    private captureFullPage;
    /**
     * Handle tab update events
     * @param tabId - Updated tab ID
     * @param changeInfo - Change information
     * @param tab - Tab object
     * @private
     */
    private handleTabUpdated;
    /**
     * Handle tab activation events
     * @param activeInfo - Active tab information
     * @private
     */
    private handleTabActivated;
    /**
     * Handle tab removal events
     * @param tabId - Removed tab ID
     * @param removeInfo - Remove information
     * @private
     */
    private handleTabRemoved;
    /**
     * Handle navigation completion events
     * @param details - Navigation details
     * @private
     */
    private handleNavigationCompleted;
    /**
     * Handle before navigate events
     * @param details - Navigation details
     * @private
     */
    private handleBeforeNavigate;
    /**
     * Handle extension installation
     * @param details - Installation details
     * @private
     */
    private handleInstalled;
    /**
     * Handle extension startup
     * @private
     */
    private handleStartup;
    /**
     * Ensure content script is injected in the specified tab
     * @param tabId - Tab ID to inject into
     * @returns Promise resolving when injection is complete
     * @private
     */
    private ensureContentScriptInjected;
    /**
     * Ensure sidebar script is injected in the specified tab
     * @param tabId - Tab ID to inject into
     * @returns Promise resolving when injection is complete
     * @private
     */
    private ensureSidebarScriptInjected;
    /**
     * Set up context menus
     * @private
     */
    private setupContextMenus;
    private contextMenuListenerAdded;
    /**
     * Handle context menu clicks
     * @private
     */
    private handleContextMenuClick;
    /**
     * Update extension badge to show recording status
     * @private
     */
    private updateBadge;
    /**
     * Generate unique session ID
     * @returns Unique session identifier
     * @private
     */
    private generateSessionId;
    /**
     * Get tab by ID
     * @param tabId - Tab ID
     * @returns Promise resolving to tab or null
     * @private
     */
    private getTabById;
    /**
     * Get current active tab
     * @returns Promise resolving to active tab or null
     * @private
     */
    private getCurrentActiveTab;
    /**
     * Save current state to storage
     * @returns Promise resolving when save is complete
     * @private
     */
    private saveState;
    /**
     * Restore state from storage
     * @returns Promise resolving when restore is complete
     * @private
     */
    private restoreState;
    /**
     * Save session data to persistent storage
     * @param sessionData - Session data to save
     * @returns Promise resolving when save is complete
     * @private
     */
    private saveSessionData;
    /**
     * Get stored workflows
     * @returns Promise resolving to workflows array
     * @private
     */
    private getStoredWorkflows;
    /**
     * Save workflow to storage
     * @param workflow - Workflow to save
     * @returns Promise resolving to save result
     * @private
     */
    private saveWorkflow;
    /**
     * Delete workflow from storage
     * @param workflowId - Workflow ID to delete
     * @returns Promise resolving to delete result
     * @private
     */
    private deleteWorkflow;
    /**
     * Export current recording session
     * @returns Promise resolving to session export data
     * @private
     */
    private exportCurrentSession;
    /**
     * Initialize storage structure
     * @returns Promise resolving when initialization is complete
     * @private
     */
    private initializeStorage;
}
export default AutoFlowBackground;
