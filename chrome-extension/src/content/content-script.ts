/**
 * @fileoverview Content script for AutoFlow Studio
 * @author Ayush Shukla
 * @description Main content script that handles DOM event recording, selector extraction,
 * and screenshot capture. Follows SOLID principles for maintainable code.
 */

import {
  TraceStep,
  ActionType,
  ElementSelector,
  InputData,
  BoundingBox,
} from "@shared/types/core";
import { SelectorExtractor } from "../utils/selector-extractor";
import { ScreenshotCapture } from "../utils/screenshot-capture";
import { EventRecorder } from "../utils/event-recorder";

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
  private stepCounterSyncInterval: NodeJS.Timeout | null = null;

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
    document.addEventListener("click", this.handleClickEvent.bind(this), {
      capture: true,
      passive: true,
    });

    // Input events (typing, form filling)
    document.addEventListener("input", this.handleInputEvent.bind(this), {
      capture: true,
      passive: true,
    });

    // Navigation events
    window.addEventListener(
      "beforeunload",
      this.handleNavigationEvent.bind(this)
    );

    // Scroll events (optimized throttling with distance threshold)
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollPosition = { x: window.scrollX, y: window.scrollY };
    let lastScrollTime = 0;

    document.addEventListener(
      "scroll",
      () => {
        const now = Date.now();
        const currentPosition = { x: window.scrollX, y: window.scrollY };

        // Calculate scroll distance
        const scrollDistance = Math.sqrt(
          Math.pow(currentPosition.x - lastScrollPosition.x, 2) +
            Math.pow(currentPosition.y - lastScrollPosition.y, 2)
        );

        // Only record if significant scroll (>50px) or enough time passed (>100ms)
        const significantScroll = scrollDistance > 50;
        const enoughTimePassed = now - lastScrollTime > 100;

        if (significantScroll || enoughTimePassed) {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            this.handleScrollEvent.bind(this)();
            lastScrollPosition = { x: window.scrollX, y: window.scrollY };
            lastScrollTime = Date.now();
          }, 50); // Reduced from 150ms to 50ms
        }
      },
      { passive: true }
    );

    // Form submission events
    document.addEventListener("submit", this.handleSubmitEvent.bind(this), {
      capture: true,
      passive: true,
    });

    // Focus events for form field detection
    document.addEventListener("focus", this.handleFocusEvent.bind(this), {
      capture: true,
      passive: true,
    });
  }

  /**
   * Set up message handlers for communication with background script
   * @private
   */
  private setupMessageHandlers(): void {
    chrome.runtime.onMessage.addListener(
      (
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
      ) => {
        this.handleMessage(message, sender, sendResponse);
        return true; // Keep message channel open for async responses
      }
    );
  }

  /**
   * Initialize recording state from storage
   * @private
   */
  private async initializeRecordingState(): Promise<void> {
    try {
      const result = await chrome.storage.local.get([
        "isRecording",
        "recordingSessionId",
      ]);
      this.isRecording = result.isRecording || false;
      this.recordingSessionId = result.recordingSessionId || null;

      if (this.isRecording) {
        this.showRecordingIndicator().catch((error) => {
          console.error("AutoFlow: Error showing recording indicator:", error);
        });
        // Also start step counter sync for restored recording state
        this.startStepCounterSync();
      }
    } catch (error) {
      console.error("AutoFlow: Failed to initialize recording state:", error);
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
        case "START_RECORDING":
          await this.startRecording(message.sessionId);
          sendResponse({ success: true });
          break;

        case "STOP_RECORDING":
          await this.stopRecording();
          sendResponse({ success: true });
          break;

        case "GET_RECORDING_STATE":
          sendResponse({
            isRecording: this.isRecording,
            sessionId: this.recordingSessionId,
            stepCount: this.stepCounter,
          });
          break;

        case "CAPTURE_SCREENSHOT":
          const screenshot = await this.screenshotCapture.captureVisible();
          sendResponse({ screenshot });
          break;

        case "EXTRACT_SELECTORS":
          const selectors = this.selectorExtractor.extractSelectors(
            message.element
          );
          sendResponse({ selectors });
          break;

        // Background uses this to detect if sidebar script is present
        case "SIDEBAR_STATUS":
          // Forward to sidebar if present; otherwise report not injected
          try {
            chrome.runtime.sendMessage({ type: "SIDEBAR_STATUS" }, (resp) => {
              if (resp && typeof resp.injected !== "undefined") {
                sendResponse(resp);
              } else {
                sendResponse({ injected: false, sidebarActive: false });
              }
            });
          } catch {
            sendResponse({ injected: false, sidebarActive: false });
          }
          break;

        case "HIDE_RECORDING_INDICATOR":
          this.hideRecordingIndicator();
          sendResponse({ success: true });
          break;

        default:
          // Silently ignore unknown message types to avoid console noise
          break;
      }
    } catch (error: any) {
      console.error("AutoFlow: Error handling message:", error);
      sendResponse({ error: error?.message || "Unknown error" });
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
      recordingSessionId: sessionId,
    });

    // Show visual indicator
    this.showRecordingIndicator().catch((error) => {
      console.error("AutoFlow: Error showing recording indicator:", error);
    });

    // Start periodic step counter sync
    this.startStepCounterSync();

    // Record initial page state
    await this.recordPageLoad();

    console.log("AutoFlow: Recording started for session:", sessionId);
  }

  /**
   * Stop recording user interactions
   */
  private async stopRecording(): Promise<void> {
    this.isRecording = false;
    const sessionId = this.recordingSessionId;
    this.recordingSessionId = null;

    // Clear recording state
    await chrome.storage.local.remove(["isRecording", "recordingSessionId"]);

    // Hide visual indicator
    this.hideRecordingIndicator();

    // Stop periodic step counter sync
    this.stopStepCounterSync();

    console.log("AutoFlow: Recording stopped for session:", sessionId);
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
    if (element.closest(".autoflow-recording-indicator")) return;

    try {
      // Highlight the clicked element
      this.highlightElement(element);

      const step = await this.createTraceStep(element, "click", event);
      await this.saveTraceStep(step);

      // Update visual feedback
      this.updateStepCounter();

      console.log("AutoFlow: Click recorded:", {
        element: element.tagName,
        text: element.textContent?.slice(0, 50),
        step: this.stepCounter,
      });
    } catch (error) {
      console.error("AutoFlow: Error recording click event:", error);
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
    const recordableTypes = [
      "text",
      "email",
      "password",
      "search",
      "tel",
      "url",
    ];
    if (element.type && !recordableTypes.includes(element.type)) return;

    try {
      // Highlight the input element
      this.highlightElement(element);

      const step = await this.createTraceStep(element, "input", event);
      await this.saveTraceStep(step);

      // Update visual feedback
      this.updateStepCounter();

      console.log("AutoFlow: Input recorded:", {
        element: element.tagName,
        type: element.type,
        placeholder: element.placeholder,
        step: this.stepCounter,
      });
    } catch (error) {
      console.error("AutoFlow: Error recording input event:", error);
    }
  }

  /**
   * Handle scroll events on the page
   * @private
   */
  private async handleScrollEvent(): Promise<void> {
    if (!this.isRecording) return;

    try {
      // Calculate scroll percentage for better context
      const scrollPercentX =
        Math.round(
          (window.scrollX / (document.body.scrollWidth - window.innerWidth)) *
            100
        ) || 0;
      const scrollPercentY =
        Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
            100
        ) || 0;

      const scrollStep: TraceStep = {
        id: this.generateStepId(),
        tabId: await this.getCurrentTabId(),
        url: window.location.href,
        action: "scroll",
        selectors: [],
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
          pageHeight: document.body.scrollHeight,
          pageWidth: document.body.scrollWidth,
          percentX: scrollPercentX,
          percentY: scrollPercentY,
        },
        timestamp: Date.now(),
        metadata: {
          description: `Scrolled to ${scrollPercentY}% of page (${window.scrollX}, ${window.scrollY})`,
          tags: ["scroll"],
          scrollDirection: this.getScrollDirection(),
        },
      };

      await this.saveTraceStep(scrollStep);

      // Update visual feedback
      this.updateStepCounter();

      console.log("AutoFlow: Scroll recorded:", {
        position: `(${window.scrollX}, ${window.scrollY})`,
        percentage: `${scrollPercentY}%`,
        step: this.stepCounter,
      });
    } catch (error) {
      console.error("AutoFlow: Error recording scroll event:", error);
    }
  }

  /**
   * Determine scroll direction for better context
   * @private
   */
  private getScrollDirection(): string {
    // This is a simple implementation - could be enhanced with velocity tracking
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    if (scrollTop > 0 && scrollLeft === 0) return "down";
    if (scrollTop === 0 && scrollLeft === 0) return "top";
    if (scrollLeft > 0 && scrollTop === 0) return "right";
    if (scrollLeft === 0 && scrollTop === 0) return "top-left";
    return "diagonal";
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
      const step = await this.createTraceStep(form, "click", event);
      step.metadata = {
        ...step.metadata,
        description: "Form submission",
        tags: ["form", "submit"],
        critical: true,
      };

      await this.saveTraceStep(step);
    } catch (error) {
      console.error("AutoFlow: Error recording form submission:", error);
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
        action: "navigate",
        selectors: [],
        timestamp: Date.now(),
        metadata: {
          description: `Navigating away from ${window.location.href}`,
          tags: ["navigation"],
        },
      };

      await this.saveTraceStep(step);
    } catch (error) {
      console.error("AutoFlow: Error recording navigation event:", error);
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
    const interactiveElements = ["input", "textarea", "select", "button"];
    if (!interactiveElements.includes(element.tagName.toLowerCase())) return;

    // This helps with form field detection and can be used for better selectors
    console.log("AutoFlow: Focus detected on:", element);
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
        action: "navigate",
        selectors: [],
        domHash: await this.generateDOMHash(),
        timestamp: Date.now(),
        metadata: {
          description: `Page loaded: ${document.title}`,
          tags: ["page_load", "navigation"],
          critical: true,
        },
      };

      // Capture screenshot of initial page state
      const screenshot = await this.screenshotCapture.captureVisible();
      if (screenshot) {
        step.thumbnailRef = await this.saveScreenshot(screenshot);
      }

      await this.saveTraceStep(step);
    } catch (error) {
      console.error("AutoFlow: Error recording page load:", error);
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
        pageWidth: document.body.scrollWidth,
      },
      domHash: await this.generateDOMHash(),
      timestamp: Date.now(),
      metadata: {
        description: this.generateStepDescription(element, action),
        tags: this.generateStepTags(element, action),
      },
    };

    // Add input data for input events
    if (
      action === "input" &&
      (element as HTMLInputElement).value !== undefined
    ) {
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
      source: "static",
      sensitive: element.type === "password",
    };

    // Mask sensitive data
    if (inputData.sensitive) {
      inputData.value = "[MASKED]";
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
      text: "text",
      email: "email",
      password: "password",
      number: "number",
      tel: "text",
      url: "text",
      search: "text",
      date: "date",
      file: "file",
    };

    return typeMap[htmlType] || "text";
  }

  /**
   * Generate a descriptive text for the step
   * @param element - Target element
   * @param action - Action type
   * @returns Human-readable description
   * @private
   */
  private generateStepDescription(
    element: Element,
    action: ActionType
  ): string {
    const elementText = element.textContent?.trim().slice(0, 50) || "";
    const tagName = element.tagName.toLowerCase();

    switch (action) {
      case "click":
        return `Clicked ${tagName}${elementText ? ': "' + elementText + '"' : ""}`;
      case "input":
        const placeholder = (element as HTMLInputElement).placeholder;
        return `Entered text in ${tagName}${placeholder ? " (" + placeholder + ")" : ""}`;
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
    const tags: string[] = [action];

    // Add element-specific tags
    if (element.tagName) {
      tags.push(element.tagName.toLowerCase());
    }

    if (element.classList.length > 0) {
      tags.push("has-class");
    }

    if (element.id) {
      tags.push("has-id");
    }

    // Add form-related tags
    if (element.closest("form")) {
      tags.push("form-element");
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
        type: "SAVE_TRACE_STEP",
        sessionId: this.recordingSessionId,
        step,
      });

      // Don't increment local counter - background script is the source of truth
      console.log("AutoFlow: Step recorded:", step);
    } catch (error) {
      console.error("AutoFlow: Error saving trace step:", error);
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
      [`screenshot_${screenshotId}`]: screenshot,
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
      chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB" }, (response) => {
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
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(16);
  }

  /**
   * Show visual recording indicator with step counter
   * @private
   */
  private async showRecordingIndicator(): Promise<void> {
    // Remove existing indicator if present
    this.hideRecordingIndicator();

    // Get the real step count from background script
    let realStepCount = 0;
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_RECORDING_STATE",
      });
      realStepCount = response?.stepCount || 0;
      this.stepCounter = realStepCount; // Sync local counter
    } catch (error) {
      console.warn(
        "AutoFlow: Could not get step count from background, using local count"
      );
      realStepCount = this.stepCounter;
    }

    const indicator = document.createElement("div");
    indicator.className = "autoflow-recording-indicator";
    indicator.innerHTML = `
      <div id="autoflow-indicator" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 12px 16px;
        border-radius: 24px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        font-weight: 600;
        z-index: 999999;
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        gap: 10px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        "></div>
        <span id="autoflow-status">Recording</span>
        <div style="
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        ">
          <span id="autoflow-step-count">${realStepCount}</span> steps
        </div>
      </div>
    `;

    // Add enhanced animation styles
    const style = document.createElement("style");
    style.id = "autoflow-indicator-styles";
    style.textContent = `
      @keyframes pulse {
        0%, 100% { 
          opacity: 1; 
          transform: scale(1);
        }
        50% { 
          opacity: 0.7; 
          transform: scale(1.1);
        }
      }
      
      @keyframes stepHighlight {
        0% { 
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
        }
        50% { 
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.6);
        }
        100% { 
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
        }
      }
      
      .autoflow-element-highlight {
        outline: 2px solid #22c55e !important;
        outline-offset: 1px !important;
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3) !important;
        animation: stepHighlight 0.4s ease-out !important;
        transition: box-shadow 0.2s ease !important;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(indicator);
  }

  /**
   * Update the step counter in the recording indicator with real count from background
   * @private
   */
  private async updateStepCounter(): Promise<void> {
    try {
      // Get the real step count from background script
      const response = await chrome.runtime.sendMessage({
        type: "GET_RECORDING_STATE",
      });
      const realStepCount = response?.stepCount || 0;

      const stepCountElement = document.getElementById("autoflow-step-count");
      if (stepCountElement) {
        stepCountElement.textContent = realStepCount.toString();

        // Add a brief highlight animation to show activity
        const indicator = document.getElementById("autoflow-indicator");
        if (indicator) {
          indicator.style.transform = "scale(1.05)";
          setTimeout(() => {
            indicator.style.transform = "scale(1)";
          }, 200);
        }
      }

      // Update local counter to match (for any other uses)
      this.stepCounter = realStepCount;
    } catch (error) {
      console.error("AutoFlow: Error updating step counter:", error);
      // Fallback to local counter if background communication fails
      const stepCountElement = document.getElementById("autoflow-step-count");
      if (stepCountElement) {
        stepCountElement.textContent = this.stepCounter.toString();
      }
    }
  }

  /**
   * Highlight an element briefly to show it was recorded
   * @param element - Element to highlight
   * @private
   */
  private highlightElement(element: Element): void {
    // Add highlight class
    element.classList.add("autoflow-element-highlight");

    // Remove highlight after animation (shorter duration)
    setTimeout(() => {
      element.classList.remove("autoflow-element-highlight");
    }, 400);
  }

  /**
   * Hide visual recording indicator
   * @private
   */
  private hideRecordingIndicator(): void {
    const indicator = document.querySelector(".autoflow-recording-indicator");
    if (indicator) {
      indicator.remove();
    }

    // Also remove the styles
    const styles = document.getElementById("autoflow-indicator-styles");
    if (styles) {
      styles.remove();
    }
  }

  /**
   * Start periodic step counter synchronization with background script
   * @private
   */
  private startStepCounterSync(): void {
    // Clear any existing interval
    this.stopStepCounterSync();

    // Sync every 2 seconds to keep the counter accurate
    this.stepCounterSyncInterval = setInterval(async () => {
      if (this.isRecording) {
        await this.updateStepCounter();
      }
    }, 2000);
  }

  /**
   * Stop periodic step counter synchronization
   * @private
   */
  private stopStepCounterSync(): void {
    if (this.stepCounterSyncInterval) {
      clearInterval(this.stepCounterSyncInterval);
      this.stepCounterSyncInterval = null;
    }
  }
}

// Initialize the content script when the page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new AutoFlowContentScript();
  });
} else {
  new AutoFlowContentScript();
}

export default AutoFlowContentScript;
