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
 * Default event recorder configuration
 */
const DEFAULT_CONFIG: EventRecorderConfig = {
  recordMouse: true,
  recordKeyboard: true,
  recordForms: true,
  recordNavigation: true,
  throttleTime: 100,
  ignoreSelectors: [
    '.autoflow-recording-indicator',
    '.autoflow-element-highlight',
    '[data-autoflow-ignore]'
  ]
};

/**
 * Event recorder class that handles intelligent event capture
 * Follows Observer pattern for event notification
 */
export class EventRecorder {
  private config: EventRecorderConfig;
  private listeners: EventListener[] = [];
  private lastEventTime: Map<string, number> = new Map();
  private isActive: boolean = false;

  /**
   * Initialize event recorder with configuration
   * @param config - Event recorder configuration (optional)
   */
  constructor(config: Partial<EventRecorderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add event listener for recorded events
   * @param listener - Event listener to add
   */
  addListener(listener: EventListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   * @param listener - Event listener to remove
   */
  removeListener(listener: EventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Start recording events
   */
  startRecording(): void {
    this.isActive = true;
    this.lastEventTime.clear();
  }

  /**
   * Stop recording events
   */
  stopRecording(): void {
    this.isActive = false;
    this.lastEventTime.clear();
  }

  /**
   * Check if an event should be recorded
   * @param event - DOM event to check
   * @returns Whether the event should be recorded
   */
  shouldRecordEvent(event: Event): boolean {
    if (!this.isActive) {
      return false;
    }

    const target = event.target as Element;
    if (!target) {
      return false;
    }

    // Check ignore selectors
    for (const selector of this.config.ignoreSelectors) {
      try {
        if (target.matches(selector) || target.closest(selector)) {
          return false;
        }
      } catch (error) {
        // Invalid selector, skip
        continue;
      }
    }

    // Check configuration flags
    if (!this.isEventTypeEnabled(event.type)) {
      return false;
    }

    // Check throttling
    if (this.isEventThrottled(event)) {
      return false;
    }

    // Additional filters for specific event types
    return this.applyEventSpecificFilters(event);
  }

  /**
   * Process and notify listeners about a recorded event
   * @param event - DOM event to process
   */
  processEvent(event: Event): void {
    if (!this.shouldRecordEvent(event)) {
      return;
    }

    const recordedEvent: RecordedEvent = {
      type: event.type,
      target: event.target as Element,
      timestamp: Date.now(),
      data: this.extractEventData(event),
      shouldRecord: true
    };

    // Update last event time for throttling
    const eventKey = this.getEventKey(event);
    this.lastEventTime.set(eventKey, recordedEvent.timestamp);

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener.onEvent(recordedEvent);
      } catch (error) {
        console.error('EventRecorder: Error in event listener:', error);
      }
    });
  }

  /**
   * Check if event type is enabled in configuration
   * @param eventType - Type of event to check
   * @returns Whether event type should be recorded
   * @private
   */
  private isEventTypeEnabled(eventType: string): boolean {
    const mouseEvents = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove'];
    const keyboardEvents = ['keydown', 'keyup', 'keypress'];
    const formEvents = ['input', 'change', 'submit', 'focus', 'blur'];
    const navigationEvents = ['beforeunload', 'unload', 'popstate', 'hashchange'];

    if (mouseEvents.includes(eventType)) {
      return this.config.recordMouse;
    }

    if (keyboardEvents.includes(eventType)) {
      return this.config.recordKeyboard;
    }

    if (formEvents.includes(eventType)) {
      return this.config.recordForms;
    }

    if (navigationEvents.includes(eventType)) {
      return this.config.recordNavigation;
    }

    // Allow other events by default
    return true;
  }

  /**
   * Check if event should be throttled
   * @param event - Event to check
   * @returns Whether event is throttled
   * @private
   */
  private isEventThrottled(event: Event): boolean {
    const eventKey = this.getEventKey(event);
    const lastTime = this.lastEventTime.get(eventKey);
    
    if (!lastTime) {
      return false; // First event of this type
    }

    const timeSinceLastEvent = Date.now() - lastTime;
    return timeSinceLastEvent < this.config.throttleTime;
  }

  /**
   * Generate unique key for event throttling
   * @param event - Event to generate key for
   * @returns Unique event key
   * @private
   */
  private getEventKey(event: Event): string {
    const target = event.target as Element;
    const tagName = target.tagName || 'unknown';
    const id = target.id || '';
    const className = target.className || '';
    
    return `${event.type}_${tagName}_${id}_${className}`;
  }

  /**
   * Apply event-specific filtering logic
   * @param event - Event to filter
   * @returns Whether event should be recorded
   * @private
   */
  private applyEventSpecificFilters(event: Event): boolean {
    switch (event.type) {
      case 'mousemove':
        return this.shouldRecordMouseMove(event as MouseEvent);
      
      case 'click':
        return this.shouldRecordClick(event as MouseEvent);
      
      case 'keydown':
      case 'keyup':
        return this.shouldRecordKeyboard(event as KeyboardEvent);
      
      case 'input':
        return this.shouldRecordInput(event);
      
      case 'scroll':
        return this.shouldRecordScroll(event);
      
      default:
        return true;
    }
  }

