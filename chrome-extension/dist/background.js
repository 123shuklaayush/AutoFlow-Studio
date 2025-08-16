/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**************************************!*\
  !*** ./src/background/background.ts ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
class AutoFlowBackground {
    /**
     * Initialize the background script
     */
    constructor() {
        this.STORAGE_KEYS = {
            WORKFLOWS: 'autoflow_workflows',
            SESSIONS: 'autoflow_sessions',
            SETTINGS: 'autoflow_settings'
        };
        this.state = {
            currentSessionId: null,
            isRecording: false,
            activeTabId: null,
            currentSteps: [],
            sessionStartTime: null
        };
        this.setupEventListeners();
        this.initializeExtension();
    }
    /**
     * Set up all event listeners for the background script
     * @private
     */
    setupEventListeners() {
        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
        // Handle tab events for recording management
        chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
        chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
        chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));
        // Handle navigation events
        chrome.webNavigation.onCompleted.addListener(this.handleNavigationCompleted.bind(this));
        chrome.webNavigation.onBeforeNavigate.addListener(this.handleBeforeNavigate.bind(this));
        // Handle extension lifecycle events
        chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));
        chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));
        // Handle context menu if needed
        this.setupContextMenus();
    }
    /**
     * Initialize extension on startup
     * @private
     */
    async initializeExtension() {
        try {
            // Restore previous state if exists
            await this.restoreState();
            // Update extension badge
            this.updateBadge();
            console.log('AutoFlow Background: Extension initialized');
        }
        catch (error) {
            console.error('AutoFlow Background: Error during initialization:', error);
        }
    }
    /**
     * Handle messages from content scripts and popup
     * @param message - Message received
     * @param sender - Message sender information
     * @param sendResponse - Response callback function
     * @returns Whether response will be sent asynchronously
     * @private
     */
    handleMessage(message, sender, sendResponse) {
        console.log('AutoFlow Background: Received message:', message.type);
        switch (message.type) {
            case 'START_RECORDING':
                this.startRecording(message.data, sender.tab?.id)
                    .then(result => sendResponse(result))
                    .catch(error => sendResponse({ error: error.message }));
                return true;
            case 'STOP_RECORDING':
                this.stopRecording()
                    .then(result => sendResponse(result))
                    .catch(error => sendResponse({ error: error.message }));
                return true;
            case 'GET_RECORDING_STATE':
                sendResponse(this.getRecordingState());
                return false;
            case 'SAVE_TRACE_STEP':
                this.saveTraceStep(message.step)
                    .then(result => sendResponse(result))
                    .catch(error => sendResponse({ error: error.message }));
                return true;
            case 'GET_CURRENT_TAB':
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    sendResponse({ tabId: tabs[0]?.id || null });
                });
                return true;
            case 'CAPTURE_VISIBLE_TAB':
                this.captureVisibleTab(sender.tab?.id)
                    .then(screenshot => sendResponse({ screenshot }))
                    .catch(error => sendResponse({ error: error.message }));
                return true;
            case 'CAPTURE_FULL_PAGE':
                this.captureFullPage(sender.tab?.id)
                    .then(screenshot => sendResponse({ screenshot }))
                    .catch(error => sendResponse({ error: error.message }));
                return true;
            case 'GET_WORKFLOWS':
                this.getStoredWorkflows()
                    .then(workflows => sendResponse({ workflows }))
                    .catch(error => sendResponse({ error: error.message }));
                return true;
            case 'SAVE_WORKFLOW':
                this.saveWorkflow(message.data)
                    .then(result => sendResponse(result))
                    .catch(error => sendResponse({ error: error.message }));
                return true;
            case 'DELETE_WORKFLOW':
                this.deleteWorkflow(message.data.workflowId)
                    .then(result => sendResponse(result))
                    .catch(error => sendResponse({ error: error.message }));
                return true;
            case 'EXPORT_SESSION':
                this.exportCurrentSession()
                    .then(sessionData => sendResponse(sessionData))
                    .catch(error => sendResponse({ error: error.message }));
                return true;
            default:
                console.warn('AutoFlow Background: Unknown message type:', message.type);
                sendResponse({ error: 'Unknown message type' });
                return false;
        }
    }
    /**
     * Start a new recording session
     * @param config - Recording configuration
     * @param tabId - Tab ID to record (optional)
     * @returns Promise resolving to session information
     * @private
     */
    async startRecording(config = {}, tabId) {
        try {
            // Stop any existing recording
            if (this.state.isRecording) {
                await this.stopRecording();
            }
            // Generate new session ID
            const sessionId = this.generateSessionId();
            // Determine active tab
            const activeTab = tabId ?
                await this.getTabById(tabId) :
                await this.getCurrentActiveTab();
            if (!activeTab) {
                throw new Error('No active tab found for recording');
            }
            // Update state
            this.state.currentSessionId = sessionId;
            this.state.isRecording = true;
            this.state.activeTabId = activeTab.id;
            this.state.currentSteps = [];
            this.state.sessionStartTime = Date.now();
            // Save state to storage
            await this.saveState();
            // Inject content script if not already present
            await this.ensureContentScriptInjected(activeTab.id);
            // Notify content script to start recording
            await chrome.tabs.sendMessage(activeTab.id, {
                type: 'START_RECORDING',
                sessionId: sessionId,
                config: config
            });
            // Update badge
            this.updateBadge();
            console.log('AutoFlow Background: Recording started for session:', sessionId);
            return {
                success: true,
                sessionId: sessionId,
                tabId: activeTab.id,
                url: activeTab.url
            };
        }
        catch (error) {
            console.error('AutoFlow Background: Error starting recording:', error);
            throw error;
        }
    }
    /**
     * Stop the current recording session
     * @returns Promise resolving to session summary
     * @private
     */
    async stopRecording() {
        try {
            if (!this.state.isRecording || !this.state.currentSessionId) {
                return { success: false, message: 'No active recording session' };
            }
            const sessionId = this.state.currentSessionId;
            const stepCount = this.state.currentSteps.length;
            const duration = this.state.sessionStartTime ?
                Date.now() - this.state.sessionStartTime : 0;
            // Notify content script to stop recording
            if (this.state.activeTabId) {
                try {
                    await chrome.tabs.sendMessage(this.state.activeTabId, {
                        type: 'STOP_RECORDING',
                        sessionId: sessionId
                    });
                }
                catch (error) {
                    console.warn('AutoFlow Background: Could not notify content script:', error);
                }
            }
            // Save session data before clearing state
            const sessionData = {
                sessionId: sessionId,
                steps: [...this.state.currentSteps],
                duration: duration,
                tabId: this.state.activeTabId,
                endTime: Date.now(),
                stepCount: stepCount
            };
            await this.saveSessionData(sessionData);
            // Clear recording state
            this.state.currentSessionId = null;
            this.state.isRecording = false;
            this.state.activeTabId = null;
            this.state.currentSteps = [];
            this.state.sessionStartTime = null;
            // Save cleared state
            await this.saveState();
            // Update badge
            this.updateBadge();
            console.log('AutoFlow Background: Recording stopped for session:', sessionId);
            return {
                success: true,
                sessionId: sessionId,
                stepCount: stepCount,
                duration: duration,
                sessionData: sessionData
            };
        }
        catch (error) {
            console.error('AutoFlow Background: Error stopping recording:', error);
            throw error;
        }
    }
    /**
     * Get current recording state
     * @returns Current recording state
     * @private
     */
    getRecordingState() {
        return {
            isRecording: this.state.isRecording,
            sessionId: this.state.currentSessionId,
            activeTabId: this.state.activeTabId,
            stepCount: this.state.currentSteps.length,
            duration: this.state.sessionStartTime ?
                Date.now() - this.state.sessionStartTime : 0
        };
    }
    /**
     * Save a trace step from content script
     * @param step - Trace step to save
     * @returns Promise resolving to save result
     * @private
     */
    async saveTraceStep(step) {
        try {
            if (!this.state.isRecording || !this.state.currentSessionId) {
                console.warn('AutoFlow Background: Attempted to save step while not recording');
                return { success: false, message: 'Not currently recording' };
            }
            // Add step to current session
            this.state.currentSteps.push(step);
            // Save updated state
            await this.saveState();
            // Optionally save to persistent storage in batches
            if (this.state.currentSteps.length % 5 === 0) {
                await this.saveSessionData({
                    sessionId: this.state.currentSessionId,
                    steps: [...this.state.currentSteps],
                    stepCount: this.state.currentSteps.length,
                    lastUpdated: Date.now()
                });
            }
            console.log('AutoFlow Background: Step saved:', step.id);
            return { success: true, stepIndex: this.state.currentSteps.length - 1 };
        }
        catch (error) {
            console.error('AutoFlow Background: Error saving trace step:', error);
            throw error;
        }
    }
    /**
     * Capture screenshot of visible tab area
     * @param tabId - Tab ID to capture (optional)
     * @returns Promise resolving to screenshot data
     * @private
     */
    async captureVisibleTab(tabId) {
        try {
            const targetTabId = tabId || this.state.activeTabId;
            if (!targetTabId) {
                throw new Error('No tab ID provided for screenshot');
            }
            // Capture visible tab
            const screenshot = await chrome.tabs.captureVisibleTab({
                format: 'png',
                quality: 90
            });
            return screenshot;
        }
        catch (error) {
            console.error('AutoFlow Background: Error capturing visible tab:', error);
            return null;
        }
    }
    /**
     * Capture full page screenshot (placeholder - requires additional implementation)
     * @param tabId - Tab ID to capture
     * @returns Promise resolving to screenshot data
     * @private
     */
    async captureFullPage(tabId) {
        // For now, return visible tab capture
        // Full page capture would require scrolling and stitching
        return this.captureVisibleTab(tabId);
    }
    /**
     * Handle tab update events
     * @param tabId - Updated tab ID
     * @param changeInfo - Change information
     * @param tab - Tab object
     * @private
     */
    handleTabUpdated(tabId, changeInfo, tab) {
        // If recording tab navigated, handle the navigation
        if (this.state.isRecording &&
            this.state.activeTabId === tabId &&
            changeInfo.status === 'complete') {
            console.log('AutoFlow Background: Recording tab navigation detected');
            // Re-inject content script if needed
            this.ensureContentScriptInjected(tabId).catch(error => {
                console.error('AutoFlow Background: Error re-injecting content script:', error);
            });
        }
    }
    /**
     * Handle tab activation events
     * @param activeInfo - Active tab information
     * @private
     */
    handleTabActivated(activeInfo) {
        // Update UI if needed
        console.log('AutoFlow Background: Tab activated:', activeInfo.tabId);
    }
    /**
     * Handle tab removal events
     * @param tabId - Removed tab ID
     * @param removeInfo - Remove information
     * @private
     */
    handleTabRemoved(tabId, removeInfo) {
        // If the recording tab was closed, stop recording
        if (this.state.isRecording && this.state.activeTabId === tabId) {
            console.log('AutoFlow Background: Recording tab closed, stopping recording');
            this.stopRecording().catch(error => {
                console.error('AutoFlow Background: Error stopping recording after tab close:', error);
            });
        }
    }
    /**
     * Handle navigation completion events
     * @param details - Navigation details
     * @private
     */
    handleNavigationCompleted(details) {
        // Only handle main frame navigation
        if (details.frameId !== 0)
            return;
        // If this is the recording tab, ensure content script is present
        if (this.state.isRecording && this.state.activeTabId === details.tabId) {
            this.ensureContentScriptInjected(details.tabId).catch(error => {
                console.error('AutoFlow Background: Error ensuring content script after navigation:', error);
            });
        }
    }
    /**
     * Handle before navigate events
     * @param details - Navigation details
     * @private
     */
    handleBeforeNavigate(details) {
        // Record navigation event if recording
        if (this.state.isRecording && this.state.activeTabId === details.tabId) {
            console.log('AutoFlow Background: Navigation detected during recording');
        }
    }
    /**
     * Handle extension installation
     * @param details - Installation details
     * @private
     */
    handleInstalled(details) {
        console.log('AutoFlow Background: Extension installed/updated:', details.reason);
        if (details.reason === 'install') {
            // Set up initial storage structure
            this.initializeStorage().catch(error => {
                console.error('AutoFlow Background: Error initializing storage:', error);
            });
        }
    }
    /**
     * Handle extension startup
     * @private
     */
    handleStartup() {
        console.log('AutoFlow Background: Extension started');
    }
    /**
     * Ensure content script is injected in the specified tab
     * @param tabId - Tab ID to inject into
     * @returns Promise resolving when injection is complete
     * @private
     */
    async ensureContentScriptInjected(tabId) {
        try {
            // Test if content script is already present
            const response = await chrome.tabs.sendMessage(tabId, {
                type: 'GET_RECORDING_STATE'
            }).catch(() => null);
            if (!response) {
                // Content script not present, inject it
                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
                console.log('AutoFlow Background: Content script injected into tab:', tabId);
            }
        }
        catch (error) {
            console.error('AutoFlow Background: Error ensuring content script injection:', error);
            throw error;
        }
    }
    /**
     * Set up context menus
     * @private
     */
    setupContextMenus() {
        chrome.contextMenus.create({
            id: 'autoflow-start-recording',
            title: 'Start AutoFlow Recording',
            contexts: ['page']
        });
        chrome.contextMenus.create({
            id: 'autoflow-stop-recording',
            title: 'Stop AutoFlow Recording',
            contexts: ['page']
        });
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === 'autoflow-start-recording') {
                this.startRecording({}, tab?.id).catch(console.error);
            }
            else if (info.menuItemId === 'autoflow-stop-recording') {
                this.stopRecording().catch(console.error);
            }
        });
    }
    /**
     * Update extension badge to show recording status
     * @private
     */
    updateBadge() {
        if (this.state.isRecording) {
            chrome.action.setBadgeText({ text: 'REC' });
            chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
            chrome.action.setTitle({ title: 'AutoFlow Studio - Recording Active' });
        }
        else {
            chrome.action.setBadgeText({ text: '' });
            chrome.action.setTitle({ title: 'AutoFlow Studio - Smart Browser Automation' });
        }
    }
    // ... [Additional utility methods would continue here]
    // For brevity, I'll include key utility methods
    /**
     * Generate unique session ID
     * @returns Unique session identifier
     * @private
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get tab by ID
     * @param tabId - Tab ID
     * @returns Promise resolving to tab or null
     * @private
     */
    async getTabById(tabId) {
        try {
            return await chrome.tabs.get(tabId);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Get current active tab
     * @returns Promise resolving to active tab or null
     * @private
     */
    async getCurrentActiveTab() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            return tabs[0] || null;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Save current state to storage
     * @returns Promise resolving when save is complete
     * @private
     */
    async saveState() {
        try {
            await chrome.storage.local.set({
                autoflow_state: this.state
            });
        }
        catch (error) {
            console.error('AutoFlow Background: Error saving state:', error);
            throw error;
        }
    }
    /**
     * Restore state from storage
     * @returns Promise resolving when restore is complete
     * @private
     */
    async restoreState() {
        try {
            const result = await chrome.storage.local.get(['autoflow_state']);
            if (result.autoflow_state) {
                this.state = { ...this.state, ...result.autoflow_state };
                console.log('AutoFlow Background: State restored');
            }
        }
        catch (error) {
            console.error('AutoFlow Background: Error restoring state:', error);
        }
    }
    /**
     * Save session data to persistent storage
     * @param sessionData - Session data to save
     * @returns Promise resolving when save is complete
     * @private
     */
    async saveSessionData(sessionData) {
        try {
            const key = `session_${sessionData.sessionId}`;
            await chrome.storage.local.set({ [key]: sessionData });
            console.log('AutoFlow Background: Session data saved:', sessionData.sessionId);
        }
        catch (error) {
            console.error('AutoFlow Background: Error saving session data:', error);
            throw error;
        }
    }
    /**
     * Get stored workflows
     * @returns Promise resolving to workflows array
     * @private
     */
    async getStoredWorkflows() {
        try {
            const result = await chrome.storage.local.get([this.STORAGE_KEYS.WORKFLOWS]);
            return result[this.STORAGE_KEYS.WORKFLOWS] || [];
        }
        catch (error) {
            console.error('AutoFlow Background: Error getting workflows:', error);
            return [];
        }
    }
    /**
     * Save workflow to storage
     * @param workflow - Workflow to save
     * @returns Promise resolving to save result
     * @private
     */
    async saveWorkflow(workflow) {
        try {
            const workflows = await this.getStoredWorkflows();
            const existingIndex = workflows.findIndex(w => w.id === workflow.id);
            if (existingIndex >= 0) {
                workflows[existingIndex] = workflow;
            }
            else {
                workflows.push(workflow);
            }
            await chrome.storage.local.set({
                [this.STORAGE_KEYS.WORKFLOWS]: workflows
            });
            return { success: true, workflow };
        }
        catch (error) {
            console.error('AutoFlow Background: Error saving workflow:', error);
            throw error;
        }
    }
    /**
     * Delete workflow from storage
     * @param workflowId - Workflow ID to delete
     * @returns Promise resolving to delete result
     * @private
     */
    async deleteWorkflow(workflowId) {
        try {
            const workflows = await this.getStoredWorkflows();
            const filteredWorkflows = workflows.filter(w => w.id !== workflowId);
            await chrome.storage.local.set({
                [this.STORAGE_KEYS.WORKFLOWS]: filteredWorkflows
            });
            return { success: true, deletedId: workflowId };
        }
        catch (error) {
            console.error('AutoFlow Background: Error deleting workflow:', error);
            throw error;
        }
    }
    /**
     * Export current recording session
     * @returns Promise resolving to session export data
     * @private
     */
    async exportCurrentSession() {
        try {
            if (!this.state.currentSessionId) {
                throw new Error('No active session to export');
            }
            return {
                sessionId: this.state.currentSessionId,
                steps: [...this.state.currentSteps],
                stepCount: this.state.currentSteps.length,
                duration: this.state.sessionStartTime ?
                    Date.now() - this.state.sessionStartTime : 0,
                exportTime: Date.now(),
                tabId: this.state.activeTabId
            };
        }
        catch (error) {
            console.error('AutoFlow Background: Error exporting session:', error);
            throw error;
        }
    }
    /**
     * Initialize storage structure
     * @returns Promise resolving when initialization is complete
     * @private
     */
    async initializeStorage() {
        try {
            const defaultData = {
                [this.STORAGE_KEYS.WORKFLOWS]: [],
                [this.STORAGE_KEYS.SESSIONS]: {},
                [this.STORAGE_KEYS.SETTINGS]: {
                    captureScreenshots: true,
                    autoSave: true,
                    maxStoredSessions: 10
                }
            };
            // Only set defaults if keys don't exist
            const existing = await chrome.storage.local.get(Object.keys(defaultData));
            const toSet = {};
            for (const [key, value] of Object.entries(defaultData)) {
                if (!(key in existing)) {
                    toSet[key] = value;
                }
            }
            if (Object.keys(toSet).length > 0) {
                await chrome.storage.local.set(toSet);
                console.log('AutoFlow Background: Storage initialized with defaults');
            }
        }
        catch (error) {
            console.error('AutoFlow Background: Error initializing storage:', error);
            throw error;
        }
    }
}
// Initialize the background script
const backgroundScript = new AutoFlowBackground();
// Export for testing
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AutoFlowBackground);

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm1hcHBpbmdzIjoiOztVQUFBO1VBQ0E7Ozs7O1dDREE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQsc0JBQXNCO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1ELHNCQUFzQjtBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxzQkFBc0I7QUFDekU7QUFDQTtBQUNBLG9DQUFvQyxtQ0FBbUM7QUFDdkUsbUNBQW1DLDRCQUE0QjtBQUMvRCxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsdURBQXVELFlBQVk7QUFDbkUsbURBQW1ELHNCQUFzQjtBQUN6RTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQsWUFBWTtBQUNuRSxtREFBbUQsc0JBQXNCO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCxXQUFXO0FBQ2pFLG1EQUFtRCxzQkFBc0I7QUFDekU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQsc0JBQXNCO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1ELHNCQUFzQjtBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxzQkFBc0I7QUFDekU7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLCtCQUErQjtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsY0FBYztBQUM1QztBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsYUFBYTtBQUN0RCxvREFBb0Qsa0JBQWtCO0FBQ3RFLHFDQUFxQyw2Q0FBNkM7QUFDbEY7QUFDQTtBQUNBLHlDQUF5QyxVQUFVO0FBQ25ELHFDQUFxQyxxREFBcUQ7QUFDMUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsV0FBVyxHQUFHLHdDQUF3QztBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxtQ0FBbUM7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsc0JBQXNCO0FBQ3pELDZDQUE2QyxvQkFBb0I7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxrQkFBa0IsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvYmFja2dyb3VuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgcmVxdWlyZSBzY29wZVxudmFyIF9fd2VicGFja19yZXF1aXJlX18gPSB7fTtcblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBCYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyIGZvciBBdXRvRmxvdyBTdHVkaW8gQ2hyb21lIEV4dGVuc2lvblxuICogQGF1dGhvciBBeXVzaCBTaHVrbGFcbiAqIEBkZXNjcmlwdGlvbiBDZW50cmFsIGNvb3JkaW5hdG9yIGZvciB0aGUgZXh0ZW5zaW9uLCBoYW5kbGVzIHRhYiBtYW5hZ2VtZW50LFxuICogc3RvcmFnZSBvcGVyYXRpb25zLCBhbmQgY29tbXVuaWNhdGlvbiBiZXR3ZWVuIGNvbXBvbmVudHMuXG4gKiBGb2xsb3dzIFNPTElEIHByaW5jaXBsZXMgYW5kIGFjdHMgYXMgYSBtZXNzYWdlIGJyb2tlci5cbiAqL1xuLyoqXG4gKiBNYWluIGJhY2tncm91bmQgc2NyaXB0IGNsYXNzXG4gKiBGb2xsb3dzIFNpbmdsZSBSZXNwb25zaWJpbGl0eSBQcmluY2lwbGUgLSBtYW5hZ2VzIGV4dGVuc2lvbiBjb29yZGluYXRpb25cbiAqL1xuY2xhc3MgQXV0b0Zsb3dCYWNrZ3JvdW5kIHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBiYWNrZ3JvdW5kIHNjcmlwdFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLlNUT1JBR0VfS0VZUyA9IHtcbiAgICAgICAgICAgIFdPUktGTE9XUzogJ2F1dG9mbG93X3dvcmtmbG93cycsXG4gICAgICAgICAgICBTRVNTSU9OUzogJ2F1dG9mbG93X3Nlc3Npb25zJyxcbiAgICAgICAgICAgIFNFVFRJTkdTOiAnYXV0b2Zsb3dfc2V0dGluZ3MnXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBjdXJyZW50U2Vzc2lvbklkOiBudWxsLFxuICAgICAgICAgICAgaXNSZWNvcmRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgYWN0aXZlVGFiSWQ6IG51bGwsXG4gICAgICAgICAgICBjdXJyZW50U3RlcHM6IFtdLFxuICAgICAgICAgICAgc2Vzc2lvblN0YXJ0VGltZTogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplRXh0ZW5zaW9uKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCB1cCBhbGwgZXZlbnQgbGlzdGVuZXJzIGZvciB0aGUgYmFja2dyb3VuZCBzY3JpcHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNldHVwRXZlbnRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIC8vIEhhbmRsZSBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0cyBhbmQgcG9wdXBcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKHRoaXMuaGFuZGxlTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gSGFuZGxlIHRhYiBldmVudHMgZm9yIHJlY29yZGluZyBtYW5hZ2VtZW50XG4gICAgICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcih0aGlzLmhhbmRsZVRhYlVwZGF0ZWQuYmluZCh0aGlzKSk7XG4gICAgICAgIGNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKHRoaXMuaGFuZGxlVGFiQWN0aXZhdGVkLmJpbmQodGhpcykpO1xuICAgICAgICBjaHJvbWUudGFicy5vblJlbW92ZWQuYWRkTGlzdGVuZXIodGhpcy5oYW5kbGVUYWJSZW1vdmVkLmJpbmQodGhpcykpO1xuICAgICAgICAvLyBIYW5kbGUgbmF2aWdhdGlvbiBldmVudHNcbiAgICAgICAgY2hyb21lLndlYk5hdmlnYXRpb24ub25Db21wbGV0ZWQuYWRkTGlzdGVuZXIodGhpcy5oYW5kbGVOYXZpZ2F0aW9uQ29tcGxldGVkLmJpbmQodGhpcykpO1xuICAgICAgICBjaHJvbWUud2ViTmF2aWdhdGlvbi5vbkJlZm9yZU5hdmlnYXRlLmFkZExpc3RlbmVyKHRoaXMuaGFuZGxlQmVmb3JlTmF2aWdhdGUuYmluZCh0aGlzKSk7XG4gICAgICAgIC8vIEhhbmRsZSBleHRlbnNpb24gbGlmZWN5Y2xlIGV2ZW50c1xuICAgICAgICBjaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcih0aGlzLmhhbmRsZUluc3RhbGxlZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25TdGFydHVwLmFkZExpc3RlbmVyKHRoaXMuaGFuZGxlU3RhcnR1cC5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gSGFuZGxlIGNvbnRleHQgbWVudSBpZiBuZWVkZWRcbiAgICAgICAgdGhpcy5zZXR1cENvbnRleHRNZW51cygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGV4dGVuc2lvbiBvbiBzdGFydHVwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBpbml0aWFsaXplRXh0ZW5zaW9uKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gUmVzdG9yZSBwcmV2aW91cyBzdGF0ZSBpZiBleGlzdHNcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVzdG9yZVN0YXRlKCk7XG4gICAgICAgICAgICAvLyBVcGRhdGUgZXh0ZW5zaW9uIGJhZGdlXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJhZGdlKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQXV0b0Zsb3cgQmFja2dyb3VuZDogRXh0ZW5zaW9uIGluaXRpYWxpemVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRvRmxvdyBCYWNrZ3JvdW5kOiBFcnJvciBkdXJpbmcgaW5pdGlhbGl6YXRpb246JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0cyBhbmQgcG9wdXBcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgKiBAcGFyYW0gc2VuZGVyIC0gTWVzc2FnZSBzZW5kZXIgaW5mb3JtYXRpb25cbiAgICAgKiBAcGFyYW0gc2VuZFJlc3BvbnNlIC0gUmVzcG9uc2UgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHJlc3BvbnNlIHdpbGwgYmUgc2VudCBhc3luY2hyb25vdXNseVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgaGFuZGxlTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQXV0b0Zsb3cgQmFja2dyb3VuZDogUmVjZWl2ZWQgbWVzc2FnZTonLCBtZXNzYWdlLnR5cGUpO1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnU1RBUlRfUkVDT1JESU5HJzpcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0UmVjb3JkaW5nKG1lc3NhZ2UuZGF0YSwgc2VuZGVyLnRhYj8uaWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiBzZW5kUmVzcG9uc2UocmVzdWx0KSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHNlbmRSZXNwb25zZSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGNhc2UgJ1NUT1BfUkVDT1JESU5HJzpcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3BSZWNvcmRpbmcoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXN1bHQgPT4gc2VuZFJlc3BvbnNlKHJlc3VsdCkpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBzZW5kUmVzcG9uc2UoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlICdHRVRfUkVDT1JESU5HX1NUQVRFJzpcbiAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UodGhpcy5nZXRSZWNvcmRpbmdTdGF0ZSgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjYXNlICdTQVZFX1RSQUNFX1NURVAnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZVRyYWNlU3RlcChtZXNzYWdlLnN0ZXApXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiBzZW5kUmVzcG9uc2UocmVzdWx0KSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHNlbmRSZXNwb25zZSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGNhc2UgJ0dFVF9DVVJSRU5UX1RBQic6XG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgKHRhYnMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgdGFiSWQ6IHRhYnNbMF0/LmlkIHx8IG51bGwgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlICdDQVBUVVJFX1ZJU0lCTEVfVEFCJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNhcHR1cmVWaXNpYmxlVGFiKHNlbmRlci50YWI/LmlkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihzY3JlZW5zaG90ID0+IHNlbmRSZXNwb25zZSh7IHNjcmVlbnNob3QgfSkpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBzZW5kUmVzcG9uc2UoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlICdDQVBUVVJFX0ZVTExfUEFHRSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jYXB0dXJlRnVsbFBhZ2Uoc2VuZGVyLnRhYj8uaWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHNjcmVlbnNob3QgPT4gc2VuZFJlc3BvbnNlKHsgc2NyZWVuc2hvdCB9KSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHNlbmRSZXNwb25zZSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGNhc2UgJ0dFVF9XT1JLRkxPV1MnOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0U3RvcmVkV29ya2Zsb3dzKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4od29ya2Zsb3dzID0+IHNlbmRSZXNwb25zZSh7IHdvcmtmbG93cyB9KSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHNlbmRSZXNwb25zZSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGNhc2UgJ1NBVkVfV09SS0ZMT1cnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZVdvcmtmbG93KG1lc3NhZ2UuZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHNlbmRSZXNwb25zZShyZXN1bHQpKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gc2VuZFJlc3BvbnNlKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY2FzZSAnREVMRVRFX1dPUktGTE9XJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVdvcmtmbG93KG1lc3NhZ2UuZGF0YS53b3JrZmxvd0lkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXN1bHQgPT4gc2VuZFJlc3BvbnNlKHJlc3VsdCkpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBzZW5kUmVzcG9uc2UoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlICdFWFBPUlRfU0VTU0lPTic6XG4gICAgICAgICAgICAgICAgdGhpcy5leHBvcnRDdXJyZW50U2Vzc2lvbigpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHNlc3Npb25EYXRhID0+IHNlbmRSZXNwb25zZShzZXNzaW9uRGF0YSkpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBzZW5kUmVzcG9uc2UoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignQXV0b0Zsb3cgQmFja2dyb3VuZDogVW5rbm93biBtZXNzYWdlIHR5cGU6JywgbWVzc2FnZS50eXBlKTtcbiAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBlcnJvcjogJ1Vua25vd24gbWVzc2FnZSB0eXBlJyB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgYSBuZXcgcmVjb3JkaW5nIHNlc3Npb25cbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gUmVjb3JkaW5nIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcGFyYW0gdGFiSWQgLSBUYWIgSUQgdG8gcmVjb3JkIChvcHRpb25hbClcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byBzZXNzaW9uIGluZm9ybWF0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBzdGFydFJlY29yZGluZyhjb25maWcgPSB7fSwgdGFiSWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFN0b3AgYW55IGV4aXN0aW5nIHJlY29yZGluZ1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNSZWNvcmRpbmcpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnN0b3BSZWNvcmRpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIG5ldyBzZXNzaW9uIElEXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uSWQgPSB0aGlzLmdlbmVyYXRlU2Vzc2lvbklkKCk7XG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgYWN0aXZlIHRhYlxuICAgICAgICAgICAgY29uc3QgYWN0aXZlVGFiID0gdGFiSWQgP1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZ2V0VGFiQnlJZCh0YWJJZCkgOlxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZ2V0Q3VycmVudEFjdGl2ZVRhYigpO1xuICAgICAgICAgICAgaWYgKCFhY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSB0YWIgZm91bmQgZm9yIHJlY29yZGluZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVXBkYXRlIHN0YXRlXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmN1cnJlbnRTZXNzaW9uSWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmlzUmVjb3JkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYWN0aXZlVGFiSWQgPSBhY3RpdmVUYWIuaWQ7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmN1cnJlbnRTdGVwcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zZXNzaW9uU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIC8vIFNhdmUgc3RhdGUgdG8gc3RvcmFnZVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU3RhdGUoKTtcbiAgICAgICAgICAgIC8vIEluamVjdCBjb250ZW50IHNjcmlwdCBpZiBub3QgYWxyZWFkeSBwcmVzZW50XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVuc3VyZUNvbnRlbnRTY3JpcHRJbmplY3RlZChhY3RpdmVUYWIuaWQpO1xuICAgICAgICAgICAgLy8gTm90aWZ5IGNvbnRlbnQgc2NyaXB0IHRvIHN0YXJ0IHJlY29yZGluZ1xuICAgICAgICAgICAgYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiLmlkLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1NUQVJUX1JFQ09SRElORycsXG4gICAgICAgICAgICAgICAgc2Vzc2lvbklkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVXBkYXRlIGJhZGdlXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJhZGdlKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQXV0b0Zsb3cgQmFja2dyb3VuZDogUmVjb3JkaW5nIHN0YXJ0ZWQgZm9yIHNlc3Npb246Jywgc2Vzc2lvbklkKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZXNzaW9uSWQ6IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICB0YWJJZDogYWN0aXZlVGFiLmlkLFxuICAgICAgICAgICAgICAgIHVybDogYWN0aXZlVGFiLnVybFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG9GbG93IEJhY2tncm91bmQ6IEVycm9yIHN0YXJ0aW5nIHJlY29yZGluZzonLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdG9wIHRoZSBjdXJyZW50IHJlY29yZGluZyBzZXNzaW9uXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gc2Vzc2lvbiBzdW1tYXJ5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBzdG9wUmVjb3JkaW5nKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmlzUmVjb3JkaW5nIHx8ICF0aGlzLnN0YXRlLmN1cnJlbnRTZXNzaW9uSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ05vIGFjdGl2ZSByZWNvcmRpbmcgc2Vzc2lvbicgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb25JZCA9IHRoaXMuc3RhdGUuY3VycmVudFNlc3Npb25JZDtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXBDb3VudCA9IHRoaXMuc3RhdGUuY3VycmVudFN0ZXBzLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5zdGF0ZS5zZXNzaW9uU3RhcnRUaW1lID9cbiAgICAgICAgICAgICAgICBEYXRlLm5vdygpIC0gdGhpcy5zdGF0ZS5zZXNzaW9uU3RhcnRUaW1lIDogMDtcbiAgICAgICAgICAgIC8vIE5vdGlmeSBjb250ZW50IHNjcmlwdCB0byBzdG9wIHJlY29yZGluZ1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlVGFiSWQpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0aGlzLnN0YXRlLmFjdGl2ZVRhYklkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnU1RPUF9SRUNPUkRJTkcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkOiBzZXNzaW9uSWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0F1dG9GbG93IEJhY2tncm91bmQ6IENvdWxkIG5vdCBub3RpZnkgY29udGVudCBzY3JpcHQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNhdmUgc2Vzc2lvbiBkYXRhIGJlZm9yZSBjbGVhcmluZyBzdGF0ZVxuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbklkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgc3RlcHM6IFsuLi50aGlzLnN0YXRlLmN1cnJlbnRTdGVwc10sXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgIHRhYklkOiB0aGlzLnN0YXRlLmFjdGl2ZVRhYklkLFxuICAgICAgICAgICAgICAgIGVuZFRpbWU6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgc3RlcENvdW50OiBzdGVwQ291bnRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXNzaW9uRGF0YShzZXNzaW9uRGF0YSk7XG4gICAgICAgICAgICAvLyBDbGVhciByZWNvcmRpbmcgc3RhdGVcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuY3VycmVudFNlc3Npb25JZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmlzUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmFjdGl2ZVRhYklkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuY3VycmVudFN0ZXBzID0gW107XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnNlc3Npb25TdGFydFRpbWUgPSBudWxsO1xuICAgICAgICAgICAgLy8gU2F2ZSBjbGVhcmVkIHN0YXRlXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTdGF0ZSgpO1xuICAgICAgICAgICAgLy8gVXBkYXRlIGJhZGdlXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJhZGdlKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQXV0b0Zsb3cgQmFja2dyb3VuZDogUmVjb3JkaW5nIHN0b3BwZWQgZm9yIHNlc3Npb246Jywgc2Vzc2lvbklkKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZXNzaW9uSWQ6IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICBzdGVwQ291bnQ6IHN0ZXBDb3VudCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgc2Vzc2lvbkRhdGE6IHNlc3Npb25EYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3cgQmFja2dyb3VuZDogRXJyb3Igc3RvcHBpbmcgcmVjb3JkaW5nOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IHJlY29yZGluZyBzdGF0ZVxuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgcmVjb3JkaW5nIHN0YXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRSZWNvcmRpbmdTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlzUmVjb3JkaW5nOiB0aGlzLnN0YXRlLmlzUmVjb3JkaW5nLFxuICAgICAgICAgICAgc2Vzc2lvbklkOiB0aGlzLnN0YXRlLmN1cnJlbnRTZXNzaW9uSWQsXG4gICAgICAgICAgICBhY3RpdmVUYWJJZDogdGhpcy5zdGF0ZS5hY3RpdmVUYWJJZCxcbiAgICAgICAgICAgIHN0ZXBDb3VudDogdGhpcy5zdGF0ZS5jdXJyZW50U3RlcHMubGVuZ3RoLFxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMuc3RhdGUuc2Vzc2lvblN0YXJ0VGltZSA/XG4gICAgICAgICAgICAgICAgRGF0ZS5ub3coKSAtIHRoaXMuc3RhdGUuc2Vzc2lvblN0YXJ0VGltZSA6IDBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2F2ZSBhIHRyYWNlIHN0ZXAgZnJvbSBjb250ZW50IHNjcmlwdFxuICAgICAqIEBwYXJhbSBzdGVwIC0gVHJhY2Ugc3RlcCB0byBzYXZlXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gc2F2ZSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIHNhdmVUcmFjZVN0ZXAoc3RlcCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmlzUmVjb3JkaW5nIHx8ICF0aGlzLnN0YXRlLmN1cnJlbnRTZXNzaW9uSWQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0F1dG9GbG93IEJhY2tncm91bmQ6IEF0dGVtcHRlZCB0byBzYXZlIHN0ZXAgd2hpbGUgbm90IHJlY29yZGluZycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnTm90IGN1cnJlbnRseSByZWNvcmRpbmcnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBZGQgc3RlcCB0byBjdXJyZW50IHNlc3Npb25cbiAgICAgICAgICAgIHRoaXMuc3RhdGUuY3VycmVudFN0ZXBzLnB1c2goc3RlcCk7XG4gICAgICAgICAgICAvLyBTYXZlIHVwZGF0ZWQgc3RhdGVcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVN0YXRlKCk7XG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5IHNhdmUgdG8gcGVyc2lzdGVudCBzdG9yYWdlIGluIGJhdGNoZXNcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRTdGVwcy5sZW5ndGggJSA1ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2Vzc2lvbkRhdGEoe1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQ6IHRoaXMuc3RhdGUuY3VycmVudFNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgc3RlcHM6IFsuLi50aGlzLnN0YXRlLmN1cnJlbnRTdGVwc10sXG4gICAgICAgICAgICAgICAgICAgIHN0ZXBDb3VudDogdGhpcy5zdGF0ZS5jdXJyZW50U3RlcHMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZS5ub3coKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0F1dG9GbG93IEJhY2tncm91bmQ6IFN0ZXAgc2F2ZWQ6Jywgc3RlcC5pZCk7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBzdGVwSW5kZXg6IHRoaXMuc3RhdGUuY3VycmVudFN0ZXBzLmxlbmd0aCAtIDEgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG9GbG93IEJhY2tncm91bmQ6IEVycm9yIHNhdmluZyB0cmFjZSBzdGVwOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhcHR1cmUgc2NyZWVuc2hvdCBvZiB2aXNpYmxlIHRhYiBhcmVhXG4gICAgICogQHBhcmFtIHRhYklkIC0gVGFiIElEIHRvIGNhcHR1cmUgKG9wdGlvbmFsKVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHNjcmVlbnNob3QgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgY2FwdHVyZVZpc2libGVUYWIodGFiSWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFRhYklkID0gdGFiSWQgfHwgdGhpcy5zdGF0ZS5hY3RpdmVUYWJJZDtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0VGFiSWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHRhYiBJRCBwcm92aWRlZCBmb3Igc2NyZWVuc2hvdCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2FwdHVyZSB2aXNpYmxlIHRhYlxuICAgICAgICAgICAgY29uc3Qgc2NyZWVuc2hvdCA9IGF3YWl0IGNocm9tZS50YWJzLmNhcHR1cmVWaXNpYmxlVGFiKHtcbiAgICAgICAgICAgICAgICBmb3JtYXQ6ICdwbmcnLFxuICAgICAgICAgICAgICAgIHF1YWxpdHk6IDkwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzY3JlZW5zaG90O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3cgQmFja2dyb3VuZDogRXJyb3IgY2FwdHVyaW5nIHZpc2libGUgdGFiOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhcHR1cmUgZnVsbCBwYWdlIHNjcmVlbnNob3QgKHBsYWNlaG9sZGVyIC0gcmVxdWlyZXMgYWRkaXRpb25hbCBpbXBsZW1lbnRhdGlvbilcbiAgICAgKiBAcGFyYW0gdGFiSWQgLSBUYWIgSUQgdG8gY2FwdHVyZVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHNjcmVlbnNob3QgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgY2FwdHVyZUZ1bGxQYWdlKHRhYklkKSB7XG4gICAgICAgIC8vIEZvciBub3csIHJldHVybiB2aXNpYmxlIHRhYiBjYXB0dXJlXG4gICAgICAgIC8vIEZ1bGwgcGFnZSBjYXB0dXJlIHdvdWxkIHJlcXVpcmUgc2Nyb2xsaW5nIGFuZCBzdGl0Y2hpbmdcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FwdHVyZVZpc2libGVUYWIodGFiSWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgdGFiIHVwZGF0ZSBldmVudHNcbiAgICAgKiBAcGFyYW0gdGFiSWQgLSBVcGRhdGVkIHRhYiBJRFxuICAgICAqIEBwYXJhbSBjaGFuZ2VJbmZvIC0gQ2hhbmdlIGluZm9ybWF0aW9uXG4gICAgICogQHBhcmFtIHRhYiAtIFRhYiBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGhhbmRsZVRhYlVwZGF0ZWQodGFiSWQsIGNoYW5nZUluZm8sIHRhYikge1xuICAgICAgICAvLyBJZiByZWNvcmRpbmcgdGFiIG5hdmlnYXRlZCwgaGFuZGxlIHRoZSBuYXZpZ2F0aW9uXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzUmVjb3JkaW5nICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmFjdGl2ZVRhYklkID09PSB0YWJJZCAmJlxuICAgICAgICAgICAgY2hhbmdlSW5mby5zdGF0dXMgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdXRvRmxvdyBCYWNrZ3JvdW5kOiBSZWNvcmRpbmcgdGFiIG5hdmlnYXRpb24gZGV0ZWN0ZWQnKTtcbiAgICAgICAgICAgIC8vIFJlLWluamVjdCBjb250ZW50IHNjcmlwdCBpZiBuZWVkZWRcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlQ29udGVudFNjcmlwdEluamVjdGVkKHRhYklkKS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3cgQmFja2dyb3VuZDogRXJyb3IgcmUtaW5qZWN0aW5nIGNvbnRlbnQgc2NyaXB0OicsIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSB0YWIgYWN0aXZhdGlvbiBldmVudHNcbiAgICAgKiBAcGFyYW0gYWN0aXZlSW5mbyAtIEFjdGl2ZSB0YWIgaW5mb3JtYXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGhhbmRsZVRhYkFjdGl2YXRlZChhY3RpdmVJbmZvKSB7XG4gICAgICAgIC8vIFVwZGF0ZSBVSSBpZiBuZWVkZWRcbiAgICAgICAgY29uc29sZS5sb2coJ0F1dG9GbG93IEJhY2tncm91bmQ6IFRhYiBhY3RpdmF0ZWQ6JywgYWN0aXZlSW5mby50YWJJZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSB0YWIgcmVtb3ZhbCBldmVudHNcbiAgICAgKiBAcGFyYW0gdGFiSWQgLSBSZW1vdmVkIHRhYiBJRFxuICAgICAqIEBwYXJhbSByZW1vdmVJbmZvIC0gUmVtb3ZlIGluZm9ybWF0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBoYW5kbGVUYWJSZW1vdmVkKHRhYklkLCByZW1vdmVJbmZvKSB7XG4gICAgICAgIC8vIElmIHRoZSByZWNvcmRpbmcgdGFiIHdhcyBjbG9zZWQsIHN0b3AgcmVjb3JkaW5nXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzUmVjb3JkaW5nICYmIHRoaXMuc3RhdGUuYWN0aXZlVGFiSWQgPT09IHRhYklkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQXV0b0Zsb3cgQmFja2dyb3VuZDogUmVjb3JkaW5nIHRhYiBjbG9zZWQsIHN0b3BwaW5nIHJlY29yZGluZycpO1xuICAgICAgICAgICAgdGhpcy5zdG9wUmVjb3JkaW5nKCkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG9GbG93IEJhY2tncm91bmQ6IEVycm9yIHN0b3BwaW5nIHJlY29yZGluZyBhZnRlciB0YWIgY2xvc2U6JywgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZGxlIG5hdmlnYXRpb24gY29tcGxldGlvbiBldmVudHNcbiAgICAgKiBAcGFyYW0gZGV0YWlscyAtIE5hdmlnYXRpb24gZGV0YWlsc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgaGFuZGxlTmF2aWdhdGlvbkNvbXBsZXRlZChkZXRhaWxzKSB7XG4gICAgICAgIC8vIE9ubHkgaGFuZGxlIG1haW4gZnJhbWUgbmF2aWdhdGlvblxuICAgICAgICBpZiAoZGV0YWlscy5mcmFtZUlkICE9PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSByZWNvcmRpbmcgdGFiLCBlbnN1cmUgY29udGVudCBzY3JpcHQgaXMgcHJlc2VudFxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc1JlY29yZGluZyAmJiB0aGlzLnN0YXRlLmFjdGl2ZVRhYklkID09PSBkZXRhaWxzLnRhYklkKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZUNvbnRlbnRTY3JpcHRJbmplY3RlZChkZXRhaWxzLnRhYklkKS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3cgQmFja2dyb3VuZDogRXJyb3IgZW5zdXJpbmcgY29udGVudCBzY3JpcHQgYWZ0ZXIgbmF2aWdhdGlvbjonLCBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgYmVmb3JlIG5hdmlnYXRlIGV2ZW50c1xuICAgICAqIEBwYXJhbSBkZXRhaWxzIC0gTmF2aWdhdGlvbiBkZXRhaWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBoYW5kbGVCZWZvcmVOYXZpZ2F0ZShkZXRhaWxzKSB7XG4gICAgICAgIC8vIFJlY29yZCBuYXZpZ2F0aW9uIGV2ZW50IGlmIHJlY29yZGluZ1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc1JlY29yZGluZyAmJiB0aGlzLnN0YXRlLmFjdGl2ZVRhYklkID09PSBkZXRhaWxzLnRhYklkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQXV0b0Zsb3cgQmFja2dyb3VuZDogTmF2aWdhdGlvbiBkZXRlY3RlZCBkdXJpbmcgcmVjb3JkaW5nJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZGxlIGV4dGVuc2lvbiBpbnN0YWxsYXRpb25cbiAgICAgKiBAcGFyYW0gZGV0YWlscyAtIEluc3RhbGxhdGlvbiBkZXRhaWxzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBoYW5kbGVJbnN0YWxsZWQoZGV0YWlscykge1xuICAgICAgICBjb25zb2xlLmxvZygnQXV0b0Zsb3cgQmFja2dyb3VuZDogRXh0ZW5zaW9uIGluc3RhbGxlZC91cGRhdGVkOicsIGRldGFpbHMucmVhc29uKTtcbiAgICAgICAgaWYgKGRldGFpbHMucmVhc29uID09PSAnaW5zdGFsbCcpIHtcbiAgICAgICAgICAgIC8vIFNldCB1cCBpbml0aWFsIHN0b3JhZ2Ugc3RydWN0dXJlXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxpemVTdG9yYWdlKCkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG9GbG93IEJhY2tncm91bmQ6IEVycm9yIGluaXRpYWxpemluZyBzdG9yYWdlOicsIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBleHRlbnNpb24gc3RhcnR1cFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgaGFuZGxlU3RhcnR1cCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0F1dG9GbG93IEJhY2tncm91bmQ6IEV4dGVuc2lvbiBzdGFydGVkJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEVuc3VyZSBjb250ZW50IHNjcmlwdCBpcyBpbmplY3RlZCBpbiB0aGUgc3BlY2lmaWVkIHRhYlxuICAgICAqIEBwYXJhbSB0YWJJZCAtIFRhYiBJRCB0byBpbmplY3QgaW50b1xuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdoZW4gaW5qZWN0aW9uIGlzIGNvbXBsZXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBlbnN1cmVDb250ZW50U2NyaXB0SW5qZWN0ZWQodGFiSWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFRlc3QgaWYgY29udGVudCBzY3JpcHQgaXMgYWxyZWFkeSBwcmVzZW50XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVF9SRUNPUkRJTkdfU1RBVEUnXG4gICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiBudWxsKTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBDb250ZW50IHNjcmlwdCBub3QgcHJlc2VudCwgaW5qZWN0IGl0XG4gICAgICAgICAgICAgICAgYXdhaXQgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxuICAgICAgICAgICAgICAgICAgICBmaWxlczogWydjb250ZW50LmpzJ11cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXV0b0Zsb3cgQmFja2dyb3VuZDogQ29udGVudCBzY3JpcHQgaW5qZWN0ZWQgaW50byB0YWI6JywgdGFiSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3cgQmFja2dyb3VuZDogRXJyb3IgZW5zdXJpbmcgY29udGVudCBzY3JpcHQgaW5qZWN0aW9uOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCB1cCBjb250ZXh0IG1lbnVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzZXR1cENvbnRleHRNZW51cygpIHtcbiAgICAgICAgY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xuICAgICAgICAgICAgaWQ6ICdhdXRvZmxvdy1zdGFydC1yZWNvcmRpbmcnLFxuICAgICAgICAgICAgdGl0bGU6ICdTdGFydCBBdXRvRmxvdyBSZWNvcmRpbmcnLFxuICAgICAgICAgICAgY29udGV4dHM6IFsncGFnZSddXG4gICAgICAgIH0pO1xuICAgICAgICBjaHJvbWUuY29udGV4dE1lbnVzLmNyZWF0ZSh7XG4gICAgICAgICAgICBpZDogJ2F1dG9mbG93LXN0b3AtcmVjb3JkaW5nJyxcbiAgICAgICAgICAgIHRpdGxlOiAnU3RvcCBBdXRvRmxvdyBSZWNvcmRpbmcnLFxuICAgICAgICAgICAgY29udGV4dHM6IFsncGFnZSddXG4gICAgICAgIH0pO1xuICAgICAgICBjaHJvbWUuY29udGV4dE1lbnVzLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcigoaW5mbywgdGFiKSA9PiB7XG4gICAgICAgICAgICBpZiAoaW5mby5tZW51SXRlbUlkID09PSAnYXV0b2Zsb3ctc3RhcnQtcmVjb3JkaW5nJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRSZWNvcmRpbmcoe30sIHRhYj8uaWQpLmNhdGNoKGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaW5mby5tZW51SXRlbUlkID09PSAnYXV0b2Zsb3ctc3RvcC1yZWNvcmRpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wUmVjb3JkaW5nKCkuY2F0Y2goY29uc29sZS5lcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZXh0ZW5zaW9uIGJhZGdlIHRvIHNob3cgcmVjb3JkaW5nIHN0YXR1c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdXBkYXRlQmFkZ2UoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzUmVjb3JkaW5nKSB7XG4gICAgICAgICAgICBjaHJvbWUuYWN0aW9uLnNldEJhZGdlVGV4dCh7IHRleHQ6ICdSRUMnIH0pO1xuICAgICAgICAgICAgY2hyb21lLmFjdGlvbi5zZXRCYWRnZUJhY2tncm91bmRDb2xvcih7IGNvbG9yOiAnI2VmNDQ0NCcgfSk7XG4gICAgICAgICAgICBjaHJvbWUuYWN0aW9uLnNldFRpdGxlKHsgdGl0bGU6ICdBdXRvRmxvdyBTdHVkaW8gLSBSZWNvcmRpbmcgQWN0aXZlJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogJycgfSk7XG4gICAgICAgICAgICBjaHJvbWUuYWN0aW9uLnNldFRpdGxlKHsgdGl0bGU6ICdBdXRvRmxvdyBTdHVkaW8gLSBTbWFydCBCcm93c2VyIEF1dG9tYXRpb24nIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIC4uLiBbQWRkaXRpb25hbCB1dGlsaXR5IG1ldGhvZHMgd291bGQgY29udGludWUgaGVyZV1cbiAgICAvLyBGb3IgYnJldml0eSwgSSdsbCBpbmNsdWRlIGtleSB1dGlsaXR5IG1ldGhvZHNcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB1bmlxdWUgc2Vzc2lvbiBJRFxuICAgICAqIEByZXR1cm5zIFVuaXF1ZSBzZXNzaW9uIGlkZW50aWZpZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdlbmVyYXRlU2Vzc2lvbklkKCkge1xuICAgICAgICByZXR1cm4gYHNlc3Npb25fJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGFiIGJ5IElEXG4gICAgICogQHBhcmFtIHRhYklkIC0gVGFiIElEXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gdGFiIG9yIG51bGxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGdldFRhYkJ5SWQodGFiSWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBjaHJvbWUudGFicy5nZXQodGFiSWQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgYWN0aXZlIHRhYlxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIGFjdGl2ZSB0YWIgb3IgbnVsbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgZ2V0Q3VycmVudEFjdGl2ZVRhYigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRhYnMgPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybiB0YWJzWzBdIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTYXZlIGN1cnJlbnQgc3RhdGUgdG8gc3RvcmFnZVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdoZW4gc2F2ZSBpcyBjb21wbGV0ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgc2F2ZVN0YXRlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgICAgICAgICBhdXRvZmxvd19zdGF0ZTogdGhpcy5zdGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRvRmxvdyBCYWNrZ3JvdW5kOiBFcnJvciBzYXZpbmcgc3RhdGU6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVzdG9yZSBzdGF0ZSBmcm9tIHN0b3JhZ2VcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aGVuIHJlc3RvcmUgaXMgY29tcGxldGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIHJlc3RvcmVTdGF0ZSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ2F1dG9mbG93X3N0YXRlJ10pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5hdXRvZmxvd19zdGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB7IC4uLnRoaXMuc3RhdGUsIC4uLnJlc3VsdC5hdXRvZmxvd19zdGF0ZSB9O1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdXRvRmxvdyBCYWNrZ3JvdW5kOiBTdGF0ZSByZXN0b3JlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3cgQmFja2dyb3VuZDogRXJyb3IgcmVzdG9yaW5nIHN0YXRlOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTYXZlIHNlc3Npb24gZGF0YSB0byBwZXJzaXN0ZW50IHN0b3JhZ2VcbiAgICAgKiBAcGFyYW0gc2Vzc2lvbkRhdGEgLSBTZXNzaW9uIGRhdGEgdG8gc2F2ZVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHdoZW4gc2F2ZSBpcyBjb21wbGV0ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgc2F2ZVNlc3Npb25EYXRhKHNlc3Npb25EYXRhKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgc2Vzc2lvbl8ke3Nlc3Npb25EYXRhLnNlc3Npb25JZH1gO1xuICAgICAgICAgICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW2tleV06IHNlc3Npb25EYXRhIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0F1dG9GbG93IEJhY2tncm91bmQ6IFNlc3Npb24gZGF0YSBzYXZlZDonLCBzZXNzaW9uRGF0YS5zZXNzaW9uSWQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3cgQmFja2dyb3VuZDogRXJyb3Igc2F2aW5nIHNlc3Npb24gZGF0YTonLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgc3RvcmVkIHdvcmtmbG93c1xuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHdvcmtmbG93cyBhcnJheVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U3RvcmVkV29ya2Zsb3dzKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFt0aGlzLlNUT1JBR0VfS0VZUy5XT1JLRkxPV1NdKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRbdGhpcy5TVE9SQUdFX0tFWVMuV09SS0ZMT1dTXSB8fCBbXTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG9GbG93IEJhY2tncm91bmQ6IEVycm9yIGdldHRpbmcgd29ya2Zsb3dzOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTYXZlIHdvcmtmbG93IHRvIHN0b3JhZ2VcbiAgICAgKiBAcGFyYW0gd29ya2Zsb3cgLSBXb3JrZmxvdyB0byBzYXZlXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gc2F2ZSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIHNhdmVXb3JrZmxvdyh3b3JrZmxvdykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgd29ya2Zsb3dzID0gYXdhaXQgdGhpcy5nZXRTdG9yZWRXb3JrZmxvd3MoKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nSW5kZXggPSB3b3JrZmxvd3MuZmluZEluZGV4KHcgPT4gdy5pZCA9PT0gd29ya2Zsb3cuaWQpO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgIHdvcmtmbG93c1tleGlzdGluZ0luZGV4XSA9IHdvcmtmbG93O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgd29ya2Zsb3dzLnB1c2god29ya2Zsb3cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgICAgICAgICBbdGhpcy5TVE9SQUdFX0tFWVMuV09SS0ZMT1dTXTogd29ya2Zsb3dzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHdvcmtmbG93IH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRvRmxvdyBCYWNrZ3JvdW5kOiBFcnJvciBzYXZpbmcgd29ya2Zsb3c6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlIHdvcmtmbG93IGZyb20gc3RvcmFnZVxuICAgICAqIEBwYXJhbSB3b3JrZmxvd0lkIC0gV29ya2Zsb3cgSUQgdG8gZGVsZXRlXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gZGVsZXRlIHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgZGVsZXRlV29ya2Zsb3cod29ya2Zsb3dJZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgd29ya2Zsb3dzID0gYXdhaXQgdGhpcy5nZXRTdG9yZWRXb3JrZmxvd3MoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkV29ya2Zsb3dzID0gd29ya2Zsb3dzLmZpbHRlcih3ID0+IHcuaWQgIT09IHdvcmtmbG93SWQpO1xuICAgICAgICAgICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgICAgICAgICBbdGhpcy5TVE9SQUdFX0tFWVMuV09SS0ZMT1dTXTogZmlsdGVyZWRXb3JrZmxvd3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGVsZXRlZElkOiB3b3JrZmxvd0lkIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRvRmxvdyBCYWNrZ3JvdW5kOiBFcnJvciBkZWxldGluZyB3b3JrZmxvdzonLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgY3VycmVudCByZWNvcmRpbmcgc2Vzc2lvblxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHNlc3Npb24gZXhwb3J0IGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGV4cG9ydEN1cnJlbnRTZXNzaW9uKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmN1cnJlbnRTZXNzaW9uSWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSBzZXNzaW9uIHRvIGV4cG9ydCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uSWQ6IHRoaXMuc3RhdGUuY3VycmVudFNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICBzdGVwczogWy4uLnRoaXMuc3RhdGUuY3VycmVudFN0ZXBzXSxcbiAgICAgICAgICAgICAgICBzdGVwQ291bnQ6IHRoaXMuc3RhdGUuY3VycmVudFN0ZXBzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogdGhpcy5zdGF0ZS5zZXNzaW9uU3RhcnRUaW1lID9cbiAgICAgICAgICAgICAgICAgICAgRGF0ZS5ub3coKSAtIHRoaXMuc3RhdGUuc2Vzc2lvblN0YXJ0VGltZSA6IDAsXG4gICAgICAgICAgICAgICAgZXhwb3J0VGltZTogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICB0YWJJZDogdGhpcy5zdGF0ZS5hY3RpdmVUYWJJZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG9GbG93IEJhY2tncm91bmQ6IEVycm9yIGV4cG9ydGluZyBzZXNzaW9uOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgc3RvcmFnZSBzdHJ1Y3R1cmVcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB3aGVuIGluaXRpYWxpemF0aW9uIGlzIGNvbXBsZXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBpbml0aWFsaXplU3RvcmFnZSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHREYXRhID0ge1xuICAgICAgICAgICAgICAgIFt0aGlzLlNUT1JBR0VfS0VZUy5XT1JLRkxPV1NdOiBbXSxcbiAgICAgICAgICAgICAgICBbdGhpcy5TVE9SQUdFX0tFWVMuU0VTU0lPTlNdOiB7fSxcbiAgICAgICAgICAgICAgICBbdGhpcy5TVE9SQUdFX0tFWVMuU0VUVElOR1NdOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcHR1cmVTY3JlZW5zaG90czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgYXV0b1NhdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1heFN0b3JlZFNlc3Npb25zOiAxMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBPbmx5IHNldCBkZWZhdWx0cyBpZiBrZXlzIGRvbid0IGV4aXN0XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChPYmplY3Qua2V5cyhkZWZhdWx0RGF0YSkpO1xuICAgICAgICAgICAgY29uc3QgdG9TZXQgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGRlZmF1bHREYXRhKSkge1xuICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBleGlzdGluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9TZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0b1NldCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh0b1NldCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0F1dG9GbG93IEJhY2tncm91bmQ6IFN0b3JhZ2UgaW5pdGlhbGl6ZWQgd2l0aCBkZWZhdWx0cycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3cgQmFja2dyb3VuZDogRXJyb3IgaW5pdGlhbGl6aW5nIHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBJbml0aWFsaXplIHRoZSBiYWNrZ3JvdW5kIHNjcmlwdFxuY29uc3QgYmFja2dyb3VuZFNjcmlwdCA9IG5ldyBBdXRvRmxvd0JhY2tncm91bmQoKTtcbi8vIEV4cG9ydCBmb3IgdGVzdGluZ1xuZXhwb3J0IGRlZmF1bHQgQXV0b0Zsb3dCYWNrZ3JvdW5kO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9