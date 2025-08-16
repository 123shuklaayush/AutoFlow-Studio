/**
 * @fileoverview Screenshot capture utility for visual verification and AI healing
 * @author Ayush Shukla
 * @description Handles capturing screenshots of elements and page regions.
 * Optimized for storage efficiency and visual recognition.
 */
/**
 * Configuration for screenshot capture
 */
export interface ScreenshotConfig {
    /** Maximum width for screenshots */
    maxWidth: number;
    /** Maximum height for screenshots */
    maxHeight: number;
    /** JPEG quality (0-1) */
    quality: number;
    /** Format for screenshots */
    format: 'png' | 'jpeg';
    /** Whether to include element highlight */
    highlight: boolean;
}
/**
 * Screenshot capture utility class
 * Follows Single Responsibility Principle for screenshot operations
 */
export declare class ScreenshotCapture {
    private config;
    /**
     * Initialize screenshot capture with configuration
     * @param config - Screenshot configuration (optional)
     */
    constructor(config?: Partial<ScreenshotConfig>);
    /**
     * Capture screenshot of a specific element with context
     * @param element - Element to capture
     * @param padding - Padding around element (default: 20px)
     * @returns Promise resolving to base64 screenshot or null
     */
    captureElement(element: Element, padding?: number): Promise<string | null>;
    /**
     * Capture screenshot of the visible page area
     * @returns Promise resolving to base64 screenshot or null
     */
    captureVisible(): Promise<string | null>;
    /**
     * Capture full page screenshot (if possible)
     * @returns Promise resolving to base64 screenshot or null
     */
    captureFullPage(): Promise<string | null>;
    /**
     * Capture screenshot with element highlighting for multiple elements
     * @param elements - Elements to highlight
     * @returns Promise resolving to base64 screenshot or null
     */
    captureWithHighlights(elements: Element[]): Promise<string | null>;
    /**
     * Capture the visible area using chrome.tabs API via background script
     * @returns Promise resolving to base64 screenshot
     * @private
     */
    private captureVisibleArea;
    /**
     * Check if element is out of the current viewport
     * @param element - Element to check
     * @returns Whether element is out of view
     * @private
     */
    private isElementOutOfView;
    /**
     * Add visual highlight to an element
     * @param element - Element to highlight
     * @param color - Highlight color (default: red)
     * @returns Highlight element or null
     * @private
     */
    private addElementHighlight;
    /**
     * Crop screenshot to specific region
     * @param screenshot - Base64 screenshot data
     * @param region - Region to crop
     * @param config - Screenshot configuration
     * @returns Promise resolving to cropped screenshot
     * @private
     */
    private cropScreenshot;
    /**
     * Resize screenshot to fit within maximum dimensions
     * @param screenshot - Base64 screenshot data
     * @param config - Screenshot configuration
     * @returns Promise resolving to resized screenshot
     * @private
     */
    private resizeScreenshot;
    /**
     * Calculate new dimensions for resizing while maintaining aspect ratio
     * @param originalWidth - Original image width
     * @param originalHeight - Original image height
     * @param maxWidth - Maximum allowed width
     * @param maxHeight - Maximum allowed height
     * @returns New dimensions
     * @private
     */
    private calculateResizeDimensions;
    /**
     * Sleep utility for waiting
     * @param ms - Milliseconds to sleep
     * @returns Promise that resolves after delay
     * @private
     */
    private sleep;
    /**
     * Get estimated screenshot file size in bytes
     * @param screenshot - Base64 screenshot data
     * @returns Estimated file size in bytes
     */
    getScreenshotSize(screenshot: string): number;
    /**
     * Compress screenshot if it's too large
     * @param screenshot - Base64 screenshot data
     * @param maxSize - Maximum size in bytes (default: 500KB)
     * @returns Promise resolving to compressed screenshot
     */
    compressIfNeeded(screenshot: string, maxSize?: number): Promise<string>;
}
