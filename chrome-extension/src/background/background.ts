/**
 * @fileoverview Background service worker for AutoFlow Studio Chrome Extension
 * @author Ayush Shukla
 * @description Central coordinator for the extension, handles tab management,
 * storage operations, and communication between components.
 * Follows SOLID principles and acts as a message broker.
 */

import { TraceStep, Workflow } from '@shared/types/core';

/**
 * Background script state management
 */
interface BackgroundState {
  /** Current recording session ID */
  currentSessionId: string | null;
  /** Whether recording is active */
  isRecording: boolean;
  /** Active tab being recorded */
  activeTabId: number | null;
  /** Recorded steps for current session */
  currentSteps: TraceStep[];
  /** Session start time */
  sessionStartTime: number | null;
}

/**
 * Message types for internal communication
 */
interface ExtensionMessage {
  type: string;
  data?: any;
  sessionId?: string;
  tabId?: number;
  step?: TraceStep;
}

/**
 * Main background script class
 * Follows Single Responsibility Principle - manages extension coordination
 */
class AutoFlowBackground {
  private state: BackgroundState;
  private readonly STORAGE_KEYS = {
    WORKFLOWS: 'autoflow_workflows',
    SESSIONS: 'autoflow_sessions',
    SETTINGS: 'autoflow_settings'
  };