  /**
   * Check if mouse move should be recorded
   * @param event - Mouse move event
   * @returns Whether to record
   * @private
   */
  private shouldRecordMouseMove(event: MouseEvent): boolean {
    // Only record mouse moves during drag operations or over interactive elements
    const target = event.target as Element;
    
    if (event.buttons > 0) {
      return true; // Mouse button is pressed (dragging)
    }

    // Check if over interactive element
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    return interactiveTags.includes(target.tagName.toLowerCase());
  }

  /**
   * Check if click should be recorded
   * @param event - Click event
   * @returns Whether to record
   * @private
   */
  private shouldRecordClick(event: MouseEvent): boolean {
    const target = event.target as Element;
    
    // Skip right clicks and middle clicks for now
    if (event.button !== 0) {
      return false;
    }

    // Skip clicks on non-interactive elements unless they have event handlers
    const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'label'];
    const hasClickHandler = this.elementHasClickHandler(target);
    
    return interactiveTags.includes(target.tagName.toLowerCase()) || 
           hasClickHandler ||
           target.getAttribute('role') === 'button';
  }

  /**
   * Check if keyboard event should be recorded
   * @param event - Keyboard event
   * @returns Whether to record
   * @private
   */
  private shouldRecordKeyboard(event: KeyboardEvent): boolean {
    const target = event.target as Element;
    
    // Only record keyboard events on input elements
    const inputTags = ['input', 'textarea'];
    const isContentEditable = target.hasAttribute('contenteditable');
    
    if (!inputTags.includes(target.tagName.toLowerCase()) && !isContentEditable) {
      // Record navigation keys even outside input fields
      const navigationKeys = ['Enter', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      return navigationKeys.includes(event.key);
    }

    return true;
  }

  /**
   * Check if input event should be recorded
   * @param event - Input event
   * @returns Whether to record
   * @private
   */
  private shouldRecordInput(event: Event): boolean {
    const target = event.target as HTMLInputElement;
    
    // Skip password fields for security (will be handled specially)
    if (target.type === 'password') {
      return true; // Record but will be masked later
    }

    // Skip very frequent input events on range sliders
    if (target.type === 'range') {
      return false;
    }

    return true;
  }

  /**
   * Check if scroll event should be recorded
   * @param event - Scroll event
   * @returns Whether to record
   * @private
   */
  private shouldRecordScroll(event: Event): boolean {
    // Always record scroll events, but they're throttled by configuration
    return true;
  }

  /**
   * Check if element has click event handlers
   * @param element - Element to check
   * @returns Whether element has click handlers
   * @private
   */
  private elementHasClickHandler(element: Element): boolean {
    // This is a heuristic - we can't directly detect event listeners
    // Look for common indicators
    
    // Check for cursor pointer style
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.cursor === 'pointer') {
      return true;
    }

    // Check for common click-related attributes
    const clickAttributes = ['onclick', 'data-action', 'data-click', 'data-toggle'];
    for (const attr of clickAttributes) {
      if (element.hasAttribute(attr)) {
        return true;
      }
    }

    // Check for common clickable classes
    const clickableClasses = ['btn', 'button', 'clickable', 'link', 'action'];
    const elementClasses = element.className.toLowerCase();
    for (const cls of clickableClasses) {
      if (elementClasses.includes(cls)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract relevant data from an event
   * @param event - Event to extract data from
   * @returns Event data object
   * @private
   */
  private extractEventData(event: Event): any {
    const baseData = {
      type: event.type,
      timestamp: event.timeStamp,
      bubbles: event.bubbles,
      cancelable: event.cancelable
    };

    // Add event-specific data
    switch (event.type) {
      case 'click':
      case 'mousedown':
      case 'mouseup':
        const mouseEvent = event as MouseEvent;
        return {
          ...baseData,
          clientX: mouseEvent.clientX,
          clientY: mouseEvent.clientY,
          button: mouseEvent.button,
          buttons: mouseEvent.buttons,
          ctrlKey: mouseEvent.ctrlKey,
          shiftKey: mouseEvent.shiftKey,
          altKey: mouseEvent.altKey,
          metaKey: mouseEvent.metaKey
        };

      case 'keydown':
      case 'keyup':
      case 'keypress':
        const keyEvent = event as KeyboardEvent;
        return {
          ...baseData,
          key: keyEvent.key,
          code: keyEvent.code,
          keyCode: keyEvent.keyCode,
          ctrlKey: keyEvent.ctrlKey,
          shiftKey: keyEvent.shiftKey,
          altKey: keyEvent.altKey,
          metaKey: keyEvent.metaKey
        };

      case 'input':
      case 'change':
        const inputTarget = event.target as HTMLInputElement;
        return {
          ...baseData,
          value: inputTarget.value,
          type: inputTarget.type,
          name: inputTarget.name,
          id: inputTarget.id
        };

      case 'focus':
      case 'blur':
        const focusTarget = event.target as HTMLElement;
        return {
          ...baseData,
          tagName: focusTarget.tagName,
          type: (focusTarget as HTMLInputElement).type,
          name: (focusTarget as HTMLInputElement).name,
          id: focusTarget.id
        };

      case 'submit':
        const formTarget = event.target as HTMLFormElement;
        return {
          ...baseData,
          action: formTarget.action,
          method: formTarget.method,
          id: formTarget.id,
          name: formTarget.name
        };

      case 'scroll':
        return {
          ...baseData,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          scrollWidth: document.body.scrollWidth,
          scrollHeight: document.body.scrollHeight
        };

      default:
        return baseData;
    }
  }
}
