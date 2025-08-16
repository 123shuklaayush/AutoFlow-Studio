/**
 * @fileoverview Screenshot capture utility for visual verification and AI healing
 * @author Ayush Shukla
 * @description Handles capturing screenshots of elements and page regions.
 * Optimized for storage efficiency and visual recognition.
 */

import { BoundingBox } from '@shared/types/core';

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
 * Default screenshot configuration optimized for storage and recognition
 */
const DEFAULT_CONFIG: ScreenshotConfig = {
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
export class ScreenshotCapture {
  private config: ScreenshotConfig;

  /**
   * Initialize screenshot capture with configuration
   * @param config - Screenshot configuration (optional)
   */
  constructor(config: Partial<ScreenshotConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Capture screenshot of a specific element with context
   * @param element - Element to capture
   * @param padding - Padding around element (default: 20px)
   * @returns Promise resolving to base64 screenshot or null
   */
  async captureElement(element: Element, padding: number = 20): Promise<string | null> {
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
      let highlightElement: HTMLElement | null = null;
      if (this.config.highlight) {
        highlightElement = this.addElementHighlight(element);
      }

      try {
        // Capture the visible area
        const screenshot = await this.captureVisibleArea();
        
        if (screenshot) {
          // Crop to the specific region
          const croppedScreenshot = await this.cropScreenshot(
            screenshot,
            captureRegion,
            this.config
          );
          
          return croppedScreenshot;
        }

      } finally {
        // Remove highlight
        if (highlightElement) {
          highlightElement.remove();
        }
      }

      return null;

    } catch (error) {
      console.error('ScreenshotCapture: Error capturing element screenshot:', error);
      return null;
    }
  }

  /**
   * Capture screenshot of the visible page area
   * @returns Promise resolving to base64 screenshot or null
   */
  async captureVisible(): Promise<string | null> {
    try {
      const screenshot = await this.captureVisibleArea();
      
      if (screenshot) {
        // Resize if needed to stay within limits
        return await this.resizeScreenshot(screenshot, this.config);
      }

      return null;

    } catch (error) {
      console.error('ScreenshotCapture: Error capturing visible screenshot:', error);
      return null;
    }
  }

  /**
   * Capture full page screenshot (if possible)
   * @returns Promise resolving to base64 screenshot or null
   */
  async captureFullPage(): Promise<string | null> {
    try {
      // This requires the background script to handle via chrome.tabs.captureVisibleTab
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'CAPTURE_FULL_PAGE' },
          (response) => {
            resolve(response?.screenshot || null);
          }
        );
      });

    } catch (error) {
      console.error('ScreenshotCapture: Error capturing full page screenshot:', error);
      return null;
    }
  }

  /**
   * Capture screenshot with element highlighting for multiple elements
   * @param elements - Elements to highlight
   * @returns Promise resolving to base64 screenshot or null
   */
  async captureWithHighlights(elements: Element[]): Promise<string | null> {
    try {
      const highlights: HTMLElement[] = [];

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
      } finally {
        // Clean up highlights
        highlights.forEach(highlight => highlight.remove());
      }

    } catch (error) {
      console.error('ScreenshotCapture: Error capturing with highlights:', error);
      return null;
    }
  }

  /**
   * Capture the visible area using chrome.tabs API via background script
   * @returns Promise resolving to base64 screenshot
   * @private
   */
  private async captureVisibleArea(): Promise<string | null> {
    try {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'CAPTURE_VISIBLE_TAB' },
          (response) => {
            if (response?.error) {
              console.error('ScreenshotCapture: Background script error:', response.error);
              resolve(null);
            } else {
              resolve(response?.screenshot || null);
            }
          }
        );
      });

    } catch (error) {
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
  private isElementOutOfView(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    
    return (
      rect.bottom < 0 ||
      rect.right < 0 ||
      rect.left > window.innerWidth ||
      rect.top > window.innerHeight
    );
  }

  /**
   * Add visual highlight to an element
   * @param element - Element to highlight
   * @param color - Highlight color (default: red)
   * @returns Highlight element or null
   * @private
   */
  private addElementHighlight(
    element: Element, 
    color: string = '#ef4444'
  ): HTMLElement | null {
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

    } catch (error) {
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
  private async cropScreenshot(
    screenshot: string,
    region: { x: number; y: number; width: number; height: number },
    config: ScreenshotConfig
  ): Promise<string> {
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
            ctx.drawImage(
              img,
              region.x, region.y, region.width, region.height,
              0, 0, region.width, region.height
            );

            // Convert to desired format and quality
            const croppedData = canvas.toDataURL(
              `image/${config.format}`,
              config.quality
            );

            resolve(croppedData);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load screenshot image'));
        };

        img.src = screenshot;

      } catch (error) {
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
  private async resizeScreenshot(
    screenshot: string,
    config: ScreenshotConfig
  ): Promise<string> {
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
            const { width: newWidth, height: newHeight } = this.calculateResizeDimensions(
              img.width,
              img.height,
              config.maxWidth,
              config.maxHeight
            );

            // Set canvas size
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw resized image
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Convert to desired format and quality
            const resizedData = canvas.toDataURL(
              `image/${config.format}`,
              config.quality
            );

            resolve(resizedData);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load screenshot image'));
        };

        img.src = screenshot;

      } catch (error) {
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
  private calculateResizeDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
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
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get estimated screenshot file size in bytes
   * @param screenshot - Base64 screenshot data
   * @returns Estimated file size in bytes
   */
  getScreenshotSize(screenshot: string): number {
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
  async compressIfNeeded(screenshot: string, maxSize: number = 500 * 1024): Promise<string> {
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

    } catch (error) {
      console.warn('ScreenshotCapture: Error compressing screenshot:', error);
      return screenshot; // Return original if compression fails
    }
  }
}
