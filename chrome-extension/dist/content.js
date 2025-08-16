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
            const dataAttrs = ['data-testid', 'data-test', 'data-cy', 'data-automation'];
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
                const classSelector = `.${Array.from(element.classList).join('.')}`;
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
            console.warn('CssSelectorStrategy: Error extracting selector:', error);
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
        const usefulAttrs = ['name', 'type', 'value', 'placeholder', 'title', 'role', 'aria-label'];
        for (const attr of usefulAttrs) {
            const value = element.getAttribute(attr);
            if (value && value.length < 50) { // Avoid very long values
                attributes.push(`[${attr}="${value}"]`);
            }
        }
        if (attributes.length > 0) {
            return `${tag}${attributes.join('')}`;
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
        return path.join(' > ');
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
                    const sameTagSiblings = siblings.filter(el => el.tagName === current.tagName);
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
            return path.length > 0 ? '/' + path.join('') : null;
        }
        catch (error) {
            console.warn('XPathSelectorStrategy: Error extracting selector:', error);
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
            console.warn('TextSelectorStrategy: Error extracting selector:', error);
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
            if (selector.startsWith('text=')) {
                return text === selector.substring(5);
            }
            else if (selector.startsWith('text*=')) {
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
            const role = element.getAttribute('role');
            const ariaLabel = element.getAttribute('aria-label');
            const ariaLabelledby = element.getAttribute('aria-labelledby');
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
            console.warn('RoleSelectorStrategy: Error extracting selector:', error);
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
            if (selector.startsWith('role=')) {
                const expectedRole = selector.substring(5);
                const actualRole = element.getAttribute('role') || this.getImplicitRole(element);
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
        const roleMap = {
            'button': 'button',
            'a': 'link',
            'input': this.getInputRole(element),
            'textarea': 'textbox',
            'select': 'combobox',
            'img': 'img',
            'h1': 'heading',
            'h2': 'heading',
            'h3': 'heading',
            'h4': 'heading',
            'h5': 'heading',
            'h6': 'heading',
            'nav': 'navigation',
            'main': 'main',
            'header': 'banner',
            'footer': 'contentinfo',
            'aside': 'complementary',
            'section': 'region',
            'article': 'article'
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
        const type = input.type.toLowerCase();
        const inputRoles = {
            'button': 'button',
            'submit': 'button',
            'reset': 'button',
            'checkbox': 'checkbox',
            'radio': 'radio',
            'text': 'textbox',
            'password': 'textbox',
            'email': 'textbox',
            'search': 'searchbox',
            'tel': 'textbox',
            'url': 'textbox',
            'number': 'spinbutton'
        };
        return inputRoles[type] || 'textbox';
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
            new RoleSelectorStrategy()
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
                        boundingBox
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
                console.warn('SelectorExtractor: Error with strategy:', strategy.constructor.name, error);
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
            if (selector.includes('#') && element.id) {
                confidence += 5;
            }
            // Bonus for data attributes
            if (selector.includes('data-')) {
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
            height: rect.height
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
            'id', 'class', 'name', 'type', 'value', 'placeholder', 'title',
            'role', 'aria-label', 'data-testid', 'data-test', 'href', 'src'
        ];
        for (const attr of relevantAttrs) {
            const value = element.getAttribute(attr);
            if (value) {
                attributes[attr] = value;
            }
        }
        // Add tag name for reference
        attributes['tagName'] = element.tagName.toLowerCase();
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
        const text = element.textContent?.trim().slice(0, 30) || '';
        return {
            css: tagName,
            text: text || undefined,
            attributes: this.extractRelevantAttributes(element),
            boundingBox,
            confidence: 10 // Low confidence for fallback
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
        let scrollTimeout;
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
            const result = await chrome.storage.local.get(['isRecording', 'recordingSessionId']);
            this.isRecording = result.isRecording || false;
            this.recordingSessionId = result.recordingSessionId || null;
            if (this.isRecording) {
                this.showRecordingIndicator();
            }
        }
        catch (error) {
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
    async handleMessage(message, sender, sendResponse) {
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
        }
        catch (error) {
            console.error('AutoFlow: Error handling message:', error);
            sendResponse({ error: error?.message || 'Unknown error' });
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
    async stopRecording() {
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
    async handleClickEvent(event) {
        if (!this.isRecording || !event.target)
            return;
        const element = event.target;
        // Skip clicks on the recording indicator
        if (element.closest('.autoflow-recording-indicator'))
            return;
        try {
            const step = await this.createTraceStep(element, 'click', event);
            await this.saveTraceStep(step);
        }
        catch (error) {
            console.error('AutoFlow: Error recording click event:', error);
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
        const recordableTypes = ['text', 'email', 'password', 'search', 'tel', 'url'];
        if (element.type && !recordableTypes.includes(element.type))
            return;
        try {
            const step = await this.createTraceStep(element, 'input', event);
            await this.saveTraceStep(step);
        }
        catch (error) {
            console.error('AutoFlow: Error recording input event:', error);
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
        }
        catch (error) {
            console.error('AutoFlow: Error recording scroll event:', error);
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
            const step = await this.createTraceStep(form, 'click', event);
            step.metadata = {
                ...step.metadata,
                description: 'Form submission',
                tags: ['form', 'submit'],
                critical: true
            };
            await this.saveTraceStep(step);
        }
        catch (error) {
            console.error('AutoFlow: Error recording form submission:', error);
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
                action: 'navigate',
                selectors: [],
                timestamp: Date.now(),
                metadata: {
                    description: `Navigating away from ${window.location.href}`,
                    tags: ['navigation']
                }
            };
            await this.saveTraceStep(step);
        }
        catch (error) {
            console.error('AutoFlow: Error recording navigation event:', error);
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
        const interactiveElements = ['input', 'textarea', 'select', 'button'];
        if (!interactiveElements.includes(element.tagName.toLowerCase()))
            return;
        // This helps with form field detection and can be used for better selectors
        console.log('AutoFlow: Focus detected on:', element);
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
        }
        catch (error) {
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
        if (action === 'input' && element.value !== undefined) {
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
    mapInputType(htmlType) {
        const typeMap = {
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
    generateStepDescription(element, action) {
        const elementText = element.textContent?.trim().slice(0, 50) || '';
        const tagName = element.tagName.toLowerCase();
        switch (action) {
            case 'click':
                return `Clicked ${tagName}${elementText ? ': "' + elementText + '"' : ''}`;
            case 'input':
                const placeholder = element.placeholder;
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
    generateStepTags(element, action) {
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
    async saveTraceStep(step) {
        try {
            // Send to background script for processing and storage
            await chrome.runtime.sendMessage({
                type: 'SAVE_TRACE_STEP',
                sessionId: this.recordingSessionId,
                step
            });
            this.stepCounter++;
            console.log('AutoFlow: Step recorded:', step);
        }
        catch (error) {
            console.error('AutoFlow: Error saving trace step:', error);
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
            [`screenshot_${screenshotId}`]: screenshot
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
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }
    /**
     * Show visual recording indicator
     * @private
     */
    showRecordingIndicator() {
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
    hideRecordingIndicator() {
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
}
else {
    new AutoFlowContentScript();
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AutoFlowContentScript);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLFdBQVcsR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLFVBQVU7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDclpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsMkJBQTJCO0FBQ3hFO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdGQUFnRjtBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLDZCQUE2QjtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLFVBQVU7QUFDMUIsZUFBZSxTQUFTO0FBQ3hCLGlCQUFpQixXQUFXO0FBQzVCLGtCQUFrQixZQUFZO0FBQzlCLDRCQUE0QjtBQUM1Qiw0QkFBNEIsTUFBTTtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzRUFBc0UsY0FBYztBQUNwRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxxQ0FBcUM7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0VBQXNFLGNBQWM7QUFDcEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtRUFBbUU7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQzdYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxXQUFXO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxLQUFLLElBQUksTUFBTTtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyx3Q0FBd0M7QUFDbEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QztBQUM5QyxvQ0FBb0MsS0FBSyxJQUFJLE1BQU07QUFDbkQ7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLElBQUksRUFBRSxvQkFBb0I7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxNQUFNO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxRQUFRLFFBQVEsV0FBVztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsUUFBUTtBQUNqRDtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsUUFBUSxHQUFHLE1BQU07QUFDMUQ7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLFFBQVE7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQSwwREFBMEQsMEJBQTBCO0FBQ3BGO0FBQ0E7QUFDQSwrQkFBK0IsS0FBSztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBLDhFQUE4RSxpQ0FBaUM7QUFDL0c7QUFDQTtBQUNBLG9DQUFvQyxZQUFZO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxLQUFLO0FBQ2xEO0FBQ0Esb0RBQW9ELFVBQVU7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLGFBQWE7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztVQ2hpQkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7Ozs7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNnRTtBQUNBO0FBQ1I7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLHdFQUFpQjtBQUN0RCxxQ0FBcUMsd0VBQWlCO0FBQ3RELGlDQUFpQyxnRUFBYTtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsSUFBSSxlQUFlO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekIsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxlQUFlO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxlQUFlO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsWUFBWTtBQUMvQztBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsV0FBVztBQUM5QztBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsK0JBQStCO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLDBDQUEwQztBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSwwREFBMEQsZUFBZSxJQUFJLGVBQWU7QUFDNUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELHFCQUFxQjtBQUM5RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxlQUFlO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxRQUFRLEVBQUUsNkNBQTZDO0FBQ3pGO0FBQ0E7QUFDQSwwQ0FBMEMsUUFBUSxFQUFFLDRDQUE0QztBQUNoRztBQUNBLG9DQUFvQyxRQUFRLEtBQUssUUFBUTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxXQUFXLEdBQUcsd0NBQXdDO0FBQ2pHO0FBQ0EsMkJBQTJCLGFBQWE7QUFDeEMsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsV0FBVyxHQUFHLGlCQUFpQixHQUFHLHdDQUF3QztBQUNqRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLHlCQUF5QjtBQUNsRTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFpRTtBQUNqRTtBQUNBO0FBQ0EsMkJBQTJCLE1BQU0sR0FBRyxJQUFJLEdBQUcsU0FBUztBQUNwRDtBQUNBO0FBQ0Esd0JBQXdCLG9CQUFvQjtBQUM1QztBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxxQkFBcUIsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vLi9zcmMvdXRpbHMvZXZlbnQtcmVjb3JkZXIudHMiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi8uL3NyYy91dGlscy9zY3JlZW5zaG90LWNhcHR1cmUudHMiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi8uL3NyYy91dGlscy9zZWxlY3Rvci1leHRyYWN0b3IudHMiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vLi9zcmMvY29udGVudC9jb250ZW50LXNjcmlwdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRXZlbnQgcmVjb3JkaW5nIHV0aWxpdHkgZm9yIGNhcHR1cmluZyB1c2VyIGludGVyYWN0aW9uc1xuICogQGF1dGhvciBBeXVzaCBTaHVrbGFcbiAqIEBkZXNjcmlwdGlvbiBIYW5kbGVzIHJlY29yZGluZyBhbmQgcHJvY2Vzc2luZyBvZiB1c2VyIGV2ZW50cyB3aXRoIHNtYXJ0IGZpbHRlcmluZy5cbiAqIEltcGxlbWVudHMgT2JzZXJ2ZXIgcGF0dGVybiBmb3IgZXZlbnQgaGFuZGxpbmcuXG4gKi9cbi8qKlxuICogRGVmYXVsdCBldmVudCByZWNvcmRlciBjb25maWd1cmF0aW9uXG4gKi9cbmNvbnN0IERFRkFVTFRfQ09ORklHID0ge1xuICAgIHJlY29yZE1vdXNlOiB0cnVlLFxuICAgIHJlY29yZEtleWJvYXJkOiB0cnVlLFxuICAgIHJlY29yZEZvcm1zOiB0cnVlLFxuICAgIHJlY29yZE5hdmlnYXRpb246IHRydWUsXG4gICAgdGhyb3R0bGVUaW1lOiAxMDAsXG4gICAgaWdub3JlU2VsZWN0b3JzOiBbXG4gICAgICAgICcuYXV0b2Zsb3ctcmVjb3JkaW5nLWluZGljYXRvcicsXG4gICAgICAgICcuYXV0b2Zsb3ctZWxlbWVudC1oaWdobGlnaHQnLFxuICAgICAgICAnW2RhdGEtYXV0b2Zsb3ctaWdub3JlXSdcbiAgICBdXG59O1xuLyoqXG4gKiBFdmVudCByZWNvcmRlciBjbGFzcyB0aGF0IGhhbmRsZXMgaW50ZWxsaWdlbnQgZXZlbnQgY2FwdHVyZVxuICogRm9sbG93cyBPYnNlcnZlciBwYXR0ZXJuIGZvciBldmVudCBub3RpZmljYXRpb25cbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50UmVjb3JkZXIge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgZXZlbnQgcmVjb3JkZXIgd2l0aCBjb25maWd1cmF0aW9uXG4gICAgICogQHBhcmFtIGNvbmZpZyAtIEV2ZW50IHJlY29yZGVyIGNvbmZpZ3VyYXRpb24gKG9wdGlvbmFsKVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZyA9IHt9KSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gICAgICAgIHRoaXMubGFzdEV2ZW50VGltZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHJlY29yZGVkIGV2ZW50c1xuICAgICAqIEBwYXJhbSBsaXN0ZW5lciAtIEV2ZW50IGxpc3RlbmVyIHRvIGFkZFxuICAgICAqL1xuICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgLSBFdmVudCBsaXN0ZW5lciB0byByZW1vdmVcbiAgICAgKi9cbiAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcikge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMubGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCByZWNvcmRpbmcgZXZlbnRzXG4gICAgICovXG4gICAgc3RhcnRSZWNvcmRpbmcoKSB7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmxhc3RFdmVudFRpbWUuY2xlYXIoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RvcCByZWNvcmRpbmcgZXZlbnRzXG4gICAgICovXG4gICAgc3RvcFJlY29yZGluZygpIHtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxhc3RFdmVudFRpbWUuY2xlYXIoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYW4gZXZlbnQgc2hvdWxkIGJlIHJlY29yZGVkXG4gICAgICogQHBhcmFtIGV2ZW50IC0gRE9NIGV2ZW50IHRvIGNoZWNrXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgZXZlbnQgc2hvdWxkIGJlIHJlY29yZGVkXG4gICAgICovXG4gICAgc2hvdWxkUmVjb3JkRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGlnbm9yZSBzZWxlY3RvcnNcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiB0aGlzLmNvbmZpZy5pZ25vcmVTZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5tYXRjaGVzKHNlbGVjdG9yKSB8fCB0YXJnZXQuY2xvc2VzdChzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIEludmFsaWQgc2VsZWN0b3IsIHNraXBcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBjb25maWd1cmF0aW9uIGZsYWdzXG4gICAgICAgIGlmICghdGhpcy5pc0V2ZW50VHlwZUVuYWJsZWQoZXZlbnQudHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayB0aHJvdHRsaW5nXG4gICAgICAgIGlmICh0aGlzLmlzRXZlbnRUaHJvdHRsZWQoZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkaXRpb25hbCBmaWx0ZXJzIGZvciBzcGVjaWZpYyBldmVudCB0eXBlc1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBseUV2ZW50U3BlY2lmaWNGaWx0ZXJzKGV2ZW50KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJvY2VzcyBhbmQgbm90aWZ5IGxpc3RlbmVycyBhYm91dCBhIHJlY29yZGVkIGV2ZW50XG4gICAgICogQHBhcmFtIGV2ZW50IC0gRE9NIGV2ZW50IHRvIHByb2Nlc3NcbiAgICAgKi9cbiAgICBwcm9jZXNzRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFJlY29yZEV2ZW50KGV2ZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlY29yZGVkRXZlbnQgPSB7XG4gICAgICAgICAgICB0eXBlOiBldmVudC50eXBlLFxuICAgICAgICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXQsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICBkYXRhOiB0aGlzLmV4dHJhY3RFdmVudERhdGEoZXZlbnQpLFxuICAgICAgICAgICAgc2hvdWxkUmVjb3JkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIC8vIFVwZGF0ZSBsYXN0IGV2ZW50IHRpbWUgZm9yIHRocm90dGxpbmdcbiAgICAgICAgY29uc3QgZXZlbnRLZXkgPSB0aGlzLmdldEV2ZW50S2V5KGV2ZW50KTtcbiAgICAgICAgdGhpcy5sYXN0RXZlbnRUaW1lLnNldChldmVudEtleSwgcmVjb3JkZWRFdmVudC50aW1lc3RhbXApO1xuICAgICAgICAvLyBOb3RpZnkgYWxsIGxpc3RlbmVyc1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIub25FdmVudChyZWNvcmRlZEV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V2ZW50UmVjb3JkZXI6IEVycm9yIGluIGV2ZW50IGxpc3RlbmVyOicsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGV2ZW50IHR5cGUgaXMgZW5hYmxlZCBpbiBjb25maWd1cmF0aW9uXG4gICAgICogQHBhcmFtIGV2ZW50VHlwZSAtIFR5cGUgb2YgZXZlbnQgdG8gY2hlY2tcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIGV2ZW50IHR5cGUgc2hvdWxkIGJlIHJlY29yZGVkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBpc0V2ZW50VHlwZUVuYWJsZWQoZXZlbnRUeXBlKSB7XG4gICAgICAgIGNvbnN0IG1vdXNlRXZlbnRzID0gWydjbGljaycsICdkYmxjbGljaycsICdtb3VzZWRvd24nLCAnbW91c2V1cCcsICdtb3VzZW1vdmUnXTtcbiAgICAgICAgY29uc3Qga2V5Ym9hcmRFdmVudHMgPSBbJ2tleWRvd24nLCAna2V5dXAnLCAna2V5cHJlc3MnXTtcbiAgICAgICAgY29uc3QgZm9ybUV2ZW50cyA9IFsnaW5wdXQnLCAnY2hhbmdlJywgJ3N1Ym1pdCcsICdmb2N1cycsICdibHVyJ107XG4gICAgICAgIGNvbnN0IG5hdmlnYXRpb25FdmVudHMgPSBbJ2JlZm9yZXVubG9hZCcsICd1bmxvYWQnLCAncG9wc3RhdGUnLCAnaGFzaGNoYW5nZSddO1xuICAgICAgICBpZiAobW91c2VFdmVudHMuaW5jbHVkZXMoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnJlY29yZE1vdXNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXlib2FyZEV2ZW50cy5pbmNsdWRlcyhldmVudFR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucmVjb3JkS2V5Ym9hcmQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvcm1FdmVudHMuaW5jbHVkZXMoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnJlY29yZEZvcm1zO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYXZpZ2F0aW9uRXZlbnRzLmluY2x1ZGVzKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5yZWNvcmROYXZpZ2F0aW9uO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsbG93IG90aGVyIGV2ZW50cyBieSBkZWZhdWx0XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBldmVudCBzaG91bGQgYmUgdGhyb3R0bGVkXG4gICAgICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gY2hlY2tcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIGV2ZW50IGlzIHRocm90dGxlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgaXNFdmVudFRocm90dGxlZChldmVudCkge1xuICAgICAgICBjb25zdCBldmVudEtleSA9IHRoaXMuZ2V0RXZlbnRLZXkoZXZlbnQpO1xuICAgICAgICBjb25zdCBsYXN0VGltZSA9IHRoaXMubGFzdEV2ZW50VGltZS5nZXQoZXZlbnRLZXkpO1xuICAgICAgICBpZiAoIWxhc3RUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIEZpcnN0IGV2ZW50IG9mIHRoaXMgdHlwZVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRpbWVTaW5jZUxhc3RFdmVudCA9IERhdGUubm93KCkgLSBsYXN0VGltZTtcbiAgICAgICAgcmV0dXJuIHRpbWVTaW5jZUxhc3RFdmVudCA8IHRoaXMuY29uZmlnLnRocm90dGxlVGltZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgdW5pcXVlIGtleSBmb3IgZXZlbnQgdGhyb3R0bGluZ1xuICAgICAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGdlbmVyYXRlIGtleSBmb3JcbiAgICAgKiBAcmV0dXJucyBVbmlxdWUgZXZlbnQga2V5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRFdmVudEtleShldmVudCkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGNvbnN0IHRhZ05hbWUgPSB0YXJnZXQudGFnTmFtZSB8fCAndW5rbm93bic7XG4gICAgICAgIGNvbnN0IGlkID0gdGFyZ2V0LmlkIHx8ICcnO1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSB0YXJnZXQuY2xhc3NOYW1lIHx8ICcnO1xuICAgICAgICByZXR1cm4gYCR7ZXZlbnQudHlwZX1fJHt0YWdOYW1lfV8ke2lkfV8ke2NsYXNzTmFtZX1gO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBcHBseSBldmVudC1zcGVjaWZpYyBmaWx0ZXJpbmcgbG9naWNcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBmaWx0ZXJcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIGV2ZW50IHNob3VsZCBiZSByZWNvcmRlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXBwbHlFdmVudFNwZWNpZmljRmlsdGVycyhldmVudCkge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ21vdXNlbW92ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hvdWxkUmVjb3JkTW91c2VNb3ZlKGV2ZW50KTtcbiAgICAgICAgICAgIGNhc2UgJ2NsaWNrJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaG91bGRSZWNvcmRDbGljayhldmVudCk7XG4gICAgICAgICAgICBjYXNlICdrZXlkb3duJzpcbiAgICAgICAgICAgIGNhc2UgJ2tleXVwJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaG91bGRSZWNvcmRLZXlib2FyZChldmVudCk7XG4gICAgICAgICAgICBjYXNlICdpbnB1dCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hvdWxkUmVjb3JkSW5wdXQoZXZlbnQpO1xuICAgICAgICAgICAgY2FzZSAnc2Nyb2xsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaG91bGRSZWNvcmRTY3JvbGwoZXZlbnQpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBtb3VzZSBtb3ZlIHNob3VsZCBiZSByZWNvcmRlZFxuICAgICAqIEBwYXJhbSBldmVudCAtIE1vdXNlIG1vdmUgZXZlbnRcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRvIHJlY29yZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2hvdWxkUmVjb3JkTW91c2VNb3ZlKGV2ZW50KSB7XG4gICAgICAgIC8vIE9ubHkgcmVjb3JkIG1vdXNlIG1vdmVzIGR1cmluZyBkcmFnIG9wZXJhdGlvbnMgb3Igb3ZlciBpbnRlcmFjdGl2ZSBlbGVtZW50c1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmIChldmVudC5idXR0b25zID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIE1vdXNlIGJ1dHRvbiBpcyBwcmVzc2VkIChkcmFnZ2luZylcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBpZiBvdmVyIGludGVyYWN0aXZlIGVsZW1lbnRcbiAgICAgICAgY29uc3QgaW50ZXJhY3RpdmVUYWdzID0gWydidXR0b24nLCAnYScsICdpbnB1dCcsICdzZWxlY3QnLCAndGV4dGFyZWEnXTtcbiAgICAgICAgcmV0dXJuIGludGVyYWN0aXZlVGFncy5pbmNsdWRlcyh0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgY2xpY2sgc2hvdWxkIGJlIHJlY29yZGVkXG4gICAgICogQHBhcmFtIGV2ZW50IC0gQ2xpY2sgZXZlbnRcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRvIHJlY29yZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2hvdWxkUmVjb3JkQ2xpY2soZXZlbnQpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAvLyBTa2lwIHJpZ2h0IGNsaWNrcyBhbmQgbWlkZGxlIGNsaWNrcyBmb3Igbm93XG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTa2lwIGNsaWNrcyBvbiBub24taW50ZXJhY3RpdmUgZWxlbWVudHMgdW5sZXNzIHRoZXkgaGF2ZSBldmVudCBoYW5kbGVyc1xuICAgICAgICBjb25zdCBpbnRlcmFjdGl2ZVRhZ3MgPSBbJ2EnLCAnYnV0dG9uJywgJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYScsICdsYWJlbCddO1xuICAgICAgICBjb25zdCBoYXNDbGlja0hhbmRsZXIgPSB0aGlzLmVsZW1lbnRIYXNDbGlja0hhbmRsZXIodGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIGludGVyYWN0aXZlVGFncy5pbmNsdWRlcyh0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgaGFzQ2xpY2tIYW5kbGVyIHx8XG4gICAgICAgICAgICB0YXJnZXQuZ2V0QXR0cmlidXRlKCdyb2xlJykgPT09ICdidXR0b24nO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBrZXlib2FyZCBldmVudCBzaG91bGQgYmUgcmVjb3JkZWRcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBLZXlib2FyZCBldmVudFxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdG8gcmVjb3JkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzaG91bGRSZWNvcmRLZXlib2FyZChldmVudCkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIC8vIE9ubHkgcmVjb3JkIGtleWJvYXJkIGV2ZW50cyBvbiBpbnB1dCBlbGVtZW50c1xuICAgICAgICBjb25zdCBpbnB1dFRhZ3MgPSBbJ2lucHV0JywgJ3RleHRhcmVhJ107XG4gICAgICAgIGNvbnN0IGlzQ29udGVudEVkaXRhYmxlID0gdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJyk7XG4gICAgICAgIGlmICghaW5wdXRUYWdzLmluY2x1ZGVzKHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpICYmICFpc0NvbnRlbnRFZGl0YWJsZSkge1xuICAgICAgICAgICAgLy8gUmVjb3JkIG5hdmlnYXRpb24ga2V5cyBldmVuIG91dHNpZGUgaW5wdXQgZmllbGRzXG4gICAgICAgICAgICBjb25zdCBuYXZpZ2F0aW9uS2V5cyA9IFsnRW50ZXInLCAnVGFiJywgJ0VzY2FwZScsICdBcnJvd1VwJywgJ0Fycm93RG93bicsICdBcnJvd0xlZnQnLCAnQXJyb3dSaWdodCddO1xuICAgICAgICAgICAgcmV0dXJuIG5hdmlnYXRpb25LZXlzLmluY2x1ZGVzKGV2ZW50LmtleSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGlucHV0IGV2ZW50IHNob3VsZCBiZSByZWNvcmRlZFxuICAgICAqIEBwYXJhbSBldmVudCAtIElucHV0IGV2ZW50XG4gICAgICogQHJldHVybnMgV2hldGhlciB0byByZWNvcmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNob3VsZFJlY29yZElucHV0KGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgLy8gU2tpcCBwYXNzd29yZCBmaWVsZHMgZm9yIHNlY3VyaXR5ICh3aWxsIGJlIGhhbmRsZWQgc3BlY2lhbGx5KVxuICAgICAgICBpZiAodGFyZ2V0LnR5cGUgPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBSZWNvcmQgYnV0IHdpbGwgYmUgbWFza2VkIGxhdGVyXG4gICAgICAgIH1cbiAgICAgICAgLy8gU2tpcCB2ZXJ5IGZyZXF1ZW50IGlucHV0IGV2ZW50cyBvbiByYW5nZSBzbGlkZXJzXG4gICAgICAgIGlmICh0YXJnZXQudHlwZSA9PT0gJ3JhbmdlJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBzY3JvbGwgZXZlbnQgc2hvdWxkIGJlIHJlY29yZGVkXG4gICAgICogQHBhcmFtIGV2ZW50IC0gU2Nyb2xsIGV2ZW50XG4gICAgICogQHJldHVybnMgV2hldGhlciB0byByZWNvcmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNob3VsZFJlY29yZFNjcm9sbChldmVudCkge1xuICAgICAgICAvLyBBbHdheXMgcmVjb3JkIHNjcm9sbCBldmVudHMsIGJ1dCB0aGV5J3JlIHRocm90dGxlZCBieSBjb25maWd1cmF0aW9uXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBlbGVtZW50IGhhcyBjbGljayBldmVudCBoYW5kbGVyc1xuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gRWxlbWVudCB0byBjaGVja1xuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgZWxlbWVudCBoYXMgY2xpY2sgaGFuZGxlcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGVsZW1lbnRIYXNDbGlja0hhbmRsZXIoZWxlbWVudCkge1xuICAgICAgICAvLyBUaGlzIGlzIGEgaGV1cmlzdGljIC0gd2UgY2FuJ3QgZGlyZWN0bHkgZGV0ZWN0IGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICAvLyBMb29rIGZvciBjb21tb24gaW5kaWNhdG9yc1xuICAgICAgICAvLyBDaGVjayBmb3IgY3Vyc29yIHBvaW50ZXIgc3R5bGVcbiAgICAgICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuICAgICAgICBpZiAoY29tcHV0ZWRTdHlsZS5jdXJzb3IgPT09ICdwb2ludGVyJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbW1vbiBjbGljay1yZWxhdGVkIGF0dHJpYnV0ZXNcbiAgICAgICAgY29uc3QgY2xpY2tBdHRyaWJ1dGVzID0gWydvbmNsaWNrJywgJ2RhdGEtYWN0aW9uJywgJ2RhdGEtY2xpY2snLCAnZGF0YS10b2dnbGUnXTtcbiAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIGNsaWNrQXR0cmlidXRlcykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbW1vbiBjbGlja2FibGUgY2xhc3Nlc1xuICAgICAgICBjb25zdCBjbGlja2FibGVDbGFzc2VzID0gWydidG4nLCAnYnV0dG9uJywgJ2NsaWNrYWJsZScsICdsaW5rJywgJ2FjdGlvbiddO1xuICAgICAgICBjb25zdCBlbGVtZW50Q2xhc3NlcyA9IGVsZW1lbnQuY2xhc3NOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGZvciAoY29uc3QgY2xzIG9mIGNsaWNrYWJsZUNsYXNzZXMpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50Q2xhc3Nlcy5pbmNsdWRlcyhjbHMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IHJlbGV2YW50IGRhdGEgZnJvbSBhbiBldmVudFxuICAgICAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGV4dHJhY3QgZGF0YSBmcm9tXG4gICAgICogQHJldHVybnMgRXZlbnQgZGF0YSBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGV4dHJhY3RFdmVudERhdGEoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgYmFzZURhdGEgPSB7XG4gICAgICAgICAgICB0eXBlOiBldmVudC50eXBlLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBldmVudC50aW1lU3RhbXAsXG4gICAgICAgICAgICBidWJibGVzOiBldmVudC5idWJibGVzLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogZXZlbnQuY2FuY2VsYWJsZVxuICAgICAgICB9O1xuICAgICAgICAvLyBBZGQgZXZlbnQtc3BlY2lmaWMgZGF0YVxuICAgICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NsaWNrJzpcbiAgICAgICAgICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICAgICAgICBjYXNlICdtb3VzZXVwJzpcbiAgICAgICAgICAgICAgICBjb25zdCBtb3VzZUV2ZW50ID0gZXZlbnQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgLi4uYmFzZURhdGEsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFg6IG1vdXNlRXZlbnQuY2xpZW50WCxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50WTogbW91c2VFdmVudC5jbGllbnRZLFxuICAgICAgICAgICAgICAgICAgICBidXR0b246IG1vdXNlRXZlbnQuYnV0dG9uLFxuICAgICAgICAgICAgICAgICAgICBidXR0b25zOiBtb3VzZUV2ZW50LmJ1dHRvbnMsXG4gICAgICAgICAgICAgICAgICAgIGN0cmxLZXk6IG1vdXNlRXZlbnQuY3RybEtleSxcbiAgICAgICAgICAgICAgICAgICAgc2hpZnRLZXk6IG1vdXNlRXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICAgICAgICAgIGFsdEtleTogbW91c2VFdmVudC5hbHRLZXksXG4gICAgICAgICAgICAgICAgICAgIG1ldGFLZXk6IG1vdXNlRXZlbnQubWV0YUtleVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdrZXlkb3duJzpcbiAgICAgICAgICAgIGNhc2UgJ2tleXVwJzpcbiAgICAgICAgICAgIGNhc2UgJ2tleXByZXNzJzpcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlFdmVudCA9IGV2ZW50O1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmJhc2VEYXRhLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGtleUV2ZW50LmtleSxcbiAgICAgICAgICAgICAgICAgICAgY29kZToga2V5RXZlbnQuY29kZSxcbiAgICAgICAgICAgICAgICAgICAga2V5Q29kZToga2V5RXZlbnQua2V5Q29kZSxcbiAgICAgICAgICAgICAgICAgICAgY3RybEtleToga2V5RXZlbnQuY3RybEtleSxcbiAgICAgICAgICAgICAgICAgICAgc2hpZnRLZXk6IGtleUV2ZW50LnNoaWZ0S2V5LFxuICAgICAgICAgICAgICAgICAgICBhbHRLZXk6IGtleUV2ZW50LmFsdEtleSxcbiAgICAgICAgICAgICAgICAgICAgbWV0YUtleToga2V5RXZlbnQubWV0YUtleVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdpbnB1dCc6XG4gICAgICAgICAgICBjYXNlICdjaGFuZ2UnOlxuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0VGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmJhc2VEYXRhLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaW5wdXRUYXJnZXQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGlucHV0VGFyZ2V0LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGlucHV0VGFyZ2V0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGlkOiBpbnB1dFRhcmdldC5pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdmb2N1cyc6XG4gICAgICAgICAgICBjYXNlICdibHVyJzpcbiAgICAgICAgICAgICAgICBjb25zdCBmb2N1c1RhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAuLi5iYXNlRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZTogZm9jdXNUYXJnZXQudGFnTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogZm9jdXNUYXJnZXQudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZm9jdXNUYXJnZXQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGZvY3VzVGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ3N1Ym1pdCc6XG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybVRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAuLi5iYXNlRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmb3JtVGFyZ2V0LmFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBmb3JtVGFyZ2V0Lm1ldGhvZCxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGZvcm1UYXJnZXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGZvcm1UYXJnZXQubmFtZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdzY3JvbGwnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmJhc2VEYXRhLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxYOiB3aW5kb3cuc2Nyb2xsWCxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsWTogd2luZG93LnNjcm9sbFksXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFdpZHRoOiBkb2N1bWVudC5ib2R5LnNjcm9sbFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxIZWlnaHQ6IGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJhc2VEYXRhO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFNjcmVlbnNob3QgY2FwdHVyZSB1dGlsaXR5IGZvciB2aXN1YWwgdmVyaWZpY2F0aW9uIGFuZCBBSSBoZWFsaW5nXG4gKiBAYXV0aG9yIEF5dXNoIFNodWtsYVxuICogQGRlc2NyaXB0aW9uIEhhbmRsZXMgY2FwdHVyaW5nIHNjcmVlbnNob3RzIG9mIGVsZW1lbnRzIGFuZCBwYWdlIHJlZ2lvbnMuXG4gKiBPcHRpbWl6ZWQgZm9yIHN0b3JhZ2UgZWZmaWNpZW5jeSBhbmQgdmlzdWFsIHJlY29nbml0aW9uLlxuICovXG4vKipcbiAqIERlZmF1bHQgc2NyZWVuc2hvdCBjb25maWd1cmF0aW9uIG9wdGltaXplZCBmb3Igc3RvcmFnZSBhbmQgcmVjb2duaXRpb25cbiAqL1xuY29uc3QgREVGQVVMVF9DT05GSUcgPSB7XG4gICAgbWF4V2lkdGg6IDgwMCxcbiAgICBtYXhIZWlnaHQ6IDYwMCxcbiAgICBxdWFsaXR5OiAwLjgsXG4gICAgZm9ybWF0OiAnanBlZycsXG4gICAgaGlnaGxpZ2h0OiB0cnVlXG59O1xuLyoqXG4gKiBTY3JlZW5zaG90IGNhcHR1cmUgdXRpbGl0eSBjbGFzc1xuICogRm9sbG93cyBTaW5nbGUgUmVzcG9uc2liaWxpdHkgUHJpbmNpcGxlIGZvciBzY3JlZW5zaG90IG9wZXJhdGlvbnNcbiAqL1xuZXhwb3J0IGNsYXNzIFNjcmVlbnNob3RDYXB0dXJlIHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHNjcmVlbnNob3QgY2FwdHVyZSB3aXRoIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gU2NyZWVuc2hvdCBjb25maWd1cmF0aW9uIChvcHRpb25hbClcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihjb25maWcgPSB7fSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYXB0dXJlIHNjcmVlbnNob3Qgb2YgYSBzcGVjaWZpYyBlbGVtZW50IHdpdGggY29udGV4dFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gRWxlbWVudCB0byBjYXB0dXJlXG4gICAgICogQHBhcmFtIHBhZGRpbmcgLSBQYWRkaW5nIGFyb3VuZCBlbGVtZW50IChkZWZhdWx0OiAyMHB4KVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIGJhc2U2NCBzY3JlZW5zaG90IG9yIG51bGxcbiAgICAgKi9cbiAgICBhc3luYyBjYXB0dXJlRWxlbWVudChlbGVtZW50LCBwYWRkaW5nID0gMjApIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGNhcHR1cmUgcmVnaW9uIHdpdGggcGFkZGluZ1xuICAgICAgICAgICAgY29uc3QgY2FwdHVyZVJlZ2lvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiBNYXRoLm1heCgwLCByZWN0LmxlZnQgLSBwYWRkaW5nKSxcbiAgICAgICAgICAgICAgICB5OiBNYXRoLm1heCgwLCByZWN0LnRvcCAtIHBhZGRpbmcpLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBNYXRoLm1pbih3aW5kb3cuaW5uZXJXaWR0aCAtIHJlY3QubGVmdCArIHBhZGRpbmcsIHJlY3Qud2lkdGggKyAocGFkZGluZyAqIDIpKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3QudG9wICsgcGFkZGluZywgcmVjdC5oZWlnaHQgKyAocGFkZGluZyAqIDIpKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIFNjcm9sbCBlbGVtZW50IGludG8gdmlldyBpZiBuZWVkZWRcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRWxlbWVudE91dE9mVmlldyhlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgICAgICAgICAgICBiZWhhdmlvcjogJ2luc3RhbnQnLFxuICAgICAgICAgICAgICAgICAgICBibG9jazogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogJ2NlbnRlcidcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBXYWl0IGZvciBzY3JvbGwgdG8gY29tcGxldGVcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNsZWVwKDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBIaWdobGlnaHQgZWxlbWVudCBpZiBjb25maWd1cmVkXG4gICAgICAgICAgICBsZXQgaGlnaGxpZ2h0RWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWcuaGlnaGxpZ2h0KSB7XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0RWxlbWVudCA9IHRoaXMuYWRkRWxlbWVudEhpZ2hsaWdodChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gQ2FwdHVyZSB0aGUgdmlzaWJsZSBhcmVhXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NyZWVuc2hvdCA9IGF3YWl0IHRoaXMuY2FwdHVyZVZpc2libGVBcmVhKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNjcmVlbnNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JvcCB0byB0aGUgc3BlY2lmaWMgcmVnaW9uXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyb3BwZWRTY3JlZW5zaG90ID0gYXdhaXQgdGhpcy5jcm9wU2NyZWVuc2hvdChzY3JlZW5zaG90LCBjYXB0dXJlUmVnaW9uLCB0aGlzLmNvbmZpZyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjcm9wcGVkU2NyZWVuc2hvdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgaGlnaGxpZ2h0XG4gICAgICAgICAgICAgICAgaWYgKGhpZ2hsaWdodEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0RWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1NjcmVlbnNob3RDYXB0dXJlOiBFcnJvciBjYXB0dXJpbmcgZWxlbWVudCBzY3JlZW5zaG90OicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhcHR1cmUgc2NyZWVuc2hvdCBvZiB0aGUgdmlzaWJsZSBwYWdlIGFyZWFcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byBiYXNlNjQgc2NyZWVuc2hvdCBvciBudWxsXG4gICAgICovXG4gICAgYXN5bmMgY2FwdHVyZVZpc2libGUoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzY3JlZW5zaG90ID0gYXdhaXQgdGhpcy5jYXB0dXJlVmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgIGlmIChzY3JlZW5zaG90KSB7XG4gICAgICAgICAgICAgICAgLy8gUmVzaXplIGlmIG5lZWRlZCB0byBzdGF5IHdpdGhpbiBsaW1pdHNcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZXNpemVTY3JlZW5zaG90KHNjcmVlbnNob3QsIHRoaXMuY29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2NyZWVuc2hvdENhcHR1cmU6IEVycm9yIGNhcHR1cmluZyB2aXNpYmxlIHNjcmVlbnNob3Q6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FwdHVyZSBmdWxsIHBhZ2Ugc2NyZWVuc2hvdCAoaWYgcG9zc2libGUpXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gYmFzZTY0IHNjcmVlbnNob3Qgb3IgbnVsbFxuICAgICAqL1xuICAgIGFzeW5jIGNhcHR1cmVGdWxsUGFnZSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFRoaXMgcmVxdWlyZXMgdGhlIGJhY2tncm91bmQgc2NyaXB0IHRvIGhhbmRsZSB2aWEgY2hyb21lLnRhYnMuY2FwdHVyZVZpc2libGVUYWJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogJ0NBUFRVUkVfRlVMTF9QQUdFJyB9LCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZT8uc2NyZWVuc2hvdCB8fCBudWxsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2NyZWVuc2hvdENhcHR1cmU6IEVycm9yIGNhcHR1cmluZyBmdWxsIHBhZ2Ugc2NyZWVuc2hvdDonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYXB0dXJlIHNjcmVlbnNob3Qgd2l0aCBlbGVtZW50IGhpZ2hsaWdodGluZyBmb3IgbXVsdGlwbGUgZWxlbWVudHNcbiAgICAgKiBAcGFyYW0gZWxlbWVudHMgLSBFbGVtZW50cyB0byBoaWdobGlnaHRcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byBiYXNlNjQgc2NyZWVuc2hvdCBvciBudWxsXG4gICAgICovXG4gICAgYXN5bmMgY2FwdHVyZVdpdGhIaWdobGlnaHRzKGVsZW1lbnRzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBoaWdobGlnaHRzID0gW107XG4gICAgICAgICAgICAvLyBBZGQgaGlnaGxpZ2h0cyB0byBhbGwgZWxlbWVudHNcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhpZ2hsaWdodCA9IHRoaXMuYWRkRWxlbWVudEhpZ2hsaWdodChlbGVtZW50LCAnIzNiODJmNicpOyAvLyBCbHVlIGhpZ2hsaWdodFxuICAgICAgICAgICAgICAgIGlmIChoaWdobGlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cy5wdXNoKGhpZ2hsaWdodCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzY3JlZW5zaG90ID0gYXdhaXQgdGhpcy5jYXB0dXJlVmlzaWJsZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzY3JlZW5zaG90O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgaGlnaGxpZ2h0c1xuICAgICAgICAgICAgICAgIGhpZ2hsaWdodHMuZm9yRWFjaChoaWdobGlnaHQgPT4gaGlnaGxpZ2h0LnJlbW92ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1NjcmVlbnNob3RDYXB0dXJlOiBFcnJvciBjYXB0dXJpbmcgd2l0aCBoaWdobGlnaHRzOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhcHR1cmUgdGhlIHZpc2libGUgYXJlYSB1c2luZyBjaHJvbWUudGFicyBBUEkgdmlhIGJhY2tncm91bmQgc2NyaXB0XG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gYmFzZTY0IHNjcmVlbnNob3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGNhcHR1cmVWaXNpYmxlQXJlYSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogJ0NBUFRVUkVfVklTSUJMRV9UQUInIH0sIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2U/LmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTY3JlZW5zaG90Q2FwdHVyZTogQmFja2dyb3VuZCBzY3JpcHQgZXJyb3I6JywgcmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2U/LnNjcmVlbnNob3QgfHwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2NyZWVuc2hvdENhcHR1cmU6IEVycm9yIGNvbW11bmljYXRpbmcgd2l0aCBiYWNrZ3JvdW5kIHNjcmlwdDonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBlbGVtZW50IGlzIG91dCBvZiB0aGUgY3VycmVudCB2aWV3cG9ydFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gRWxlbWVudCB0byBjaGVja1xuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgZWxlbWVudCBpcyBvdXQgb2Ygdmlld1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgaXNFbGVtZW50T3V0T2ZWaWV3KGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHJldHVybiAocmVjdC5ib3R0b20gPCAwIHx8XG4gICAgICAgICAgICByZWN0LnJpZ2h0IDwgMCB8fFxuICAgICAgICAgICAgcmVjdC5sZWZ0ID4gd2luZG93LmlubmVyV2lkdGggfHxcbiAgICAgICAgICAgIHJlY3QudG9wID4gd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIHZpc3VhbCBoaWdobGlnaHQgdG8gYW4gZWxlbWVudFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gRWxlbWVudCB0byBoaWdobGlnaHRcbiAgICAgKiBAcGFyYW0gY29sb3IgLSBIaWdobGlnaHQgY29sb3IgKGRlZmF1bHQ6IHJlZClcbiAgICAgKiBAcmV0dXJucyBIaWdobGlnaHQgZWxlbWVudCBvciBudWxsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhZGRFbGVtZW50SGlnaGxpZ2h0KGVsZW1lbnQsIGNvbG9yID0gJyNlZjQ0NDQnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IGhpZ2hsaWdodCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGlnaGxpZ2h0LmNsYXNzTmFtZSA9ICdhdXRvZmxvdy1lbGVtZW50LWhpZ2hsaWdodCc7XG4gICAgICAgICAgICBoaWdobGlnaHQuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICBsZWZ0OiAke3JlY3QubGVmdH1weDtcbiAgICAgICAgdG9wOiAke3JlY3QudG9wfXB4O1xuICAgICAgICB3aWR0aDogJHtyZWN0LndpZHRofXB4O1xuICAgICAgICBoZWlnaHQ6ICR7cmVjdC5oZWlnaHR9cHg7XG4gICAgICAgIGJvcmRlcjogMnB4IHNvbGlkICR7Y29sb3J9O1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2NvbG9yfTIwO1xuICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgei1pbmRleDogOTk5OTk4O1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICBib3JkZXItcmFkaXVzOiAycHg7XG4gICAgICBgO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChoaWdobGlnaHQpO1xuICAgICAgICAgICAgcmV0dXJuIGhpZ2hsaWdodDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignU2NyZWVuc2hvdENhcHR1cmU6IEVycm9yIGFkZGluZyBlbGVtZW50IGhpZ2hsaWdodDonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcm9wIHNjcmVlbnNob3QgdG8gc3BlY2lmaWMgcmVnaW9uXG4gICAgICogQHBhcmFtIHNjcmVlbnNob3QgLSBCYXNlNjQgc2NyZWVuc2hvdCBkYXRhXG4gICAgICogQHBhcmFtIHJlZ2lvbiAtIFJlZ2lvbiB0byBjcm9wXG4gICAgICogQHBhcmFtIGNvbmZpZyAtIFNjcmVlbnNob3QgY29uZmlndXJhdGlvblxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIGNyb3BwZWQgc2NyZWVuc2hvdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgY3JvcFNjcmVlbnNob3Qoc2NyZWVuc2hvdCwgcmVnaW9uLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFjdHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2Fubm90IGdldCBjYW52YXMgY29udGV4dCcpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGNhbnZhcyBzaXplIHRvIGNyb3BwZWQgcmVnaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMud2lkdGggPSByZWdpb24ud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gcmVnaW9uLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERyYXcgY3JvcHBlZCBwb3J0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgcmVnaW9uLngsIHJlZ2lvbi55LCByZWdpb24ud2lkdGgsIHJlZ2lvbi5oZWlnaHQsIDAsIDAsIHJlZ2lvbi53aWR0aCwgcmVnaW9uLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRvIGRlc2lyZWQgZm9ybWF0IGFuZCBxdWFsaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcm9wcGVkRGF0YSA9IGNhbnZhcy50b0RhdGFVUkwoYGltYWdlLyR7Y29uZmlnLmZvcm1hdH1gLCBjb25maWcucXVhbGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNyb3BwZWREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdGYWlsZWQgdG8gbG9hZCBzY3JlZW5zaG90IGltYWdlJykpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9IHNjcmVlbnNob3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVzaXplIHNjcmVlbnNob3QgdG8gZml0IHdpdGhpbiBtYXhpbXVtIGRpbWVuc2lvbnNcbiAgICAgKiBAcGFyYW0gc2NyZWVuc2hvdCAtIEJhc2U2NCBzY3JlZW5zaG90IGRhdGFcbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gU2NyZWVuc2hvdCBjb25maWd1cmF0aW9uXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gcmVzaXplZCBzY3JlZW5zaG90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyByZXNpemVTY3JlZW5zaG90KHNjcmVlbnNob3QsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgICAgICBpZiAoIWN0eCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdDYW5ub3QgZ2V0IGNhbnZhcyBjb250ZXh0JykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgbmV3IGRpbWVuc2lvbnMgbWFpbnRhaW5pbmcgYXNwZWN0IHJhdGlvXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHdpZHRoOiBuZXdXaWR0aCwgaGVpZ2h0OiBuZXdIZWlnaHQgfSA9IHRoaXMuY2FsY3VsYXRlUmVzaXplRGltZW5zaW9ucyhpbWcud2lkdGgsIGltZy5oZWlnaHQsIGNvbmZpZy5tYXhXaWR0aCwgY29uZmlnLm1heEhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTZXQgY2FudmFzIHNpemVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IG5ld1dpZHRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IG5ld0hlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERyYXcgcmVzaXplZCBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDAsIG5ld1dpZHRoLCBuZXdIZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCB0byBkZXNpcmVkIGZvcm1hdCBhbmQgcXVhbGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzaXplZERhdGEgPSBjYW52YXMudG9EYXRhVVJMKGBpbWFnZS8ke2NvbmZpZy5mb3JtYXR9YCwgY29uZmlnLnF1YWxpdHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNpemVkRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgc2NyZWVuc2hvdCBpbWFnZScpKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGltZy5zcmMgPSBzY3JlZW5zaG90O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSBuZXcgZGltZW5zaW9ucyBmb3IgcmVzaXppbmcgd2hpbGUgbWFpbnRhaW5pbmcgYXNwZWN0IHJhdGlvXG4gICAgICogQHBhcmFtIG9yaWdpbmFsV2lkdGggLSBPcmlnaW5hbCBpbWFnZSB3aWR0aFxuICAgICAqIEBwYXJhbSBvcmlnaW5hbEhlaWdodCAtIE9yaWdpbmFsIGltYWdlIGhlaWdodFxuICAgICAqIEBwYXJhbSBtYXhXaWR0aCAtIE1heGltdW0gYWxsb3dlZCB3aWR0aFxuICAgICAqIEBwYXJhbSBtYXhIZWlnaHQgLSBNYXhpbXVtIGFsbG93ZWQgaGVpZ2h0XG4gICAgICogQHJldHVybnMgTmV3IGRpbWVuc2lvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGNhbGN1bGF0ZVJlc2l6ZURpbWVuc2lvbnMob3JpZ2luYWxXaWR0aCwgb3JpZ2luYWxIZWlnaHQsIG1heFdpZHRoLCBtYXhIZWlnaHQpIHtcbiAgICAgICAgLy8gSWYgaW1hZ2UgaXMgYWxyZWFkeSB3aXRoaW4gbGltaXRzLCByZXR1cm4gb3JpZ2luYWwgc2l6ZVxuICAgICAgICBpZiAob3JpZ2luYWxXaWR0aCA8PSBtYXhXaWR0aCAmJiBvcmlnaW5hbEhlaWdodCA8PSBtYXhIZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHdpZHRoOiBvcmlnaW5hbFdpZHRoLCBoZWlnaHQ6IG9yaWdpbmFsSGVpZ2h0IH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHNjYWxlIGZhY3RvcnNcbiAgICAgICAgY29uc3Qgc2NhbGVYID0gbWF4V2lkdGggLyBvcmlnaW5hbFdpZHRoO1xuICAgICAgICBjb25zdCBzY2FsZVkgPSBtYXhIZWlnaHQgLyBvcmlnaW5hbEhlaWdodDtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogTWF0aC5mbG9vcihvcmlnaW5hbFdpZHRoICogc2NhbGUpLFxuICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLmZsb29yKG9yaWdpbmFsSGVpZ2h0ICogc2NhbGUpXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNsZWVwIHV0aWxpdHkgZm9yIHdhaXRpbmdcbiAgICAgKiBAcGFyYW0gbXMgLSBNaWxsaXNlY29uZHMgdG8gc2xlZXBcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXIgZGVsYXlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNsZWVwKG1zKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGVzdGltYXRlZCBzY3JlZW5zaG90IGZpbGUgc2l6ZSBpbiBieXRlc1xuICAgICAqIEBwYXJhbSBzY3JlZW5zaG90IC0gQmFzZTY0IHNjcmVlbnNob3QgZGF0YVxuICAgICAqIEByZXR1cm5zIEVzdGltYXRlZCBmaWxlIHNpemUgaW4gYnl0ZXNcbiAgICAgKi9cbiAgICBnZXRTY3JlZW5zaG90U2l6ZShzY3JlZW5zaG90KSB7XG4gICAgICAgIC8vIEJhc2U2NCBlbmNvZGluZyBpbmNyZWFzZXMgc2l6ZSBieSB+MzMlXG4gICAgICAgIC8vIFJlbW92ZSBkYXRhIFVSTCBwcmVmaXggaWYgcHJlc2VudFxuICAgICAgICBjb25zdCBiYXNlNjREYXRhID0gc2NyZWVuc2hvdC5yZXBsYWNlKC9eZGF0YTppbWFnZVxcL1thLXpdKztiYXNlNjQsLywgJycpO1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoYmFzZTY0RGF0YS5sZW5ndGggKiAzKSAvIDQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb21wcmVzcyBzY3JlZW5zaG90IGlmIGl0J3MgdG9vIGxhcmdlXG4gICAgICogQHBhcmFtIHNjcmVlbnNob3QgLSBCYXNlNjQgc2NyZWVuc2hvdCBkYXRhXG4gICAgICogQHBhcmFtIG1heFNpemUgLSBNYXhpbXVtIHNpemUgaW4gYnl0ZXMgKGRlZmF1bHQ6IDUwMEtCKVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIGNvbXByZXNzZWQgc2NyZWVuc2hvdFxuICAgICAqL1xuICAgIGFzeW5jIGNvbXByZXNzSWZOZWVkZWQoc2NyZWVuc2hvdCwgbWF4U2l6ZSA9IDUwMCAqIDEwMjQpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFNpemUgPSB0aGlzLmdldFNjcmVlbnNob3RTaXplKHNjcmVlbnNob3QpO1xuICAgICAgICBpZiAoY3VycmVudFNpemUgPD0gbWF4U2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHNjcmVlbnNob3Q7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVkdWNlIHF1YWxpdHkgYW5kIHRyeSBhZ2FpblxuICAgICAgICBjb25zdCBjb21wcmVzc2VkQ29uZmlnID0ge1xuICAgICAgICAgICAgLi4udGhpcy5jb25maWcsXG4gICAgICAgICAgICBxdWFsaXR5OiBNYXRoLm1heCgwLjMsIHRoaXMuY29uZmlnLnF1YWxpdHkgKiAwLjcpXG4gICAgICAgIH07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb21wcmVzc2VkID0gYXdhaXQgdGhpcy5yZXNpemVTY3JlZW5zaG90KHNjcmVlbnNob3QsIGNvbXByZXNzZWRDb25maWcpO1xuICAgICAgICAgICAgY29uc3QgY29tcHJlc3NlZFNpemUgPSB0aGlzLmdldFNjcmVlbnNob3RTaXplKGNvbXByZXNzZWQpO1xuICAgICAgICAgICAgaWYgKGNvbXByZXNzZWRTaXplIDw9IG1heFNpemUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcHJlc3NlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHN0aWxsIHRvbyBsYXJnZSwgcmVkdWNlIGRpbWVuc2lvbnNcbiAgICAgICAgICAgIGNvbnN0IGZ1cnRoZXJDb21wcmVzc2VkID0gYXdhaXQgdGhpcy5yZXNpemVTY3JlZW5zaG90KGNvbXByZXNzZWQsIHtcbiAgICAgICAgICAgICAgICAuLi5jb21wcmVzc2VkQ29uZmlnLFxuICAgICAgICAgICAgICAgIG1heFdpZHRoOiBNYXRoLmZsb29yKGNvbXByZXNzZWRDb25maWcubWF4V2lkdGggKiAwLjgpLFxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogTWF0aC5mbG9vcihjb21wcmVzc2VkQ29uZmlnLm1heEhlaWdodCAqIDAuOClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZ1cnRoZXJDb21wcmVzc2VkO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdTY3JlZW5zaG90Q2FwdHVyZTogRXJyb3IgY29tcHJlc3Npbmcgc2NyZWVuc2hvdDonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gc2NyZWVuc2hvdDsgLy8gUmV0dXJuIG9yaWdpbmFsIGlmIGNvbXByZXNzaW9uIGZhaWxzXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgU2VsZWN0b3IgZXh0cmFjdGlvbiB1dGlsaXR5IGZvciByb2J1c3QgZWxlbWVudCB0YXJnZXRpbmdcbiAqIEBhdXRob3IgQXl1c2ggU2h1a2xhXG4gKiBAZGVzY3JpcHRpb24gRXh0cmFjdHMgbXVsdGlwbGUgc2VsZWN0b3Igc3RyYXRlZ2llcyBmb3IgcmVsaWFibGUgZWxlbWVudCBmaW5kaW5nLlxuICogSW1wbGVtZW50cyBJbnRlcmZhY2UgU2VncmVnYXRpb24gUHJpbmNpcGxlIHdpdGggZm9jdXNlZCBzZWxlY3RvciBzdHJhdGVnaWVzLlxuICovXG4vKipcbiAqIENTUyBzZWxlY3RvciBleHRyYWN0aW9uIHN0cmF0ZWd5XG4gKi9cbmNsYXNzIENzc1NlbGVjdG9yU3RyYXRlZ3kge1xuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgQ1NTIHNlbGVjdG9yIGZvciB0aGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyBDU1Mgc2VsZWN0b3Igc3RyaW5nIG9yIG51bGxcbiAgICAgKi9cbiAgICBleHRyYWN0KGVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFRyeSBJRCBmaXJzdCAoaGlnaGVzdCBzcGVjaWZpY2l0eSlcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlkICYmIC9eW2EtekEtWl1bXFx3LV0qJC8udGVzdChlbGVtZW50LmlkKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkU2VsZWN0b3IgPSBgIyR7ZWxlbWVudC5pZH1gO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVW5pcXVlKGlkU2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpZFNlbGVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRyeSBkYXRhIGF0dHJpYnV0ZXMgKGdvb2QgZm9yIGF1dG9tYXRpb24pXG4gICAgICAgICAgICBjb25zdCBkYXRhQXR0cnMgPSBbJ2RhdGEtdGVzdGlkJywgJ2RhdGEtdGVzdCcsICdkYXRhLWN5JywgJ2RhdGEtYXV0b21hdGlvbiddO1xuICAgICAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIGRhdGFBdHRycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFTZWxlY3RvciA9IGBbJHthdHRyfT1cIiR7dmFsdWV9XCJdYDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNVbmlxdWUoZGF0YVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFTZWxlY3RvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRyeSBjbGFzcy1iYXNlZCBzZWxlY3RvclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFzc1NlbGVjdG9yID0gYC4ke0FycmF5LmZyb20oZWxlbWVudC5jbGFzc0xpc3QpLmpvaW4oJy4nKX1gO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVW5pcXVlKGNsYXNzU2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbGFzc1NlbGVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRyeSB0YWcgKyBhdHRyaWJ1dGVzIGNvbWJpbmF0aW9uXG4gICAgICAgICAgICBjb25zdCB0YWdTZWxlY3RvciA9IHRoaXMuZ2VuZXJhdGVUYWdBdHRyaWJ1dGVTZWxlY3RvcihlbGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0YWdTZWxlY3RvciAmJiB0aGlzLmlzVW5pcXVlKHRhZ1NlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YWdTZWxlY3RvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZhbGwgYmFjayB0byBudGgtY2hpbGQgc2VsZWN0b3JcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRlTnRoQ2hpbGRTZWxlY3RvcihlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ3NzU2VsZWN0b3JTdHJhdGVneTogRXJyb3IgZXh0cmFjdGluZyBzZWxlY3RvcjonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcHJpb3JpdHkgb2YgdGhpcyBzdHJhdGVneSAoaGlnaGVyIGlzIGJldHRlcilcbiAgICAgKi9cbiAgICBnZXRQcmlvcml0eSgpIHtcbiAgICAgICAgcmV0dXJuIDkwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgc2VsZWN0b3IgaXMgdmFsaWQgZm9yIHRoZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHNlbGVjdG9yIC0gQ1NTIHNlbGVjdG9yIHRvIHZhbGlkYXRlXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHNlbGVjdG9yIGlzIHZhbGlkXG4gICAgICovXG4gICAgaXNWYWxpZChzZWxlY3RvciwgZWxlbWVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZm91bmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIHJldHVybiBmb3VuZCA9PT0gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHNlbGVjdG9yIHJldHVybnMgb25seSBvbmUgZWxlbWVudFxuICAgICAqIEBwYXJhbSBzZWxlY3RvciAtIENTUyBzZWxlY3RvciB0byBjaGVja1xuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHNlbGVjdG9yIGlzIHVuaXF1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgaXNVbmlxdWUoc2VsZWN0b3IpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5sZW5ndGggPT09IDE7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgc2VsZWN0b3IgYmFzZWQgb24gdGFnIGFuZCBhdHRyaWJ1dGVzXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIFRhZyArIGF0dHJpYnV0ZSBzZWxlY3RvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2VuZXJhdGVUYWdBdHRyaWJ1dGVTZWxlY3RvcihlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHRhZyA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gW107XG4gICAgICAgIC8vIENoZWNrIHVzZWZ1bCBhdHRyaWJ1dGVzXG4gICAgICAgIGNvbnN0IHVzZWZ1bEF0dHJzID0gWyduYW1lJywgJ3R5cGUnLCAndmFsdWUnLCAncGxhY2Vob2xkZXInLCAndGl0bGUnLCAncm9sZScsICdhcmlhLWxhYmVsJ107XG4gICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiB1c2VmdWxBdHRycykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPCA1MCkgeyAvLyBBdm9pZCB2ZXJ5IGxvbmcgdmFsdWVzXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5wdXNoKGBbJHthdHRyfT1cIiR7dmFsdWV9XCJdYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGAke3RhZ30ke2F0dHJpYnV0ZXMuam9pbignJyl9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgbnRoLWNoaWxkIHNlbGVjdG9yIGFzIGxhc3QgcmVzb3J0XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIG50aC1jaGlsZCBzZWxlY3RvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2VuZXJhdGVOdGhDaGlsZFNlbGVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGF0aCA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBjdXJyZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaWJsaW5ncyA9IEFycmF5LmZyb20oY3VycmVudC5wYXJlbnRFbGVtZW50LmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdzLmluZGV4T2YoY3VycmVudCkgKyAxO1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yICs9IGA6bnRoLWNoaWxkKCR7aW5kZXh9KWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoLnVuc2hpZnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIC8vIExpbWl0IGRlcHRoIHRvIGF2b2lkIHZlcnkgbG9uZyBzZWxlY3RvcnNcbiAgICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+PSA1KVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oJyA+ICcpO1xuICAgIH1cbn1cbi8qKlxuICogWFBhdGggc2VsZWN0b3IgZXh0cmFjdGlvbiBzdHJhdGVneVxuICovXG5jbGFzcyBYUGF0aFNlbGVjdG9yU3RyYXRlZ3kge1xuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgWFBhdGggc2VsZWN0b3IgZm9yIHRoZSBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIFhQYXRoIHNlbGVjdG9yIHN0cmluZyBvciBudWxsXG4gICAgICovXG4gICAgZXh0cmFjdChlbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gW107XG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IGVsZW1lbnQ7XG4gICAgICAgICAgICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhZ05hbWUgPSBjdXJyZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudC5pZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2UgSUQgZm9yIHNob3J0ZXIgWFBhdGhcbiAgICAgICAgICAgICAgICAgICAgcGF0aC51bnNoaWZ0KGAvLyR7dGFnTmFtZX1bQGlkPScke2N1cnJlbnQuaWR9J11gKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGN1cnJlbnQucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaWJsaW5ncyA9IEFycmF5LmZyb20oY3VycmVudC5wYXJlbnRFbGVtZW50LmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2FtZVRhZ1NpYmxpbmdzID0gc2libGluZ3MuZmlsdGVyKGVsID0+IGVsLnRhZ05hbWUgPT09IGN1cnJlbnQudGFnTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYW1lVGFnU2libGluZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoLnVuc2hpZnQoYC8ke3RhZ05hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHNhbWVUYWdTaWJsaW5ncy5pbmRleE9mKGN1cnJlbnQpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgudW5zaGlmdChgLyR7dGFnTmFtZX1bJHtpbmRleH1dYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBhdGgudW5zaGlmdChgLyR7dGFnTmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICAvLyBMaW1pdCBkZXB0aFxuICAgICAgICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+PSA2KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXRoLmxlbmd0aCA+IDAgPyAnLycgKyBwYXRoLmpvaW4oJycpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignWFBhdGhTZWxlY3RvclN0cmF0ZWd5OiBFcnJvciBleHRyYWN0aW5nIHNlbGVjdG9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBwcmlvcml0eSBvZiB0aGlzIHN0cmF0ZWd5XG4gICAgICovXG4gICAgZ2V0UHJpb3JpdHkoKSB7XG4gICAgICAgIHJldHVybiA3MDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIFhQYXRoIHNlbGVjdG9yIGlzIHZhbGlkIGZvciB0aGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSBzZWxlY3RvciAtIFhQYXRoIHNlbGVjdG9yIHRvIHZhbGlkYXRlXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHNlbGVjdG9yIGlzIHZhbGlkXG4gICAgICovXG4gICAgaXNWYWxpZChzZWxlY3RvciwgZWxlbWVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZG9jdW1lbnQuZXZhbHVhdGUoc2VsZWN0b3IsIGRvY3VtZW50LCBudWxsLCBYUGF0aFJlc3VsdC5GSVJTVF9PUkRFUkVEX05PREVfVFlQRSwgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnNpbmdsZU5vZGVWYWx1ZSA9PT0gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogVGV4dC1iYXNlZCBzZWxlY3RvciBleHRyYWN0aW9uIHN0cmF0ZWd5XG4gKi9cbmNsYXNzIFRleHRTZWxlY3RvclN0cmF0ZWd5IHtcbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IHRleHQtYmFzZWQgc2VsZWN0b3IgZm9yIHRoZSBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIFRleHQgc2VsZWN0b3Igc3RyaW5nIG9yIG51bGxcbiAgICAgKi9cbiAgICBleHRyYWN0KGVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBlbGVtZW50LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICBpZiAoIXRleHQgfHwgdGV4dC5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gU2tpcCB2ZXJ5IGxvbmcgdGV4dCBvciBlbXB0eSBlbGVtZW50c1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGV4dCBpcyB1bmlxdWVcbiAgICAgICAgICAgIGNvbnN0IHhwYXRoID0gYC8vKltub3JtYWxpemUtc3BhY2UodGV4dCgpKT0nJHt0ZXh0LnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKX0nXWA7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkb2N1bWVudC5ldmFsdWF0ZSh4cGF0aCwgZG9jdW1lbnQsIG51bGwsIFhQYXRoUmVzdWx0Lk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFLCBudWxsKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc25hcHNob3RMZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYHRleHQ9JHt0ZXh0fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUcnkgcGFydGlhbCB0ZXh0IG1hdGNoIGZvciBsb25nZXIgdGV4dFxuICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gMTApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWFsVGV4dCA9IHRleHQuc2xpY2UoMCwgMjApO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpYWxYcGF0aCA9IGAvLypbY29udGFpbnMobm9ybWFsaXplLXNwYWNlKHRleHQoKSksJyR7cGFydGlhbFRleHQucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpfScpXWA7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydGlhbFJlc3VsdCA9IGRvY3VtZW50LmV2YWx1YXRlKHBhcnRpYWxYcGF0aCwgZG9jdW1lbnQsIG51bGwsIFhQYXRoUmVzdWx0Lk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFLCBudWxsKTtcbiAgICAgICAgICAgICAgICBpZiAocGFydGlhbFJlc3VsdC5zbmFwc2hvdExlbmd0aCA8PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgdGV4dCo9JHtwYXJ0aWFsVGV4dH1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdUZXh0U2VsZWN0b3JTdHJhdGVneTogRXJyb3IgZXh0cmFjdGluZyBzZWxlY3RvcjonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcHJpb3JpdHkgb2YgdGhpcyBzdHJhdGVneVxuICAgICAqL1xuICAgIGdldFByaW9yaXR5KCkge1xuICAgICAgICByZXR1cm4gNjA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSB0ZXh0IHNlbGVjdG9yIGlzIHZhbGlkIGZvciB0aGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSBzZWxlY3RvciAtIFRleHQgc2VsZWN0b3IgdG8gdmFsaWRhdGVcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgc2VsZWN0b3IgaXMgdmFsaWRcbiAgICAgKi9cbiAgICBpc1ZhbGlkKHNlbGVjdG9yLCBlbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgaWYgKCF0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5zdGFydHNXaXRoKCd0ZXh0PScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQgPT09IHNlbGVjdG9yLnN1YnN0cmluZyg1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHNlbGVjdG9yLnN0YXJ0c1dpdGgoJ3RleHQqPScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQuaW5jbHVkZXMoc2VsZWN0b3Iuc3Vic3RyaW5nKDYpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogQVJJQS9Sb2xlLWJhc2VkIHNlbGVjdG9yIGV4dHJhY3Rpb24gc3RyYXRlZ3lcbiAqL1xuY2xhc3MgUm9sZVNlbGVjdG9yU3RyYXRlZ3kge1xuICAgIC8qKlxuICAgICAqIEV4dHJhY3Qgcm9sZS1iYXNlZCBzZWxlY3RvciBmb3IgdGhlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgUm9sZSBzZWxlY3RvciBzdHJpbmcgb3IgbnVsbFxuICAgICAqL1xuICAgIGV4dHJhY3QoZWxlbWVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgcm9sZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdyb2xlJyk7XG4gICAgICAgICAgICBjb25zdCBhcmlhTGFiZWwgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpO1xuICAgICAgICAgICAgY29uc3QgYXJpYUxhYmVsbGVkYnkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5Jyk7XG4gICAgICAgICAgICBpZiAocm9sZSkge1xuICAgICAgICAgICAgICAgIGxldCByb2xlU2VsZWN0b3IgPSBgW3JvbGU9XCIke3JvbGV9XCJdYDtcbiAgICAgICAgICAgICAgICBpZiAoYXJpYUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJvbGVTZWxlY3RvciArPSBgW2FyaWEtbGFiZWw9XCIke2FyaWFMYWJlbH1cIl1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIHNlbGVjdG9yIGlzIHVuaXF1ZVxuICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHJvbGVTZWxlY3RvcikubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByb2xlU2VsZWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGltcGxpY2l0IHJvbGVzXG4gICAgICAgICAgICBjb25zdCBpbXBsaWNpdFJvbGUgPSB0aGlzLmdldEltcGxpY2l0Um9sZShlbGVtZW50KTtcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdFJvbGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYHJvbGU9JHtpbXBsaWNpdFJvbGV9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdSb2xlU2VsZWN0b3JTdHJhdGVneTogRXJyb3IgZXh0cmFjdGluZyBzZWxlY3RvcjonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcHJpb3JpdHkgb2YgdGhpcyBzdHJhdGVneVxuICAgICAqL1xuICAgIGdldFByaW9yaXR5KCkge1xuICAgICAgICByZXR1cm4gODA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSByb2xlIHNlbGVjdG9yIGlzIHZhbGlkIGZvciB0aGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSBzZWxlY3RvciAtIFJvbGUgc2VsZWN0b3IgdG8gdmFsaWRhdGVcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgc2VsZWN0b3IgaXMgdmFsaWRcbiAgICAgKi9cbiAgICBpc1ZhbGlkKHNlbGVjdG9yLCBlbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3Iuc3RhcnRzV2l0aCgncm9sZT0nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkUm9sZSA9IHNlbGVjdG9yLnN1YnN0cmluZyg1KTtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxSb2xlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSB8fCB0aGlzLmdldEltcGxpY2l0Um9sZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0dWFsUm9sZSA9PT0gZXhwZWN0ZWRSb2xlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZm91bmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIHJldHVybiBmb3VuZCA9PT0gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgaW1wbGljaXQgQVJJQSByb2xlIGZvciBjb21tb24gZWxlbWVudHNcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMgSW1wbGljaXQgcm9sZSBvciBudWxsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRJbXBsaWNpdFJvbGUoZWxlbWVudCkge1xuICAgICAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHJvbGVNYXAgPSB7XG4gICAgICAgICAgICAnYnV0dG9uJzogJ2J1dHRvbicsXG4gICAgICAgICAgICAnYSc6ICdsaW5rJyxcbiAgICAgICAgICAgICdpbnB1dCc6IHRoaXMuZ2V0SW5wdXRSb2xlKGVsZW1lbnQpLFxuICAgICAgICAgICAgJ3RleHRhcmVhJzogJ3RleHRib3gnLFxuICAgICAgICAgICAgJ3NlbGVjdCc6ICdjb21ib2JveCcsXG4gICAgICAgICAgICAnaW1nJzogJ2ltZycsXG4gICAgICAgICAgICAnaDEnOiAnaGVhZGluZycsXG4gICAgICAgICAgICAnaDInOiAnaGVhZGluZycsXG4gICAgICAgICAgICAnaDMnOiAnaGVhZGluZycsXG4gICAgICAgICAgICAnaDQnOiAnaGVhZGluZycsXG4gICAgICAgICAgICAnaDUnOiAnaGVhZGluZycsXG4gICAgICAgICAgICAnaDYnOiAnaGVhZGluZycsXG4gICAgICAgICAgICAnbmF2JzogJ25hdmlnYXRpb24nLFxuICAgICAgICAgICAgJ21haW4nOiAnbWFpbicsXG4gICAgICAgICAgICAnaGVhZGVyJzogJ2Jhbm5lcicsXG4gICAgICAgICAgICAnZm9vdGVyJzogJ2NvbnRlbnRpbmZvJyxcbiAgICAgICAgICAgICdhc2lkZSc6ICdjb21wbGVtZW50YXJ5JyxcbiAgICAgICAgICAgICdzZWN0aW9uJzogJ3JlZ2lvbicsXG4gICAgICAgICAgICAnYXJ0aWNsZSc6ICdhcnRpY2xlJ1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcm9sZU1hcFt0YWdOYW1lXSB8fCBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcm9sZSBmb3IgaW5wdXQgZWxlbWVudHMgYmFzZWQgb24gdHlwZVxuICAgICAqIEBwYXJhbSBpbnB1dCAtIElucHV0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyBJbnB1dCByb2xlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRJbnB1dFJvbGUoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IGlucHV0LnR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgaW5wdXRSb2xlcyA9IHtcbiAgICAgICAgICAgICdidXR0b24nOiAnYnV0dG9uJyxcbiAgICAgICAgICAgICdzdWJtaXQnOiAnYnV0dG9uJyxcbiAgICAgICAgICAgICdyZXNldCc6ICdidXR0b24nLFxuICAgICAgICAgICAgJ2NoZWNrYm94JzogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICdyYWRpbyc6ICdyYWRpbycsXG4gICAgICAgICAgICAndGV4dCc6ICd0ZXh0Ym94JyxcbiAgICAgICAgICAgICdwYXNzd29yZCc6ICd0ZXh0Ym94JyxcbiAgICAgICAgICAgICdlbWFpbCc6ICd0ZXh0Ym94JyxcbiAgICAgICAgICAgICdzZWFyY2gnOiAnc2VhcmNoYm94JyxcbiAgICAgICAgICAgICd0ZWwnOiAndGV4dGJveCcsXG4gICAgICAgICAgICAndXJsJzogJ3RleHRib3gnLFxuICAgICAgICAgICAgJ251bWJlcic6ICdzcGluYnV0dG9uJ1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gaW5wdXRSb2xlc1t0eXBlXSB8fCAndGV4dGJveCc7XG4gICAgfVxufVxuLyoqXG4gKiBNYWluIHNlbGVjdG9yIGV4dHJhY3RvciBjbGFzcyB0aGF0IGNvb3JkaW5hdGVzIG11bHRpcGxlIHN0cmF0ZWdpZXNcbiAqIEZvbGxvd3MgU2luZ2xlIFJlc3BvbnNpYmlsaXR5IFByaW5jaXBsZSBhbmQgU3RyYXRlZ3kgUGF0dGVyblxuICovXG5leHBvcnQgY2xhc3MgU2VsZWN0b3JFeHRyYWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnN0cmF0ZWdpZXMgPSBbXG4gICAgICAgICAgICBuZXcgQ3NzU2VsZWN0b3JTdHJhdGVneSgpLFxuICAgICAgICAgICAgbmV3IFhQYXRoU2VsZWN0b3JTdHJhdGVneSgpLFxuICAgICAgICAgICAgbmV3IFRleHRTZWxlY3RvclN0cmF0ZWd5KCksXG4gICAgICAgICAgICBuZXcgUm9sZVNlbGVjdG9yU3RyYXRlZ3koKVxuICAgICAgICBdLnNvcnQoKGEsIGIpID0+IGIuZ2V0UHJpb3JpdHkoKSAtIGEuZ2V0UHJpb3JpdHkoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgbXVsdGlwbGUgc2VsZWN0b3JzIGZvciBhbiBlbGVtZW50IHVzaW5nIGFsbCBzdHJhdGVnaWVzXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudCB0byBleHRyYWN0IHNlbGVjdG9ycyBmb3JcbiAgICAgKiBAcmV0dXJucyBBcnJheSBvZiBlbGVtZW50IHNlbGVjdG9ycyB3aXRoIGNvbmZpZGVuY2Ugc2NvcmVzXG4gICAgICovXG4gICAgZXh0cmFjdFNlbGVjdG9ycyhlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtdO1xuICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IHRoaXMuZ2V0Qm91bmRpbmdCb3goZWxlbWVudCk7XG4gICAgICAgIC8vIEV4dHJhY3Qgc2VsZWN0b3JzIHVzaW5nIGVhY2ggc3RyYXRlZ3lcbiAgICAgICAgZm9yIChjb25zdCBzdHJhdGVneSBvZiB0aGlzLnN0cmF0ZWdpZXMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBzdHJhdGVneS5leHRyYWN0KGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWRlbmNlID0gdGhpcy5jYWxjdWxhdGVDb25maWRlbmNlKHNlbGVjdG9yLCBlbGVtZW50LCBzdHJhdGVneSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTZWxlY3RvciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZGVuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZGluZ0JveFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAvLyBBc3NpZ24gc2VsZWN0b3IgdG8gYXBwcm9wcmlhdGUgcHJvcGVydHkgYmFzZWQgb24gc3RyYXRlZ3lcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0cmF0ZWd5IGluc3RhbmNlb2YgQ3NzU2VsZWN0b3JTdHJhdGVneSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFNlbGVjdG9yLmNzcyA9IHNlbGVjdG9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0cmF0ZWd5IGluc3RhbmNlb2YgWFBhdGhTZWxlY3RvclN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50U2VsZWN0b3IueHBhdGggPSBzZWxlY3RvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdHJhdGVneSBpbnN0YW5jZW9mIFRleHRTZWxlY3RvclN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50U2VsZWN0b3IudGV4dCA9IHNlbGVjdG9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0cmF0ZWd5IGluc3RhbmNlb2YgUm9sZVNlbGVjdG9yU3RyYXRlZ3kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTZWxlY3Rvci5yb2xlID0gc2VsZWN0b3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGVsZW1lbnQgYXR0cmlidXRlcyBmb3IgYWRkaXRpb25hbCB2ZXJpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFNlbGVjdG9yLmF0dHJpYnV0ZXMgPSB0aGlzLmV4dHJhY3RSZWxldmFudEF0dHJpYnV0ZXMoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9ycy5wdXNoKGVsZW1lbnRTZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdTZWxlY3RvckV4dHJhY3RvcjogRXJyb3Igd2l0aCBzdHJhdGVneTonLCBzdHJhdGVneS5jb25zdHJ1Y3Rvci5uYW1lLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgbm8gc2VsZWN0b3JzIHdlcmUgZm91bmQsIGNyZWF0ZSBhIGJhc2ljIGZhbGxiYWNrXG4gICAgICAgIGlmIChzZWxlY3RvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzZWxlY3RvcnMucHVzaCh0aGlzLmNyZWF0ZUZhbGxiYWNrU2VsZWN0b3IoZWxlbWVudCwgYm91bmRpbmdCb3gpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VsZWN0b3JzLnNvcnQoKGEsIGIpID0+IChiLmNvbmZpZGVuY2UgfHwgMCkgLSAoYS5jb25maWRlbmNlIHx8IDApKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIGNvbmZpZGVuY2Ugc2NvcmUgZm9yIGEgc2VsZWN0b3JcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBUaGUgc2VsZWN0b3Igc3RyaW5nXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSBzdHJhdGVneSAtIFN0cmF0ZWd5IHVzZWQgdG8gZXh0cmFjdCB0aGUgc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyBDb25maWRlbmNlIHNjb3JlICgwLTEwMClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGNhbGN1bGF0ZUNvbmZpZGVuY2Uoc2VsZWN0b3IsIGVsZW1lbnQsIHN0cmF0ZWd5KSB7XG4gICAgICAgIGxldCBjb25maWRlbmNlID0gc3RyYXRlZ3kuZ2V0UHJpb3JpdHkoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEJvbnVzIGZvciBJRC1iYXNlZCBzZWxlY3RvcnNcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5pbmNsdWRlcygnIycpICYmIGVsZW1lbnQuaWQpIHtcbiAgICAgICAgICAgICAgICBjb25maWRlbmNlICs9IDU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBCb251cyBmb3IgZGF0YSBhdHRyaWJ1dGVzXG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IuaW5jbHVkZXMoJ2RhdGEtJykpIHtcbiAgICAgICAgICAgICAgICBjb25maWRlbmNlICs9IDM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQZW5hbHR5IGZvciB2ZXJ5IGxvbmcgc2VsZWN0b3JzXG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZSAtPSAxMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEJvbnVzIGZvciBzaG9ydCwgc2ltcGxlIHNlbGVjdG9yc1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yLmxlbmd0aCA8IDMwKSB7XG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZSArPSAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVmVyaWZ5IHRoZSBzZWxlY3RvciBhY3R1YWxseSB3b3Jrc1xuICAgICAgICAgICAgaWYgKHN0cmF0ZWd5LmlzVmFsaWQoc2VsZWN0b3IsIGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZSArPSA1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZSAtPSAyMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbmZpZGVuY2UgLT0gMTU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgY29uZmlkZW5jZSkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmRpbmcgYm94IGZvciBhbiBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIEJvdW5kaW5nIGJveCBjb29yZGluYXRlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0Qm91bmRpbmdCb3goZWxlbWVudCkge1xuICAgICAgICBjb25zdCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHJlY3QubGVmdCArIHdpbmRvdy5zY3JvbGxYLFxuICAgICAgICAgICAgeTogcmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWSxcbiAgICAgICAgICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiByZWN0LmhlaWdodFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IHJlbGV2YW50IGF0dHJpYnV0ZXMgZnJvbSBhbiBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIE9iamVjdCB3aXRoIHJlbGV2YW50IGF0dHJpYnV0ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGV4dHJhY3RSZWxldmFudEF0dHJpYnV0ZXMoZWxlbWVudCkge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0ge307XG4gICAgICAgIGNvbnN0IHJlbGV2YW50QXR0cnMgPSBbXG4gICAgICAgICAgICAnaWQnLCAnY2xhc3MnLCAnbmFtZScsICd0eXBlJywgJ3ZhbHVlJywgJ3BsYWNlaG9sZGVyJywgJ3RpdGxlJyxcbiAgICAgICAgICAgICdyb2xlJywgJ2FyaWEtbGFiZWwnLCAnZGF0YS10ZXN0aWQnLCAnZGF0YS10ZXN0JywgJ2hyZWYnLCAnc3JjJ1xuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgcmVsZXZhbnRBdHRycykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNbYXR0cl0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgdGFnIG5hbWUgZm9yIHJlZmVyZW5jZVxuICAgICAgICBhdHRyaWJ1dGVzWyd0YWdOYW1lJ10gPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGZhbGxiYWNrIHNlbGVjdG9yIHdoZW4gYWxsIHN0cmF0ZWdpZXMgZmFpbFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gYm91bmRpbmdCb3ggLSBFbGVtZW50IGJvdW5kaW5nIGJveFxuICAgICAqIEByZXR1cm5zIEZhbGxiYWNrIGVsZW1lbnQgc2VsZWN0b3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGNyZWF0ZUZhbGxiYWNrU2VsZWN0b3IoZWxlbWVudCwgYm91bmRpbmdCb3gpIHtcbiAgICAgICAgY29uc3QgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpLnNsaWNlKDAsIDMwKSB8fCAnJztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNzczogdGFnTmFtZSxcbiAgICAgICAgICAgIHRleHQ6IHRleHQgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgYXR0cmlidXRlczogdGhpcy5leHRyYWN0UmVsZXZhbnRBdHRyaWJ1dGVzKGVsZW1lbnQpLFxuICAgICAgICAgICAgYm91bmRpbmdCb3gsXG4gICAgICAgICAgICBjb25maWRlbmNlOiAxMCAvLyBMb3cgY29uZmlkZW5jZSBmb3IgZmFsbGJhY2tcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb250ZW50IHNjcmlwdCBmb3IgQXV0b0Zsb3cgU3R1ZGlvXG4gKiBAYXV0aG9yIEF5dXNoIFNodWtsYVxuICogQGRlc2NyaXB0aW9uIE1haW4gY29udGVudCBzY3JpcHQgdGhhdCBoYW5kbGVzIERPTSBldmVudCByZWNvcmRpbmcsIHNlbGVjdG9yIGV4dHJhY3Rpb24sXG4gKiBhbmQgc2NyZWVuc2hvdCBjYXB0dXJlLiBGb2xsb3dzIFNPTElEIHByaW5jaXBsZXMgZm9yIG1haW50YWluYWJsZSBjb2RlLlxuICovXG5pbXBvcnQgeyBTZWxlY3RvckV4dHJhY3RvciB9IGZyb20gJy4uL3V0aWxzL3NlbGVjdG9yLWV4dHJhY3Rvcic7XG5pbXBvcnQgeyBTY3JlZW5zaG90Q2FwdHVyZSB9IGZyb20gJy4uL3V0aWxzL3NjcmVlbnNob3QtY2FwdHVyZSc7XG5pbXBvcnQgeyBFdmVudFJlY29yZGVyIH0gZnJvbSAnLi4vdXRpbHMvZXZlbnQtcmVjb3JkZXInO1xuLyoqXG4gKiBNYWluIGNvbnRlbnQgc2NyaXB0IGNsYXNzIGZvbGxvd2luZyBTaW5nbGUgUmVzcG9uc2liaWxpdHkgUHJpbmNpcGxlXG4gKiBIYW5kbGVzIGNvb3JkaW5hdGlvbiBiZXR3ZWVuIGRpZmZlcmVudCByZWNvcmRpbmcgY29tcG9uZW50c1xuICovXG5jbGFzcyBBdXRvRmxvd0NvbnRlbnRTY3JpcHQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIGNvbnRlbnQgc2NyaXB0IHdpdGggYWxsIGRlcGVuZGVuY2llc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmlzUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVjb3JkaW5nU2Vzc2lvbklkID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGVwQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JFeHRyYWN0b3IgPSBuZXcgU2VsZWN0b3JFeHRyYWN0b3IoKTtcbiAgICAgICAgdGhpcy5zY3JlZW5zaG90Q2FwdHVyZSA9IG5ldyBTY3JlZW5zaG90Q2FwdHVyZSgpO1xuICAgICAgICB0aGlzLmV2ZW50UmVjb3JkZXIgPSBuZXcgRXZlbnRSZWNvcmRlcigpO1xuICAgICAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5zZXR1cE1lc3NhZ2VIYW5kbGVycygpO1xuICAgICAgICB0aGlzLmluaXRpYWxpemVSZWNvcmRpbmdTdGF0ZSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgdXAgRE9NIGV2ZW50IGxpc3RlbmVycyBmb3IgcmVjb3JkaW5nIHVzZXIgaW50ZXJhY3Rpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzZXR1cEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgICAvLyBDbGljayBldmVudHNcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrRXZlbnQuYmluZCh0aGlzKSwge1xuICAgICAgICAgICAgY2FwdHVyZTogdHJ1ZSxcbiAgICAgICAgICAgIHBhc3NpdmU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIElucHV0IGV2ZW50cyAodHlwaW5nLCBmb3JtIGZpbGxpbmcpXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5oYW5kbGVJbnB1dEV2ZW50LmJpbmQodGhpcyksIHtcbiAgICAgICAgICAgIGNhcHR1cmU6IHRydWUsXG4gICAgICAgICAgICBwYXNzaXZlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBOYXZpZ2F0aW9uIGV2ZW50c1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgdGhpcy5oYW5kbGVOYXZpZ2F0aW9uRXZlbnQuYmluZCh0aGlzKSk7XG4gICAgICAgIC8vIFNjcm9sbCBldmVudHMgKHRocm90dGxlZCBmb3IgcGVyZm9ybWFuY2UpXG4gICAgICAgIGxldCBzY3JvbGxUaW1lb3V0O1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZW91dCk7XG4gICAgICAgICAgICBzY3JvbGxUaW1lb3V0ID0gc2V0VGltZW91dCh0aGlzLmhhbmRsZVNjcm9sbEV2ZW50LmJpbmQodGhpcyksIDE1MCk7XG4gICAgICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgLy8gRm9ybSBzdWJtaXNzaW9uIGV2ZW50c1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB0aGlzLmhhbmRsZVN1Ym1pdEV2ZW50LmJpbmQodGhpcyksIHtcbiAgICAgICAgICAgIGNhcHR1cmU6IHRydWUsXG4gICAgICAgICAgICBwYXNzaXZlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBGb2N1cyBldmVudHMgZm9yIGZvcm0gZmllbGQgZGV0ZWN0aW9uXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5oYW5kbGVGb2N1c0V2ZW50LmJpbmQodGhpcyksIHtcbiAgICAgICAgICAgIGNhcHR1cmU6IHRydWUsXG4gICAgICAgICAgICBwYXNzaXZlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgdXAgbWVzc2FnZSBoYW5kbGVycyBmb3IgY29tbXVuaWNhdGlvbiB3aXRoIGJhY2tncm91bmQgc2NyaXB0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzZXR1cE1lc3NhZ2VIYW5kbGVycygpIHtcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBLZWVwIG1lc3NhZ2UgY2hhbm5lbCBvcGVuIGZvciBhc3luYyByZXNwb25zZXNcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgcmVjb3JkaW5nIHN0YXRlIGZyb20gc3RvcmFnZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgaW5pdGlhbGl6ZVJlY29yZGluZ1N0YXRlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnaXNSZWNvcmRpbmcnLCAncmVjb3JkaW5nU2Vzc2lvbklkJ10pO1xuICAgICAgICAgICAgdGhpcy5pc1JlY29yZGluZyA9IHJlc3VsdC5pc1JlY29yZGluZyB8fCBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucmVjb3JkaW5nU2Vzc2lvbklkID0gcmVzdWx0LnJlY29yZGluZ1Nlc3Npb25JZCB8fCBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNSZWNvcmRpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dSZWNvcmRpbmdJbmRpY2F0b3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG9GbG93OiBGYWlsZWQgdG8gaW5pdGlhbGl6ZSByZWNvcmRpbmcgc3RhdGU6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBtZXNzYWdlcyBmcm9tIGJhY2tncm91bmQgc2NyaXB0IG9yIHBvcHVwXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSByZWNlaXZlZFxuICAgICAqIEBwYXJhbSBzZW5kZXIgLSBNZXNzYWdlIHNlbmRlciBpbmZvcm1hdGlvblxuICAgICAqIEBwYXJhbSBzZW5kUmVzcG9uc2UgLSBSZXNwb25zZSBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgaGFuZGxlTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdTVEFSVF9SRUNPUkRJTkcnOlxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnN0YXJ0UmVjb3JkaW5nKG1lc3NhZ2Uuc2Vzc2lvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnU1RPUF9SRUNPUkRJTkcnOlxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnN0b3BSZWNvcmRpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnR0VUX1JFQ09SRElOR19TVEFURSc6XG4gICAgICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1JlY29yZGluZzogdGhpcy5pc1JlY29yZGluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZDogdGhpcy5yZWNvcmRpbmdTZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwQ291bnQ6IHRoaXMuc3RlcENvdW50ZXJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0NBUFRVUkVfU0NSRUVOU0hPVCc6XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNjcmVlbnNob3QgPSBhd2FpdCB0aGlzLnNjcmVlbnNob3RDYXB0dXJlLmNhcHR1cmVWaXNpYmxlKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHNjcmVlbnNob3QgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0VYVFJBQ1RfU0VMRUNUT1JTJzpcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gdGhpcy5zZWxlY3RvckV4dHJhY3Rvci5leHRyYWN0U2VsZWN0b3JzKG1lc3NhZ2UuZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHNlbGVjdG9ycyB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdBdXRvRmxvdzogVW5rbm93biBtZXNzYWdlIHR5cGU6JywgbWVzc2FnZS50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgZXJyb3I6ICdVbmtub3duIG1lc3NhZ2UgdHlwZScgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRvRmxvdzogRXJyb3IgaGFuZGxpbmcgbWVzc2FnZTonLCBlcnJvcik7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBlcnJvcjogZXJyb3I/Lm1lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHJlY29yZGluZyB1c2VyIGludGVyYWN0aW9uc1xuICAgICAqIEBwYXJhbSBzZXNzaW9uSWQgLSBVbmlxdWUgc2Vzc2lvbiBpZGVudGlmaWVyXG4gICAgICovXG4gICAgYXN5bmMgc3RhcnRSZWNvcmRpbmcoc2Vzc2lvbklkKSB7XG4gICAgICAgIHRoaXMuaXNSZWNvcmRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnJlY29yZGluZ1Nlc3Npb25JZCA9IHNlc3Npb25JZDtcbiAgICAgICAgdGhpcy5zdGVwQ291bnRlciA9IDA7XG4gICAgICAgIC8vIFN0b3JlIHJlY29yZGluZyBzdGF0ZVxuICAgICAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICAgICAgaXNSZWNvcmRpbmc6IHRydWUsXG4gICAgICAgICAgICByZWNvcmRpbmdTZXNzaW9uSWQ6IHNlc3Npb25JZFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2hvdyB2aXN1YWwgaW5kaWNhdG9yXG4gICAgICAgIHRoaXMuc2hvd1JlY29yZGluZ0luZGljYXRvcigpO1xuICAgICAgICAvLyBSZWNvcmQgaW5pdGlhbCBwYWdlIHN0YXRlXG4gICAgICAgIGF3YWl0IHRoaXMucmVjb3JkUGFnZUxvYWQoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0F1dG9GbG93OiBSZWNvcmRpbmcgc3RhcnRlZCBmb3Igc2Vzc2lvbjonLCBzZXNzaW9uSWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdG9wIHJlY29yZGluZyB1c2VyIGludGVyYWN0aW9uc1xuICAgICAqL1xuICAgIGFzeW5jIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgICAgIHRoaXMuaXNSZWNvcmRpbmcgPSBmYWxzZTtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbklkID0gdGhpcy5yZWNvcmRpbmdTZXNzaW9uSWQ7XG4gICAgICAgIHRoaXMucmVjb3JkaW5nU2Vzc2lvbklkID0gbnVsbDtcbiAgICAgICAgLy8gQ2xlYXIgcmVjb3JkaW5nIHN0YXRlXG4gICAgICAgIGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLnJlbW92ZShbJ2lzUmVjb3JkaW5nJywgJ3JlY29yZGluZ1Nlc3Npb25JZCddKTtcbiAgICAgICAgLy8gSGlkZSB2aXN1YWwgaW5kaWNhdG9yXG4gICAgICAgIHRoaXMuaGlkZVJlY29yZGluZ0luZGljYXRvcigpO1xuICAgICAgICBjb25zb2xlLmxvZygnQXV0b0Zsb3c6IFJlY29yZGluZyBzdG9wcGVkIGZvciBzZXNzaW9uOicsIHNlc3Npb25JZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBjbGljayBldmVudHMgb24gdGhlIHBhZ2VcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBUaGUgY2xpY2sgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGhhbmRsZUNsaWNrRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUmVjb3JkaW5nIHx8ICFldmVudC50YXJnZXQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIC8vIFNraXAgY2xpY2tzIG9uIHRoZSByZWNvcmRpbmcgaW5kaWNhdG9yXG4gICAgICAgIGlmIChlbGVtZW50LmNsb3Nlc3QoJy5hdXRvZmxvdy1yZWNvcmRpbmctaW5kaWNhdG9yJykpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0gYXdhaXQgdGhpcy5jcmVhdGVUcmFjZVN0ZXAoZWxlbWVudCwgJ2NsaWNrJywgZXZlbnQpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlVHJhY2VTdGVwKHN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3c6IEVycm9yIHJlY29yZGluZyBjbGljayBldmVudDonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZGxlIGlucHV0IGV2ZW50cyAodHlwaW5nLCBmb3JtIGZpbGxpbmcpXG4gICAgICogQHBhcmFtIGV2ZW50IC0gVGhlIGlucHV0IGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBoYW5kbGVJbnB1dEV2ZW50KGV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1JlY29yZGluZyB8fCAhZXZlbnQudGFyZ2V0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAvLyBPbmx5IHJlY29yZCBjZXJ0YWluIGlucHV0IHR5cGVzXG4gICAgICAgIGNvbnN0IHJlY29yZGFibGVUeXBlcyA9IFsndGV4dCcsICdlbWFpbCcsICdwYXNzd29yZCcsICdzZWFyY2gnLCAndGVsJywgJ3VybCddO1xuICAgICAgICBpZiAoZWxlbWVudC50eXBlICYmICFyZWNvcmRhYmxlVHlwZXMuaW5jbHVkZXMoZWxlbWVudC50eXBlKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSBhd2FpdCB0aGlzLmNyZWF0ZVRyYWNlU3RlcChlbGVtZW50LCAnaW5wdXQnLCBldmVudCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVUcmFjZVN0ZXAoc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRvRmxvdzogRXJyb3IgcmVjb3JkaW5nIGlucHV0IGV2ZW50OicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2Nyb2xsIGV2ZW50cyBvbiB0aGUgcGFnZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgaGFuZGxlU2Nyb2xsRXZlbnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1JlY29yZGluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFN0ZXAgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVTdGVwSWQoKSxcbiAgICAgICAgICAgICAgICB0YWJJZDogYXdhaXQgdGhpcy5nZXRDdXJyZW50VGFiSWQoKSxcbiAgICAgICAgICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3Njcm9sbCcsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3JzOiBbXSxcbiAgICAgICAgICAgICAgICBzY3JvbGxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiB3aW5kb3cuc2Nyb2xsWCxcbiAgICAgICAgICAgICAgICAgICAgeTogd2luZG93LnNjcm9sbFksXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VIZWlnaHQ6IGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBwYWdlV2lkdGg6IGRvY3VtZW50LmJvZHkuc2Nyb2xsV2lkdGhcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYFNjcm9sbGVkIHRvIHBvc2l0aW9uICgke3dpbmRvdy5zY3JvbGxYfSwgJHt3aW5kb3cuc2Nyb2xsWX0pYCxcbiAgICAgICAgICAgICAgICAgICAgdGFnczogWydzY3JvbGwnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVUcmFjZVN0ZXAoc2Nyb2xsU3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRvRmxvdzogRXJyb3IgcmVjb3JkaW5nIHNjcm9sbCBldmVudDonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZGxlIGZvcm0gc3VibWlzc2lvbiBldmVudHNcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBUaGUgc3VibWl0IGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBoYW5kbGVTdWJtaXRFdmVudChldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWNvcmRpbmcgfHwgIWV2ZW50LnRhcmdldClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgZm9ybSA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSBhd2FpdCB0aGlzLmNyZWF0ZVRyYWNlU3RlcChmb3JtLCAnY2xpY2snLCBldmVudCk7XG4gICAgICAgICAgICBzdGVwLm1ldGFkYXRhID0ge1xuICAgICAgICAgICAgICAgIC4uLnN0ZXAubWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdGb3JtIHN1Ym1pc3Npb24nLFxuICAgICAgICAgICAgICAgIHRhZ3M6IFsnZm9ybScsICdzdWJtaXQnXSxcbiAgICAgICAgICAgICAgICBjcml0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVRyYWNlU3RlcChzdGVwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG9GbG93OiBFcnJvciByZWNvcmRpbmcgZm9ybSBzdWJtaXNzaW9uOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgbmF2aWdhdGlvbiBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGhhbmRsZU5hdmlnYXRpb25FdmVudCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUmVjb3JkaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc3RlcCA9IHtcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZVN0ZXBJZCgpLFxuICAgICAgICAgICAgICAgIHRhYklkOiBhd2FpdCB0aGlzLmdldEN1cnJlbnRUYWJJZCgpLFxuICAgICAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbmF2aWdhdGUnLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yczogW10sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgTmF2aWdhdGluZyBhd2F5IGZyb20gJHt3aW5kb3cubG9jYXRpb24uaHJlZn1gLFxuICAgICAgICAgICAgICAgICAgICB0YWdzOiBbJ25hdmlnYXRpb24nXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVUcmFjZVN0ZXAoc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRvRmxvdzogRXJyb3IgcmVjb3JkaW5nIG5hdmlnYXRpb24gZXZlbnQ6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBmb2N1cyBldmVudHMgZm9yIGZvcm0gZmllbGRzXG4gICAgICogQHBhcmFtIGV2ZW50IC0gVGhlIGZvY3VzIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBoYW5kbGVGb2N1c0V2ZW50KGV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1JlY29yZGluZyB8fCAhZXZlbnQudGFyZ2V0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAvLyBPbmx5IHJlY29yZCBmb2N1cyBvbiBpbnRlcmFjdGl2ZSBlbGVtZW50c1xuICAgICAgICBjb25zdCBpbnRlcmFjdGl2ZUVsZW1lbnRzID0gWydpbnB1dCcsICd0ZXh0YXJlYScsICdzZWxlY3QnLCAnYnV0dG9uJ107XG4gICAgICAgIGlmICghaW50ZXJhY3RpdmVFbGVtZW50cy5pbmNsdWRlcyhlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIFRoaXMgaGVscHMgd2l0aCBmb3JtIGZpZWxkIGRldGVjdGlvbiBhbmQgY2FuIGJlIHVzZWQgZm9yIGJldHRlciBzZWxlY3RvcnNcbiAgICAgICAgY29uc29sZS5sb2coJ0F1dG9GbG93OiBGb2N1cyBkZXRlY3RlZCBvbjonLCBlbGVtZW50KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVjb3JkIGluaXRpYWwgcGFnZSBsb2FkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyByZWNvcmRQYWdlTG9hZCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVTdGVwSWQoKSxcbiAgICAgICAgICAgICAgICB0YWJJZDogYXdhaXQgdGhpcy5nZXRDdXJyZW50VGFiSWQoKSxcbiAgICAgICAgICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ25hdmlnYXRlJyxcbiAgICAgICAgICAgICAgICBzZWxlY3RvcnM6IFtdLFxuICAgICAgICAgICAgICAgIGRvbUhhc2g6IGF3YWl0IHRoaXMuZ2VuZXJhdGVET01IYXNoKCksXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgUGFnZSBsb2FkZWQ6ICR7ZG9jdW1lbnQudGl0bGV9YCxcbiAgICAgICAgICAgICAgICAgICAgdGFnczogWydwYWdlX2xvYWQnLCAnbmF2aWdhdGlvbiddLFxuICAgICAgICAgICAgICAgICAgICBjcml0aWNhbDogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBDYXB0dXJlIHNjcmVlbnNob3Qgb2YgaW5pdGlhbCBwYWdlIHN0YXRlXG4gICAgICAgICAgICBjb25zdCBzY3JlZW5zaG90ID0gYXdhaXQgdGhpcy5zY3JlZW5zaG90Q2FwdHVyZS5jYXB0dXJlVmlzaWJsZSgpO1xuICAgICAgICAgICAgaWYgKHNjcmVlbnNob3QpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnRodW1ibmFpbFJlZiA9IGF3YWl0IHRoaXMuc2F2ZVNjcmVlbnNob3Qoc2NyZWVuc2hvdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVUcmFjZVN0ZXAoc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRvRmxvdzogRXJyb3IgcmVjb3JkaW5nIHBhZ2UgbG9hZDonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgdHJhY2Ugc3RlcCBmcm9tIGFuIGV2ZW50IGFuZCBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBUaGUgdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gYWN0aW9uIC0gVGhlIGFjdGlvbiB0eXBlXG4gICAgICogQHBhcmFtIGV2ZW50IC0gVGhlIG9yaWdpbmFsIGV2ZW50XG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gYSBUcmFjZVN0ZXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZVRyYWNlU3RlcChlbGVtZW50LCBhY3Rpb24sIGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IHRoaXMuc2VsZWN0b3JFeHRyYWN0b3IuZXh0cmFjdFNlbGVjdG9ycyhlbGVtZW50KTtcbiAgICAgICAgY29uc3QgYm91bmRpbmdCb3ggPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBzdGVwID0ge1xuICAgICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVTdGVwSWQoKSxcbiAgICAgICAgICAgIHRhYklkOiBhd2FpdCB0aGlzLmdldEN1cnJlbnRUYWJJZCgpLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIGFjdGlvbixcbiAgICAgICAgICAgIHNlbGVjdG9ycyxcbiAgICAgICAgICAgIHNjcm9sbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgeDogd2luZG93LnNjcm9sbFgsXG4gICAgICAgICAgICAgICAgeTogd2luZG93LnNjcm9sbFksXG4gICAgICAgICAgICAgICAgcGFnZUhlaWdodDogZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQsXG4gICAgICAgICAgICAgICAgcGFnZVdpZHRoOiBkb2N1bWVudC5ib2R5LnNjcm9sbFdpZHRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9tSGFzaDogYXdhaXQgdGhpcy5nZW5lcmF0ZURPTUhhc2goKSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuZ2VuZXJhdGVTdGVwRGVzY3JpcHRpb24oZWxlbWVudCwgYWN0aW9uKSxcbiAgICAgICAgICAgICAgICB0YWdzOiB0aGlzLmdlbmVyYXRlU3RlcFRhZ3MoZWxlbWVudCwgYWN0aW9uKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBBZGQgaW5wdXQgZGF0YSBmb3IgaW5wdXQgZXZlbnRzXG4gICAgICAgIGlmIChhY3Rpb24gPT09ICdpbnB1dCcgJiYgZWxlbWVudC52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdGVwLmlucHV0RGF0YSA9IHRoaXMuZXh0cmFjdElucHV0RGF0YShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYXB0dXJlIHNjcmVlbnNob3QgZm9yIHZpc3VhbCB2ZXJpZmljYXRpb25cbiAgICAgICAgY29uc3Qgc2NyZWVuc2hvdCA9IGF3YWl0IHRoaXMuc2NyZWVuc2hvdENhcHR1cmUuY2FwdHVyZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIGlmIChzY3JlZW5zaG90KSB7XG4gICAgICAgICAgICBzdGVwLnRodW1ibmFpbFJlZiA9IGF3YWl0IHRoaXMuc2F2ZVNjcmVlbnNob3Qoc2NyZWVuc2hvdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgaW5wdXQgZGF0YSBmcm9tIGZvcm0gZWxlbWVudHNcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRoZSBpbnB1dCBlbGVtZW50XG4gICAgICogQHJldHVybnMgSW5wdXREYXRhIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZXh0cmFjdElucHV0RGF0YShlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGlucHV0RGF0YSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBlbGVtZW50LnZhbHVlLFxuICAgICAgICAgICAgdHlwZTogdGhpcy5tYXBJbnB1dFR5cGUoZWxlbWVudC50eXBlKSxcbiAgICAgICAgICAgIHNvdXJjZTogJ3N0YXRpYycsXG4gICAgICAgICAgICBzZW5zaXRpdmU6IGVsZW1lbnQudHlwZSA9PT0gJ3Bhc3N3b3JkJ1xuICAgICAgICB9O1xuICAgICAgICAvLyBNYXNrIHNlbnNpdGl2ZSBkYXRhXG4gICAgICAgIGlmIChpbnB1dERhdGEuc2Vuc2l0aXZlKSB7XG4gICAgICAgICAgICBpbnB1dERhdGEudmFsdWUgPSAnW01BU0tFRF0nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnB1dERhdGE7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1hcCBIVE1MIGlucHV0IHR5cGVzIHRvIG91ciBJbnB1dFR5cGUgZW51bVxuICAgICAqIEBwYXJhbSBodG1sVHlwZSAtIEhUTUwgaW5wdXQgdHlwZVxuICAgICAqIEByZXR1cm5zIE1hcHBlZCBpbnB1dCB0eXBlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBtYXBJbnB1dFR5cGUoaHRtbFR5cGUpIHtcbiAgICAgICAgY29uc3QgdHlwZU1hcCA9IHtcbiAgICAgICAgICAgICd0ZXh0JzogJ3RleHQnLFxuICAgICAgICAgICAgJ2VtYWlsJzogJ2VtYWlsJyxcbiAgICAgICAgICAgICdwYXNzd29yZCc6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAnbnVtYmVyJzogJ251bWJlcicsXG4gICAgICAgICAgICAndGVsJzogJ3RleHQnLFxuICAgICAgICAgICAgJ3VybCc6ICd0ZXh0JyxcbiAgICAgICAgICAgICdzZWFyY2gnOiAndGV4dCcsXG4gICAgICAgICAgICAnZGF0ZSc6ICdkYXRlJyxcbiAgICAgICAgICAgICdmaWxlJzogJ2ZpbGUnXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0eXBlTWFwW2h0bWxUeXBlXSB8fCAndGV4dCc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgZGVzY3JpcHRpdmUgdGV4dCBmb3IgdGhlIHN0ZXBcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIFRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIGFjdGlvbiAtIEFjdGlvbiB0eXBlXG4gICAgICogQHJldHVybnMgSHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdlbmVyYXRlU3RlcERlc2NyaXB0aW9uKGVsZW1lbnQsIGFjdGlvbikge1xuICAgICAgICBjb25zdCBlbGVtZW50VGV4dCA9IGVsZW1lbnQudGV4dENvbnRlbnQ/LnRyaW0oKS5zbGljZSgwLCA1MCkgfHwgJyc7XG4gICAgICAgIGNvbnN0IHRhZ05hbWUgPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ2NsaWNrJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYENsaWNrZWQgJHt0YWdOYW1lfSR7ZWxlbWVudFRleHQgPyAnOiBcIicgKyBlbGVtZW50VGV4dCArICdcIicgOiAnJ31gO1xuICAgICAgICAgICAgY2FzZSAnaW5wdXQnOlxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gZWxlbWVudC5wbGFjZWhvbGRlcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gYEVudGVyZWQgdGV4dCBpbiAke3RhZ05hbWV9JHtwbGFjZWhvbGRlciA/ICcgKCcgKyBwbGFjZWhvbGRlciArICcpJyA6ICcnfWA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBgUGVyZm9ybWVkICR7YWN0aW9ufSBvbiAke3RhZ05hbWV9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSByZWxldmFudCB0YWdzIGZvciB0aGUgc3RlcFxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gYWN0aW9uIC0gQWN0aW9uIHR5cGVcbiAgICAgKiBAcmV0dXJucyBBcnJheSBvZiB0YWdzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZW5lcmF0ZVN0ZXBUYWdzKGVsZW1lbnQsIGFjdGlvbikge1xuICAgICAgICBjb25zdCB0YWdzID0gW2FjdGlvbl07XG4gICAgICAgIC8vIEFkZCBlbGVtZW50LXNwZWNpZmljIHRhZ3NcbiAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSkge1xuICAgICAgICAgICAgdGFncy5wdXNoKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGFncy5wdXNoKCdoYXMtY2xhc3MnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5pZCkge1xuICAgICAgICAgICAgdGFncy5wdXNoKCdoYXMtaWQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgZm9ybS1yZWxhdGVkIHRhZ3NcbiAgICAgICAgaWYgKGVsZW1lbnQuY2xvc2VzdCgnZm9ybScpKSB7XG4gICAgICAgICAgICB0YWdzLnB1c2goJ2Zvcm0tZWxlbWVudCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWdzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTYXZlIGEgdHJhY2Ugc3RlcCB0byBzdG9yYWdlXG4gICAgICogQHBhcmFtIHN0ZXAgLSBUaGUgc3RlcCB0byBzYXZlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBzYXZlVHJhY2VTdGVwKHN0ZXApIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFNlbmQgdG8gYmFja2dyb3VuZCBzY3JpcHQgZm9yIHByb2Nlc3NpbmcgYW5kIHN0b3JhZ2VcbiAgICAgICAgICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnU0FWRV9UUkFDRV9TVEVQJyxcbiAgICAgICAgICAgICAgICBzZXNzaW9uSWQ6IHRoaXMucmVjb3JkaW5nU2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgIHN0ZXBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zdGVwQ291bnRlcisrO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0F1dG9GbG93OiBTdGVwIHJlY29yZGVkOicsIHN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXV0b0Zsb3c6IEVycm9yIHNhdmluZyB0cmFjZSBzdGVwOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTYXZlIHNjcmVlbnNob3QgdG8gc3RvcmFnZVxuICAgICAqIEBwYXJhbSBzY3JlZW5zaG90IC0gQmFzZTY0IHNjcmVlbnNob3QgZGF0YVxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHNjcmVlbnNob3QgcmVmZXJlbmNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBhc3luYyBzYXZlU2NyZWVuc2hvdChzY3JlZW5zaG90KSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbnNob3RJZCA9IGBzY3JlZW5zaG90XyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICAgICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgICAgIFtgc2NyZWVuc2hvdF8ke3NjcmVlbnNob3RJZH1gXTogc2NyZWVuc2hvdFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNjcmVlbnNob3RJZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSB1bmlxdWUgc3RlcCBJRFxuICAgICAqIEByZXR1cm5zIFVuaXF1ZSBzdGVwIGlkZW50aWZpZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdlbmVyYXRlU3RlcElkKCkge1xuICAgICAgICByZXR1cm4gYHN0ZXBfJHtEYXRlLm5vdygpfV8ke3RoaXMuc3RlcENvdW50ZXJ9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IHRhYiBJRFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHRhYiBJRFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgYXN5bmMgZ2V0Q3VycmVudFRhYklkKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogJ0dFVF9DVVJSRU5UX1RBQicgfSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZT8udGFiSWQgfHwgMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgaGFzaCBvZiB0aGUgY3VycmVudCBET00gc3RydWN0dXJlXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gRE9NIGhhc2hcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGdlbmVyYXRlRE9NSGFzaCgpIHtcbiAgICAgICAgLy8gU2ltcGxlIGhhc2ggYmFzZWQgb24gRE9NIHN0cnVjdHVyZSBhbmQga2V5IGVsZW1lbnRzXG4gICAgICAgIGNvbnN0IGJvZHlIVE1MID0gZG9jdW1lbnQuYm9keS5pbm5lckhUTUwuc2xpY2UoMCwgMTAwMCk7IC8vIEZpcnN0IDFLQlxuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgICAgICBjb25zdCB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGAke3RpdGxlfXwke3VybH18JHtib2R5SFRNTH1gO1xuICAgICAgICAvLyBTaW1wbGUgaGFzaCBmdW5jdGlvbiAoZm9yIHByb2R1Y3Rpb24sIHVzZSBjcnlwdG8gQVBJKVxuICAgICAgICBsZXQgaGFzaCA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGVudC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hhciA9IGNvbnRlbnQuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIGNoYXI7XG4gICAgICAgICAgICBoYXNoID0gaGFzaCAmIGhhc2g7IC8vIENvbnZlcnQgdG8gMzItYml0IGludGVnZXJcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgdmlzdWFsIHJlY29yZGluZyBpbmRpY2F0b3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNob3dSZWNvcmRpbmdJbmRpY2F0b3IoKSB7XG4gICAgICAgIC8vIFJlbW92ZSBleGlzdGluZyBpbmRpY2F0b3IgaWYgcHJlc2VudFxuICAgICAgICB0aGlzLmhpZGVSZWNvcmRpbmdJbmRpY2F0b3IoKTtcbiAgICAgICAgY29uc3QgaW5kaWNhdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGluZGljYXRvci5jbGFzc05hbWUgPSAnYXV0b2Zsb3ctcmVjb3JkaW5nLWluZGljYXRvcic7XG4gICAgICAgIGluZGljYXRvci5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IHN0eWxlPVwiXG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgdG9wOiAyMHB4O1xuICAgICAgICByaWdodDogMjBweDtcbiAgICAgICAgYmFja2dyb3VuZDogI2VmNDQ0NDtcbiAgICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgICBwYWRkaW5nOiA4cHggMTZweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMjBweDtcbiAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgc2Fucy1zZXJpZjtcbiAgICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICB6LWluZGV4OiA5OTk5OTk7XG4gICAgICAgIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjIpO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBnYXA6IDhweDtcbiAgICAgIFwiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwiXG4gICAgICAgICAgd2lkdGg6IDhweDtcbiAgICAgICAgICBoZWlnaHQ6IDhweDtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiB3aGl0ZTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgYW5pbWF0aW9uOiBwdWxzZSAxcyBpbmZpbml0ZTtcbiAgICAgICAgXCI+PC9kaXY+XG4gICAgICAgIFJlY29yZGluZ1xuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgICAgICAgLy8gQWRkIGFuaW1hdGlvbiBzdHlsZXNcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbiAgICAgIEBrZXlmcmFtZXMgcHVsc2Uge1xuICAgICAgICAwJSwgMTAwJSB7IG9wYWNpdHk6IDE7IH1cbiAgICAgICAgNTAlIHsgb3BhY2l0eTogMC41OyB9XG4gICAgICB9XG4gICAgYDtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSGlkZSB2aXN1YWwgcmVjb3JkaW5nIGluZGljYXRvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgaGlkZVJlY29yZGluZ0luZGljYXRvcigpIHtcbiAgICAgICAgY29uc3QgaW5kaWNhdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmF1dG9mbG93LXJlY29yZGluZy1pbmRpY2F0b3InKTtcbiAgICAgICAgaWYgKGluZGljYXRvcikge1xuICAgICAgICAgICAgaW5kaWNhdG9yLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gSW5pdGlhbGl6ZSB0aGUgY29udGVudCBzY3JpcHQgd2hlbiB0aGUgcGFnZSBsb2Fkc1xuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gICAgICAgIG5ldyBBdXRvRmxvd0NvbnRlbnRTY3JpcHQoKTtcbiAgICB9KTtcbn1cbmVsc2Uge1xuICAgIG5ldyBBdXRvRmxvd0NvbnRlbnRTY3JpcHQoKTtcbn1cbmV4cG9ydCBkZWZhdWx0IEF1dG9GbG93Q29udGVudFNjcmlwdDtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==