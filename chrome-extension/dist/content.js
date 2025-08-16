/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils/event-recorder.ts":
/*!*************************************!*\
  !*** ./src/utils/event-recorder.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventRecorder: () => (/* binding */ EventRecorder)
/* harmony export */ });
/**
 * @fileoverview Event recording utility for capturing user interactions
 * @author Ayush Shukla
 * @description Handles recording and processing of user events with smart filtering.
 * Implements Observer pattern for event handling.
 */
/**
 * Default event recorder configuration
 */
const DEFAULT_CONFIG = {
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
class EventRecorder {
    /**
     * Initialize event recorder with configuration
     * @param config - Event recorder configuration (optional)
     */
    constructor(config = {}) {
        this.listeners = [];
        this.lastEventTime = new Map();
        this.isActive = false;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Add event listener for recorded events
     * @param listener - Event listener to add
     */
    addListener(listener) {
        this.listeners.push(listener);
    }
    /**
     * Remove event listener
     * @param listener - Event listener to remove
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    /**
     * Start recording events
     */
    startRecording() {
        this.isActive = true;
        this.lastEventTime.clear();
    }
    /**
     * Stop recording events
     */
    stopRecording() {
        this.isActive = false;
        this.lastEventTime.clear();
    }
    /**
     * Check if an event should be recorded
     * @param event - DOM event to check
     * @returns Whether the event should be recorded
     */
    shouldRecordEvent(event) {
        if (!this.isActive) {
            return false;
        }
        const target = event.target;
        if (!target) {
            return false;
        }
        // Check ignore selectors
        for (const selector of this.config.ignoreSelectors) {
            try {
                if (target.matches(selector) || target.closest(selector)) {
                    return false;
                }
            }
            catch (error) {
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
    processEvent(event) {
        if (!this.shouldRecordEvent(event)) {
            return;
        }
        const recordedEvent = {
            type: event.type,
            target: event.target,
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
            }
            catch (error) {
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
    isEventTypeEnabled(eventType) {
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
    isEventThrottled(event) {
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
    getEventKey(event) {
        const target = event.target;
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
    applyEventSpecificFilters(event) {
        switch (event.type) {
            case 'mousemove':
                return this.shouldRecordMouseMove(event);
            case 'click':
                return this.shouldRecordClick(event);
            case 'keydown':
            case 'keyup':
                return this.shouldRecordKeyboard(event);
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
    shouldRecordMouseMove(event) {
        // Only record mouse moves during drag operations or over interactive elements
        const target = event.target;
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
    shouldRecordClick(event) {
        const target = event.target;
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
    shouldRecordKeyboard(event) {
        const target = event.target;
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
    shouldRecordInput(event) {
        const target = event.target;
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
    shouldRecordScroll(event) {
        // Always record scroll events, but they're throttled by configuration
        return true;
    }
    /**
     * Check if element has click event handlers
     * @param element - Element to check
     * @returns Whether element has click handlers
     * @private
     */
    elementHasClickHandler(element) {
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
    extractEventData(event) {
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
                const mouseEvent = event;
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
                const keyEvent = event;
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
                const inputTarget = event.target;
                return {
                    ...baseData,
                    value: inputTarget.value,
                    type: inputTarget.type,
                    name: inputTarget.name,
                    id: inputTarget.id
                };
            case 'focus':
            case 'blur':
                const focusTarget = event.target;
                return {
                    ...baseData,
                    tagName: focusTarget.tagName,
                    type: focusTarget.type,
                    name: focusTarget.name,
                    id: focusTarget.id
                };
            case 'submit':
                const formTarget = event.target;
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


/***/ }),

/***/ "./src/utils/screenshot-capture.ts":
/*!*****************************************!*\
  !*** ./src/utils/screenshot-capture.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ScreenshotCapture: () => (/* binding */ ScreenshotCapture)
/* harmony export */ });
/**
 * @fileoverview Screenshot capture utility for visual verification and AI healing
 * @author Ayush Shukla
 * @description Handles capturing screenshots of elements and page regions.
 * Optimized for storage efficiency and visual recognition.
 */
/**
 * Default screenshot configuration optimized for storage and recognition
 */
const DEFAULT_CONFIG = {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.8,
    format: 'jpeg',
    highlight: true
};
/**
 * Screenshot capture utility class
 * Follows Single Responsibility Principle for screenshot operations
 */
class ScreenshotCapture {
    /**
     * Initialize screenshot capture with configuration
     * @param config - Screenshot configuration (optional)
     */
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Capture screenshot of a specific element with context
     * @param element - Element to capture
     * @param padding - Padding around element (default: 20px)
     * @returns Promise resolving to base64 screenshot or null
     */
    async captureElement(element, padding = 20) {
        try {
            const rect = element.getBoundingClientRect();
            // Calculate capture region with padding
            const captureRegion = {
                x: Math.max(0, rect.left - padding),
                y: Math.max(0, rect.top - padding),
                width: Math.min(window.innerWidth - rect.left + padding, rect.width + (padding * 2)),
                height: Math.min(window.innerHeight - rect.top + padding, rect.height + (padding * 2))
            };
            // Scroll element into view if needed
            if (this.isElementOutOfView(element)) {
                element.scrollIntoView({
                    behavior: 'instant',
                    block: 'center',
                    inline: 'center'
                });
                // Wait for scroll to complete
                await this.sleep(100);
            }
            // Highlight element if configured
            let highlightElement = null;
            if (this.config.highlight) {
                highlightElement = this.addElementHighlight(element);
            }
            try {
                // Capture the visible area
                const screenshot = await this.captureVisibleArea();
                if (screenshot) {
                    // Crop to the specific region
                    const croppedScreenshot = await this.cropScreenshot(screenshot, captureRegion, this.config);
                    return croppedScreenshot;
                }
            }
            finally {
                // Remove highlight
                if (highlightElement) {
                    highlightElement.remove();
                }
            }
            return null;
        }
        catch (error) {
            console.error('ScreenshotCapture: Error capturing element screenshot:', error);
            return null;
        }
    }
    /**
     * Capture screenshot of the visible page area
     * @returns Promise resolving to base64 screenshot or null
     */
    async captureVisible() {
        try {
            const screenshot = await this.captureVisibleArea();
            if (screenshot) {
                // Resize if needed to stay within limits
                return await this.resizeScreenshot(screenshot, this.config);
            }
            return null;
        }
        catch (error) {
            console.error('ScreenshotCapture: Error capturing visible screenshot:', error);
            return null;
        }
    }
    /**
     * Capture full page screenshot (if possible)
     * @returns Promise resolving to base64 screenshot or null
     */
    async captureFullPage() {
        try {
            // This requires the background script to handle via chrome.tabs.captureVisibleTab
            return new Promise((resolve) => {
                chrome.runtime.sendMessage({ type: 'CAPTURE_FULL_PAGE' }, (response) => {
                    resolve(response?.screenshot || null);
                });
            });
        }
        catch (error) {
            console.error('ScreenshotCapture: Error capturing full page screenshot:', error);
            return null;
        }
    }
    /**
     * Capture screenshot with element highlighting for multiple elements
     * @param elements - Elements to highlight
     * @returns Promise resolving to base64 screenshot or null
     */
    async captureWithHighlights(elements) {
        try {
            const highlights = [];
            // Add highlights to all elements
            for (const element of elements) {
                const highlight = this.addElementHighlight(element, '#3b82f6'); // Blue highlight
                if (highlight) {
                    highlights.push(highlight);
                }
            }
            try {
                const screenshot = await this.captureVisible();
                return screenshot;
            }
            finally {
                // Clean up highlights
                highlights.forEach(highlight => highlight.remove());
            }
        }
        catch (error) {
            console.error('ScreenshotCapture: Error capturing with highlights:', error);
            return null;
        }
    }
    /**
     * Capture the visible area using chrome.tabs API via background script
     * @returns Promise resolving to base64 screenshot
     * @private
     */
    async captureVisibleArea() {
        try {
            return new Promise((resolve) => {
                chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' }, (response) => {
                    if (response?.error) {
                        console.error('ScreenshotCapture: Background script error:', response.error);
                        resolve(null);
                    }
                    else {
                        resolve(response?.screenshot || null);
                    }
                });
            });
        }
        catch (error) {
            console.error('ScreenshotCapture: Error communicating with background script:', error);
            return null;
        }
    }
    /**
     * Check if element is out of the current viewport
     * @param element - Element to check
     * @returns Whether element is out of view
     * @private
     */
    isElementOutOfView(element) {
        const rect = element.getBoundingClientRect();
        return (rect.bottom < 0 ||
            rect.right < 0 ||
            rect.left > window.innerWidth ||
            rect.top > window.innerHeight);
    }
    /**
     * Add visual highlight to an element
     * @param element - Element to highlight
     * @param color - Highlight color (default: red)
     * @returns Highlight element or null
     * @private
     */
    addElementHighlight(element, color = '#ef4444') {
        try {
            const rect = element.getBoundingClientRect();
            const highlight = document.createElement('div');
            highlight.className = 'autoflow-element-highlight';
            highlight.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        border: 2px solid ${color};
        background-color: ${color}20;
        pointer-events: none;
        z-index: 999998;
        box-sizing: border-box;
        border-radius: 2px;
      `;
            document.body.appendChild(highlight);
            return highlight;
        }
        catch (error) {
            console.warn('ScreenshotCapture: Error adding element highlight:', error);
            return null;
        }
    }
    /**
     * Crop screenshot to specific region
     * @param screenshot - Base64 screenshot data
     * @param region - Region to crop
     * @param config - Screenshot configuration
     * @returns Promise resolving to cropped screenshot
     * @private
     */
    async cropScreenshot(screenshot, region, config) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Cannot get canvas context'));
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    try {
                        // Set canvas size to cropped region
                        canvas.width = region.width;
                        canvas.height = region.height;
                        // Draw cropped portion
                        ctx.drawImage(img, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);
                        // Convert to desired format and quality
                        const croppedData = canvas.toDataURL(`image/${config.format}`, config.quality);
                        resolve(croppedData);
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                img.onerror = () => {
                    reject(new Error('Failed to load screenshot image'));
                };
                img.src = screenshot;
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Resize screenshot to fit within maximum dimensions
     * @param screenshot - Base64 screenshot data
     * @param config - Screenshot configuration
     * @returns Promise resolving to resized screenshot
     * @private
     */
    async resizeScreenshot(screenshot, config) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Cannot get canvas context'));
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    try {
                        // Calculate new dimensions maintaining aspect ratio
                        const { width: newWidth, height: newHeight } = this.calculateResizeDimensions(img.width, img.height, config.maxWidth, config.maxHeight);
                        // Set canvas size
                        canvas.width = newWidth;
                        canvas.height = newHeight;
                        // Draw resized image
                        ctx.drawImage(img, 0, 0, newWidth, newHeight);
                        // Convert to desired format and quality
                        const resizedData = canvas.toDataURL(`image/${config.format}`, config.quality);
                        resolve(resizedData);
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                img.onerror = () => {
                    reject(new Error('Failed to load screenshot image'));
                };
                img.src = screenshot;
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Calculate new dimensions for resizing while maintaining aspect ratio
     * @param originalWidth - Original image width
     * @param originalHeight - Original image height
     * @param maxWidth - Maximum allowed width
     * @param maxHeight - Maximum allowed height
     * @returns New dimensions
     * @private
     */
    calculateResizeDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        // If image is already within limits, return original size
        if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
            return { width: originalWidth, height: originalHeight };
        }
        // Calculate scale factors
        const scaleX = maxWidth / originalWidth;
        const scaleY = maxHeight / originalHeight;
        const scale = Math.min(scaleX, scaleY);
        return {
            width: Math.floor(originalWidth * scale),
            height: Math.floor(originalHeight * scale)
        };
    }
    /**
     * Sleep utility for waiting
     * @param ms - Milliseconds to sleep
     * @returns Promise that resolves after delay
     * @private
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get estimated screenshot file size in bytes
     * @param screenshot - Base64 screenshot data
     * @returns Estimated file size in bytes
     */
    getScreenshotSize(screenshot) {
        // Base64 encoding increases size by ~33%
        // Remove data URL prefix if present
        const base64Data = screenshot.replace(/^data:image\/[a-z]+;base64,/, '');
        return Math.floor((base64Data.length * 3) / 4);
    }
    /**
     * Compress screenshot if it's too large
     * @param screenshot - Base64 screenshot data
     * @param maxSize - Maximum size in bytes (default: 500KB)
     * @returns Promise resolving to compressed screenshot
     */
    async compressIfNeeded(screenshot, maxSize = 500 * 1024) {
        const currentSize = this.getScreenshotSize(screenshot);
        if (currentSize <= maxSize) {
            return screenshot;
        }
        // Reduce quality and try again
        const compressedConfig = {
            ...this.config,
            quality: Math.max(0.3, this.config.quality * 0.7)
        };
        try {
            const compressed = await this.resizeScreenshot(screenshot, compressedConfig);
            const compressedSize = this.getScreenshotSize(compressed);
            if (compressedSize <= maxSize) {
                return compressed;
            }
            // If still too large, reduce dimensions
            const furtherCompressed = await this.resizeScreenshot(compressed, {
                ...compressedConfig,
                maxWidth: Math.floor(compressedConfig.maxWidth * 0.8),
                maxHeight: Math.floor(compressedConfig.maxHeight * 0.8)
            });
            return furtherCompressed;
        }
        catch (error) {
            console.warn('ScreenshotCapture: Error compressing screenshot:', error);
            return screenshot; // Return original if compression fails
        }
    }
}


/***/ }),

/***/ "./src/utils/selector-extractor.ts":
/*!*****************************************!*\
  !*** ./src/utils/selector-extractor.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SelectorExtractor: () => (/* binding */ SelectorExtractor)
/* harmony export */ });
/**
 * @fileoverview Selector extraction utility for robust element targeting
 * @author Ayush Shukla
 * @description Extracts multiple selector strategies for reliable element finding.
 * Implements Interface Segregation Principle with focused selector strategies.
 */
/**
 * CSS selector extraction strategy
 */
class CssSelectorStrategy {
    /**
     * Extract CSS selector for the element
     * @param element - Target element
     * @returns CSS selector string or null
     */
    extract(element) {
        try {
            // Try ID first (highest specificity)
            if (element.id && /^[a-zA-Z][\w-]*$/.test(element.id)) {
                const idSelector = `#${element.id}`;
                if (this.isUnique(idSelector)) {
                    return idSelector;
                }
            }
            // Try data attributes (good for automation)
            const dataAttrs = [
                "data-testid",
                "data-test",
                "data-cy",
                "data-automation",
            ];
            for (const attr of dataAttrs) {
                const value = element.getAttribute(attr);
                if (value) {
                    const dataSelector = `[${attr}="${value}"]`;
                    if (this.isUnique(dataSelector)) {
                        return dataSelector;
                    }
                }
            }
            // Try class-based selector
            if (element.classList.length > 0) {
                const classSelector = `.${Array.from(element.classList).join(".")}`;
                if (this.isUnique(classSelector)) {
                    return classSelector;
                }
            }
            // Try tag + attributes combination
            const tagSelector = this.generateTagAttributeSelector(element);
            if (tagSelector && this.isUnique(tagSelector)) {
                return tagSelector;
            }
            // Fall back to nth-child selector
            return this.generateNthChildSelector(element);
        }
        catch (error) {
            console.warn("CssSelectorStrategy: Error extracting selector:", error);
            return null;
        }
    }
    /**
     * Get priority of this strategy (higher is better)
     */
    getPriority() {
        return 90;
    }
    /**
     * Check if the selector is valid for the element
     * @param selector - CSS selector to validate
     * @param element - Target element
     * @returns Whether the selector is valid
     */
    isValid(selector, element) {
        try {
            const found = document.querySelector(selector);
            return found === element;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Check if a selector returns only one element
     * @param selector - CSS selector to check
     * @returns Whether the selector is unique
     * @private
     */
    isUnique(selector) {
        try {
            return document.querySelectorAll(selector).length === 1;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Generate selector based on tag and attributes
     * @param element - Target element
     * @returns Tag + attribute selector
     * @private
     */
    generateTagAttributeSelector(element) {
        const tag = element.tagName.toLowerCase();
        const attributes = [];
        // Check useful attributes
        const usefulAttrs = [
            "name",
            "type",
            "value",
            "placeholder",
            "title",
            "role",
            "aria-label",
        ];
        for (const attr of usefulAttrs) {
            const value = element.getAttribute(attr);
            if (value && value.length < 50) {
                // Avoid very long values
                attributes.push(`[${attr}="${value}"]`);
            }
        }
        if (attributes.length > 0) {
            return `${tag}${attributes.join("")}`;
        }
        return null;
    }
    /**
     * Generate nth-child selector as last resort
     * @param element - Target element
     * @returns nth-child selector
     * @private
     */
    generateNthChildSelector(element) {
        const path = [];
        let current = element;
        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let selector = current.tagName.toLowerCase();
            if (current.parentElement) {
                const siblings = Array.from(current.parentElement.children);
                const index = siblings.indexOf(current) + 1;
                selector += `:nth-child(${index})`;
            }
            path.unshift(selector);
            current = current.parentElement;
            // Limit depth to avoid very long selectors
            if (path.length >= 5)
                break;
        }
        return path.join(" > ");
    }
}
/**
 * XPath selector extraction strategy
 */
class XPathSelectorStrategy {
    /**
     * Extract XPath selector for the element
     * @param element - Target element
     * @returns XPath selector string or null
     */
    extract(element) {
        try {
            const path = [];
            let current = element;
            while (current && current.nodeType === Node.ELEMENT_NODE) {
                const tagName = current.tagName.toLowerCase();
                if (current.id) {
                    // Use ID for shorter XPath
                    path.unshift(`//${tagName}[@id='${current.id}']`);
                    break;
                }
                else if (current.parentElement) {
                    const siblings = Array.from(current.parentElement.children);
                    const sameTagSiblings = siblings.filter((el) => el.tagName === current.tagName);
                    if (sameTagSiblings.length === 1) {
                        path.unshift(`/${tagName}`);
                    }
                    else {
                        const index = sameTagSiblings.indexOf(current) + 1;
                        path.unshift(`/${tagName}[${index}]`);
                    }
                }
                else {
                    path.unshift(`/${tagName}`);
                }
                current = current.parentElement;
                // Limit depth
                if (path.length >= 6)
                    break;
            }
            return path.length > 0 ? "/" + path.join("") : null;
        }
        catch (error) {
            console.warn("XPathSelectorStrategy: Error extracting selector:", error);
            return null;
        }
    }
    /**
     * Get priority of this strategy
     */
    getPriority() {
        return 70;
    }
    /**
     * Check if the XPath selector is valid for the element
     * @param selector - XPath selector to validate
     * @param element - Target element
     * @returns Whether the selector is valid
     */
    isValid(selector, element) {
        try {
            const result = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue === element;
        }
        catch (error) {
            return false;
        }
    }
}
/**
 * Text-based selector extraction strategy
 */
class TextSelectorStrategy {
    /**
     * Extract text-based selector for the element
     * @param element - Target element
     * @returns Text selector string or null
     */
    extract(element) {
        try {
            const text = element.textContent?.trim();
            if (!text || text.length > 100) {
                return null; // Skip very long text or empty elements
            }
            // Check if text is unique
            const xpath = `//*[normalize-space(text())='${text.replace(/'/g, "\\'")}']`;
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (result.snapshotLength === 1) {
                return `text=${text}`;
            }
            // Try partial text match for longer text
            if (text.length > 10) {
                const partialText = text.slice(0, 20);
                const partialXpath = `//*[contains(normalize-space(text()),'${partialText.replace(/'/g, "\\'")}')]`;
                const partialResult = document.evaluate(partialXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (partialResult.snapshotLength <= 3) {
                    return `text*=${partialText}`;
                }
            }
            return null;
        }
        catch (error) {
            console.warn("TextSelectorStrategy: Error extracting selector:", error);
            return null;
        }
    }
    /**
     * Get priority of this strategy
     */
    getPriority() {
        return 60;
    }
    /**
     * Check if the text selector is valid for the element
     * @param selector - Text selector to validate
     * @param element - Target element
     * @returns Whether the selector is valid
     */
    isValid(selector, element) {
        try {
            const text = element.textContent?.trim();
            if (!text)
                return false;
            if (selector.startsWith("text=")) {
                return text === selector.substring(5);
            }
            else if (selector.startsWith("text*=")) {
                return text.includes(selector.substring(6));
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
}
/**
 * ARIA/Role-based selector extraction strategy
 */
class RoleSelectorStrategy {
    /**
     * Extract role-based selector for the element
     * @param element - Target element
     * @returns Role selector string or null
     */
    extract(element) {
        try {
            const role = element.getAttribute("role");
            const ariaLabel = element.getAttribute("aria-label");
            const ariaLabelledby = element.getAttribute("aria-labelledby");
            if (role) {
                let roleSelector = `[role="${role}"]`;
                if (ariaLabel) {
                    roleSelector += `[aria-label="${ariaLabel}"]`;
                }
                // Check if this selector is unique
                if (document.querySelectorAll(roleSelector).length === 1) {
                    return roleSelector;
                }
            }
            // Check for implicit roles
            const implicitRole = this.getImplicitRole(element);
            if (implicitRole) {
                return `role=${implicitRole}`;
            }
            return null;
        }
        catch (error) {
            console.warn("RoleSelectorStrategy: Error extracting selector:", error);
            return null;
        }
    }
    /**
     * Get priority of this strategy
     */
    getPriority() {
        return 80;
    }
    /**
     * Check if the role selector is valid for the element
     * @param selector - Role selector to validate
     * @param element - Target element
     * @returns Whether the selector is valid
     */
    isValid(selector, element) {
        try {
            if (selector.startsWith("role=")) {
                const expectedRole = selector.substring(5);
                const actualRole = element.getAttribute("role") || this.getImplicitRole(element);
                return actualRole === expectedRole;
            }
            const found = document.querySelector(selector);
            return found === element;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get implicit ARIA role for common elements
     * @param element - Target element
     * @returns Implicit role or null
     * @private
     */
    getImplicitRole(element) {
        const tagName = element.tagName.toLowerCase();
        // Handle input elements specially
        if (tagName === "input") {
            return this.getInputRole(element);
        }
        const roleMap = {
            button: "button",
            a: "link",
            textarea: "textbox",
            select: "combobox",
            img: "img",
            h1: "heading",
            h2: "heading",
            h3: "heading",
            h4: "heading",
            h5: "heading",
            h6: "heading",
            nav: "navigation",
            main: "main",
            header: "banner",
            footer: "contentinfo",
            aside: "complementary",
            section: "region",
            article: "article",
        };
        return roleMap[tagName] || null;
    }
    /**
     * Get role for input elements based on type
     * @param input - Input element
     * @returns Input role
     * @private
     */
    getInputRole(input) {
        const type = (input.type || "text").toLowerCase();
        const inputRoles = {
            button: "button",
            submit: "button",
            reset: "button",
            checkbox: "checkbox",
            radio: "radio",
            text: "textbox",
            password: "textbox",
            email: "textbox",
            search: "searchbox",
            tel: "textbox",
            url: "textbox",
            number: "spinbutton",
        };
        return inputRoles[type] || "textbox";
    }
}
/**
 * Main selector extractor class that coordinates multiple strategies
 * Follows Single Responsibility Principle and Strategy Pattern
 */
class SelectorExtractor {
    constructor() {
        this.strategies = [
            new CssSelectorStrategy(),
            new XPathSelectorStrategy(),
            new TextSelectorStrategy(),
            new RoleSelectorStrategy(),
        ].sort((a, b) => b.getPriority() - a.getPriority());
    }
    /**
     * Extract multiple selectors for an element using all strategies
     * @param element - Target element to extract selectors for
     * @returns Array of element selectors with confidence scores
     */
    extractSelectors(element) {
        const selectors = [];
        const boundingBox = this.getBoundingBox(element);
        // Extract selectors using each strategy
        for (const strategy of this.strategies) {
            try {
                const selector = strategy.extract(element);
                if (selector) {
                    const confidence = this.calculateConfidence(selector, element, strategy);
                    const elementSelector = {
                        confidence,
                        boundingBox,
                    };
                    // Assign selector to appropriate property based on strategy
                    if (strategy instanceof CssSelectorStrategy) {
                        elementSelector.css = selector;
                    }
                    else if (strategy instanceof XPathSelectorStrategy) {
                        elementSelector.xpath = selector;
                    }
                    else if (strategy instanceof TextSelectorStrategy) {
                        elementSelector.text = selector;
                    }
                    else if (strategy instanceof RoleSelectorStrategy) {
                        elementSelector.role = selector;
                    }
                    // Add element attributes for additional verification
                    elementSelector.attributes = this.extractRelevantAttributes(element);
                    selectors.push(elementSelector);
                }
            }
            catch (error) {
                console.warn("SelectorExtractor: Error with strategy:", strategy.constructor.name, error);
            }
        }
        // If no selectors were found, create a basic fallback
        if (selectors.length === 0) {
            selectors.push(this.createFallbackSelector(element, boundingBox));
        }
        return selectors.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    }
    /**
     * Calculate confidence score for a selector
     * @param selector - The selector string
     * @param element - Target element
     * @param strategy - Strategy used to extract the selector
     * @returns Confidence score (0-100)
     * @private
     */
    calculateConfidence(selector, element, strategy) {
        let confidence = strategy.getPriority();
        try {
            // Bonus for ID-based selectors
            if (selector.includes("#") && element.id) {
                confidence += 5;
            }
            // Bonus for data attributes
            if (selector.includes("data-")) {
                confidence += 3;
            }
            // Penalty for very long selectors
            if (selector.length > 100) {
                confidence -= 10;
            }
            // Bonus for short, simple selectors
            if (selector.length < 30) {
                confidence += 2;
            }
            // Verify the selector actually works
            if (strategy.isValid(selector, element)) {
                confidence += 5;
            }
            else {
                confidence -= 20;
            }
        }
        catch (error) {
            confidence -= 15;
        }
        return Math.max(0, Math.min(100, confidence));
    }
    /**
     * Get bounding box for an element
     * @param element - Target element
     * @returns Bounding box coordinates
     * @private
     */
    getBoundingBox(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
        };
    }
    /**
     * Extract relevant attributes from an element
     * @param element - Target element
     * @returns Object with relevant attributes
     * @private
     */
    extractRelevantAttributes(element) {
        const attributes = {};
        const relevantAttrs = [
            "id",
            "class",
            "name",
            "type",
            "value",
            "placeholder",
            "title",
            "role",
            "aria-label",
            "data-testid",
            "data-test",
            "href",
            "src",
        ];
        for (const attr of relevantAttrs) {
            const value = element.getAttribute(attr);
            if (value) {
                attributes[attr] = value;
            }
        }
        // Add tag name for reference
        attributes["tagName"] = element.tagName.toLowerCase();
        return attributes;
    }
    /**
     * Create a fallback selector when all strategies fail
     * @param element - Target element
     * @param boundingBox - Element bounding box
     * @returns Fallback element selector
     * @private
     */
    createFallbackSelector(element, boundingBox) {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.trim().slice(0, 30) || "";
        return {
            css: tagName,
            text: text || undefined,
            attributes: this.extractRelevantAttributes(element),
            boundingBox,
            confidence: 10, // Low confidence for fallback
        };
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***************************************!*\
  !*** ./src/content/content-script.ts ***!
  \***************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_selector_extractor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/selector-extractor */ "./src/utils/selector-extractor.ts");
/* harmony import */ var _utils_screenshot_capture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/screenshot-capture */ "./src/utils/screenshot-capture.ts");
/* harmony import */ var _utils_event_recorder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/event-recorder */ "./src/utils/event-recorder.ts");
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
class AutoFlowContentScript {
    /**
     * Initialize the content script with all dependencies
     */
    constructor() {
        this.isRecording = false;
        this.recordingSessionId = null;
        this.stepCounter = 0;
        this.stepCounterSyncInterval = null;
        this.selectorExtractor = new _utils_selector_extractor__WEBPACK_IMPORTED_MODULE_0__.SelectorExtractor();
        this.screenshotCapture = new _utils_screenshot_capture__WEBPACK_IMPORTED_MODULE_1__.ScreenshotCapture();
        this.eventRecorder = new _utils_event_recorder__WEBPACK_IMPORTED_MODULE_2__.EventRecorder();
        this.setupEventListeners();
        this.setupMessageHandlers();
        this.initializeRecordingState();
    }
    /**
     * Set up DOM event listeners for recording user interactions
     * @private
     */
    setupEventListeners() {
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
        window.addEventListener("beforeunload", this.handleNavigationEvent.bind(this));
        // Scroll events (throttled for performance)
        let scrollTimeout;
        document.addEventListener("scroll", () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(this.handleScrollEvent.bind(this), 150);
        }, { passive: true });
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
    setupMessageHandlers() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }
    /**
     * Initialize recording state from storage
     * @private
     */
    async initializeRecordingState() {
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
        }
        catch (error) {
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
    async handleMessage(message, sender, sendResponse) {
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
                    const selectors = this.selectorExtractor.extractSelectors(message.element);
                    sendResponse({ selectors });
                    break;
                // Background uses this to detect if sidebar script is present
                case "SIDEBAR_STATUS":
                    // Forward to sidebar if present; otherwise report not injected
                    try {
                        chrome.runtime.sendMessage({ type: "SIDEBAR_STATUS" }, (resp) => {
                            if (resp && typeof resp.injected !== "undefined") {
                                sendResponse(resp);
                            }
                            else {
                                sendResponse({ injected: false, sidebarActive: false });
                            }
                        });
                    }
                    catch {
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
        }
        catch (error) {
            console.error("AutoFlow: Error handling message:", error);
            sendResponse({ error: error?.message || "Unknown error" });
        }
    }
    /**
     * Start recording user interactions
     * @param sessionId - Unique session identifier
     */
    async startRecording(sessionId) {
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
    async stopRecording() {
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
    async handleClickEvent(event) {
        if (!this.isRecording || !event.target)
            return;
        const element = event.target;
        // Skip clicks on the recording indicator
        if (element.closest(".autoflow-recording-indicator"))
            return;
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
        }
        catch (error) {
            console.error("AutoFlow: Error recording click event:", error);
        }
    }
    /**
     * Handle input events (typing, form filling)
     * @param event - The input event
     * @private
     */
    async handleInputEvent(event) {
        if (!this.isRecording || !event.target)
            return;
        const element = event.target;
        // Only record certain input types
        const recordableTypes = [
            "text",
            "email",
            "password",
            "search",
            "tel",
            "url",
        ];
        if (element.type && !recordableTypes.includes(element.type))
            return;
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
        }
        catch (error) {
            console.error("AutoFlow: Error recording input event:", error);
        }
    }
    /**
     * Handle scroll events on the page
     * @private
     */
    async handleScrollEvent() {
        if (!this.isRecording)
            return;
        try {
            const scrollStep = {
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
                },
                timestamp: Date.now(),
                metadata: {
                    description: `Scrolled to position (${window.scrollX}, ${window.scrollY})`,
                    tags: ["scroll"],
                },
            };
            await this.saveTraceStep(scrollStep);
        }
        catch (error) {
            console.error("AutoFlow: Error recording scroll event:", error);
        }
    }
    /**
     * Handle form submission events
     * @param event - The submit event
     * @private
     */
    async handleSubmitEvent(event) {
        if (!this.isRecording || !event.target)
            return;
        const form = event.target;
        try {
            const step = await this.createTraceStep(form, "click", event);
            step.metadata = {
                ...step.metadata,
                description: "Form submission",
                tags: ["form", "submit"],
                critical: true,
            };
            await this.saveTraceStep(step);
        }
        catch (error) {
            console.error("AutoFlow: Error recording form submission:", error);
        }
    }
    /**
     * Handle navigation events
     * @private
     */
    async handleNavigationEvent() {
        if (!this.isRecording)
            return;
        try {
            const step = {
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
        }
        catch (error) {
            console.error("AutoFlow: Error recording navigation event:", error);
        }
    }
    /**
     * Handle focus events for form fields
     * @param event - The focus event
     * @private
     */
    async handleFocusEvent(event) {
        if (!this.isRecording || !event.target)
            return;
        const element = event.target;
        // Only record focus on interactive elements
        const interactiveElements = ["input", "textarea", "select", "button"];
        if (!interactiveElements.includes(element.tagName.toLowerCase()))
            return;
        // This helps with form field detection and can be used for better selectors
        console.log("AutoFlow: Focus detected on:", element);
    }
    /**
     * Record initial page load
     * @private
     */
    async recordPageLoad() {
        try {
            const step = {
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
        }
        catch (error) {
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
    async createTraceStep(element, action, event) {
        const selectors = this.selectorExtractor.extractSelectors(element);
        const boundingBox = element.getBoundingClientRect();
        const step = {
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
        if (action === "input" &&
            element.value !== undefined) {
            step.inputData = this.extractInputData(element);
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
    extractInputData(element) {
        const inputData = {
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
    mapInputType(htmlType) {
        const typeMap = {
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
    generateStepDescription(element, action) {
        const elementText = element.textContent?.trim().slice(0, 50) || "";
        const tagName = element.tagName.toLowerCase();
        switch (action) {
            case "click":
                return `Clicked ${tagName}${elementText ? ': "' + elementText + '"' : ""}`;
            case "input":
                const placeholder = element.placeholder;
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
    generateStepTags(element, action) {
        const tags = [action];
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
    async saveTraceStep(step) {
        try {
            // Send to background script for processing and storage
            await chrome.runtime.sendMessage({
                type: "SAVE_TRACE_STEP",
                sessionId: this.recordingSessionId,
                step,
            });
            // Don't increment local counter - background script is the source of truth
            console.log("AutoFlow: Step recorded:", step);
        }
        catch (error) {
            console.error("AutoFlow: Error saving trace step:", error);
        }
    }
    /**
     * Save screenshot to storage
     * @param screenshot - Base64 screenshot data
     * @returns Promise resolving to screenshot reference
     * @private
     */
    async saveScreenshot(screenshot) {
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
    generateStepId() {
        return `step_${Date.now()}_${this.stepCounter}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get current tab ID
     * @returns Promise resolving to tab ID
     * @private
     */
    async getCurrentTabId() {
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
    async generateDOMHash() {
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
    async showRecordingIndicator() {
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
        }
        catch (error) {
            console.warn("AutoFlow: Could not get step count from background, using local count");
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
    async updateStepCounter() {
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
        }
        catch (error) {
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
    highlightElement(element) {
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
    hideRecordingIndicator() {
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
    startStepCounterSync() {
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
    stopStepCounterSync() {
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
}
else {
    new AutoFlowContentScript();
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AutoFlowContentScript);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLFdBQVcsR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLFVBQVU7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDclpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsMkJBQTJCO0FBQ3hFO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdGQUFnRjtBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLDZCQUE2QjtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLFVBQVU7QUFDMUIsZUFBZSxTQUFTO0FBQ3hCLGlCQUFpQixXQUFXO0FBQzVCLGtCQUFrQixZQUFZO0FBQzlCLDRCQUE0QjtBQUM1Qiw0QkFBNEIsTUFBTTtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzRUFBc0UsY0FBYztBQUNwRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxxQ0FBcUM7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0VBQXNFLGNBQWM7QUFDcEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtRUFBbUU7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQzdYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxXQUFXO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsS0FBSyxJQUFJLE1BQU07QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsd0NBQXdDO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxLQUFLLElBQUksTUFBTTtBQUNuRDtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsSUFBSSxFQUFFLG9CQUFvQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLE1BQU07QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLFFBQVEsUUFBUSxXQUFXO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxRQUFRO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxRQUFRLEdBQUcsTUFBTTtBQUMxRDtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsUUFBUTtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBLDBEQUEwRCwwQkFBMEI7QUFDcEY7QUFDQTtBQUNBLCtCQUErQixLQUFLO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEVBQThFLGlDQUFpQztBQUMvRztBQUNBO0FBQ0Esb0NBQW9DLFlBQVk7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLEtBQUs7QUFDbEQ7QUFDQSxvREFBb0QsVUFBVTtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsYUFBYTtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztVQzVqQkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7Ozs7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNnRTtBQUNBO0FBQ1I7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsd0VBQWlCO0FBQ3RELHFDQUFxQyx3RUFBaUI7QUFDdEQsaUNBQWlDLGdFQUFhO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxJQUFJLGVBQWU7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxlQUFlO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxlQUFlO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsWUFBWTtBQUMvQztBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsV0FBVztBQUM5QztBQUNBO0FBQ0E7QUFDQSxzREFBc0Q7QUFDdEQ7QUFDQSxxREFBcUQsd0JBQXdCO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDLHVDQUF1QztBQUN0RjtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0EsdUNBQXVDLHVDQUF1QztBQUM5RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxlQUFlO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsMENBQTBDO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSwwREFBMEQsZUFBZSxJQUFJLGVBQWU7QUFDNUY7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQscUJBQXFCO0FBQzlFO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBaUQsZUFBZTtBQUNoRTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsUUFBUSxFQUFFLDZDQUE2QztBQUN6RjtBQUNBO0FBQ0EsMENBQTBDLFFBQVEsRUFBRSw0Q0FBNEM7QUFDaEc7QUFDQSxvQ0FBb0MsUUFBUSxLQUFLLFFBQVE7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsV0FBVyxHQUFHLHdDQUF3QztBQUNqRztBQUNBLDJCQUEyQixhQUFhO0FBQ3hDLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFdBQVcsR0FBRyxpQkFBaUIsR0FBRyx3Q0FBd0M7QUFDakc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5Qyx5QkFBeUI7QUFDbEU7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBaUU7QUFDakU7QUFDQTtBQUNBLDJCQUEyQixNQUFNLEdBQUcsSUFBSSxHQUFHLFNBQVM7QUFDcEQ7QUFDQTtBQUNBLHdCQUF3QixvQkFBb0I7QUFDNUM7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLGNBQWM7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFlLHFCQUFxQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi8uL3NyYy91dGlscy9ldmVudC1yZWNvcmRlci50cyIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uLy4vc3JjL3V0aWxzL3NjcmVlbnNob3QtY2FwdHVyZS50cyIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uLy4vc3JjL3V0aWxzL3NlbGVjdG9yLWV4dHJhY3Rvci50cyIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi8uL3NyYy9jb250ZW50L2NvbnRlbnQtc2NyaXB0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVvdmVydmlldyBFdmVudCByZWNvcmRpbmcgdXRpbGl0eSBmb3IgY2FwdHVyaW5nIHVzZXIgaW50ZXJhY3Rpb25zXG4gKiBAYXV0aG9yIEF5dXNoIFNodWtsYVxuICogQGRlc2NyaXB0aW9uIEhhbmRsZXMgcmVjb3JkaW5nIGFuZCBwcm9jZXNzaW5nIG9mIHVzZXIgZXZlbnRzIHdpdGggc21hcnQgZmlsdGVyaW5nLlxuICogSW1wbGVtZW50cyBPYnNlcnZlciBwYXR0ZXJuIGZvciBldmVudCBoYW5kbGluZy5cbiAqL1xuLyoqXG4gKiBEZWZhdWx0IGV2ZW50IHJlY29yZGVyIGNvbmZpZ3VyYXRpb25cbiAqL1xuY29uc3QgREVGQVVMVF9DT05GSUcgPSB7XG4gICAgcmVjb3JkTW91c2U6IHRydWUsXG4gICAgcmVjb3JkS2V5Ym9hcmQ6IHRydWUsXG4gICAgcmVjb3JkRm9ybXM6IHRydWUsXG4gICAgcmVjb3JkTmF2aWdhdGlvbjogdHJ1ZSxcbiAgICB0aHJvdHRsZVRpbWU6IDEwMCxcbiAgICBpZ25vcmVTZWxlY3RvcnM6IFtcbiAgICAgICAgJy5hdXRvZmxvdy1yZWNvcmRpbmctaW5kaWNhdG9yJyxcbiAgICAgICAgJy5hdXRvZmxvdy1lbGVtZW50LWhpZ2hsaWdodCcsXG4gICAgICAgICdbZGF0YS1hdXRvZmxvdy1pZ25vcmVdJ1xuICAgIF1cbn07XG4vKipcbiAqIEV2ZW50IHJlY29yZGVyIGNsYXNzIHRoYXQgaGFuZGxlcyBpbnRlbGxpZ2VudCBldmVudCBjYXB0dXJlXG4gKiBGb2xsb3dzIE9ic2VydmVyIHBhdHRlcm4gZm9yIGV2ZW50IG5vdGlmaWNhdGlvblxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRSZWNvcmRlciB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBldmVudCByZWNvcmRlciB3aXRoIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gRXZlbnQgcmVjb3JkZXIgY29uZmlndXJhdGlvbiAob3B0aW9uYWwpXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29uZmlnID0ge30pIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgdGhpcy5sYXN0RXZlbnRUaW1lID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5ERUZBVUxUX0NPTkZJRywgLi4uY29uZmlnIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBldmVudCBsaXN0ZW5lciBmb3IgcmVjb3JkZWQgZXZlbnRzXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIC0gRXZlbnQgbGlzdGVuZXIgdG8gYWRkXG4gICAgICovXG4gICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciAtIEV2ZW50IGxpc3RlbmVyIHRvIHJlbW92ZVxuICAgICAqL1xuICAgIHJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5saXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHJlY29yZGluZyBldmVudHNcbiAgICAgKi9cbiAgICBzdGFydFJlY29yZGluZygpIHtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMubGFzdEV2ZW50VGltZS5jbGVhcigpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdG9wIHJlY29yZGluZyBldmVudHNcbiAgICAgKi9cbiAgICBzdG9wUmVjb3JkaW5nKCkge1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGFzdEV2ZW50VGltZS5jbGVhcigpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhbiBldmVudCBzaG91bGQgYmUgcmVjb3JkZWRcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBET00gZXZlbnQgdG8gY2hlY2tcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBldmVudCBzaG91bGQgYmUgcmVjb3JkZWRcbiAgICAgKi9cbiAgICBzaG91bGRSZWNvcmRFdmVudChldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgaWdub3JlIHNlbGVjdG9yc1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHRoaXMuY29uZmlnLmlnbm9yZVNlbGVjdG9ycykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpIHx8IHRhcmdldC5jbG9zZXN0KHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gSW52YWxpZCBzZWxlY3Rvciwgc2tpcFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGNvbmZpZ3VyYXRpb24gZmxhZ3NcbiAgICAgICAgaWYgKCF0aGlzLmlzRXZlbnRUeXBlRW5hYmxlZChldmVudC50eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIHRocm90dGxpbmdcbiAgICAgICAgaWYgKHRoaXMuaXNFdmVudFRocm90dGxlZChldmVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGRpdGlvbmFsIGZpbHRlcnMgZm9yIHNwZWNpZmljIGV2ZW50IHR5cGVzXG4gICAgICAgIHJldHVybiB0aGlzLmFwcGx5RXZlbnRTcGVjaWZpY0ZpbHRlcnMoZXZlbnQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIGFuZCBub3RpZnkgbGlzdGVuZXJzIGFib3V0IGEgcmVjb3JkZWQgZXZlbnRcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBET00gZXZlbnQgdG8gcHJvY2Vzc1xuICAgICAqL1xuICAgIHByb2Nlc3NFdmVudChldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuc2hvdWxkUmVjb3JkRXZlbnQoZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVjb3JkZWRFdmVudCA9IHtcbiAgICAgICAgICAgIHR5cGU6IGV2ZW50LnR5cGUsXG4gICAgICAgICAgICB0YXJnZXQ6IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGRhdGE6IHRoaXMuZXh0cmFjdEV2ZW50RGF0YShldmVudCksXG4gICAgICAgICAgICBzaG91bGRSZWNvcmQ6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgLy8gVXBkYXRlIGxhc3QgZXZlbnQgdGltZSBmb3IgdGhyb3R0bGluZ1xuICAgICAgICBjb25zdCBldmVudEtleSA9IHRoaXMuZ2V0RXZlbnRLZXkoZXZlbnQpO1xuICAgICAgICB0aGlzLmxhc3RFdmVudFRpbWUuc2V0KGV2ZW50S2V5LCByZWNvcmRlZEV2ZW50LnRpbWVzdGFtcCk7XG4gICAgICAgIC8vIE5vdGlmeSBhbGwgbGlzdGVuZXJzXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5vbkV2ZW50KHJlY29yZGVkRXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXZlbnRSZWNvcmRlcjogRXJyb3IgaW4gZXZlbnQgbGlzdGVuZXI6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgZXZlbnQgdHlwZSBpcyBlbmFibGVkIGluIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcGFyYW0gZXZlbnRUeXBlIC0gVHlwZSBvZiBldmVudCB0byBjaGVja1xuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgZXZlbnQgdHlwZSBzaG91bGQgYmUgcmVjb3JkZWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGlzRXZlbnRUeXBlRW5hYmxlZChldmVudFR5cGUpIHtcbiAgICAgICAgY29uc3QgbW91c2VFdmVudHMgPSBbJ2NsaWNrJywgJ2RibGNsaWNrJywgJ21vdXNlZG93bicsICdtb3VzZXVwJywgJ21vdXNlbW92ZSddO1xuICAgICAgICBjb25zdCBrZXlib2FyZEV2ZW50cyA9IFsna2V5ZG93bicsICdrZXl1cCcsICdrZXlwcmVzcyddO1xuICAgICAgICBjb25zdCBmb3JtRXZlbnRzID0gWydpbnB1dCcsICdjaGFuZ2UnLCAnc3VibWl0JywgJ2ZvY3VzJywgJ2JsdXInXTtcbiAgICAgICAgY29uc3QgbmF2aWdhdGlvbkV2ZW50cyA9IFsnYmVmb3JldW5sb2FkJywgJ3VubG9hZCcsICdwb3BzdGF0ZScsICdoYXNoY2hhbmdlJ107XG4gICAgICAgIGlmIChtb3VzZUV2ZW50cy5pbmNsdWRlcyhldmVudFR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucmVjb3JkTW91c2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleWJvYXJkRXZlbnRzLmluY2x1ZGVzKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5yZWNvcmRLZXlib2FyZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZm9ybUV2ZW50cy5pbmNsdWRlcyhldmVudFR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucmVjb3JkRm9ybXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hdmlnYXRpb25FdmVudHMuaW5jbHVkZXMoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnJlY29yZE5hdmlnYXRpb247XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWxsb3cgb3RoZXIgZXZlbnRzIGJ5IGRlZmF1bHRcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGV2ZW50IHNob3VsZCBiZSB0aHJvdHRsZWRcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBjaGVja1xuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgZXZlbnQgaXMgdGhyb3R0bGVkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBpc0V2ZW50VGhyb3R0bGVkKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGV2ZW50S2V5ID0gdGhpcy5nZXRFdmVudEtleShldmVudCk7XG4gICAgICAgIGNvbnN0IGxhc3RUaW1lID0gdGhpcy5sYXN0RXZlbnRUaW1lLmdldChldmVudEtleSk7XG4gICAgICAgIGlmICghbGFzdFRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gRmlyc3QgZXZlbnQgb2YgdGhpcyB0eXBlXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGltZVNpbmNlTGFzdEV2ZW50ID0gRGF0ZS5ub3coKSAtIGxhc3RUaW1lO1xuICAgICAgICByZXR1cm4gdGltZVNpbmNlTGFzdEV2ZW50IDwgdGhpcy5jb25maWcudGhyb3R0bGVUaW1lO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB1bmlxdWUga2V5IGZvciBldmVudCB0aHJvdHRsaW5nXG4gICAgICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gZ2VuZXJhdGUga2V5IGZvclxuICAgICAqIEByZXR1cm5zIFVuaXF1ZSBldmVudCBrZXlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldEV2ZW50S2V5KGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgY29uc3QgdGFnTmFtZSA9IHRhcmdldC50YWdOYW1lIHx8ICd1bmtub3duJztcbiAgICAgICAgY29uc3QgaWQgPSB0YXJnZXQuaWQgfHwgJyc7XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IHRhcmdldC5jbGFzc05hbWUgfHwgJyc7XG4gICAgICAgIHJldHVybiBgJHtldmVudC50eXBlfV8ke3RhZ05hbWV9XyR7aWR9XyR7Y2xhc3NOYW1lfWA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFwcGx5IGV2ZW50LXNwZWNpZmljIGZpbHRlcmluZyBsb2dpY1xuICAgICAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGZpbHRlclxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgZXZlbnQgc2hvdWxkIGJlIHJlY29yZGVkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhcHBseUV2ZW50U3BlY2lmaWNGaWx0ZXJzKGV2ZW50KSB7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnbW91c2Vtb3ZlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaG91bGRSZWNvcmRNb3VzZU1vdmUoZXZlbnQpO1xuICAgICAgICAgICAgY2FzZSAnY2xpY2snOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNob3VsZFJlY29yZENsaWNrKGV2ZW50KTtcbiAgICAgICAgICAgIGNhc2UgJ2tleWRvd24nOlxuICAgICAgICAgICAgY2FzZSAna2V5dXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNob3VsZFJlY29yZEtleWJvYXJkKGV2ZW50KTtcbiAgICAgICAgICAgIGNhc2UgJ2lucHV0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaG91bGRSZWNvcmRJbnB1dChldmVudCk7XG4gICAgICAgICAgICBjYXNlICdzY3JvbGwnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNob3VsZFJlY29yZFNjcm9sbChldmVudCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIG1vdXNlIG1vdmUgc2hvdWxkIGJlIHJlY29yZGVkXG4gICAgICogQHBhcmFtIGV2ZW50IC0gTW91c2UgbW92ZSBldmVudFxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdG8gcmVjb3JkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzaG91bGRSZWNvcmRNb3VzZU1vdmUoZXZlbnQpIHtcbiAgICAgICAgLy8gT25seSByZWNvcmQgbW91c2UgbW92ZXMgZHVyaW5nIGRyYWcgb3BlcmF0aW9ucyBvciBvdmVyIGludGVyYWN0aXZlIGVsZW1lbnRzXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbnMgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gTW91c2UgYnV0dG9uIGlzIHByZXNzZWQgKGRyYWdnaW5nKVxuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGlmIG92ZXIgaW50ZXJhY3RpdmUgZWxlbWVudFxuICAgICAgICBjb25zdCBpbnRlcmFjdGl2ZVRhZ3MgPSBbJ2J1dHRvbicsICdhJywgJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYSddO1xuICAgICAgICByZXR1cm4gaW50ZXJhY3RpdmVUYWdzLmluY2x1ZGVzKHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBjbGljayBzaG91bGQgYmUgcmVjb3JkZWRcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBDbGljayBldmVudFxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdG8gcmVjb3JkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzaG91bGRSZWNvcmRDbGljayhldmVudCkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIC8vIFNraXAgcmlnaHQgY2xpY2tzIGFuZCBtaWRkbGUgY2xpY2tzIGZvciBub3dcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNraXAgY2xpY2tzIG9uIG5vbi1pbnRlcmFjdGl2ZSBlbGVtZW50cyB1bmxlc3MgdGhleSBoYXZlIGV2ZW50IGhhbmRsZXJzXG4gICAgICAgIGNvbnN0IGludGVyYWN0aXZlVGFncyA9IFsnYScsICdidXR0b24nLCAnaW5wdXQnLCAnc2VsZWN0JywgJ3RleHRhcmVhJywgJ2xhYmVsJ107XG4gICAgICAgIGNvbnN0IGhhc0NsaWNrSGFuZGxlciA9IHRoaXMuZWxlbWVudEhhc0NsaWNrSGFuZGxlcih0YXJnZXQpO1xuICAgICAgICByZXR1cm4gaW50ZXJhY3RpdmVUYWdzLmluY2x1ZGVzKHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICBoYXNDbGlja0hhbmRsZXIgfHxcbiAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSA9PT0gJ2J1dHRvbic7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGtleWJvYXJkIGV2ZW50IHNob3VsZCBiZSByZWNvcmRlZFxuICAgICAqIEBwYXJhbSBldmVudCAtIEtleWJvYXJkIGV2ZW50XG4gICAgICogQHJldHVybnMgV2hldGhlciB0byByZWNvcmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNob3VsZFJlY29yZEtleWJvYXJkKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgLy8gT25seSByZWNvcmQga2V5Ym9hcmQgZXZlbnRzIG9uIGlucHV0IGVsZW1lbnRzXG4gICAgICAgIGNvbnN0IGlucHV0VGFncyA9IFsnaW5wdXQnLCAndGV4dGFyZWEnXTtcbiAgICAgICAgY29uc3QgaXNDb250ZW50RWRpdGFibGUgPSB0YXJnZXQuaGFzQXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnKTtcbiAgICAgICAgaWYgKCFpbnB1dFRhZ3MuaW5jbHVkZXModGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSkgJiYgIWlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgICAgICAgICAvLyBSZWNvcmQgbmF2aWdhdGlvbiBrZXlzIGV2ZW4gb3V0c2lkZSBpbnB1dCBmaWVsZHNcbiAgICAgICAgICAgIGNvbnN0IG5hdmlnYXRpb25LZXlzID0gWydFbnRlcicsICdUYWInLCAnRXNjYXBlJywgJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ0Fycm93TGVmdCcsICdBcnJvd1JpZ2h0J107XG4gICAgICAgICAgICByZXR1cm4gbmF2aWdhdGlvbktleXMuaW5jbHVkZXMoZXZlbnQua2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgaW5wdXQgZXZlbnQgc2hvdWxkIGJlIHJlY29yZGVkXG4gICAgICogQHBhcmFtIGV2ZW50IC0gSW5wdXQgZXZlbnRcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRvIHJlY29yZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2hvdWxkUmVjb3JkSW5wdXQoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAvLyBTa2lwIHBhc3N3b3JkIGZpZWxkcyBmb3Igc2VjdXJpdHkgKHdpbGwgYmUgaGFuZGxlZCBzcGVjaWFsbHkpXG4gICAgICAgIGlmICh0YXJnZXQudHlwZSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIFJlY29yZCBidXQgd2lsbCBiZSBtYXNrZWQgbGF0ZXJcbiAgICAgICAgfVxuICAgICAgICAvLyBTa2lwIHZlcnkgZnJlcXVlbnQgaW5wdXQgZXZlbnRzIG9uIHJhbmdlIHNsaWRlcnNcbiAgICAgICAgaWYgKHRhcmdldC50eXBlID09PSAncmFuZ2UnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHNjcm9sbCBldmVudCBzaG91bGQgYmUgcmVjb3JkZWRcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBTY3JvbGwgZXZlbnRcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRvIHJlY29yZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2hvdWxkUmVjb3JkU2Nyb2xsKGV2ZW50KSB7XG4gICAgICAgIC8vIEFsd2F5cyByZWNvcmQgc2Nyb2xsIGV2ZW50cywgYnV0IHRoZXkncmUgdGhyb3R0bGVkIGJ5IGNvbmZpZ3VyYXRpb25cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGVsZW1lbnQgaGFzIGNsaWNrIGV2ZW50IGhhbmRsZXJzXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBFbGVtZW50IHRvIGNoZWNrXG4gICAgICogQHJldHVybnMgV2hldGhlciBlbGVtZW50IGhhcyBjbGljayBoYW5kbGVyc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZWxlbWVudEhhc0NsaWNrSGFuZGxlcihlbGVtZW50KSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBoZXVyaXN0aWMgLSB3ZSBjYW4ndCBkaXJlY3RseSBkZXRlY3QgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgIC8vIExvb2sgZm9yIGNvbW1vbiBpbmRpY2F0b3JzXG4gICAgICAgIC8vIENoZWNrIGZvciBjdXJzb3IgcG9pbnRlciBzdHlsZVxuICAgICAgICBjb25zdCBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG4gICAgICAgIGlmIChjb21wdXRlZFN0eWxlLmN1cnNvciA9PT0gJ3BvaW50ZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3IgY29tbW9uIGNsaWNrLXJlbGF0ZWQgYXR0cmlidXRlc1xuICAgICAgICBjb25zdCBjbGlja0F0dHJpYnV0ZXMgPSBbJ29uY2xpY2snLCAnZGF0YS1hY3Rpb24nLCAnZGF0YS1jbGljaycsICdkYXRhLXRvZ2dsZSddO1xuICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgY2xpY2tBdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3IgY29tbW9uIGNsaWNrYWJsZSBjbGFzc2VzXG4gICAgICAgIGNvbnN0IGNsaWNrYWJsZUNsYXNzZXMgPSBbJ2J0bicsICdidXR0b24nLCAnY2xpY2thYmxlJywgJ2xpbmsnLCAnYWN0aW9uJ107XG4gICAgICAgIGNvbnN0IGVsZW1lbnRDbGFzc2VzID0gZWxlbWVudC5jbGFzc05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgZm9yIChjb25zdCBjbHMgb2YgY2xpY2thYmxlQ2xhc3Nlcykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRDbGFzc2VzLmluY2x1ZGVzKGNscykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgcmVsZXZhbnQgZGF0YSBmcm9tIGFuIGV2ZW50XG4gICAgICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gZXh0cmFjdCBkYXRhIGZyb21cbiAgICAgKiBAcmV0dXJucyBFdmVudCBkYXRhIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZXh0cmFjdEV2ZW50RGF0YShldmVudCkge1xuICAgICAgICBjb25zdCBiYXNlRGF0YSA9IHtcbiAgICAgICAgICAgIHR5cGU6IGV2ZW50LnR5cGUsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IGV2ZW50LnRpbWVTdGFtcCxcbiAgICAgICAgICAgIGJ1YmJsZXM6IGV2ZW50LmJ1YmJsZXMsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiBldmVudC5jYW5jZWxhYmxlXG4gICAgICAgIH07XG4gICAgICAgIC8vIEFkZCBldmVudC1zcGVjaWZpYyBkYXRhXG4gICAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnY2xpY2snOlxuICAgICAgICAgICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgICAgICAgIGNhc2UgJ21vdXNldXAnOlxuICAgICAgICAgICAgICAgIGNvbnN0IG1vdXNlRXZlbnQgPSBldmVudDtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAuLi5iYXNlRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50WDogbW91c2VFdmVudC5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRZOiBtb3VzZUV2ZW50LmNsaWVudFksXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbjogbW91c2VFdmVudC5idXR0b24sXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnM6IG1vdXNlRXZlbnQuYnV0dG9ucyxcbiAgICAgICAgICAgICAgICAgICAgY3RybEtleTogbW91c2VFdmVudC5jdHJsS2V5LFxuICAgICAgICAgICAgICAgICAgICBzaGlmdEtleTogbW91c2VFdmVudC5zaGlmdEtleSxcbiAgICAgICAgICAgICAgICAgICAgYWx0S2V5OiBtb3VzZUV2ZW50LmFsdEtleSxcbiAgICAgICAgICAgICAgICAgICAgbWV0YUtleTogbW91c2VFdmVudC5tZXRhS2V5XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2tleWRvd24nOlxuICAgICAgICAgICAgY2FzZSAna2V5dXAnOlxuICAgICAgICAgICAgY2FzZSAna2V5cHJlc3MnOlxuICAgICAgICAgICAgICAgIGNvbnN0IGtleUV2ZW50ID0gZXZlbnQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgLi4uYmFzZURhdGEsXG4gICAgICAgICAgICAgICAgICAgIGtleToga2V5RXZlbnQua2V5LFxuICAgICAgICAgICAgICAgICAgICBjb2RlOiBrZXlFdmVudC5jb2RlLFxuICAgICAgICAgICAgICAgICAgICBrZXlDb2RlOiBrZXlFdmVudC5rZXlDb2RlLFxuICAgICAgICAgICAgICAgICAgICBjdHJsS2V5OiBrZXlFdmVudC5jdHJsS2V5LFxuICAgICAgICAgICAgICAgICAgICBzaGlmdEtleToga2V5RXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICAgICAgICAgIGFsdEtleToga2V5RXZlbnQuYWx0S2V5LFxuICAgICAgICAgICAgICAgICAgICBtZXRhS2V5OiBrZXlFdmVudC5tZXRhS2V5XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2lucHV0JzpcbiAgICAgICAgICAgIGNhc2UgJ2NoYW5nZSc6XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRUYXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgLi4uYmFzZURhdGEsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpbnB1dFRhcmdldC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW5wdXRUYXJnZXQudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaW5wdXRUYXJnZXQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlucHV0VGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2ZvY3VzJzpcbiAgICAgICAgICAgIGNhc2UgJ2JsdXInOlxuICAgICAgICAgICAgICAgIGNvbnN0IGZvY3VzVGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmJhc2VEYXRhLFxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiBmb2N1c1RhcmdldC50YWdOYW1lLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBmb2N1c1RhcmdldC50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBmb2N1c1RhcmdldC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBpZDogZm9jdXNUYXJnZXQuaWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnc3VibWl0JzpcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtVGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmJhc2VEYXRhLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZvcm1UYXJnZXQuYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IGZvcm1UYXJnZXQubWV0aG9kLFxuICAgICAgICAgICAgICAgICAgICBpZDogZm9ybVRhcmdldC5pZCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZm9ybVRhcmdldC5uYW1lXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ3Njcm9sbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgLi4uYmFzZURhdGEsXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFg6IHdpbmRvdy5zY3JvbGxYLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxZOiB3aW5kb3cuc2Nyb2xsWSxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsV2lkdGg6IGRvY3VtZW50LmJvZHkuc2Nyb2xsV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbEhlaWdodDogZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZURhdGE7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgU2NyZWVuc2hvdCBjYXB0dXJlIHV0aWxpdHkgZm9yIHZpc3VhbCB2ZXJpZmljYXRpb24gYW5kIEFJIGhlYWxpbmdcbiAqIEBhdXRob3IgQXl1c2ggU2h1a2xhXG4gKiBAZGVzY3JpcHRpb24gSGFuZGxlcyBjYXB0dXJpbmcgc2NyZWVuc2hvdHMgb2YgZWxlbWVudHMgYW5kIHBhZ2UgcmVnaW9ucy5cbiAqIE9wdGltaXplZCBmb3Igc3RvcmFnZSBlZmZpY2llbmN5IGFuZCB2aXN1YWwgcmVjb2duaXRpb24uXG4gKi9cbi8qKlxuICogRGVmYXVsdCBzY3JlZW5zaG90IGNvbmZpZ3VyYXRpb24gb3B0aW1pemVkIGZvciBzdG9yYWdlIGFuZCByZWNvZ25pdGlvblxuICovXG5jb25zdCBERUZBVUxUX0NPTkZJRyA9IHtcbiAgICBtYXhXaWR0aDogODAwLFxuICAgIG1heEhlaWdodDogNjAwLFxuICAgIHF1YWxpdHk6IDAuOCxcbiAgICBmb3JtYXQ6ICdqcGVnJyxcbiAgICBoaWdobGlnaHQ6IHRydWVcbn07XG4vKipcbiAqIFNjcmVlbnNob3QgY2FwdHVyZSB1dGlsaXR5IGNsYXNzXG4gKiBGb2xsb3dzIFNpbmdsZSBSZXNwb25zaWJpbGl0eSBQcmluY2lwbGUgZm9yIHNjcmVlbnNob3Qgb3BlcmF0aW9uc1xuICovXG5leHBvcnQgY2xhc3MgU2NyZWVuc2hvdENhcHR1cmUge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgc2NyZWVuc2hvdCBjYXB0dXJlIHdpdGggY29uZmlndXJhdGlvblxuICAgICAqIEBwYXJhbSBjb25maWcgLSBTY3JlZW5zaG90IGNvbmZpZ3VyYXRpb24gKG9wdGlvbmFsKVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZyA9IHt9KSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5ERUZBVUxUX0NPTkZJRywgLi4uY29uZmlnIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhcHR1cmUgc2NyZWVuc2hvdCBvZiBhIHNwZWNpZmljIGVsZW1lbnQgd2l0aCBjb250ZXh0XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBFbGVtZW50IHRvIGNhcHR1cmVcbiAgICAgKiBAcGFyYW0gcGFkZGluZyAtIFBhZGRpbmcgYXJvdW5kIGVsZW1lbnQgKGRlZmF1bHQ6IDIwcHgpXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gYmFzZTY0IHNjcmVlbnNob3Qgb3IgbnVsbFxuICAgICAqL1xuICAgIGFzeW5jIGNhcHR1cmVFbGVtZW50KGVsZW1lbnQsIHBhZGRpbmcgPSAyMCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgY2FwdHVyZSByZWdpb24gd2l0aCBwYWRkaW5nXG4gICAgICAgICAgICBjb25zdCBjYXB0dXJlUmVnaW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IE1hdGgubWF4KDAsIHJlY3QubGVmdCAtIHBhZGRpbmcpLFxuICAgICAgICAgICAgICAgIHk6IE1hdGgubWF4KDAsIHJlY3QudG9wIC0gcGFkZGluZyksXG4gICAgICAgICAgICAgICAgd2lkdGg6IE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoIC0gcmVjdC5sZWZ0ICsgcGFkZGluZywgcmVjdC53aWR0aCArIChwYWRkaW5nICogMikpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0IC0gcmVjdC50b3AgKyBwYWRkaW5nLCByZWN0LmhlaWdodCArIChwYWRkaW5nICogMikpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gU2Nyb2xsIGVsZW1lbnQgaW50byB2aWV3IGlmIG5lZWRlZFxuICAgICAgICAgICAgaWYgKHRoaXMuaXNFbGVtZW50T3V0T2ZWaWV3KGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgICAgICAgICAgICAgIGJlaGF2aW9yOiAnaW5zdGFudCcsXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiAnY2VudGVyJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIFdhaXQgZm9yIHNjcm9sbCB0byBjb21wbGV0ZVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEhpZ2hsaWdodCBlbGVtZW50IGlmIGNvbmZpZ3VyZWRcbiAgICAgICAgICAgIGxldCBoaWdobGlnaHRFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5oaWdobGlnaHQpIHtcbiAgICAgICAgICAgICAgICBoaWdobGlnaHRFbGVtZW50ID0gdGhpcy5hZGRFbGVtZW50SGlnaGxpZ2h0KGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBDYXB0dXJlIHRoZSB2aXNpYmxlIGFyZWFcbiAgICAgICAgICAgICAgICBjb25zdCBzY3JlZW5zaG90ID0gYXdhaXQgdGhpcy5jYXB0dXJlVmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgICAgICBpZiAoc2NyZWVuc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBDcm9wIHRvIHRoZSBzcGVjaWZpYyByZWdpb25cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3JvcHBlZFNjcmVlbnNob3QgPSBhd2FpdCB0aGlzLmNyb3BTY3JlZW5zaG90KHNjcmVlbnNob3QsIGNhcHR1cmVSZWdpb24sIHRoaXMuY29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNyb3BwZWRTY3JlZW5zaG90O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBoaWdobGlnaHRcbiAgICAgICAgICAgICAgICBpZiAoaGlnaGxpZ2h0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2NyZWVuc2hvdENhcHR1cmU6IEVycm9yIGNhcHR1cmluZyBlbGVtZW50IHNjcmVlbnNob3Q6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FwdHVyZSBzY3JlZW5zaG90IG9mIHRoZSB2aXNpYmxlIHBhZ2UgYXJlYVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIGJhc2U2NCBzY3JlZW5zaG90IG9yIG51bGxcbiAgICAgKi9cbiAgICBhc3luYyBjYXB0dXJlVmlzaWJsZSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNjcmVlbnNob3QgPSBhd2FpdCB0aGlzLmNhcHR1cmVWaXNpYmxlQXJlYSgpO1xuICAgICAgICAgICAgaWYgKHNjcmVlbnNob3QpIHtcbiAgICAgICAgICAgICAgICAvLyBSZXNpemUgaWYgbmVlZGVkIHRvIHN0YXkgd2l0aGluIGxpbWl0c1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlc2l6ZVNjcmVlbnNob3Qoc2NyZWVuc2hvdCwgdGhpcy5jb25maWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTY3JlZW5zaG90Q2FwdHVyZTogRXJyb3IgY2FwdHVyaW5nIHZpc2libGUgc2NyZWVuc2hvdDonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYXB0dXJlIGZ1bGwgcGFnZSBzY3JlZW5zaG90IChpZiBwb3NzaWJsZSlcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byBiYXNlNjQgc2NyZWVuc2hvdCBvciBudWxsXG4gICAgICovXG4gICAgYXN5bmMgY2FwdHVyZUZ1bGxQYWdlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gVGhpcyByZXF1aXJlcyB0aGUgYmFja2dyb3VuZCBzY3JpcHQgdG8gaGFuZGxlIHZpYSBjaHJvbWUudGFicy5jYXB0dXJlVmlzaWJsZVRhYlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyB0eXBlOiAnQ0FQVFVSRV9GVUxMX1BBR0UnIH0sIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlPy5zY3JlZW5zaG90IHx8IG51bGwpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTY3JlZW5zaG90Q2FwdHVyZTogRXJyb3IgY2FwdHVyaW5nIGZ1bGwgcGFnZSBzY3JlZW5zaG90OicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhcHR1cmUgc2NyZWVuc2hvdCB3aXRoIGVsZW1lbnQgaGlnaGxpZ2h0aW5nIGZvciBtdWx0aXBsZSBlbGVtZW50c1xuICAgICAqIEBwYXJhbSBlbGVtZW50cyAtIEVsZW1lbnRzIHRvIGhpZ2hsaWdodFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIGJhc2U2NCBzY3JlZW5zaG90IG9yIG51bGxcbiAgICAgKi9cbiAgICBhc3luYyBjYXB0dXJlV2l0aEhpZ2hsaWdodHMoZWxlbWVudHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGhpZ2hsaWdodHMgPSBbXTtcbiAgICAgICAgICAgIC8vIEFkZCBoaWdobGlnaHRzIHRvIGFsbCBlbGVtZW50c1xuICAgICAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0ID0gdGhpcy5hZGRFbGVtZW50SGlnaGxpZ2h0KGVsZW1lbnQsICcjM2I4MmY2Jyk7IC8vIEJsdWUgaGlnaGxpZ2h0XG4gICAgICAgICAgICAgICAgaWYgKGhpZ2hsaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRzLnB1c2goaGlnaGxpZ2h0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjcmVlbnNob3QgPSBhd2FpdCB0aGlzLmNhcHR1cmVWaXNpYmxlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjcmVlbnNob3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCBoaWdobGlnaHRzXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0cy5mb3JFYWNoKGhpZ2hsaWdodCA9PiBoaWdobGlnaHQucmVtb3ZlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2NyZWVuc2hvdENhcHR1cmU6IEVycm9yIGNhcHR1cmluZyB3aXRoIGhpZ2hsaWdodHM6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FwdHVyZSB0aGUgdmlzaWJsZSBhcmVhIHVzaW5nIGNocm9tZS50YWJzIEFQSSB2aWEgYmFja2dyb3VuZCBzY3JpcHRcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byBiYXNlNjQgc2NyZWVuc2hvdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgY2FwdHVyZVZpc2libGVBcmVhKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyB0eXBlOiAnQ0FQVFVSRV9WSVNJQkxFX1RBQicgfSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZT8uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1NjcmVlbnNob3RDYXB0dXJlOiBCYWNrZ3JvdW5kIHNjcmlwdCBlcnJvcjonLCByZXNwb25zZS5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZT8uc2NyZWVuc2hvdCB8fCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTY3JlZW5zaG90Q2FwdHVyZTogRXJyb3IgY29tbXVuaWNhdGluZyB3aXRoIGJhY2tncm91bmQgc2NyaXB0OicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGVsZW1lbnQgaXMgb3V0IG9mIHRoZSBjdXJyZW50IHZpZXdwb3J0XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBFbGVtZW50IHRvIGNoZWNrXG4gICAgICogQHJldHVybnMgV2hldGhlciBlbGVtZW50IGlzIG91dCBvZiB2aWV3XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBpc0VsZW1lbnRPdXRPZlZpZXcoZWxlbWVudCkge1xuICAgICAgICBjb25zdCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgcmV0dXJuIChyZWN0LmJvdHRvbSA8IDAgfHxcbiAgICAgICAgICAgIHJlY3QucmlnaHQgPCAwIHx8XG4gICAgICAgICAgICByZWN0LmxlZnQgPiB3aW5kb3cuaW5uZXJXaWR0aCB8fFxuICAgICAgICAgICAgcmVjdC50b3AgPiB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGQgdmlzdWFsIGhpZ2hsaWdodCB0byBhbiBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBFbGVtZW50IHRvIGhpZ2hsaWdodFxuICAgICAqIEBwYXJhbSBjb2xvciAtIEhpZ2hsaWdodCBjb2xvciAoZGVmYXVsdDogcmVkKVxuICAgICAqIEByZXR1cm5zIEhpZ2hsaWdodCBlbGVtZW50IG9yIG51bGxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFkZEVsZW1lbnRIaWdobGlnaHQoZWxlbWVudCwgY29sb3IgPSAnI2VmNDQ0NCcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBoaWdobGlnaHQuY2xhc3NOYW1lID0gJ2F1dG9mbG93LWVsZW1lbnQtaGlnaGxpZ2h0JztcbiAgICAgICAgICAgIGhpZ2hsaWdodC5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgIGxlZnQ6ICR7cmVjdC5sZWZ0fXB4O1xuICAgICAgICB0b3A6ICR7cmVjdC50b3B9cHg7XG4gICAgICAgIHdpZHRoOiAke3JlY3Qud2lkdGh9cHg7XG4gICAgICAgIGhlaWdodDogJHtyZWN0LmhlaWdodH1weDtcbiAgICAgICAgYm9yZGVyOiAycHggc29saWQgJHtjb2xvcn07XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7Y29sb3J9MjA7XG4gICAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgICAgICB6LWluZGV4OiA5OTk5OTg7XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICAgIGA7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGhpZ2hsaWdodCk7XG4gICAgICAgICAgICByZXR1cm4gaGlnaGxpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdTY3JlZW5zaG90Q2FwdHVyZTogRXJyb3IgYWRkaW5nIGVsZW1lbnQgaGlnaGxpZ2h0OicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyb3Agc2NyZWVuc2hvdCB0byBzcGVjaWZpYyByZWdpb25cbiAgICAgKiBAcGFyYW0gc2NyZWVuc2hvdCAtIEJhc2U2NCBzY3JlZW5zaG90IGRhdGFcbiAgICAgKiBAcGFyYW0gcmVnaW9uIC0gUmVnaW9uIHRvIGNyb3BcbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gU2NyZWVuc2hvdCBjb25maWd1cmF0aW9uXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gY3JvcHBlZCBzY3JlZW5zaG90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBjcm9wU2NyZWVuc2hvdChzY3JlZW5zaG90LCByZWdpb24sIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgICAgICBpZiAoIWN0eCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdDYW5ub3QgZ2V0IGNhbnZhcyBjb250ZXh0JykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTZXQgY2FudmFzIHNpemUgdG8gY3JvcHBlZCByZWdpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHJlZ2lvbi53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSByZWdpb24uaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRHJhdyBjcm9wcGVkIHBvcnRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCByZWdpb24ueCwgcmVnaW9uLnksIHJlZ2lvbi53aWR0aCwgcmVnaW9uLmhlaWdodCwgMCwgMCwgcmVnaW9uLndpZHRoLCByZWdpb24uaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gZGVzaXJlZCBmb3JtYXQgYW5kIHF1YWxpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyb3BwZWREYXRhID0gY2FudmFzLnRvRGF0YVVSTChgaW1hZ2UvJHtjb25maWcuZm9ybWF0fWAsIGNvbmZpZy5xdWFsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY3JvcHBlZERhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaW1nLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHNjcmVlbnNob3QgaW1hZ2UnKSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gc2NyZWVuc2hvdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNpemUgc2NyZWVuc2hvdCB0byBmaXQgd2l0aGluIG1heGltdW0gZGltZW5zaW9uc1xuICAgICAqIEBwYXJhbSBzY3JlZW5zaG90IC0gQmFzZTY0IHNjcmVlbnNob3QgZGF0YVxuICAgICAqIEBwYXJhbSBjb25maWcgLSBTY3JlZW5zaG90IGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byByZXNpemVkIHNjcmVlbnNob3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIHJlc2l6ZVNjcmVlbnNob3Qoc2NyZWVuc2hvdCwgY29uZmlnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgICAgIGlmICghY3R4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Nhbm5vdCBnZXQgY2FudmFzIGNvbnRleHQnKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBuZXcgZGltZW5zaW9ucyBtYWludGFpbmluZyBhc3BlY3QgcmF0aW9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgd2lkdGg6IG5ld1dpZHRoLCBoZWlnaHQ6IG5ld0hlaWdodCB9ID0gdGhpcy5jYWxjdWxhdGVSZXNpemVEaW1lbnNpb25zKGltZy53aWR0aCwgaW1nLmhlaWdodCwgY29uZmlnLm1heFdpZHRoLCBjb25maWcubWF4SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNldCBjYW52YXMgc2l6ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gbmV3V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRHJhdyByZXNpemVkIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCwgbmV3V2lkdGgsIG5ld0hlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRvIGRlc2lyZWQgZm9ybWF0IGFuZCBxdWFsaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNpemVkRGF0YSA9IGNhbnZhcy50b0RhdGFVUkwoYGltYWdlLyR7Y29uZmlnLmZvcm1hdH1gLCBjb25maWcucXVhbGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc2l6ZWREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdGYWlsZWQgdG8gbG9hZCBzY3JlZW5zaG90IGltYWdlJykpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9IHNjcmVlbnNob3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIG5ldyBkaW1lbnNpb25zIGZvciByZXNpemluZyB3aGlsZSBtYWludGFpbmluZyBhc3BlY3QgcmF0aW9cbiAgICAgKiBAcGFyYW0gb3JpZ2luYWxXaWR0aCAtIE9yaWdpbmFsIGltYWdlIHdpZHRoXG4gICAgICogQHBhcmFtIG9yaWdpbmFsSGVpZ2h0IC0gT3JpZ2luYWwgaW1hZ2UgaGVpZ2h0XG4gICAgICogQHBhcmFtIG1heFdpZHRoIC0gTWF4aW11bSBhbGxvd2VkIHdpZHRoXG4gICAgICogQHBhcmFtIG1heEhlaWdodCAtIE1heGltdW0gYWxsb3dlZCBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyBOZXcgZGltZW5zaW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY2FsY3VsYXRlUmVzaXplRGltZW5zaW9ucyhvcmlnaW5hbFdpZHRoLCBvcmlnaW5hbEhlaWdodCwgbWF4V2lkdGgsIG1heEhlaWdodCkge1xuICAgICAgICAvLyBJZiBpbWFnZSBpcyBhbHJlYWR5IHdpdGhpbiBsaW1pdHMsIHJldHVybiBvcmlnaW5hbCBzaXplXG4gICAgICAgIGlmIChvcmlnaW5hbFdpZHRoIDw9IG1heFdpZHRoICYmIG9yaWdpbmFsSGVpZ2h0IDw9IG1heEhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgd2lkdGg6IG9yaWdpbmFsV2lkdGgsIGhlaWdodDogb3JpZ2luYWxIZWlnaHQgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYWxjdWxhdGUgc2NhbGUgZmFjdG9yc1xuICAgICAgICBjb25zdCBzY2FsZVggPSBtYXhXaWR0aCAvIG9yaWdpbmFsV2lkdGg7XG4gICAgICAgIGNvbnN0IHNjYWxlWSA9IG1heEhlaWdodCAvIG9yaWdpbmFsSGVpZ2h0O1xuICAgICAgICBjb25zdCBzY2FsZSA9IE1hdGgubWluKHNjYWxlWCwgc2NhbGVZKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBNYXRoLmZsb29yKG9yaWdpbmFsV2lkdGggKiBzY2FsZSksXG4gICAgICAgICAgICBoZWlnaHQ6IE1hdGguZmxvb3Iob3JpZ2luYWxIZWlnaHQgKiBzY2FsZSlcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2xlZXAgdXRpbGl0eSBmb3Igd2FpdGluZ1xuICAgICAqIEBwYXJhbSBtcyAtIE1pbGxpc2Vjb25kcyB0byBzbGVlcFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciBkZWxheVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2xlZXAobXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgZXN0aW1hdGVkIHNjcmVlbnNob3QgZmlsZSBzaXplIGluIGJ5dGVzXG4gICAgICogQHBhcmFtIHNjcmVlbnNob3QgLSBCYXNlNjQgc2NyZWVuc2hvdCBkYXRhXG4gICAgICogQHJldHVybnMgRXN0aW1hdGVkIGZpbGUgc2l6ZSBpbiBieXRlc1xuICAgICAqL1xuICAgIGdldFNjcmVlbnNob3RTaXplKHNjcmVlbnNob3QpIHtcbiAgICAgICAgLy8gQmFzZTY0IGVuY29kaW5nIGluY3JlYXNlcyBzaXplIGJ5IH4zMyVcbiAgICAgICAgLy8gUmVtb3ZlIGRhdGEgVVJMIHByZWZpeCBpZiBwcmVzZW50XG4gICAgICAgIGNvbnN0IGJhc2U2NERhdGEgPSBzY3JlZW5zaG90LnJlcGxhY2UoL15kYXRhOmltYWdlXFwvW2Etel0rO2Jhc2U2NCwvLCAnJyk7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChiYXNlNjREYXRhLmxlbmd0aCAqIDMpIC8gNCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbXByZXNzIHNjcmVlbnNob3QgaWYgaXQncyB0b28gbGFyZ2VcbiAgICAgKiBAcGFyYW0gc2NyZWVuc2hvdCAtIEJhc2U2NCBzY3JlZW5zaG90IGRhdGFcbiAgICAgKiBAcGFyYW0gbWF4U2l6ZSAtIE1heGltdW0gc2l6ZSBpbiBieXRlcyAoZGVmYXVsdDogNTAwS0IpXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gY29tcHJlc3NlZCBzY3JlZW5zaG90XG4gICAgICovXG4gICAgYXN5bmMgY29tcHJlc3NJZk5lZWRlZChzY3JlZW5zaG90LCBtYXhTaXplID0gNTAwICogMTAyNCkge1xuICAgICAgICBjb25zdCBjdXJyZW50U2l6ZSA9IHRoaXMuZ2V0U2NyZWVuc2hvdFNpemUoc2NyZWVuc2hvdCk7XG4gICAgICAgIGlmIChjdXJyZW50U2l6ZSA8PSBtYXhTaXplKSB7XG4gICAgICAgICAgICByZXR1cm4gc2NyZWVuc2hvdDtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZWR1Y2UgcXVhbGl0eSBhbmQgdHJ5IGFnYWluXG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWRDb25maWcgPSB7XG4gICAgICAgICAgICAuLi50aGlzLmNvbmZpZyxcbiAgICAgICAgICAgIHF1YWxpdHk6IE1hdGgubWF4KDAuMywgdGhpcy5jb25maWcucXVhbGl0eSAqIDAuNylcbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXByZXNzZWQgPSBhd2FpdCB0aGlzLnJlc2l6ZVNjcmVlbnNob3Qoc2NyZWVuc2hvdCwgY29tcHJlc3NlZENvbmZpZyk7XG4gICAgICAgICAgICBjb25zdCBjb21wcmVzc2VkU2l6ZSA9IHRoaXMuZ2V0U2NyZWVuc2hvdFNpemUoY29tcHJlc3NlZCk7XG4gICAgICAgICAgICBpZiAoY29tcHJlc3NlZFNpemUgPD0gbWF4U2l6ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wcmVzc2VkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgc3RpbGwgdG9vIGxhcmdlLCByZWR1Y2UgZGltZW5zaW9uc1xuICAgICAgICAgICAgY29uc3QgZnVydGhlckNvbXByZXNzZWQgPSBhd2FpdCB0aGlzLnJlc2l6ZVNjcmVlbnNob3QoY29tcHJlc3NlZCwge1xuICAgICAgICAgICAgICAgIC4uLmNvbXByZXNzZWRDb25maWcsXG4gICAgICAgICAgICAgICAgbWF4V2lkdGg6IE1hdGguZmxvb3IoY29tcHJlc3NlZENvbmZpZy5tYXhXaWR0aCAqIDAuOCksXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiBNYXRoLmZsb29yKGNvbXByZXNzZWRDb25maWcubWF4SGVpZ2h0ICogMC44KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZnVydGhlckNvbXByZXNzZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1NjcmVlbnNob3RDYXB0dXJlOiBFcnJvciBjb21wcmVzc2luZyBzY3JlZW5zaG90OicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBzY3JlZW5zaG90OyAvLyBSZXR1cm4gb3JpZ2luYWwgaWYgY29tcHJlc3Npb24gZmFpbHNcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBTZWxlY3RvciBleHRyYWN0aW9uIHV0aWxpdHkgZm9yIHJvYnVzdCBlbGVtZW50IHRhcmdldGluZ1xuICogQGF1dGhvciBBeXVzaCBTaHVrbGFcbiAqIEBkZXNjcmlwdGlvbiBFeHRyYWN0cyBtdWx0aXBsZSBzZWxlY3RvciBzdHJhdGVnaWVzIGZvciByZWxpYWJsZSBlbGVtZW50IGZpbmRpbmcuXG4gKiBJbXBsZW1lbnRzIEludGVyZmFjZSBTZWdyZWdhdGlvbiBQcmluY2lwbGUgd2l0aCBmb2N1c2VkIHNlbGVjdG9yIHN0cmF0ZWdpZXMuXG4gKi9cbi8qKlxuICogQ1NTIHNlbGVjdG9yIGV4dHJhY3Rpb24gc3RyYXRlZ3lcbiAqL1xuY2xhc3MgQ3NzU2VsZWN0b3JTdHJhdGVneSB7XG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBDU1Mgc2VsZWN0b3IgZm9yIHRoZSBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIENTUyBzZWxlY3RvciBzdHJpbmcgb3IgbnVsbFxuICAgICAqL1xuICAgIGV4dHJhY3QoZWxlbWVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gVHJ5IElEIGZpcnN0IChoaWdoZXN0IHNwZWNpZmljaXR5KVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaWQgJiYgL15bYS16QS1aXVtcXHctXSokLy50ZXN0KGVsZW1lbnQuaWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWRTZWxlY3RvciA9IGAjJHtlbGVtZW50LmlkfWA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNVbmlxdWUoaWRTZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkU2VsZWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVHJ5IGRhdGEgYXR0cmlidXRlcyAoZ29vZCBmb3IgYXV0b21hdGlvbilcbiAgICAgICAgICAgIGNvbnN0IGRhdGFBdHRycyA9IFtcbiAgICAgICAgICAgICAgICBcImRhdGEtdGVzdGlkXCIsXG4gICAgICAgICAgICAgICAgXCJkYXRhLXRlc3RcIixcbiAgICAgICAgICAgICAgICBcImRhdGEtY3lcIixcbiAgICAgICAgICAgICAgICBcImRhdGEtYXV0b21hdGlvblwiLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiBkYXRhQXR0cnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhU2VsZWN0b3IgPSBgWyR7YXR0cn09XCIke3ZhbHVlfVwiXWA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVW5pcXVlKGRhdGFTZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhU2VsZWN0b3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUcnkgY2xhc3MtYmFzZWQgc2VsZWN0b3JcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xhc3NTZWxlY3RvciA9IGAuJHtBcnJheS5mcm9tKGVsZW1lbnQuY2xhc3NMaXN0KS5qb2luKFwiLlwiKX1gO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVW5pcXVlKGNsYXNzU2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbGFzc1NlbGVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRyeSB0YWcgKyBhdHRyaWJ1dGVzIGNvbWJpbmF0aW9uXG4gICAgICAgICAgICBjb25zdCB0YWdTZWxlY3RvciA9IHRoaXMuZ2VuZXJhdGVUYWdBdHRyaWJ1dGVTZWxlY3RvcihlbGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0YWdTZWxlY3RvciAmJiB0aGlzLmlzVW5pcXVlKHRhZ1NlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YWdTZWxlY3RvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZhbGwgYmFjayB0byBudGgtY2hpbGQgc2VsZWN0b3JcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRlTnRoQ2hpbGRTZWxlY3RvcihlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkNzc1NlbGVjdG9yU3RyYXRlZ3k6IEVycm9yIGV4dHJhY3Rpbmcgc2VsZWN0b3I6XCIsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBwcmlvcml0eSBvZiB0aGlzIHN0cmF0ZWd5IChoaWdoZXIgaXMgYmV0dGVyKVxuICAgICAqL1xuICAgIGdldFByaW9yaXR5KCkge1xuICAgICAgICByZXR1cm4gOTA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBzZWxlY3RvciBpcyB2YWxpZCBmb3IgdGhlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBDU1Mgc2VsZWN0b3IgdG8gdmFsaWRhdGVcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgc2VsZWN0b3IgaXMgdmFsaWRcbiAgICAgKi9cbiAgICBpc1ZhbGlkKHNlbGVjdG9yLCBlbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmb3VuZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgcmV0dXJuIGZvdW5kID09PSBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgc2VsZWN0b3IgcmV0dXJucyBvbmx5IG9uZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHNlbGVjdG9yIC0gQ1NTIHNlbGVjdG9yIHRvIGNoZWNrXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgc2VsZWN0b3IgaXMgdW5pcXVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBpc1VuaXF1ZShzZWxlY3Rvcikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLmxlbmd0aCA9PT0gMTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBzZWxlY3RvciBiYXNlZCBvbiB0YWcgYW5kIGF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgVGFnICsgYXR0cmlidXRlIHNlbGVjdG9yXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZW5lcmF0ZVRhZ0F0dHJpYnV0ZVNlbGVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgdGFnID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBbXTtcbiAgICAgICAgLy8gQ2hlY2sgdXNlZnVsIGF0dHJpYnV0ZXNcbiAgICAgICAgY29uc3QgdXNlZnVsQXR0cnMgPSBbXG4gICAgICAgICAgICBcIm5hbWVcIixcbiAgICAgICAgICAgIFwidHlwZVwiLFxuICAgICAgICAgICAgXCJ2YWx1ZVwiLFxuICAgICAgICAgICAgXCJwbGFjZWhvbGRlclwiLFxuICAgICAgICAgICAgXCJ0aXRsZVwiLFxuICAgICAgICAgICAgXCJyb2xlXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIixcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIHVzZWZ1bEF0dHJzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlLmxlbmd0aCA8IDUwKSB7XG4gICAgICAgICAgICAgICAgLy8gQXZvaWQgdmVyeSBsb25nIHZhbHVlc1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMucHVzaChgWyR7YXR0cn09XCIke3ZhbHVlfVwiXWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBgJHt0YWd9JHthdHRyaWJ1dGVzLmpvaW4oXCJcIil9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgbnRoLWNoaWxkIHNlbGVjdG9yIGFzIGxhc3QgcmVzb3J0XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIG50aC1jaGlsZCBzZWxlY3RvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2VuZXJhdGVOdGhDaGlsZFNlbGVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGF0aCA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBjdXJyZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaWJsaW5ncyA9IEFycmF5LmZyb20oY3VycmVudC5wYXJlbnRFbGVtZW50LmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdzLmluZGV4T2YoY3VycmVudCkgKyAxO1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yICs9IGA6bnRoLWNoaWxkKCR7aW5kZXh9KWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoLnVuc2hpZnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIC8vIExpbWl0IGRlcHRoIHRvIGF2b2lkIHZlcnkgbG9uZyBzZWxlY3RvcnNcbiAgICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+PSA1KVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oXCIgPiBcIik7XG4gICAgfVxufVxuLyoqXG4gKiBYUGF0aCBzZWxlY3RvciBleHRyYWN0aW9uIHN0cmF0ZWd5XG4gKi9cbmNsYXNzIFhQYXRoU2VsZWN0b3JTdHJhdGVneSB7XG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBYUGF0aCBzZWxlY3RvciBmb3IgdGhlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgWFBhdGggc2VsZWN0b3Igc3RyaW5nIG9yIG51bGxcbiAgICAgKi9cbiAgICBleHRyYWN0KGVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBbXTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gZWxlbWVudDtcbiAgICAgICAgICAgIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFnTmFtZSA9IGN1cnJlbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50LmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBJRCBmb3Igc2hvcnRlciBYUGF0aFxuICAgICAgICAgICAgICAgICAgICBwYXRoLnVuc2hpZnQoYC8vJHt0YWdOYW1lfVtAaWQ9JyR7Y3VycmVudC5pZH0nXWApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY3VycmVudC5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpYmxpbmdzID0gQXJyYXkuZnJvbShjdXJyZW50LnBhcmVudEVsZW1lbnQuY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzYW1lVGFnU2libGluZ3MgPSBzaWJsaW5ncy5maWx0ZXIoKGVsKSA9PiBlbC50YWdOYW1lID09PSBjdXJyZW50LnRhZ05hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2FtZVRhZ1NpYmxpbmdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC51bnNoaWZ0KGAvJHt0YWdOYW1lfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBzYW1lVGFnU2libGluZ3MuaW5kZXhPZihjdXJyZW50KSArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoLnVuc2hpZnQoYC8ke3RhZ05hbWV9WyR7aW5kZXh9XWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwYXRoLnVuc2hpZnQoYC8ke3RhZ05hbWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgLy8gTGltaXQgZGVwdGhcbiAgICAgICAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPj0gNilcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcGF0aC5sZW5ndGggPiAwID8gXCIvXCIgKyBwYXRoLmpvaW4oXCJcIikgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiWFBhdGhTZWxlY3RvclN0cmF0ZWd5OiBFcnJvciBleHRyYWN0aW5nIHNlbGVjdG9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcHJpb3JpdHkgb2YgdGhpcyBzdHJhdGVneVxuICAgICAqL1xuICAgIGdldFByaW9yaXR5KCkge1xuICAgICAgICByZXR1cm4gNzA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBYUGF0aCBzZWxlY3RvciBpcyB2YWxpZCBmb3IgdGhlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBYUGF0aCBzZWxlY3RvciB0byB2YWxpZGF0ZVxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBzZWxlY3RvciBpcyB2YWxpZFxuICAgICAqL1xuICAgIGlzVmFsaWQoc2VsZWN0b3IsIGVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGRvY3VtZW50LmV2YWx1YXRlKHNlbGVjdG9yLCBkb2N1bWVudCwgbnVsbCwgWFBhdGhSZXN1bHQuRklSU1RfT1JERVJFRF9OT0RFX1RZUEUsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5zaW5nbGVOb2RlVmFsdWUgPT09IGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIFRleHQtYmFzZWQgc2VsZWN0b3IgZXh0cmFjdGlvbiBzdHJhdGVneVxuICovXG5jbGFzcyBUZXh0U2VsZWN0b3JTdHJhdGVneSB7XG4gICAgLyoqXG4gICAgICogRXh0cmFjdCB0ZXh0LWJhc2VkIHNlbGVjdG9yIGZvciB0aGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyBUZXh0IHNlbGVjdG9yIHN0cmluZyBvciBudWxsXG4gICAgICovXG4gICAgZXh0cmFjdChlbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgaWYgKCF0ZXh0IHx8IHRleHQubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIFNraXAgdmVyeSBsb25nIHRleHQgb3IgZW1wdHkgZWxlbWVudHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRleHQgaXMgdW5pcXVlXG4gICAgICAgICAgICBjb25zdCB4cGF0aCA9IGAvLypbbm9ybWFsaXplLXNwYWNlKHRleHQoKSk9JyR7dGV4dC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIil9J11gO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZG9jdW1lbnQuZXZhbHVhdGUoeHBhdGgsIGRvY3VtZW50LCBudWxsLCBYUGF0aFJlc3VsdC5PUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRSwgbnVsbCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnNuYXBzaG90TGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGB0ZXh0PSR7dGV4dH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVHJ5IHBhcnRpYWwgdGV4dCBtYXRjaCBmb3IgbG9uZ2VyIHRleHRcbiAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDEwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydGlhbFRleHQgPSB0ZXh0LnNsaWNlKDAsIDIwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWFsWHBhdGggPSBgLy8qW2NvbnRhaW5zKG5vcm1hbGl6ZS1zcGFjZSh0ZXh0KCkpLCcke3BhcnRpYWxUZXh0LnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKX0nKV1gO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpYWxSZXN1bHQgPSBkb2N1bWVudC5ldmFsdWF0ZShwYXJ0aWFsWHBhdGgsIGRvY3VtZW50LCBudWxsLCBYUGF0aFJlc3VsdC5PUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRpYWxSZXN1bHQuc25hcHNob3RMZW5ndGggPD0gMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYHRleHQqPSR7cGFydGlhbFRleHR9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRleHRTZWxlY3RvclN0cmF0ZWd5OiBFcnJvciBleHRyYWN0aW5nIHNlbGVjdG9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcHJpb3JpdHkgb2YgdGhpcyBzdHJhdGVneVxuICAgICAqL1xuICAgIGdldFByaW9yaXR5KCkge1xuICAgICAgICByZXR1cm4gNjA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSB0ZXh0IHNlbGVjdG9yIGlzIHZhbGlkIGZvciB0aGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSBzZWxlY3RvciAtIFRleHQgc2VsZWN0b3IgdG8gdmFsaWRhdGVcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgc2VsZWN0b3IgaXMgdmFsaWRcbiAgICAgKi9cbiAgICBpc1ZhbGlkKHNlbGVjdG9yLCBlbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgaWYgKCF0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5zdGFydHNXaXRoKFwidGV4dD1cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dCA9PT0gc2VsZWN0b3Iuc3Vic3RyaW5nKDUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2VsZWN0b3Iuc3RhcnRzV2l0aChcInRleHQqPVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0LmluY2x1ZGVzKHNlbGVjdG9yLnN1YnN0cmluZyg2KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEFSSUEvUm9sZS1iYXNlZCBzZWxlY3RvciBleHRyYWN0aW9uIHN0cmF0ZWd5XG4gKi9cbmNsYXNzIFJvbGVTZWxlY3RvclN0cmF0ZWd5IHtcbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IHJvbGUtYmFzZWQgc2VsZWN0b3IgZm9yIHRoZSBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIFJvbGUgc2VsZWN0b3Igc3RyaW5nIG9yIG51bGxcbiAgICAgKi9cbiAgICBleHRyYWN0KGVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJvbGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcInJvbGVcIik7XG4gICAgICAgICAgICBjb25zdCBhcmlhTGFiZWwgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIik7XG4gICAgICAgICAgICBjb25zdCBhcmlhTGFiZWxsZWRieSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbGxlZGJ5XCIpO1xuICAgICAgICAgICAgaWYgKHJvbGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgcm9sZVNlbGVjdG9yID0gYFtyb2xlPVwiJHtyb2xlfVwiXWA7XG4gICAgICAgICAgICAgICAgaWYgKGFyaWFMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICByb2xlU2VsZWN0b3IgKz0gYFthcmlhLWxhYmVsPVwiJHthcmlhTGFiZWx9XCJdYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBzZWxlY3RvciBpcyB1bmlxdWVcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChyb2xlU2VsZWN0b3IpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9sZVNlbGVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBpbXBsaWNpdCByb2xlc1xuICAgICAgICAgICAgY29uc3QgaW1wbGljaXRSb2xlID0gdGhpcy5nZXRJbXBsaWNpdFJvbGUoZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAoaW1wbGljaXRSb2xlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGByb2xlPSR7aW1wbGljaXRSb2xlfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlJvbGVTZWxlY3RvclN0cmF0ZWd5OiBFcnJvciBleHRyYWN0aW5nIHNlbGVjdG9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcHJpb3JpdHkgb2YgdGhpcyBzdHJhdGVneVxuICAgICAqL1xuICAgIGdldFByaW9yaXR5KCkge1xuICAgICAgICByZXR1cm4gODA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSByb2xlIHNlbGVjdG9yIGlzIHZhbGlkIGZvciB0aGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSBzZWxlY3RvciAtIFJvbGUgc2VsZWN0b3IgdG8gdmFsaWRhdGVcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgc2VsZWN0b3IgaXMgdmFsaWRcbiAgICAgKi9cbiAgICBpc1ZhbGlkKHNlbGVjdG9yLCBlbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3Iuc3RhcnRzV2l0aChcInJvbGU9XCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRSb2xlID0gc2VsZWN0b3Iuc3Vic3RyaW5nKDUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdHVhbFJvbGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcInJvbGVcIikgfHwgdGhpcy5nZXRJbXBsaWNpdFJvbGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdHVhbFJvbGUgPT09IGV4cGVjdGVkUm9sZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZvdW5kID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICByZXR1cm4gZm91bmQgPT09IGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGltcGxpY2l0IEFSSUEgcm9sZSBmb3IgY29tbW9uIGVsZW1lbnRzXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIEltcGxpY2l0IHJvbGUgb3IgbnVsbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0SW1wbGljaXRSb2xlKGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAvLyBIYW5kbGUgaW5wdXQgZWxlbWVudHMgc3BlY2lhbGx5XG4gICAgICAgIGlmICh0YWdOYW1lID09PSBcImlucHV0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldElucHV0Um9sZShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb2xlTWFwID0ge1xuICAgICAgICAgICAgYnV0dG9uOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgYTogXCJsaW5rXCIsXG4gICAgICAgICAgICB0ZXh0YXJlYTogXCJ0ZXh0Ym94XCIsXG4gICAgICAgICAgICBzZWxlY3Q6IFwiY29tYm9ib3hcIixcbiAgICAgICAgICAgIGltZzogXCJpbWdcIixcbiAgICAgICAgICAgIGgxOiBcImhlYWRpbmdcIixcbiAgICAgICAgICAgIGgyOiBcImhlYWRpbmdcIixcbiAgICAgICAgICAgIGgzOiBcImhlYWRpbmdcIixcbiAgICAgICAgICAgIGg0OiBcImhlYWRpbmdcIixcbiAgICAgICAgICAgIGg1OiBcImhlYWRpbmdcIixcbiAgICAgICAgICAgIGg2OiBcImhlYWRpbmdcIixcbiAgICAgICAgICAgIG5hdjogXCJuYXZpZ2F0aW9uXCIsXG4gICAgICAgICAgICBtYWluOiBcIm1haW5cIixcbiAgICAgICAgICAgIGhlYWRlcjogXCJiYW5uZXJcIixcbiAgICAgICAgICAgIGZvb3RlcjogXCJjb250ZW50aW5mb1wiLFxuICAgICAgICAgICAgYXNpZGU6IFwiY29tcGxlbWVudGFyeVwiLFxuICAgICAgICAgICAgc2VjdGlvbjogXCJyZWdpb25cIixcbiAgICAgICAgICAgIGFydGljbGU6IFwiYXJ0aWNsZVwiLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcm9sZU1hcFt0YWdOYW1lXSB8fCBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcm9sZSBmb3IgaW5wdXQgZWxlbWVudHMgYmFzZWQgb24gdHlwZVxuICAgICAqIEBwYXJhbSBpbnB1dCAtIElucHV0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyBJbnB1dCByb2xlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRJbnB1dFJvbGUoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IChpbnB1dC50eXBlIHx8IFwidGV4dFwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBpbnB1dFJvbGVzID0ge1xuICAgICAgICAgICAgYnV0dG9uOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgc3VibWl0OiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgcmVzZXQ6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBjaGVja2JveDogXCJjaGVja2JveFwiLFxuICAgICAgICAgICAgcmFkaW86IFwicmFkaW9cIixcbiAgICAgICAgICAgIHRleHQ6IFwidGV4dGJveFwiLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IFwidGV4dGJveFwiLFxuICAgICAgICAgICAgZW1haWw6IFwidGV4dGJveFwiLFxuICAgICAgICAgICAgc2VhcmNoOiBcInNlYXJjaGJveFwiLFxuICAgICAgICAgICAgdGVsOiBcInRleHRib3hcIixcbiAgICAgICAgICAgIHVybDogXCJ0ZXh0Ym94XCIsXG4gICAgICAgICAgICBudW1iZXI6IFwic3BpbmJ1dHRvblwiLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gaW5wdXRSb2xlc1t0eXBlXSB8fCBcInRleHRib3hcIjtcbiAgICB9XG59XG4vKipcbiAqIE1haW4gc2VsZWN0b3IgZXh0cmFjdG9yIGNsYXNzIHRoYXQgY29vcmRpbmF0ZXMgbXVsdGlwbGUgc3RyYXRlZ2llc1xuICogRm9sbG93cyBTaW5nbGUgUmVzcG9uc2liaWxpdHkgUHJpbmNpcGxlIGFuZCBTdHJhdGVneSBQYXR0ZXJuXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWxlY3RvckV4dHJhY3RvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuc3RyYXRlZ2llcyA9IFtcbiAgICAgICAgICAgIG5ldyBDc3NTZWxlY3RvclN0cmF0ZWd5KCksXG4gICAgICAgICAgICBuZXcgWFBhdGhTZWxlY3RvclN0cmF0ZWd5KCksXG4gICAgICAgICAgICBuZXcgVGV4dFNlbGVjdG9yU3RyYXRlZ3koKSxcbiAgICAgICAgICAgIG5ldyBSb2xlU2VsZWN0b3JTdHJhdGVneSgpLFxuICAgICAgICBdLnNvcnQoKGEsIGIpID0+IGIuZ2V0UHJpb3JpdHkoKSAtIGEuZ2V0UHJpb3JpdHkoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgbXVsdGlwbGUgc2VsZWN0b3JzIGZvciBhbiBlbGVtZW50IHVzaW5nIGFsbCBzdHJhdGVnaWVzXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudCB0byBleHRyYWN0IHNlbGVjdG9ycyBmb3JcbiAgICAgKiBAcmV0dXJucyBBcnJheSBvZiBlbGVtZW50IHNlbGVjdG9ycyB3aXRoIGNvbmZpZGVuY2Ugc2NvcmVzXG4gICAgICovXG4gICAgZXh0cmFjdFNlbGVjdG9ycyhlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtdO1xuICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IHRoaXMuZ2V0Qm91bmRpbmdCb3goZWxlbWVudCk7XG4gICAgICAgIC8vIEV4dHJhY3Qgc2VsZWN0b3JzIHVzaW5nIGVhY2ggc3RyYXRlZ3lcbiAgICAgICAgZm9yIChjb25zdCBzdHJhdGVneSBvZiB0aGlzLnN0cmF0ZWdpZXMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBzdHJhdGVneS5leHRyYWN0KGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWRlbmNlID0gdGhpcy5jYWxjdWxhdGVDb25maWRlbmNlKHNlbGVjdG9yLCBlbGVtZW50LCBzdHJhdGVneSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTZWxlY3RvciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZGVuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZGluZ0JveCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXNzaWduIHNlbGVjdG9yIHRvIGFwcHJvcHJpYXRlIHByb3BlcnR5IGJhc2VkIG9uIHN0cmF0ZWd5XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHJhdGVneSBpbnN0YW5jZW9mIENzc1NlbGVjdG9yU3RyYXRlZ3kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTZWxlY3Rvci5jc3MgPSBzZWxlY3RvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdHJhdGVneSBpbnN0YW5jZW9mIFhQYXRoU2VsZWN0b3JTdHJhdGVneSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFNlbGVjdG9yLnhwYXRoID0gc2VsZWN0b3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RyYXRlZ3kgaW5zdGFuY2VvZiBUZXh0U2VsZWN0b3JTdHJhdGVneSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFNlbGVjdG9yLnRleHQgPSBzZWxlY3RvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdHJhdGVneSBpbnN0YW5jZW9mIFJvbGVTZWxlY3RvclN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50U2VsZWN0b3Iucm9sZSA9IHNlbGVjdG9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBlbGVtZW50IGF0dHJpYnV0ZXMgZm9yIGFkZGl0aW9uYWwgdmVyaWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTZWxlY3Rvci5hdHRyaWJ1dGVzID0gdGhpcy5leHRyYWN0UmVsZXZhbnRBdHRyaWJ1dGVzKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcnMucHVzaChlbGVtZW50U2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlNlbGVjdG9yRXh0cmFjdG9yOiBFcnJvciB3aXRoIHN0cmF0ZWd5OlwiLCBzdHJhdGVneS5jb25zdHJ1Y3Rvci5uYW1lLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgbm8gc2VsZWN0b3JzIHdlcmUgZm91bmQsIGNyZWF0ZSBhIGJhc2ljIGZhbGxiYWNrXG4gICAgICAgIGlmIChzZWxlY3RvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzZWxlY3RvcnMucHVzaCh0aGlzLmNyZWF0ZUZhbGxiYWNrU2VsZWN0b3IoZWxlbWVudCwgYm91bmRpbmdCb3gpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VsZWN0b3JzLnNvcnQoKGEsIGIpID0+IChiLmNvbmZpZGVuY2UgfHwgMCkgLSAoYS5jb25maWRlbmNlIHx8IDApKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIGNvbmZpZGVuY2Ugc2NvcmUgZm9yIGEgc2VsZWN0b3JcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBUaGUgc2VsZWN0b3Igc3RyaW5nXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSBzdHJhdGVneSAtIFN0cmF0ZWd5IHVzZWQgdG8gZXh0cmFjdCB0aGUgc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyBDb25maWRlbmNlIHNjb3JlICgwLTEwMClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGNhbGN1bGF0ZUNvbmZpZGVuY2Uoc2VsZWN0b3IsIGVsZW1lbnQsIHN0cmF0ZWd5KSB7XG4gICAgICAgIGxldCBjb25maWRlbmNlID0gc3RyYXRlZ3kuZ2V0UHJpb3JpdHkoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEJvbnVzIGZvciBJRC1iYXNlZCBzZWxlY3RvcnNcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5pbmNsdWRlcyhcIiNcIikgJiYgZWxlbWVudC5pZCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2UgKz0gNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEJvbnVzIGZvciBkYXRhIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5pbmNsdWRlcyhcImRhdGEtXCIpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZSArPSAzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGVuYWx0eSBmb3IgdmVyeSBsb25nIHNlbGVjdG9yc1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2UgLT0gMTA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBCb251cyBmb3Igc2hvcnQsIHNpbXBsZSBzZWxlY3RvcnNcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5sZW5ndGggPCAzMCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2UgKz0gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFZlcmlmeSB0aGUgc2VsZWN0b3IgYWN0dWFsbHkgd29ya3NcbiAgICAgICAgICAgIGlmIChzdHJhdGVneS5pc1ZhbGlkKHNlbGVjdG9yLCBlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2UgKz0gNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2UgLT0gMjA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25maWRlbmNlIC09IDE1O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIGNvbmZpZGVuY2UpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kaW5nIGJveCBmb3IgYW4gZWxlbWVudFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyBCb3VuZGluZyBib3ggY29vcmRpbmF0ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldEJvdW5kaW5nQm94KGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiByZWN0LmxlZnQgKyB3aW5kb3cuc2Nyb2xsWCxcbiAgICAgICAgICAgIHk6IHJlY3QudG9wICsgd2luZG93LnNjcm9sbFksXG4gICAgICAgICAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgcmVsZXZhbnQgYXR0cmlidXRlcyBmcm9tIGFuIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgT2JqZWN0IHdpdGggcmVsZXZhbnQgYXR0cmlidXRlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZXh0cmFjdFJlbGV2YW50QXR0cmlidXRlcyhlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgY29uc3QgcmVsZXZhbnRBdHRycyA9IFtcbiAgICAgICAgICAgIFwiaWRcIixcbiAgICAgICAgICAgIFwiY2xhc3NcIixcbiAgICAgICAgICAgIFwibmFtZVwiLFxuICAgICAgICAgICAgXCJ0eXBlXCIsXG4gICAgICAgICAgICBcInZhbHVlXCIsXG4gICAgICAgICAgICBcInBsYWNlaG9sZGVyXCIsXG4gICAgICAgICAgICBcInRpdGxlXCIsXG4gICAgICAgICAgICBcInJvbGVcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiLFxuICAgICAgICAgICAgXCJkYXRhLXRlc3RpZFwiLFxuICAgICAgICAgICAgXCJkYXRhLXRlc3RcIixcbiAgICAgICAgICAgIFwiaHJlZlwiLFxuICAgICAgICAgICAgXCJzcmNcIixcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIHJlbGV2YW50QXR0cnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzW2F0dHJdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHRhZyBuYW1lIGZvciByZWZlcmVuY2VcbiAgICAgICAgYXR0cmlidXRlc1tcInRhZ05hbWVcIl0gPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGZhbGxiYWNrIHNlbGVjdG9yIHdoZW4gYWxsIHN0cmF0ZWdpZXMgZmFpbFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gYm91bmRpbmdCb3ggLSBFbGVtZW50IGJvdW5kaW5nIGJveFxuICAgICAqIEByZXR1cm5zIEZhbGxiYWNrIGVsZW1lbnQgc2VsZWN0b3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGNyZWF0ZUZhbGxiYWNrU2VsZWN0b3IoZWxlbWVudCwgYm91bmRpbmdCb3gpIHtcbiAgICAgICAgY29uc3QgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpLnNsaWNlKDAsIDMwKSB8fCBcIlwiO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY3NzOiB0YWdOYW1lLFxuICAgICAgICAgICAgdGV4dDogdGV4dCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0aGlzLmV4dHJhY3RSZWxldmFudEF0dHJpYnV0ZXMoZWxlbWVudCksXG4gICAgICAgICAgICBib3VuZGluZ0JveCxcbiAgICAgICAgICAgIGNvbmZpZGVuY2U6IDEwLCAvLyBMb3cgY29uZmlkZW5jZSBmb3IgZmFsbGJhY2tcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb250ZW50IHNjcmlwdCBmb3IgQXV0b0Zsb3cgU3R1ZGlvXG4gKiBAYXV0aG9yIEF5dXNoIFNodWtsYVxuICogQGRlc2NyaXB0aW9uIE1haW4gY29udGVudCBzY3JpcHQgdGhhdCBoYW5kbGVzIERPTSBldmVudCByZWNvcmRpbmcsIHNlbGVjdG9yIGV4dHJhY3Rpb24sXG4gKiBhbmQgc2NyZWVuc2hvdCBjYXB0dXJlLiBGb2xsb3dzIFNPTElEIHByaW5jaXBsZXMgZm9yIG1haW50YWluYWJsZSBjb2RlLlxuICovXG5pbXBvcnQgeyBTZWxlY3RvckV4dHJhY3RvciB9IGZyb20gXCIuLi91dGlscy9zZWxlY3Rvci1leHRyYWN0b3JcIjtcbmltcG9ydCB7IFNjcmVlbnNob3RDYXB0dXJlIH0gZnJvbSBcIi4uL3V0aWxzL3NjcmVlbnNob3QtY2FwdHVyZVwiO1xuaW1wb3J0IHsgRXZlbnRSZWNvcmRlciB9IGZyb20gXCIuLi91dGlscy9ldmVudC1yZWNvcmRlclwiO1xuLyoqXG4gKiBNYWluIGNvbnRlbnQgc2NyaXB0IGNsYXNzIGZvbGxvd2luZyBTaW5nbGUgUmVzcG9uc2liaWxpdHkgUHJpbmNpcGxlXG4gKiBIYW5kbGVzIGNvb3JkaW5hdGlvbiBiZXR3ZWVuIGRpZmZlcmVudCByZWNvcmRpbmcgY29tcG9uZW50c1xuICovXG5jbGFzcyBBdXRvRmxvd0NvbnRlbnRTY3JpcHQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIGNvbnRlbnQgc2NyaXB0IHdpdGggYWxsIGRlcGVuZGVuY2llc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmlzUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVjb3JkaW5nU2Vzc2lvbklkID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGVwQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuc3RlcENvdW50ZXJTeW5jSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB0aGlzLnNlbGVjdG9yRXh0cmFjdG9yID0gbmV3IFNlbGVjdG9yRXh0cmFjdG9yKCk7XG4gICAgICAgIHRoaXMuc2NyZWVuc2hvdENhcHR1cmUgPSBuZXcgU2NyZWVuc2hvdENhcHR1cmUoKTtcbiAgICAgICAgdGhpcy5ldmVudFJlY29yZGVyID0gbmV3IEV2ZW50UmVjb3JkZXIoKTtcbiAgICAgICAgdGhpcy5zZXR1cEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuc2V0dXBNZXNzYWdlSGFuZGxlcnMoKTtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplUmVjb3JkaW5nU3RhdGUoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IHVwIERPTSBldmVudCBsaXN0ZW5lcnMgZm9yIHJlY29yZGluZyB1c2VyIGludGVyYWN0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2V0dXBFdmVudExpc3RlbmVycygpIHtcbiAgICAgICAgLy8gQ2xpY2sgZXZlbnRzXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmhhbmRsZUNsaWNrRXZlbnQuYmluZCh0aGlzKSwge1xuICAgICAgICAgICAgY2FwdHVyZTogdHJ1ZSxcbiAgICAgICAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBJbnB1dCBldmVudHMgKHR5cGluZywgZm9ybSBmaWxsaW5nKVxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGhpcy5oYW5kbGVJbnB1dEV2ZW50LmJpbmQodGhpcyksIHtcbiAgICAgICAgICAgIGNhcHR1cmU6IHRydWUsXG4gICAgICAgICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gTmF2aWdhdGlvbiBldmVudHNcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJiZWZvcmV1bmxvYWRcIiwgdGhpcy5oYW5kbGVOYXZpZ2F0aW9uRXZlbnQuYmluZCh0aGlzKSk7XG4gICAgICAgIC8vIFNjcm9sbCBldmVudHMgKHRocm90dGxlZCBmb3IgcGVyZm9ybWFuY2UpXG4gICAgICAgIGxldCBzY3JvbGxUaW1lb3V0O1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzY3JvbGxUaW1lb3V0KTtcbiAgICAgICAgICAgIHNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMuaGFuZGxlU2Nyb2xsRXZlbnQuYmluZCh0aGlzKSwgMTUwKTtcbiAgICAgICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgICAgICAvLyBGb3JtIHN1Ym1pc3Npb24gZXZlbnRzXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy5oYW5kbGVTdWJtaXRFdmVudC5iaW5kKHRoaXMpLCB7XG4gICAgICAgICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgICAgICAgcGFzc2l2ZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEZvY3VzIGV2ZW50cyBmb3IgZm9ybSBmaWVsZCBkZXRlY3Rpb25cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMuaGFuZGxlRm9jdXNFdmVudC5iaW5kKHRoaXMpLCB7XG4gICAgICAgICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgICAgICAgcGFzc2l2ZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCB1cCBtZXNzYWdlIGhhbmRsZXJzIGZvciBjb21tdW5pY2F0aW9uIHdpdGggYmFja2dyb3VuZCBzY3JpcHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNldHVwTWVzc2FnZUhhbmRsZXJzKCkge1xuICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlc1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSByZWNvcmRpbmcgc3RhdGUgZnJvbSBzdG9yYWdlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBpbml0aWFsaXplUmVjb3JkaW5nU3RhdGUoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1xuICAgICAgICAgICAgICAgIFwiaXNSZWNvcmRpbmdcIixcbiAgICAgICAgICAgICAgICBcInJlY29yZGluZ1Nlc3Npb25JZFwiLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB0aGlzLmlzUmVjb3JkaW5nID0gcmVzdWx0LmlzUmVjb3JkaW5nIHx8IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5yZWNvcmRpbmdTZXNzaW9uSWQgPSByZXN1bHQucmVjb3JkaW5nU2Vzc2lvbklkIHx8IG51bGw7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlY29yZGluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1JlY29yZGluZ0luZGljYXRvcigpLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXV0b0Zsb3c6IEVycm9yIHNob3dpbmcgcmVjb3JkaW5nIGluZGljYXRvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIEFsc28gc3RhcnQgc3RlcCBjb3VudGVyIHN5bmMgZm9yIHJlc3RvcmVkIHJlY29yZGluZyBzdGF0ZVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRTdGVwQ291bnRlclN5bmMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRvRmxvdzogRmFpbGVkIHRvIGluaXRpYWxpemUgcmVjb3JkaW5nIHN0YXRlOlwiLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZGxlIG1lc3NhZ2VzIGZyb20gYmFja2dyb3VuZCBzY3JpcHQgb3IgcG9wdXBcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICogQHBhcmFtIHNlbmRlciAtIE1lc3NhZ2Ugc2VuZGVyIGluZm9ybWF0aW9uXG4gICAgICogQHBhcmFtIHNlbmRSZXNwb25zZSAtIFJlc3BvbnNlIGNhbGxiYWNrXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVEFSVF9SRUNPUkRJTkdcIjpcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zdGFydFJlY29yZGluZyhtZXNzYWdlLnNlc3Npb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVE9QX1JFQ09SRElOR1wiOlxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnN0b3BSZWNvcmRpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdFVF9SRUNPUkRJTkdfU1RBVEVcIjpcbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUmVjb3JkaW5nOiB0aGlzLmlzUmVjb3JkaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkOiB0aGlzLnJlY29yZGluZ1Nlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb3VudDogdGhpcy5zdGVwQ291bnRlcixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDQVBUVVJFX1NDUkVFTlNIT1RcIjpcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2NyZWVuc2hvdCA9IGF3YWl0IHRoaXMuc2NyZWVuc2hvdENhcHR1cmUuY2FwdHVyZVZpc2libGUoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc2NyZWVuc2hvdCB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkVYVFJBQ1RfU0VMRUNUT1JTXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IHRoaXMuc2VsZWN0b3JFeHRyYWN0b3IuZXh0cmFjdFNlbGVjdG9ycyhtZXNzYWdlLmVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzZWxlY3RvcnMgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIEJhY2tncm91bmQgdXNlcyB0aGlzIHRvIGRldGVjdCBpZiBzaWRlYmFyIHNjcmlwdCBpcyBwcmVzZW50XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNJREVCQVJfU1RBVFVTXCI6XG4gICAgICAgICAgICAgICAgICAgIC8vIEZvcndhcmQgdG8gc2lkZWJhciBpZiBwcmVzZW50OyBvdGhlcndpc2UgcmVwb3J0IG5vdCBpbmplY3RlZFxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyB0eXBlOiBcIlNJREVCQVJfU1RBVFVTXCIgfSwgKHJlc3ApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcCAmJiB0eXBlb2YgcmVzcC5pbmplY3RlZCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UocmVzcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBpbmplY3RlZDogZmFsc2UsIHNpZGViYXJBY3RpdmU6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IGluamVjdGVkOiBmYWxzZSwgc2lkZWJhckFjdGl2ZTogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkhJREVfUkVDT1JESU5HX0lORElDQVRPUlwiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGVSZWNvcmRpbmdJbmRpY2F0b3IoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgLy8gU2lsZW50bHkgaWdub3JlIHVua25vd24gbWVzc2FnZSB0eXBlcyB0byBhdm9pZCBjb25zb2xlIG5vaXNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dG9GbG93OiBFcnJvciBoYW5kbGluZyBtZXNzYWdlOlwiLCBlcnJvcik7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBlcnJvcjogZXJyb3I/Lm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCIgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgcmVjb3JkaW5nIHVzZXIgaW50ZXJhY3Rpb25zXG4gICAgICogQHBhcmFtIHNlc3Npb25JZCAtIFVuaXF1ZSBzZXNzaW9uIGlkZW50aWZpZXJcbiAgICAgKi9cbiAgICBhc3luYyBzdGFydFJlY29yZGluZyhzZXNzaW9uSWQpIHtcbiAgICAgICAgdGhpcy5pc1JlY29yZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMucmVjb3JkaW5nU2Vzc2lvbklkID0gc2Vzc2lvbklkO1xuICAgICAgICB0aGlzLnN0ZXBDb3VudGVyID0gMDtcbiAgICAgICAgLy8gU3RvcmUgcmVjb3JkaW5nIHN0YXRlXG4gICAgICAgIGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgICAgICBpc1JlY29yZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIHJlY29yZGluZ1Nlc3Npb25JZDogc2Vzc2lvbklkLFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2hvdyB2aXN1YWwgaW5kaWNhdG9yXG4gICAgICAgIHRoaXMuc2hvd1JlY29yZGluZ0luZGljYXRvcigpLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dG9GbG93OiBFcnJvciBzaG93aW5nIHJlY29yZGluZyBpbmRpY2F0b3I6XCIsIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFN0YXJ0IHBlcmlvZGljIHN0ZXAgY291bnRlciBzeW5jXG4gICAgICAgIHRoaXMuc3RhcnRTdGVwQ291bnRlclN5bmMoKTtcbiAgICAgICAgLy8gUmVjb3JkIGluaXRpYWwgcGFnZSBzdGF0ZVxuICAgICAgICBhd2FpdCB0aGlzLnJlY29yZFBhZ2VMb2FkKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQXV0b0Zsb3c6IFJlY29yZGluZyBzdGFydGVkIGZvciBzZXNzaW9uOlwiLCBzZXNzaW9uSWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdG9wIHJlY29yZGluZyB1c2VyIGludGVyYWN0aW9uc1xuICAgICAqL1xuICAgIGFzeW5jIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgICAgIHRoaXMuaXNSZWNvcmRpbmcgPSBmYWxzZTtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbklkID0gdGhpcy5yZWNvcmRpbmdTZXNzaW9uSWQ7XG4gICAgICAgIHRoaXMucmVjb3JkaW5nU2Vzc2lvbklkID0gbnVsbDtcbiAgICAgICAgLy8gQ2xlYXIgcmVjb3JkaW5nIHN0YXRlXG4gICAgICAgIGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLnJlbW92ZShbXCJpc1JlY29yZGluZ1wiLCBcInJlY29yZGluZ1Nlc3Npb25JZFwiXSk7XG4gICAgICAgIC8vIEhpZGUgdmlzdWFsIGluZGljYXRvclxuICAgICAgICB0aGlzLmhpZGVSZWNvcmRpbmdJbmRpY2F0b3IoKTtcbiAgICAgICAgLy8gU3RvcCBwZXJpb2RpYyBzdGVwIGNvdW50ZXIgc3luY1xuICAgICAgICB0aGlzLnN0b3BTdGVwQ291bnRlclN5bmMoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJBdXRvRmxvdzogUmVjb3JkaW5nIHN0b3BwZWQgZm9yIHNlc3Npb246XCIsIHNlc3Npb25JZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBjbGljayBldmVudHMgb24gdGhlIHBhZ2VcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBUaGUgY2xpY2sgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGhhbmRsZUNsaWNrRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUmVjb3JkaW5nIHx8ICFldmVudC50YXJnZXQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIC8vIFNraXAgY2xpY2tzIG9uIHRoZSByZWNvcmRpbmcgaW5kaWNhdG9yXG4gICAgICAgIGlmIChlbGVtZW50LmNsb3Nlc3QoXCIuYXV0b2Zsb3ctcmVjb3JkaW5nLWluZGljYXRvclwiKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEhpZ2hsaWdodCB0aGUgY2xpY2tlZCBlbGVtZW50XG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0gYXdhaXQgdGhpcy5jcmVhdGVUcmFjZVN0ZXAoZWxlbWVudCwgXCJjbGlja1wiLCBldmVudCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVUcmFjZVN0ZXAoc3RlcCk7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdmlzdWFsIGZlZWRiYWNrXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0ZXBDb3VudGVyKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkF1dG9GbG93OiBDbGljayByZWNvcmRlZDpcIiwge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQudGFnTmFtZSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBlbGVtZW50LnRleHRDb250ZW50Py5zbGljZSgwLCA1MCksXG4gICAgICAgICAgICAgICAgc3RlcDogdGhpcy5zdGVwQ291bnRlcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dG9GbG93OiBFcnJvciByZWNvcmRpbmcgY2xpY2sgZXZlbnQ6XCIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgaW5wdXQgZXZlbnRzICh0eXBpbmcsIGZvcm0gZmlsbGluZylcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBUaGUgaW5wdXQgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGhhbmRsZUlucHV0RXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUmVjb3JkaW5nIHx8ICFldmVudC50YXJnZXQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIC8vIE9ubHkgcmVjb3JkIGNlcnRhaW4gaW5wdXQgdHlwZXNcbiAgICAgICAgY29uc3QgcmVjb3JkYWJsZVR5cGVzID0gW1xuICAgICAgICAgICAgXCJ0ZXh0XCIsXG4gICAgICAgICAgICBcImVtYWlsXCIsXG4gICAgICAgICAgICBcInBhc3N3b3JkXCIsXG4gICAgICAgICAgICBcInNlYXJjaFwiLFxuICAgICAgICAgICAgXCJ0ZWxcIixcbiAgICAgICAgICAgIFwidXJsXCIsXG4gICAgICAgIF07XG4gICAgICAgIGlmIChlbGVtZW50LnR5cGUgJiYgIXJlY29yZGFibGVUeXBlcy5pbmNsdWRlcyhlbGVtZW50LnR5cGUpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gSGlnaGxpZ2h0IHRoZSBpbnB1dCBlbGVtZW50XG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0gYXdhaXQgdGhpcy5jcmVhdGVUcmFjZVN0ZXAoZWxlbWVudCwgXCJpbnB1dFwiLCBldmVudCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVUcmFjZVN0ZXAoc3RlcCk7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdmlzdWFsIGZlZWRiYWNrXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0ZXBDb3VudGVyKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkF1dG9GbG93OiBJbnB1dCByZWNvcmRlZDpcIiwge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQudGFnTmFtZSxcbiAgICAgICAgICAgICAgICB0eXBlOiBlbGVtZW50LnR5cGUsXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGVsZW1lbnQucGxhY2Vob2xkZXIsXG4gICAgICAgICAgICAgICAgc3RlcDogdGhpcy5zdGVwQ291bnRlcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dG9GbG93OiBFcnJvciByZWNvcmRpbmcgaW5wdXQgZXZlbnQ6XCIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2Nyb2xsIGV2ZW50cyBvbiB0aGUgcGFnZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgaGFuZGxlU2Nyb2xsRXZlbnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1JlY29yZGluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFN0ZXAgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVTdGVwSWQoKSxcbiAgICAgICAgICAgICAgICB0YWJJZDogYXdhaXQgdGhpcy5nZXRDdXJyZW50VGFiSWQoKSxcbiAgICAgICAgICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJzY3JvbGxcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RvcnM6IFtdLFxuICAgICAgICAgICAgICAgIHNjcm9sbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHdpbmRvdy5zY3JvbGxYLFxuICAgICAgICAgICAgICAgICAgICB5OiB3aW5kb3cuc2Nyb2xsWSxcbiAgICAgICAgICAgICAgICAgICAgcGFnZUhlaWdodDogZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VXaWR0aDogZG9jdW1lbnQuYm9keS5zY3JvbGxXaWR0aCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYFNjcm9sbGVkIHRvIHBvc2l0aW9uICgke3dpbmRvdy5zY3JvbGxYfSwgJHt3aW5kb3cuc2Nyb2xsWX0pYCxcbiAgICAgICAgICAgICAgICAgICAgdGFnczogW1wic2Nyb2xsXCJdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlVHJhY2VTdGVwKHNjcm9sbFN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dG9GbG93OiBFcnJvciByZWNvcmRpbmcgc2Nyb2xsIGV2ZW50OlwiLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZGxlIGZvcm0gc3VibWlzc2lvbiBldmVudHNcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBUaGUgc3VibWl0IGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBoYW5kbGVTdWJtaXRFdmVudChldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWNvcmRpbmcgfHwgIWV2ZW50LnRhcmdldClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgZm9ybSA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSBhd2FpdCB0aGlzLmNyZWF0ZVRyYWNlU3RlcChmb3JtLCBcImNsaWNrXCIsIGV2ZW50KTtcbiAgICAgICAgICAgIHN0ZXAubWV0YWRhdGEgPSB7XG4gICAgICAgICAgICAgICAgLi4uc3RlcC5tZXRhZGF0YSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJGb3JtIHN1Ym1pc3Npb25cIixcbiAgICAgICAgICAgICAgICB0YWdzOiBbXCJmb3JtXCIsIFwic3VibWl0XCJdLFxuICAgICAgICAgICAgICAgIGNyaXRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVRyYWNlU3RlcChzdGVwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRvRmxvdzogRXJyb3IgcmVjb3JkaW5nIGZvcm0gc3VibWlzc2lvbjpcIiwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBuYXZpZ2F0aW9uIGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgaGFuZGxlTmF2aWdhdGlvbkV2ZW50KCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWNvcmRpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0ge1xuICAgICAgICAgICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlU3RlcElkKCksXG4gICAgICAgICAgICAgICAgdGFiSWQ6IGF3YWl0IHRoaXMuZ2V0Q3VycmVudFRhYklkKCksXG4gICAgICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwibmF2aWdhdGVcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RvcnM6IFtdLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYE5hdmlnYXRpbmcgYXdheSBmcm9tICR7d2luZG93LmxvY2F0aW9uLmhyZWZ9YCxcbiAgICAgICAgICAgICAgICAgICAgdGFnczogW1wibmF2aWdhdGlvblwiXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVRyYWNlU3RlcChzdGVwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRvRmxvdzogRXJyb3IgcmVjb3JkaW5nIG5hdmlnYXRpb24gZXZlbnQ6XCIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgZm9jdXMgZXZlbnRzIGZvciBmb3JtIGZpZWxkc1xuICAgICAqIEBwYXJhbSBldmVudCAtIFRoZSBmb2N1cyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgaGFuZGxlRm9jdXNFdmVudChldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWNvcmRpbmcgfHwgIWV2ZW50LnRhcmdldClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgLy8gT25seSByZWNvcmQgZm9jdXMgb24gaW50ZXJhY3RpdmUgZWxlbWVudHNcbiAgICAgICAgY29uc3QgaW50ZXJhY3RpdmVFbGVtZW50cyA9IFtcImlucHV0XCIsIFwidGV4dGFyZWFcIiwgXCJzZWxlY3RcIiwgXCJidXR0b25cIl07XG4gICAgICAgIGlmICghaW50ZXJhY3RpdmVFbGVtZW50cy5pbmNsdWRlcyhlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIFRoaXMgaGVscHMgd2l0aCBmb3JtIGZpZWxkIGRldGVjdGlvbiBhbmQgY2FuIGJlIHVzZWQgZm9yIGJldHRlciBzZWxlY3RvcnNcbiAgICAgICAgY29uc29sZS5sb2coXCJBdXRvRmxvdzogRm9jdXMgZGV0ZWN0ZWQgb246XCIsIGVsZW1lbnQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZWNvcmQgaW5pdGlhbCBwYWdlIGxvYWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIHJlY29yZFBhZ2VMb2FkKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc3RlcCA9IHtcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZVN0ZXBJZCgpLFxuICAgICAgICAgICAgICAgIHRhYklkOiBhd2FpdCB0aGlzLmdldEN1cnJlbnRUYWJJZCgpLFxuICAgICAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcIm5hdmlnYXRlXCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3JzOiBbXSxcbiAgICAgICAgICAgICAgICBkb21IYXNoOiBhd2FpdCB0aGlzLmdlbmVyYXRlRE9NSGFzaCgpLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYFBhZ2UgbG9hZGVkOiAke2RvY3VtZW50LnRpdGxlfWAsXG4gICAgICAgICAgICAgICAgICAgIHRhZ3M6IFtcInBhZ2VfbG9hZFwiLCBcIm5hdmlnYXRpb25cIl0sXG4gICAgICAgICAgICAgICAgICAgIGNyaXRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gQ2FwdHVyZSBzY3JlZW5zaG90IG9mIGluaXRpYWwgcGFnZSBzdGF0ZVxuICAgICAgICAgICAgY29uc3Qgc2NyZWVuc2hvdCA9IGF3YWl0IHRoaXMuc2NyZWVuc2hvdENhcHR1cmUuY2FwdHVyZVZpc2libGUoKTtcbiAgICAgICAgICAgIGlmIChzY3JlZW5zaG90KSB7XG4gICAgICAgICAgICAgICAgc3RlcC50aHVtYm5haWxSZWYgPSBhd2FpdCB0aGlzLnNhdmVTY3JlZW5zaG90KHNjcmVlbnNob3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlVHJhY2VTdGVwKHN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dG9GbG93OiBFcnJvciByZWNvcmRpbmcgcGFnZSBsb2FkOlwiLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgdHJhY2Ugc3RlcCBmcm9tIGFuIGV2ZW50IGFuZCBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUaGUgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gYWN0aW9uIC0gVGhlIGFjdGlvbiB0eXBlXG4gICAgICogQHBhcmFtIGV2ZW50IC0gVGhlIG9yaWdpbmFsIGV2ZW50XG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gYSBUcmFjZVN0ZXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZVRyYWNlU3RlcChlbGVtZW50LCBhY3Rpb24sIGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IHRoaXMuc2VsZWN0b3JFeHRyYWN0b3IuZXh0cmFjdFNlbGVjdG9ycyhlbGVtZW50KTtcbiAgICAgICAgY29uc3QgYm91bmRpbmdCb3ggPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBzdGVwID0ge1xuICAgICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVTdGVwSWQoKSxcbiAgICAgICAgICAgIHRhYklkOiBhd2FpdCB0aGlzLmdldEN1cnJlbnRUYWJJZCgpLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIGFjdGlvbixcbiAgICAgICAgICAgIHNlbGVjdG9ycyxcbiAgICAgICAgICAgIHNjcm9sbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgeDogd2luZG93LnNjcm9sbFgsXG4gICAgICAgICAgICAgICAgeTogd2luZG93LnNjcm9sbFksXG4gICAgICAgICAgICAgICAgcGFnZUhlaWdodDogZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQsXG4gICAgICAgICAgICAgICAgcGFnZVdpZHRoOiBkb2N1bWVudC5ib2R5LnNjcm9sbFdpZHRoLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvbUhhc2g6IGF3YWl0IHRoaXMuZ2VuZXJhdGVET01IYXNoKCksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmdlbmVyYXRlU3RlcERlc2NyaXB0aW9uKGVsZW1lbnQsIGFjdGlvbiksXG4gICAgICAgICAgICAgICAgdGFnczogdGhpcy5nZW5lcmF0ZVN0ZXBUYWdzKGVsZW1lbnQsIGFjdGlvbiksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICAvLyBBZGQgaW5wdXQgZGF0YSBmb3IgaW5wdXQgZXZlbnRzXG4gICAgICAgIGlmIChhY3Rpb24gPT09IFwiaW5wdXRcIiAmJlxuICAgICAgICAgICAgZWxlbWVudC52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdGVwLmlucHV0RGF0YSA9IHRoaXMuZXh0cmFjdElucHV0RGF0YShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYXB0dXJlIHNjcmVlbnNob3QgZm9yIHZpc3VhbCB2ZXJpZmljYXRpb25cbiAgICAgICAgY29uc3Qgc2NyZWVuc2hvdCA9IGF3YWl0IHRoaXMuc2NyZWVuc2hvdENhcHR1cmUuY2FwdHVyZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIGlmIChzY3JlZW5zaG90KSB7XG4gICAgICAgICAgICBzdGVwLnRodW1ibmFpbFJlZiA9IGF3YWl0IHRoaXMuc2F2ZVNjcmVlbnNob3Qoc2NyZWVuc2hvdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgaW5wdXQgZGF0YSBmcm9tIGZvcm0gZWxlbWVudHNcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRoZSBpbnB1dCBlbGVtZW50XG4gICAgICogQHJldHVybnMgSW5wdXREYXRhIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZXh0cmFjdElucHV0RGF0YShlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGlucHV0RGF0YSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBlbGVtZW50LnZhbHVlLFxuICAgICAgICAgICAgdHlwZTogdGhpcy5tYXBJbnB1dFR5cGUoZWxlbWVudC50eXBlKSxcbiAgICAgICAgICAgIHNvdXJjZTogXCJzdGF0aWNcIixcbiAgICAgICAgICAgIHNlbnNpdGl2ZTogZWxlbWVudC50eXBlID09PSBcInBhc3N3b3JkXCIsXG4gICAgICAgIH07XG4gICAgICAgIC8vIE1hc2sgc2Vuc2l0aXZlIGRhdGFcbiAgICAgICAgaWYgKGlucHV0RGF0YS5zZW5zaXRpdmUpIHtcbiAgICAgICAgICAgIGlucHV0RGF0YS52YWx1ZSA9IFwiW01BU0tFRF1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5wdXREYXRhO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNYXAgSFRNTCBpbnB1dCB0eXBlcyB0byBvdXIgSW5wdXRUeXBlIGVudW1cbiAgICAgKiBAcGFyYW0gaHRtbFR5cGUgLSBIVE1MIGlucHV0IHR5cGVcbiAgICAgKiBAcmV0dXJucyBNYXBwZWQgaW5wdXQgdHlwZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgbWFwSW5wdXRUeXBlKGh0bWxUeXBlKSB7XG4gICAgICAgIGNvbnN0IHR5cGVNYXAgPSB7XG4gICAgICAgICAgICB0ZXh0OiBcInRleHRcIixcbiAgICAgICAgICAgIGVtYWlsOiBcImVtYWlsXCIsXG4gICAgICAgICAgICBwYXNzd29yZDogXCJwYXNzd29yZFwiLFxuICAgICAgICAgICAgbnVtYmVyOiBcIm51bWJlclwiLFxuICAgICAgICAgICAgdGVsOiBcInRleHRcIixcbiAgICAgICAgICAgIHVybDogXCJ0ZXh0XCIsXG4gICAgICAgICAgICBzZWFyY2g6IFwidGV4dFwiLFxuICAgICAgICAgICAgZGF0ZTogXCJkYXRlXCIsXG4gICAgICAgICAgICBmaWxlOiBcImZpbGVcIixcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHR5cGVNYXBbaHRtbFR5cGVdIHx8IFwidGV4dFwiO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBhIGRlc2NyaXB0aXZlIHRleHQgZm9yIHRoZSBzdGVwXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSBhY3Rpb24gLSBBY3Rpb24gdHlwZVxuICAgICAqIEByZXR1cm5zIEh1bWFuLXJlYWRhYmxlIGRlc2NyaXB0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZW5lcmF0ZVN0ZXBEZXNjcmlwdGlvbihlbGVtZW50LCBhY3Rpb24pIHtcbiAgICAgICAgY29uc3QgZWxlbWVudFRleHQgPSBlbGVtZW50LnRleHRDb250ZW50Py50cmltKCkuc2xpY2UoMCwgNTApIHx8IFwiXCI7XG4gICAgICAgIGNvbnN0IHRhZ05hbWUgPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgXCJjbGlja1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgQ2xpY2tlZCAke3RhZ05hbWV9JHtlbGVtZW50VGV4dCA/ICc6IFwiJyArIGVsZW1lbnRUZXh0ICsgJ1wiJyA6IFwiXCJ9YDtcbiAgICAgICAgICAgIGNhc2UgXCJpbnB1dFwiOlxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gZWxlbWVudC5wbGFjZWhvbGRlcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gYEVudGVyZWQgdGV4dCBpbiAke3RhZ05hbWV9JHtwbGFjZWhvbGRlciA/IFwiIChcIiArIHBsYWNlaG9sZGVyICsgXCIpXCIgOiBcIlwifWA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBgUGVyZm9ybWVkICR7YWN0aW9ufSBvbiAke3RhZ05hbWV9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSByZWxldmFudCB0YWdzIGZvciB0aGUgc3RlcFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gYWN0aW9uIC0gQWN0aW9uIHR5cGVcbiAgICAgKiBAcmV0dXJucyBBcnJheSBvZiB0YWdzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZW5lcmF0ZVN0ZXBUYWdzKGVsZW1lbnQsIGFjdGlvbikge1xuICAgICAgICBjb25zdCB0YWdzID0gW2FjdGlvbl07XG4gICAgICAgIC8vIEFkZCBlbGVtZW50LXNwZWNpZmljIHRhZ3NcbiAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSkge1xuICAgICAgICAgICAgdGFncy5wdXNoKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGFncy5wdXNoKFwiaGFzLWNsYXNzXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LmlkKSB7XG4gICAgICAgICAgICB0YWdzLnB1c2goXCJoYXMtaWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIGZvcm0tcmVsYXRlZCB0YWdzXG4gICAgICAgIGlmIChlbGVtZW50LmNsb3Nlc3QoXCJmb3JtXCIpKSB7XG4gICAgICAgICAgICB0YWdzLnB1c2goXCJmb3JtLWVsZW1lbnRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZ3M7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNhdmUgYSB0cmFjZSBzdGVwIHRvIHN0b3JhZ2VcbiAgICAgKiBAcGFyYW0gc3RlcCAtIFRoZSBzdGVwIHRvIHNhdmVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIHNhdmVUcmFjZVN0ZXAoc3RlcCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gU2VuZCB0byBiYWNrZ3JvdW5kIHNjcmlwdCBmb3IgcHJvY2Vzc2luZyBhbmQgc3RvcmFnZVxuICAgICAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiU0FWRV9UUkFDRV9TVEVQXCIsXG4gICAgICAgICAgICAgICAgc2Vzc2lvbklkOiB0aGlzLnJlY29yZGluZ1Nlc3Npb25JZCxcbiAgICAgICAgICAgICAgICBzdGVwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBEb24ndCBpbmNyZW1lbnQgbG9jYWwgY291bnRlciAtIGJhY2tncm91bmQgc2NyaXB0IGlzIHRoZSBzb3VyY2Ugb2YgdHJ1dGhcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXV0b0Zsb3c6IFN0ZXAgcmVjb3JkZWQ6XCIsIHN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dG9GbG93OiBFcnJvciBzYXZpbmcgdHJhY2Ugc3RlcDpcIiwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNhdmUgc2NyZWVuc2hvdCB0byBzdG9yYWdlXG4gICAgICogQHBhcmFtIHNjcmVlbnNob3QgLSBCYXNlNjQgc2NyZWVuc2hvdCBkYXRhXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gc2NyZWVuc2hvdCByZWZlcmVuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIHNhdmVTY3JlZW5zaG90KHNjcmVlbnNob3QpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuc2hvdElkID0gYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgICAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICAgICAgW2BzY3JlZW5zaG90XyR7c2NyZWVuc2hvdElkfWBdOiBzY3JlZW5zaG90LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNjcmVlbnNob3RJZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSB1bmlxdWUgc3RlcCBJRFxuICAgICAqIEByZXR1cm5zIFVuaXF1ZSBzdGVwIGlkZW50aWZpZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdlbmVyYXRlU3RlcElkKCkge1xuICAgICAgICByZXR1cm4gYHN0ZXBfJHtEYXRlLm5vdygpfV8ke3RoaXMuc3RlcENvdW50ZXJ9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IHRhYiBJRFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHRhYiBJRFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgZ2V0Q3VycmVudFRhYklkKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogXCJHRVRfQ1VSUkVOVF9UQUJcIiB9LCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlPy50YWJJZCB8fCAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSBoYXNoIG9mIHRoZSBjdXJyZW50IERPTSBzdHJ1Y3R1cmVcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byBET00gaGFzaFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgZ2VuZXJhdGVET01IYXNoKCkge1xuICAgICAgICAvLyBTaW1wbGUgaGFzaCBiYXNlZCBvbiBET00gc3RydWN0dXJlIGFuZCBrZXkgZWxlbWVudHNcbiAgICAgICAgY29uc3QgYm9keUhUTUwgPSBkb2N1bWVudC5ib2R5LmlubmVySFRNTC5zbGljZSgwLCAxMDAwKTsgLy8gRmlyc3QgMUtCXG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgICAgIGNvbnN0IHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYCR7dGl0bGV9fCR7dXJsfXwke2JvZHlIVE1MfWA7XG4gICAgICAgIC8vIFNpbXBsZSBoYXNoIGZ1bmN0aW9uIChmb3IgcHJvZHVjdGlvbiwgdXNlIGNyeXB0byBBUEkpXG4gICAgICAgIGxldCBoYXNoID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaGFyID0gY29udGVudC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgaGFzaCA9IChoYXNoIDw8IDUpIC0gaGFzaCArIGNoYXI7XG4gICAgICAgICAgICBoYXNoID0gaGFzaCAmIGhhc2g7IC8vIENvbnZlcnQgdG8gMzItYml0IGludGVnZXJcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgdmlzdWFsIHJlY29yZGluZyBpbmRpY2F0b3Igd2l0aCBzdGVwIGNvdW50ZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIHNob3dSZWNvcmRpbmdJbmRpY2F0b3IoKSB7XG4gICAgICAgIC8vIFJlbW92ZSBleGlzdGluZyBpbmRpY2F0b3IgaWYgcHJlc2VudFxuICAgICAgICB0aGlzLmhpZGVSZWNvcmRpbmdJbmRpY2F0b3IoKTtcbiAgICAgICAgLy8gR2V0IHRoZSByZWFsIHN0ZXAgY291bnQgZnJvbSBiYWNrZ3JvdW5kIHNjcmlwdFxuICAgICAgICBsZXQgcmVhbFN0ZXBDb3VudCA9IDA7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVF9SRUNPUkRJTkdfU1RBVEVcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVhbFN0ZXBDb3VudCA9IHJlc3BvbnNlPy5zdGVwQ291bnQgfHwgMDtcbiAgICAgICAgICAgIHRoaXMuc3RlcENvdW50ZXIgPSByZWFsU3RlcENvdW50OyAvLyBTeW5jIGxvY2FsIGNvdW50ZXJcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkF1dG9GbG93OiBDb3VsZCBub3QgZ2V0IHN0ZXAgY291bnQgZnJvbSBiYWNrZ3JvdW5kLCB1c2luZyBsb2NhbCBjb3VudFwiKTtcbiAgICAgICAgICAgIHJlYWxTdGVwQ291bnQgPSB0aGlzLnN0ZXBDb3VudGVyO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGluZGljYXRvci5jbGFzc05hbWUgPSBcImF1dG9mbG93LXJlY29yZGluZy1pbmRpY2F0b3JcIjtcbiAgICAgICAgaW5kaWNhdG9yLmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgaWQ9XCJhdXRvZmxvdy1pbmRpY2F0b3JcIiBzdHlsZT1cIlxuICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgIHRvcDogMjBweDtcbiAgICAgICAgcmlnaHQ6IDIwcHg7XG4gICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNlZjQ0NDQsICNkYzI2MjYpO1xuICAgICAgICBjb2xvcjogd2hpdGU7XG4gICAgICAgIHBhZGRpbmc6IDEycHggMTZweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMjRweDtcbiAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgc2Fucy1zZXJpZjtcbiAgICAgICAgZm9udC1zaXplOiAxM3B4O1xuICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICB6LWluZGV4OiA5OTk5OTk7XG4gICAgICAgIGJveC1zaGFkb3c6IDAgNnB4IDIwcHggcmdiYSgyMzksIDY4LCA2OCwgMC40KTtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgZ2FwOiAxMHB4O1xuICAgICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbiAgICAgIFwiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwiXG4gICAgICAgICAgd2lkdGg6IDEwcHg7XG4gICAgICAgICAgaGVpZ2h0OiAxMHB4O1xuICAgICAgICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBhbmltYXRpb246IHB1bHNlIDEuNXMgaW5maW5pdGU7XG4gICAgICAgIFwiPjwvZGl2PlxuICAgICAgICA8c3BhbiBpZD1cImF1dG9mbG93LXN0YXR1c1wiPlJlY29yZGluZzwvc3Bhbj5cbiAgICAgICAgPGRpdiBzdHlsZT1cIlxuICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcbiAgICAgICAgICBwYWRkaW5nOiA0cHggOHB4O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gICAgICAgICAgZm9udC1zaXplOiAxMXB4O1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgICAgIFwiPlxuICAgICAgICAgIDxzcGFuIGlkPVwiYXV0b2Zsb3ctc3RlcC1jb3VudFwiPiR7cmVhbFN0ZXBDb3VudH08L3NwYW4+IHN0ZXBzXG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgICAgICAgLy8gQWRkIGVuaGFuY2VkIGFuaW1hdGlvbiBzdHlsZXNcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgICAgIHN0eWxlLmlkID0gXCJhdXRvZmxvdy1pbmRpY2F0b3Itc3R5bGVzXCI7XG4gICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gYFxuICAgICAgQGtleWZyYW1lcyBwdWxzZSB7XG4gICAgICAgIDAlLCAxMDAlIHsgXG4gICAgICAgICAgb3BhY2l0eTogMTsgXG4gICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcbiAgICAgICAgfVxuICAgICAgICA1MCUgeyBcbiAgICAgICAgICBvcGFjaXR5OiAwLjc7IFxuICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMS4xKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBAa2V5ZnJhbWVzIHN0ZXBIaWdobGlnaHQge1xuICAgICAgICAwJSB7IFxuICAgICAgICAgIGJveC1zaGFkb3c6IDAgMCAwIDJweCByZ2JhKDM0LCAxOTcsIDk0LCAwLjMpO1xuICAgICAgICB9XG4gICAgICAgIDUwJSB7IFxuICAgICAgICAgIGJveC1zaGFkb3c6IDAgMCAwIDRweCByZ2JhKDM0LCAxOTcsIDk0LCAwLjYpO1xuICAgICAgICB9XG4gICAgICAgIDEwMCUgeyBcbiAgICAgICAgICBib3gtc2hhZG93OiAwIDAgMCAycHggcmdiYSgzNCwgMTk3LCA5NCwgMC4zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAuYXV0b2Zsb3ctZWxlbWVudC1oaWdobGlnaHQge1xuICAgICAgICBvdXRsaW5lOiAycHggc29saWQgIzIyYzU1ZSAhaW1wb3J0YW50O1xuICAgICAgICBvdXRsaW5lLW9mZnNldDogMXB4ICFpbXBvcnRhbnQ7XG4gICAgICAgIGJveC1zaGFkb3c6IDAgMCAwIDJweCByZ2JhKDM0LCAxOTcsIDk0LCAwLjMpICFpbXBvcnRhbnQ7XG4gICAgICAgIGFuaW1hdGlvbjogc3RlcEhpZ2hsaWdodCAwLjRzIGVhc2Utb3V0ICFpbXBvcnRhbnQ7XG4gICAgICAgIHRyYW5zaXRpb246IGJveC1zaGFkb3cgMC4ycyBlYXNlICFpbXBvcnRhbnQ7XG4gICAgICB9XG4gICAgYDtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSBzdGVwIGNvdW50ZXIgaW4gdGhlIHJlY29yZGluZyBpbmRpY2F0b3Igd2l0aCByZWFsIGNvdW50IGZyb20gYmFja2dyb3VuZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgdXBkYXRlU3RlcENvdW50ZXIoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIHJlYWwgc3RlcCBjb3VudCBmcm9tIGJhY2tncm91bmQgc2NyaXB0XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVF9SRUNPUkRJTkdfU1RBVEVcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVhbFN0ZXBDb3VudCA9IHJlc3BvbnNlPy5zdGVwQ291bnQgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXBDb3VudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dG9mbG93LXN0ZXAtY291bnRcIik7XG4gICAgICAgICAgICBpZiAoc3RlcENvdW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHN0ZXBDb3VudEVsZW1lbnQudGV4dENvbnRlbnQgPSByZWFsU3RlcENvdW50LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgLy8gQWRkIGEgYnJpZWYgaGlnaGxpZ2h0IGFuaW1hdGlvbiB0byBzaG93IGFjdGl2aXR5XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kaWNhdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRvZmxvdy1pbmRpY2F0b3JcIik7XG4gICAgICAgICAgICAgICAgaWYgKGluZGljYXRvcikge1xuICAgICAgICAgICAgICAgICAgICBpbmRpY2F0b3Iuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZSgxLjA1KVwiO1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGljYXRvci5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlKDEpXCI7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVXBkYXRlIGxvY2FsIGNvdW50ZXIgdG8gbWF0Y2ggKGZvciBhbnkgb3RoZXIgdXNlcylcbiAgICAgICAgICAgIHRoaXMuc3RlcENvdW50ZXIgPSByZWFsU3RlcENvdW50O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dG9GbG93OiBFcnJvciB1cGRhdGluZyBzdGVwIGNvdW50ZXI6XCIsIGVycm9yKTtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrIHRvIGxvY2FsIGNvdW50ZXIgaWYgYmFja2dyb3VuZCBjb21tdW5pY2F0aW9uIGZhaWxzXG4gICAgICAgICAgICBjb25zdCBzdGVwQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRvZmxvdy1zdGVwLWNvdW50XCIpO1xuICAgICAgICAgICAgaWYgKHN0ZXBDb3VudEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzdGVwQ291bnRFbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5zdGVwQ291bnRlci50b1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhpZ2hsaWdodCBhbiBlbGVtZW50IGJyaWVmbHkgdG8gc2hvdyBpdCB3YXMgcmVjb3JkZWRcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIEVsZW1lbnQgdG8gaGlnaGxpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBoaWdobGlnaHRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgLy8gQWRkIGhpZ2hsaWdodCBjbGFzc1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJhdXRvZmxvdy1lbGVtZW50LWhpZ2hsaWdodFwiKTtcbiAgICAgICAgLy8gUmVtb3ZlIGhpZ2hsaWdodCBhZnRlciBhbmltYXRpb24gKHNob3J0ZXIgZHVyYXRpb24pXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiYXV0b2Zsb3ctZWxlbWVudC1oaWdobGlnaHRcIik7XG4gICAgICAgIH0sIDQwMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhpZGUgdmlzdWFsIHJlY29yZGluZyBpbmRpY2F0b3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGhpZGVSZWNvcmRpbmdJbmRpY2F0b3IoKSB7XG4gICAgICAgIGNvbnN0IGluZGljYXRvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXV0b2Zsb3ctcmVjb3JkaW5nLWluZGljYXRvclwiKTtcbiAgICAgICAgaWYgKGluZGljYXRvcikge1xuICAgICAgICAgICAgaW5kaWNhdG9yLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsc28gcmVtb3ZlIHRoZSBzdHlsZXNcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRvZmxvdy1pbmRpY2F0b3Itc3R5bGVzXCIpO1xuICAgICAgICBpZiAoc3R5bGVzKSB7XG4gICAgICAgICAgICBzdHlsZXMucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgcGVyaW9kaWMgc3RlcCBjb3VudGVyIHN5bmNocm9uaXphdGlvbiB3aXRoIGJhY2tncm91bmQgc2NyaXB0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzdGFydFN0ZXBDb3VudGVyU3luYygpIHtcbiAgICAgICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIGludGVydmFsXG4gICAgICAgIHRoaXMuc3RvcFN0ZXBDb3VudGVyU3luYygpO1xuICAgICAgICAvLyBTeW5jIGV2ZXJ5IDIgc2Vjb25kcyB0byBrZWVwIHRoZSBjb3VudGVyIGFjY3VyYXRlXG4gICAgICAgIHRoaXMuc3RlcENvdW50ZXJTeW5jSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1JlY29yZGluZykge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMudXBkYXRlU3RlcENvdW50ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMjAwMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0b3AgcGVyaW9kaWMgc3RlcCBjb3VudGVyIHN5bmNocm9uaXphdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc3RvcFN0ZXBDb3VudGVyU3luYygpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RlcENvdW50ZXJTeW5jSW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5zdGVwQ291bnRlclN5bmNJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGlzLnN0ZXBDb3VudGVyU3luY0ludGVydmFsID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIEluaXRpYWxpemUgdGhlIGNvbnRlbnQgc2NyaXB0IHdoZW4gdGhlIHBhZ2UgbG9hZHNcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICAgICAgbmV3IEF1dG9GbG93Q29udGVudFNjcmlwdCgpO1xuICAgIH0pO1xufVxuZWxzZSB7XG4gICAgbmV3IEF1dG9GbG93Q29udGVudFNjcmlwdCgpO1xufVxuZXhwb3J0IGRlZmF1bHQgQXV0b0Zsb3dDb250ZW50U2NyaXB0O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9