/**
 * @fileoverview Content script for AutoFlow Studio
 * @author Ayush Shukla
 * @description Main content script that handles DOM event recording, selector extraction,
 * and screenshot capture. Follows SOLID principles for maintainable code.
 */

import { TraceStep, ActionType, ElementSelector, InputData, BoundingBox } from '@shared/types/core';
import { SelectorExtractor } from '../utils/selector-extractor';
import { ScreenshotCapture } from '../utils/screenshot-capture';
import { EventRecorder } from '../utils/event-recorder';

/**
 * Main content script class following Single Responsibility Principle
 * Handles coordination between different recording components
 */
class AutoFlowContentScript {
  private isRecording: boolean = false;
  private recordingSessionId: string | null = null;
  private selectorExtractor: SelectorExtractor;
  private screenshotCapture: ScreenshotCapture;
  private eventRecorder: EventRecorder;
  private stepCounter: number = 0;

  /**
   * Initialize the content script with all dependencies
   */
  constructor() {
    this.selectorExtractor = new SelectorExtractor();
    this.screenshotCapture = new ScreenshotCapture();
    this.eventRecorder = new EventRecorder();
    
    this.setupEventListeners();
    this.setupMessageHandlers();
    this.initializeRecordingState();
  }

  /**
   * Set up DOM event listeners for recording user interactions
   * @private
   */
  private setupEventListeners(): void {
    // Click events
    document.addEventListener('click', this.handleClickEvent.bind(this), {
      capture: true,
      passive: true
    });

    // Input events (typing, form filling)
    document.addEventListener('input', this.handleInputEvent.bind(this), {
      capture: true,
      passive: true
    });

    // Navigation events
    window.addEventListener('beforeunload', this.handleNavigationEvent.bind(this));

    // Scroll events (throttled for performance)
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(this.handleScrollEvent.bind(this), 150);
    }, { passive: true });

    // Form submission events
    document.addEventListener('submit', this.handleSubmitEvent.bind(this), {
      capture: true,
      passive: true
    });

    // Focus events for form field detection
    document.addEventListener('focus', this.handleFocusEvent.bind(this), {
      capture: true,
      passive: true
    });
  }

  /**
   * Set up message handlers for communication with background script
   * @private
   */
  private setupMessageHandlers(): void {
    chrome.runtime.onMessage.addListener((
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });
  }

  /**
   * Initialize recording state from storage
   * @private
   */
  private async initializeRecordingState(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['isRecording', 'recordingSessionId']);
      this.isRecording = result.isRecording || false;
      this.recordingSessionId = result.recordingSessionId || null;

      if (this.isRecording) {
        this.showRecordingIndicator();
      }
    } catch (error) {
      console.error('AutoFlow: Failed to initialize recording state:', error);
    }
  }

  /**
   * Handle messages from background script or popup
   * @param message - The message received
   * @param sender - Message sender information
   * @param sendResponse - Response callback
   * @private
   */
  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      switch (message.type) {
        case 'START_RECORDING':
          await this.startRecording(message.sessionId);
          sendResponse({ success: true });
          break;

        case 'STOP_RECORDING':
          await this.stopRecording();
          sendResponse({ success: true });
          break;

        case 'GET_RECORDING_STATE':
          sendResponse({
            isRecording: this.isRecording,
            sessionId: this.recordingSessionId,
            stepCount: this.stepCounter
          });
          break;

        case 'CAPTURE_SCREENSHOT':
          const screenshot = await this.screenshotCapture.captureVisible();
          sendResponse({ screenshot });
          break;

        case 'EXTRACT_SELECTORS':
          const selectors = this.selectorExtractor.extractSelectors(message.element);
          sendResponse({ selectors });
          break;

        default:
          console.warn('AutoFlow: Unknown message type:', message.type);
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('AutoFlow: Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  /**
   * Start recording user interactions
   * @param sessionId - Unique session identifier
   */
  private async startRecording(sessionId: string): Promise<void> {
    this.isRecording = true;
    this.recordingSessionId = sessionId;
    this.stepCounter = 0;

    // Store recording state
    await chrome.storage.local.set({
      isRecording: true,
      recordingSessionId: sessionId
    });

    // Show visual indicator
    this.showRecordingIndicator();

    // Record initial page state
    await this.recordPageLoad();

    console.log('AutoFlow: Recording started for session:', sessionId);
  }

  /**
   * Stop recording user interactions
   */
  private async stopRecording(): Promise<void> {
    this.isRecording = false;
    const sessionId = this.recordingSessionId;
    this.recordingSessionId = null;

    // Clear recording state
    await chrome.storage.local.remove(['isRecording', 'recordingSessionId']);

    // Hide visual indicator
    this.hideRecordingIndicator();

    console.log('AutoFlow: Recording stopped for session:', sessionId);
  }

  /**
   * Handle click events on the page
   * @param event - The click event
   * @private
   */
  private async handleClickEvent(event: MouseEvent): Promise<void> {
    if (!this.isRecording || !event.target) return;

    const element = event.target as Element;
    
    // Skip clicks on the recording indicator
    if (element.closest('.autoflow-recording-indicator')) return;

    try {
      const step = await this.createTraceStep(element, 'click', event);
      await this.saveTraceStep(step);
    } catch (error) {
      console.error('AutoFlow: Error recording click event:', error);
    }
  }

  /**
   * Handle input events (typing, form filling)
   * @param event - The input event
   * @private
   */
  private async handleInputEvent(event: Event): Promise<void> {
    if (!this.isRecording || !event.target) return;

    const element = event.target as HTMLInputElement | HTMLTextAreaElement;
    
    // Only record certain input types
    const recordableTypes = ['text', 'email', 'password', 'search', 'tel', 'url'];
    if (element.type && !recordableTypes.includes(element.type)) return;

    try {
      const step = await this.createTraceStep(element, 'input', event);
      await this.saveTraceStep(step);
    } catch (error) {
      console.error('AutoFlow: Error recording input event:', error);
    }
  }

  /**
   * Handle scroll events on the page
   * @private
   */
  private async handleScrollEvent(): Promise<void> {
    if (!this.isRecording) return;

    try {
      const scrollStep: TraceStep = {
        id: this.generateStepId(),
        tabId: await this.getCurrentTabId(),
        url: window.location.href,
        action: 'scroll',
        selectors: [],
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
          pageHeight: document.body.scrollHeight,
          pageWidth: document.body.scrollWidth
        },
        timestamp: Date.now(),
        metadata: {
          description: `Scrolled to position (${window.scrollX}, ${window.scrollY})`,
          tags: ['scroll']
        }
      };

      await this.saveTraceStep(scrollStep);
    } catch (error) {
      console.error('AutoFlow: Error recording scroll event:', error);
    }
  }

  /**
   * Handle form submission events
   * @param event - The submit event
   * @private
   */
  private async handleSubmitEvent(event: Event): Promise<void> {
    if (!this.isRecording || !event.target) return;

    const form = event.target as HTMLFormElement;

    try {
      const step = await this.createTraceStep(form, 'click', event);
      step.metadata = {
        ...step.metadata,
        description: 'Form submission',
        tags: ['form', 'submit'],
        critical: true
      };

      await this.saveTraceStep(step);
    } catch (error) {
      console.error('AutoFlow: Error recording form submission:', error);
    }
  }

  /**
   * Handle navigation events
   * @private
   */
  private async handleNavigationEvent(): Promise<void> {
    if (!this.isRecording) return;

    try {
      const step: TraceStep = {
        id: this.generateStepId(),
        tabId: await this.getCurrentTabId(),
        url: window.location.href,
        action: 'navigate',
        selectors: [],
        timestamp: Date.now(),
        metadata: {
          description: `Navigating away from ${window.location.href}`,
          tags: ['navigation']
        }
      };

      await this.saveTraceStep(step);
    } catch (error) {
      console.error('AutoFlow: Error recording navigation event:', error);
    }
  }

  /**
   * Handle focus events for form fields
   * @param event - The focus event
   * @private
   */
  private async handleFocusEvent(event: FocusEvent): Promise<void> {
    if (!this.isRecording || !event.target) return;

    const element = event.target as Element;
    
    // Only record focus on interactive elements
    const interactiveElements = ['input', 'textarea', 'select', 'button'];
    if (!interactiveElements.includes(element.tagName.toLowerCase())) return;

    // This helps with form field detection and can be used for better selectors
    console.log('AutoFlow: Focus detected on:', element);
  }

  /**
   * Record initial page load
   * @private
   */
  private async recordPageLoad(): Promise<void> {
    try {
      const step: TraceStep = {
        id: this.generateStepId(),
        tabId: await this.getCurrentTabId(),
        url: window.location.href,
        action: 'navigate',
        selectors: [],
        domHash: await this.generateDOMHash(),
        timestamp: Date.now(),
        metadata: {
          description: `Page loaded: ${document.title}`,
          tags: ['page_load', 'navigation'],
          critical: true
        }
      };

      // Capture screenshot of initial page state
      const screenshot = await this.screenshotCapture.captureVisible();
      if (screenshot) {
        step.thumbnailRef = await this.saveScreenshot(screenshot);
      }

      await this.saveTraceStep(step);
    } catch (error) {
      console.error('AutoFlow: Error recording page load:', error);
    }
  }

  /**
   * Create a trace step from an event and element
   * @param element - The target element
   * @param action - The action type
   * @param event - The original event
   * @returns Promise resolving to a TraceStep
   * @private
   */
  private async createTraceStep(
    element: Element,
    action: ActionType,
    event: Event
  ): Promise<TraceStep> {
    const selectors = this.selectorExtractor.extractSelectors(element);
    const boundingBox = element.getBoundingClientRect();

    const step: TraceStep = {
      id: this.generateStepId(),
      tabId: await this.getCurrentTabId(),
      url: window.location.href,
      action,
      selectors,
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY,
        pageHeight: document.body.scrollHeight,
        pageWidth: document.body.scrollWidth
      },
      domHash: await this.generateDOMHash(),
      timestamp: Date.now(),
      metadata: {
        description: this.generateStepDescription(element, action),
        tags: this.generateStepTags(element, action)
      }
    };

    // Add input data for input events
    if (action === 'input' && (element as HTMLInputElement).value !== undefined) {
      step.inputData = this.extractInputData(element as HTMLInputElement);
    }

    // Capture screenshot for visual verification
    const screenshot = await this.screenshotCapture.captureElement(element);
    if (screenshot) {
      step.thumbnailRef = await this.saveScreenshot(screenshot);
    }

    return step;
  }

  /**
   * Extract input data from form elements
   * @param element - The input element
   * @returns InputData object
   * @private
   */
  private extractInputData(element: HTMLInputElement): InputData {
    const inputData: InputData = {
      value: element.value,
      type: this.mapInputType(element.type),
      source: 'static',
      sensitive: element.type === 'password'
    };

    // Mask sensitive data
    if (inputData.sensitive) {
      inputData.value = '[MASKED]';
    }

    return inputData;
  }

  /**
   * Map HTML input types to our InputType enum
   * @param htmlType - HTML input type
   * @returns Mapped input type
   * @private
   */
  private mapInputType(htmlType: string): any {
    const typeMap: { [key: string]: string } = {
      'text': 'text',
      'email': 'email',
      'password': 'password',
      'number': 'number',
      'tel': 'text',
      'url': 'text',
      'search': 'text',
      'date': 'date',
      'file': 'file'
    };

    return typeMap[htmlType] || 'text';
  }

  /**
   * Generate a descriptive text for the step
   * @param element - Target element
   * @param action - Action type
   * @returns Human-readable description
   * @private
   */
  private generateStepDescription(element: Element, action: ActionType): string {
    const elementText = element.textContent?.trim().slice(0, 50) || '';
    const tagName = element.tagName.toLowerCase();
    
    switch (action) {
      case 'click':
        return `Clicked ${tagName}${elementText ? ': "' + elementText + '"' : ''}`;
      case 'input':
        const placeholder = (element as HTMLInputElement).placeholder;
        return `Entered text in ${tagName}${placeholder ? ' (' + placeholder + ')' : ''}`;
      default:
        return `Performed ${action} on ${tagName}`;
    }
  }

  /**
   * Generate relevant tags for the step
   * @param element - Target element
   * @param action - Action type
   * @returns Array of tags
   * @private
   */
  private generateStepTags(element: Element, action: ActionType): string[] {
    const tags = [action];
    
    // Add element-specific tags
    if (element.tagName) {
      tags.push(element.tagName.toLowerCase());
    }
    
    if (element.classList.length > 0) {
      tags.push('has-class');
    }
    
    if (element.id) {
      tags.push('has-id');
    }

    // Add form-related tags
    if (element.closest('form')) {
      tags.push('form-element');
    }

    return tags;
  }

  /**
   * Save a trace step to storage
   * @param step - The step to save
   * @private
   */
  private async saveTraceStep(step: TraceStep): Promise<void> {
    try {
      // Send to background script for processing and storage
      await chrome.runtime.sendMessage({
        type: 'SAVE_TRACE_STEP',
        sessionId: this.recordingSessionId,
        step
      });

      this.stepCounter++;
      console.log('AutoFlow: Step recorded:', step);

    } catch (error) {
      console.error('AutoFlow: Error saving trace step:', error);
    }
  }

  /**
   * Save screenshot to storage
   * @param screenshot - Base64 screenshot data
   * @returns Promise resolving to screenshot reference
   * @private
   */
  private async saveScreenshot(screenshot: string): Promise<string> {
    const screenshotId = `screenshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await chrome.storage.local.set({
      [`screenshot_${screenshotId}`]: screenshot
    });

    return screenshotId;
  }

  /**
   * Generate a unique step ID
   * @returns Unique step identifier
   * @private
   */
  private generateStepId(): string {
    return `step_${Date.now()}_${this.stepCounter}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current tab ID
   * @returns Promise resolving to tab ID
   * @private
   */
  private async getCurrentTabId(): Promise<number> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' }, (response) => {
        resolve(response?.tabId || 0);
      });
    });
  }

  /**
   * Generate a hash of the current DOM structure
   * @returns Promise resolving to DOM hash
   * @private
   */
  private async generateDOMHash(): Promise<string> {
    // Simple hash based on DOM structure and key elements
    const bodyHTML = document.body.innerHTML.slice(0, 1000); // First 1KB
    const title = document.title;
    const url = window.location.href;
    
    const content = `${title}|${url}|${bodyHTML}`;
    
    // Simple hash function (for production, use crypto API)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }

  /**
   * Show visual recording indicator
   * @private
   */
  private showRecordingIndicator(): void {
    // Remove existing indicator if present
    this.hideRecordingIndicator();

    const indicator = document.createElement('div');
    indicator.className = 'autoflow-recording-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 12px;
        font-weight: 600;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 1s infinite;
        "></div>
        Recording
      </div>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(indicator);
  }

  /**
   * Hide visual recording indicator
   * @private
   */
  private hideRecordingIndicator(): void {
    const indicator = document.querySelector('.autoflow-recording-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
}

// Initialize the content script when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AutoFlowContentScript();
  });
} else {
  new AutoFlowContentScript();
}

export default AutoFlowContentScript;