  /**
   * Initialize the background script
   */
  constructor() {
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
  private setupEventListeners(): void {
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
  private async initializeExtension(): Promise<void> {
    try {
      // Restore previous state if exists
      await this.restoreState();
      
      // Update extension badge
      this.updateBadge();
      
      console.log('AutoFlow Background: Extension initialized');
    } catch (error) {
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
  private handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): boolean {
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
        this.saveTraceStep(message.step!)
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
  private async startRecording(config: any = {}, tabId?: number): Promise<any> {
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
      this.state.activeTabId = activeTab.id!;
      this.state.currentSteps = [];
      this.state.sessionStartTime = Date.now();

      // Save state to storage
      await this.saveState();

      // Inject content script if not already present
      await this.ensureContentScriptInjected(activeTab.id!);

      // Notify content script to start recording
      await chrome.tabs.sendMessage(activeTab.id!, {
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

    } catch (error) {
      console.error('AutoFlow Background: Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop the current recording session
   * @returns Promise resolving to session summary
   * @private
   */
  private async stopRecording(): Promise<any> {
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
        } catch (error) {
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

    } catch (error) {
      console.error('AutoFlow Background: Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * Get current recording state
   * @returns Current recording state
   * @private
   */
  private getRecordingState(): any {
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
  private async saveTraceStep(step: TraceStep): Promise<any> {
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

    } catch (error) {
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
  private async captureVisibleTab(tabId?: number): Promise<string | null> {
    try {
      const targetTabId = tabId || this.state.activeTabId;
      
      if (!targetTabId) {
        throw new Error('No tab ID provided for screenshot');
      }

      // Capture visible tab
      const screenshot = await chrome.tabs.captureVisibleTab(
        undefined, // Current window
        { format: 'png', quality: 90 }
      );

      return screenshot;

    } catch (error) {
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
  private async captureFullPage(tabId?: number): Promise<string | null> {
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
  private handleTabUpdated(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): void {
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
  private handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo): void {
    // Update UI if needed
    console.log('AutoFlow Background: Tab activated:', activeInfo.tabId);
  }

  /**
   * Handle tab removal events
   * @param tabId - Removed tab ID
   * @param removeInfo - Remove information
   * @private
   */
  private handleTabRemoved(
    tabId: number,
    removeInfo: chrome.tabs.TabRemoveInfo
  ): void {
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
  private handleNavigationCompleted(details: chrome.webNavigation.WebNavigationFramedCallbackDetails): void {
    // Only handle main frame navigation
    if (details.frameId !== 0) return;

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
  private handleBeforeNavigate(details: chrome.webNavigation.WebNavigationParentedCallbackDetails): void {
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
  private handleInstalled(details: chrome.runtime.InstalledDetails): void {
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
  private handleStartup(): void {
    console.log('AutoFlow Background: Extension started');
  }

  /**
   * Ensure content script is injected in the specified tab
   * @param tabId - Tab ID to inject into
   * @returns Promise resolving when injection is complete
   * @private
   */
  private async ensureContentScriptInjected(tabId: number): Promise<void> {
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

    } catch (error) {
      console.error('AutoFlow Background: Error ensuring content script injection:', error);
      throw error;
    }
  }

  /**
   * Set up context menus
   * @private
   */
  private setupContextMenus(): void {
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
      } else if (info.menuItemId === 'autoflow-stop-recording') {
        this.stopRecording().catch(console.error);
      }
    });
  }

  /**
   * Update extension badge to show recording status
   * @private
   */
  private updateBadge(): void {
    if (this.state.isRecording) {
      chrome.action.setBadgeText({ text: 'REC' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
      chrome.action.setTitle({ title: 'AutoFlow Studio - Recording Active' });
    } else {
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
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get tab by ID
   * @param tabId - Tab ID
   * @returns Promise resolving to tab or null
   * @private
   */
  private async getTabById(tabId: number): Promise<chrome.tabs.Tab | null> {
    try {
      return await chrome.tabs.get(tabId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current active tab
   * @returns Promise resolving to active tab or null
   * @private
   */
  private async getCurrentActiveTab(): Promise<chrome.tabs.Tab | null> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      return tabs[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save current state to storage
   * @returns Promise resolving when save is complete
   * @private
   */
  private async saveState(): Promise<void> {
    try {
      await chrome.storage.local.set({
        autoflow_state: this.state
      });
    } catch (error) {
      console.error('AutoFlow Background: Error saving state:', error);
      throw error;
    }
  }

  /**
   * Restore state from storage
   * @returns Promise resolving when restore is complete
   * @private
   */
  private async restoreState(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['autoflow_state']);
      if (result.autoflow_state) {
        this.state = { ...this.state, ...result.autoflow_state };
        console.log('AutoFlow Background: State restored');
      }
    } catch (error) {
      console.error('AutoFlow Background: Error restoring state:', error);
    }
  }

  /**
   * Save session data to persistent storage
   * @param sessionData - Session data to save
   * @returns Promise resolving when save is complete
   * @private
   */
  private async saveSessionData(sessionData: any): Promise<void> {
    try {
      const key = `session_${sessionData.sessionId}`;
      await chrome.storage.local.set({ [key]: sessionData });
      console.log('AutoFlow Background: Session data saved:', sessionData.sessionId);
    } catch (error) {
      console.error('AutoFlow Background: Error saving session data:', error);
      throw error;
    }
  }

  /**
   * Get stored workflows
   * @returns Promise resolving to workflows array
   * @private
   */
  private async getStoredWorkflows(): Promise<Workflow[]> {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEYS.WORKFLOWS]);
      return result[this.STORAGE_KEYS.WORKFLOWS] || [];
    } catch (error) {
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
  private async saveWorkflow(workflow: Workflow): Promise<any> {
    try {
      const workflows = await this.getStoredWorkflows();
      const existingIndex = workflows.findIndex(w => w.id === workflow.id);
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = workflow;
      } else {
        workflows.push(workflow);
      }

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.WORKFLOWS]: workflows
      });

      return { success: true, workflow };
    } catch (error) {
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
  private async deleteWorkflow(workflowId: string): Promise<any> {
    try {
      const workflows = await this.getStoredWorkflows();
      const filteredWorkflows = workflows.filter(w => w.id !== workflowId);
      
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.WORKFLOWS]: filteredWorkflows
      });

      return { success: true, deletedId: workflowId };
    } catch (error) {
      console.error('AutoFlow Background: Error deleting workflow:', error);
      throw error;
    }
  }

  /**
   * Export current recording session
   * @returns Promise resolving to session export data
   * @private
   */
  private async exportCurrentSession(): Promise<any> {
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
    } catch (error) {
      console.error('AutoFlow Background: Error exporting session:', error);
      throw error;
    }
  }

  /**
   * Initialize storage structure
   * @returns Promise resolving when initialization is complete
   * @private
   */
  private async initializeStorage(): Promise<void> {
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
      const toSet: { [key: string]: any } = {};

      for (const [key, value] of Object.entries(defaultData)) {
        if (!(key in existing)) {
          toSet[key] = value;
        }
      }

      if (Object.keys(toSet).length > 0) {
        await chrome.storage.local.set(toSet);
        console.log('AutoFlow Background: Storage initialized with defaults');
      }
    } catch (error) {
      console.error('AutoFlow Background: Error initializing storage:', error);
      throw error;
    }
  }
}

// Initialize the background script
const backgroundScript = new AutoFlowBackground();

// Export for testing
export default AutoFlowBackground;
