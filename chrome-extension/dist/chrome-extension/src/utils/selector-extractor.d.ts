/**
 * @fileoverview Selector extraction utility for robust element targeting
 * @author Ayush Shukla
 * @description Extracts multiple selector strategies for reliable element finding.
 * Implements Interface Segregation Principle with focused selector strategies.
 */
import { ElementSelector } from "@shared/types/core";
/**
 * Main selector extractor class that coordinates multiple strategies
 * Follows Single Responsibility Principle and Strategy Pattern
 */
export declare class SelectorExtractor {
    private strategies;
    constructor();
    /**
     * Extract multiple selectors for an element using all strategies
     * @param element - Target element to extract selectors for
     * @returns Array of element selectors with confidence scores
     */
    extractSelectors(element: Element): ElementSelector[];
    /**
     * Calculate confidence score for a selector
     * @param selector - The selector string
     * @param element - Target element
     * @param strategy - Strategy used to extract the selector
     * @returns Confidence score (0-100)
     * @private
     */
    private calculateConfidence;
    /**
     * Get bounding box for an element
     * @param element - Target element
     * @returns Bounding box coordinates
     * @private
     */
    private getBoundingBox;
    /**
     * Extract relevant attributes from an element
     * @param element - Target element
     * @returns Object with relevant attributes
     * @private
     */
    private extractRelevantAttributes;
    /**
     * Create a fallback selector when all strategies fail
     * @param element - Target element
     * @param boundingBox - Element bounding box
     * @returns Fallback element selector
     * @private
     */
    private createFallbackSelector;
}
