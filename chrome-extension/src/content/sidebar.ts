/**
 * @fileoverview AutoFlow Studio Draggable Sidebar
 * @author Ayush Shukla
 * @description SalesQL-style draggable, expandable sidebar for recording controls
 * Implements drag-and-drop positioning with memory persistence
 */

interface SidebarPosition {
  x: number;
  y: number;
  side: "right" | "left" | "top" | "bottom";
}

interface SidebarState {
  isExpanded: boolean;
  isRecording: boolean;
  position: SidebarPosition;
  sessionId: string | null;
  stepCount: number;
  duration: number;
}

/**
 * AutoFlow Studio Sidebar Manager
 * Handles sidebar creation, positioning, and user interactions
 */
class AutoFlowSidebar {
  private sidebar: HTMLElement | null = null;
  private dragHandle: HTMLElement | null = null;
  private contentArea: HTMLElement | null = null;
  private isDragging: boolean = false;
  private dragOffset = { x: 0, y: 0 };
  private state: SidebarState = {
    isExpanded: false,
    isRecording: false,
    position: { x: window.innerWidth - 60, y: 120, side: "right" },
    sessionId: null,
    stepCount: 0,
    duration: 0,
  };
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Build after state is loaded to honor previous position/expanded state
    this.loadState().finally(() => {
      this.createSidebar();
      this.attachEventListeners();
      this.setupMessageListener();

      // Mark sidebar as active (for potential future restoration features)
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ autoflow_sidebar_active: true });
      }
    });
  }

  /**
   * Load sidebar state from storage
   */
  private async loadState(): Promise<void> {
    try {
      // Check if extension context is still valid
      if (!chrome.runtime?.id) {
        console.warn(
          "AutoFlow Sidebar: Extension context invalidated, skipping state load"
        );
        return;
      }

      const result = await chrome.storage.local.get([
        "autoflow_sidebar_state",
        "autoflow_recording_state",
      ]);

      // Load sidebar state
      if (result.autoflow_sidebar_state) {
        this.state = { ...this.state, ...result.autoflow_sidebar_state };
      }

      // Load recording state from background
      const recordingState = await this.sendMessage({
        type: "GET_RECORDING_STATE",
      });
      if (recordingState && !recordingState.error) {
        this.state.isRecording = Boolean(recordingState.isRecording);
        this.state.sessionId = recordingState.sessionId || null;
        this.state.stepCount = recordingState.stepCount || 0;
        this.state.duration = recordingState.duration || 0;

        console.log("AutoFlow Sidebar: Loaded recording state:", {
          isRecording: this.state.isRecording,
          sessionId: this.state.sessionId,
          stepCount: this.state.stepCount,
          duration: this.state.duration,
        });

        // If recording is active, start status updates
        if (this.state.isRecording) {
          this.startStatusUpdates();
        }
      } else {
        // Ensure clean state if no valid recording state
        this.state.isRecording = false;
        this.state.sessionId = null;
        this.state.stepCount = 0;
        this.state.duration = 0;
        console.log(
          "AutoFlow Sidebar: No valid recording state, using defaults"
        );
      }
    } catch (error) {
      console.error("Error loading sidebar state:", error);
    }
  }

  /**
   * Save sidebar state to storage
   */
  private async saveState(): Promise<void> {
    try {
      // Check if extension context is still valid
      if (!chrome.runtime?.id) {
        console.warn(
          "AutoFlow Sidebar: Extension context invalidated, skipping state save"
        );
        return;
      }

      await chrome.storage.local.set({ autoflow_sidebar_state: this.state });
    } catch (error) {
      console.error("Error saving sidebar state:", error);
    }
  }

  /**
   * Create the sidebar HTML structure
   */
  private createSidebar(): void {
    // Remove existing sidebar if any
    const existing = document.getElementById("autoflow-sidebar");
    if (existing) existing.remove();

    // Create main sidebar container
    this.sidebar = document.createElement("div");
    this.sidebar.id = "autoflow-sidebar";
    this.sidebar.className = "autoflow-sidebar";

    // Create compact vertical tab (always visible)
    this.dragHandle = document.createElement("div");
    this.dragHandle.className = "autoflow-tab";
    this.dragHandle.innerHTML = `
      <div class="autoflow-tab-content">
        <div class="autoflow-tab-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <div class="autoflow-tab-text">AutoFlow</div>
        <button class="autoflow-close-btn" title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;

    // Create expandable content area
    this.contentArea = document.createElement("div");
    this.contentArea.className = `autoflow-content ${this.state.isExpanded ? "expanded" : ""}`;
    this.contentArea.innerHTML = this.getContentHTML();

    // Assemble sidebar with flexbox layout
    this.sidebar.style.display = "flex";
    this.sidebar.style.flexDirection = "row";
    this.sidebar.appendChild(this.dragHandle);
    this.sidebar.appendChild(this.contentArea);

    // Apply initial position (sticky from right)
    this.applySidebarPosition();

    // Add to DOM
    document.body.appendChild(this.sidebar);

    // Add CSS styles
    this.injectStyles();
  }

  /**
   * Generate content HTML based on current state
   */
  private getContentHTML(): string {
    const currentTab = {
      title: document.title,
      url: window.location.href,
    };

    return `
      <div class="autoflow-panel">
        <!-- Header -->
        <div class="autoflow-panel-header">
          <div class="autoflow-panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span>AutoFlow Studio</span>
          </div>
          <div class="autoflow-panel-subtitle">AI-Enhanced Browser Automation</div>
        </div>

        <!-- Main Action -->
        <div class="autoflow-main-action">
          ${
            this.state.isRecording
              ? `
            <!-- Recording Active -->
            <div class="autoflow-recording-status">
              <div class="autoflow-recording-indicator">
                <div class="autoflow-pulse"></div>
                <span>Recording in progress</span>
              </div>
              <div class="autoflow-recording-stats">
                <div class="autoflow-stat">
                  <span class="autoflow-stat-value">${this.state.stepCount}</span>
                  <span class="autoflow-stat-label">steps</span>
                </div>
                <div class="autoflow-stat">
                  <span class="autoflow-stat-value">${this.formatDuration(this.state.duration)}</span>
                  <span class="autoflow-stat-label">duration</span>
                </div>
              </div>
            </div>
            
            <button class="autoflow-action-btn autoflow-stop-btn" data-action="stop-recording">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="6" width="12" height="12"/>
              </svg>
              Stop Recording
            </button>
          `
              : `
            <!-- Recording Idle -->
            <div class="autoflow-welcome">
              <div class="autoflow-welcome-text">Ready to automate your workflow?</div>
              <div class="autoflow-welcome-subtitle">Click below to start recording your browser interactions</div>
            </div>
            
            <button class="autoflow-action-btn autoflow-start-btn" data-action="start-recording">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10,8 16,12 10,16"/>
              </svg>
              Start Recording
            </button>
          `
          }
        </div>

        <!-- Session Info (if exists) -->
        ${
          this.state.sessionId
            ? `
          <div class="autoflow-session-info">
            <div class="autoflow-session-label">Session: ${this.state.sessionId.slice(0, 8)}...</div>
            <button class="autoflow-export-btn" data-action="export-session">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  /**
   * Apply sidebar position and styling
   */
  private applySidebarPosition(): void {
    if (!this.sidebar) return;

    const { y } = this.state.position;
    // Sticky from right edge like SignalHire
    this.sidebar.style.right = `0px`;
    this.sidebar.style.left = `auto`;
    this.sidebar.style.top = `${Math.max(20, Math.min(window.innerHeight - 120, y))}px`;
    this.sidebar.style.transform = this.state.isExpanded
      ? "translateX(0)"
      : "translateX(calc(100% - 60px))";
  }

  /**
   * Attach event listeners for drag functionality
   */
  private attachEventListeners(): void {
    if (!this.dragHandle) return;

    // Drag functionality
    this.dragHandle.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));

    // Click entire tab to expand/collapse (like SignalHire)
    this.dragHandle.addEventListener("click", (e) => {
      // Don't expand if clicking close button
      if ((e.target as Element).closest(".autoflow-close-btn")) {
        return;
      }
      e.stopPropagation();
      this.toggleExpanded();
    });

    // Prevent dragging when clicking to expand
    this.dragHandle.addEventListener("mousedown", (e) => {
      // Only allow dragging if not clicking to expand
      if (!this.state.isExpanded) {
        e.stopPropagation();
      }
    });

    // Window resize handler
    window.addEventListener("resize", this.handleWindowResize.bind(this));

    // Close button
    const closeBtn = this.dragHandle.querySelector(".autoflow-close-btn");
    closeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.destroy();
    });

    // Action buttons in content area
    this.setupActionButtons();

    // Click outside to collapse
    this.setupClickOutsideHandler();
  }

  /**
   * Setup action button event listeners
   */
  private setupActionButtons(): void {
    if (!this.contentArea) return;

    // Use event delegation for dynamically created buttons
    this.contentArea.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest("[data-action]") as HTMLElement;

      if (!button) return;

      e.preventDefault();
      e.stopPropagation();

      const action = button.getAttribute("data-action");

      switch (action) {
        case "start-recording":
          this.startRecording();
          break;
        case "stop-recording":
          this.stopRecording();
          break;
        case "export-session":
          this.exportSession();
          break;
      }
    });
  }

  /**
   * Setup click outside handler to auto-collapse
   */
  private setupClickOutsideHandler(): void {
    document.addEventListener(
      "click",
      (e) => {
        // Only handle if sidebar is expanded
        if (!this.state.isExpanded || !this.sidebar) return;

        const target = e.target as Element;

        // Don't collapse if clicking inside the sidebar
        if (this.sidebar.contains(target)) return;

        // Collapse the sidebar
        console.log("AutoFlow Sidebar: Clicked outside, collapsing...");
        this.state.isExpanded = false;

        if (this.contentArea) {
          this.contentArea.className = `autoflow-content ${this.state.isExpanded ? "expanded" : ""}`;
        }

        this.applySidebarPosition();
        this.saveState();
      },
      true
    ); // Use capture phase to ensure we catch all clicks
  }

  /**
   * Handle mouse down for dragging
   */
  private handleMouseDown(e: MouseEvent): void {
    if (!this.sidebar) return;

    this.isDragging = true;
    const rect = this.sidebar.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    document.body.style.userSelect = "none";
    this.sidebar.style.zIndex = "2147483647";
  }

  /**
   * Handle mouse move for dragging
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging || !this.sidebar) return;

    // Lock to right edge, allow vertical drag only
    const y = e.clientY - this.dragOffset.y;
    this.state.position.y = Math.max(16, Math.min(window.innerHeight - 80, y));
    this.applySidebarPosition();
  }

  /**
   * Handle mouse up for dragging
   */
  private handleMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      document.body.style.userSelect = "";
      this.saveState();
    }
  }

  /**
   * Handle window resize
   */
  private handleWindowResize(): void {
    // Ensure sidebar stays within bounds
    this.applySidebarPosition();
  }

  /**
   * Toggle expanded state
   */
  private toggleExpanded(): void {
    this.state.isExpanded = !this.state.isExpanded;

    if (this.contentArea) {
      this.contentArea.className = `autoflow-content ${this.state.isExpanded ? "expanded" : ""}`;
    }

    // Update position with transform animation
    this.applySidebarPosition();

    this.saveState();
  }

  /**
   * Snap sidebar to corner positions
   */
  public snapToCorner(
    corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  ): void {
    const margin = 20;

    switch (corner) {
      case "top-left":
        this.state.position = { x: margin, y: margin, side: "left" };
        break;
      case "top-right":
        this.state.position = {
          x: window.innerWidth - 60 - margin,
          y: margin,
          side: "right",
        };
        break;
      case "bottom-left":
        this.state.position = {
          x: margin,
          y: window.innerHeight - 60 - margin,
          side: "left",
        };
        break;
      case "bottom-right":
        this.state.position = {
          x: window.innerWidth - 60 - margin,
          y: window.innerHeight - 60 - margin,
          side: "right",
        };
        break;
    }

    this.applySidebarPosition();
    this.saveState();
  }

  /**
   * Start recording workflow
   */
  public async startRecording(): Promise<void> {
    try {
      const response = await this.sendMessage({
        type: "START_RECORDING",
        data: {
          url: window.location.href,
          title: document.title,
        },
      });

      if (!response.error) {
        this.state.isRecording = true;
        this.state.sessionId = response.sessionId;
        this.updateContent();
        this.startStatusUpdates();
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }

  /**
   * Stop recording workflow
   */
  public async stopRecording(): Promise<void> {
    try {
      const response = await this.sendMessage({ type: "STOP_RECORDING" });

      if (!response.error) {
        this.state.isRecording = false;
        this.state.sessionId = null;
        this.state.stepCount = 0;
        this.state.duration = 0;
        this.updateContent();
        this.stopStatusUpdates();

        // Also notify content script to hide recording indicator
        this.sendMessage({ type: "HIDE_RECORDING_INDICATOR" });
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  }

  /**
   * Export current session
   */
  public async exportSession(): Promise<void> {
    try {
      const response = await this.sendMessage({ type: "EXPORT_SESSION" });

      if (!response.error) {
        // Download JSON file
        const blob = new Blob([JSON.stringify(response, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `autoflow_session_${response.sessionId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export session:", error);
    }
  }

  /**
   * Send message to background script
   */
  private async sendMessage(message: any): Promise<any> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || { error: "No response" });
      });
    });
  }

  /**
   * Set up message listener for background script updates
   */
  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "RECORDING_UPDATE") {
        this.state.stepCount = message.data.stepCount || 0;
        this.state.duration = message.data.duration || 0;
        this.updateContent();
      }
      sendResponse({ success: true });
    });
  }

  /**
   * Start periodic status updates
   */
  private startStatusUpdates(): void {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(async () => {
      const response = await this.sendMessage({ type: "GET_RECORDING_STATE" });
      if (response && !response.error) {
        this.state.stepCount = response.stepCount || 0;
        this.state.duration = response.duration || 0;
        this.updateContent();
      }
    }, 1000);
  }

  /**
   * Stop periodic status updates
   */
  private stopStatusUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update content area HTML
   */
  private updateContent(): void {
    if (this.contentArea) {
      this.contentArea.innerHTML = this.getContentHTML();
      // Re-setup action buttons after content update
      this.setupActionButtons();
    }
  }

  /**
   * Utility: Truncate text
   */
  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  /**
   * Utility: Format duration
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  /**
   * Inject CSS styles into the page
   */
  private injectStyles(): void {
    const existingStyles = document.getElementById("autoflow-sidebar-styles");
    if (existingStyles) return;

    const styles = document.createElement("style");
    styles.id = "autoflow-sidebar-styles";
    styles.textContent = `
      .autoflow-sidebar {
        position: fixed;
        z-index: 2147483646;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #374151;
        background: #ffffff;
        border-radius: 12px 0 0 12px;
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
        width: 300px;
        max-height: calc(100vh - 40px);
        overflow: hidden;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid #e5e7eb;
        border-right: none;
      }

      .autoflow-tab {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 0 0 0;
        cursor: pointer;
        user-select: none;
        position: relative;
        height: 100%;
        min-height: 120px;
        width: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 16px 8px 8px 8px;
        transition: all 0.2s ease;
      }

      .autoflow-tab:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        transform: translateX(-2px);
      }

      .autoflow-tab-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        height: 100%;
        position: relative;
      }

      .autoflow-tab-icon {
        flex-shrink: 0;
        margin-bottom: 4px;
      }

      .autoflow-tab-text {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.5px;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .autoflow-handle-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .autoflow-handle-text {
        font-weight: 600;
        flex-grow: 1;
        font-size: 15px;
      }

      .autoflow-expand-btn {
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        opacity: 0.8;
      }

      .autoflow-close-btn {
        margin-left: 6px;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        opacity: 0.9;
        background: rgba(255,255,255,0.15);
      }
      .autoflow-close-btn:hover { background: rgba(255,255,255,0.25); }

      .autoflow-expand-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        opacity: 1;
      }

      .autoflow-expand-btn.expanded svg {
        transform: rotate(-90deg);
      }

      .autoflow-content {
        flex: 1;
        background: #ffffff;
        border-radius: 0 0 12px 0;
        overflow: hidden;
        width: 240px;
        display: none;
      }

      .autoflow-content.expanded {
        display: block;
      }

      .autoflow-panel {
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .autoflow-panel-header {
        border-bottom: 1px solid #f3f4f6;
        padding-bottom: 12px;
      }

      .autoflow-panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
      }

      .autoflow-panel-subtitle {
        font-size: 13px;
        color: #6b7280;
        font-weight: 500;
      }

      .autoflow-main-action {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .autoflow-welcome {
        text-align: center;
        padding: 16px 0;
      }

      .autoflow-welcome-text {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
      }

      .autoflow-welcome-subtitle {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.5;
      }

      .autoflow-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px 20px;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        outline: none;
      }

      .autoflow-start-btn {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }

      .autoflow-start-btn:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
      }

      .autoflow-stop-btn {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }

      .autoflow-stop-btn:hover {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
      }

      .autoflow-recording-status {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 10px;
        padding: 16px;
        text-align: center;
      }

      .autoflow-recording-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 600;
        color: #059669;
      }

      .autoflow-pulse {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
        100% { opacity: 1; transform: scale(1); }
      }

      .autoflow-recording-stats {
        display: flex;
        justify-content: space-around;
        gap: 16px;
      }

      .autoflow-stat {
        text-align: center;
      }

      .autoflow-stat-value {
        display: block;
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
      }

      .autoflow-stat-label {
        font-size: 12px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .autoflow-session-info {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
      }

      .autoflow-session-label {
        font-size: 13px;
        color: #64748b;
        font-weight: 500;
      }

      .autoflow-export-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .autoflow-export-btn:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }

      .autoflow-content-inner {
        padding: 16px;
      }

      .autoflow-header {
        margin-bottom: 16px;
      }

      .autoflow-logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .autoflow-title {
        font-weight: 700;
        font-size: 16px;
        color: #111827;
      }

      .autoflow-subtitle {
        font-size: 12px;
        color: #6b7280;
      }

      .autoflow-section-title {
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .autoflow-tab-info, .autoflow-recording-status {
        background: #f9fafb;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .autoflow-tab-details {
        margin-top: 4px;
      }

      .autoflow-tab-title {
        font-weight: 500;
        color: #374151;
        font-size: 13px;
      }

      .autoflow-tab-url {
        color: #6b7280;
        font-size: 12px;
        margin-top: 2px;
      }

      .autoflow-status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #d1d5db;
      }

      .autoflow-status-indicator.recording {
        background: #ef4444;
        animation: pulse 2s infinite;
      }

      .autoflow-status-details {
        margin-top: 8px;
      }

      .autoflow-status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        margin-bottom: 4px;
      }

      .autoflow-status-item span:first-child {
        color: #6b7280;
      }

      .autoflow-status-item span:last-child {
        font-weight: 500;
        color: #374151;
      }

      .autoflow-controls {
        margin-bottom: 16px;
      }

      .autoflow-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 8px;
      }

      .autoflow-btn:last-child {
        margin-bottom: 0;
      }

      .autoflow-btn-primary {
        background: #ef4444;
        color: white;
      }

      .autoflow-btn-primary:hover {
        background: #dc2626;
      }

      .autoflow-btn-secondary {
        background: #6b7280;
        color: white;
      }

      .autoflow-btn-secondary:hover {
        background: #374151;
      }

      .autoflow-btn-tertiary {
        background: #3b82f6;
        color: white;
      }

      .autoflow-btn-tertiary:hover {
        background: #2563eb;
      }

      .autoflow-recording-controls {
        display: flex;
        gap: 8px;
      }

      .autoflow-recording-controls .autoflow-btn {
        margin-bottom: 0;
        padding: 8px 12px;
        font-size: 12px;
      }

      .autoflow-position-controls {
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
      }

      .autoflow-position-buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }

      .autoflow-position-btn {
        padding: 8px;
        border: 1px solid #d1d5db;
        background: #f9fafb;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        color: #6b7280;
      }

      .autoflow-position-btn:hover {
        background: #e5e7eb;
        color: #374151;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* Responsive adjustments */
      @media (max-width: 480px) {
        .autoflow-sidebar {
          max-width: 280px;
        }
        
        .autoflow-drag-handle {
          min-width: 200px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Destroy sidebar
   */
  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.sidebar) {
      this.sidebar.remove();
    }

    const styles = document.getElementById("autoflow-sidebar-styles");
    if (styles) {
      styles.remove();
    }

    // Mark sidebar as inactive
    if (chrome.runtime?.id) {
      chrome.storage.local.set({ autoflow_sidebar_active: false });
    }
  }
}

// Initialize sidebar when content script loads
let autoflowSidebar: AutoFlowSidebar | null = null;

// Make sidebar accessible globally for button clicks
(window as any).autoflowSidebar = {
  startRecording: () => autoflowSidebar?.startRecording(),
  stopRecording: () => autoflowSidebar?.stopRecording(),
  exportSession: () => autoflowSidebar?.exportSession(),
  snapToCorner: (corner: string) =>
    autoflowSidebar?.snapToCorner(corner as any),
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_SIDEBAR") {
    console.log(
      "AutoFlow Sidebar: Received TOGGLE_SIDEBAR, current state:",
      !!autoflowSidebar
    );

    // Toggle sidebar state

    if (autoflowSidebar) {
      console.log("AutoFlow Sidebar: Destroying existing sidebar");
      autoflowSidebar.destroy();
      autoflowSidebar = null;
    } else {
      console.log("AutoFlow Sidebar: Creating new sidebar");
      autoflowSidebar = new AutoFlowSidebar();
    }

    sendResponse({ success: true, sidebarActive: !!autoflowSidebar });
  } else if (message.type === "SIDEBAR_STATUS") {
    // Respond with sidebar status for background script to check if injected
    const status = {
      injected: true,
      sidebarActive: !!autoflowSidebar,
    };
    console.log("AutoFlow Sidebar: Status check:", status);
    sendResponse(status);
  }

  return true; // Indicates async response
});

// DISABLED: Auto-restoration is causing conflicts with manual toggle
// The sidebar will only be created via explicit TOGGLE_SIDEBAR messages
// This prevents the double-click issue and sidebar vanishing on tab switch

console.log(
  "AutoFlow Sidebar: Script loaded, waiting for explicit toggle commands..."
);
