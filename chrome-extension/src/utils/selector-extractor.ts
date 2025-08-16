/**
 * @fileoverview Selector extraction utility for robust element targeting
 * @author Ayush Shukla
 * @description Extracts multiple selector strategies for reliable element finding.
 * Implements Interface Segregation Principle with focused selector strategies.
 */

import { ElementSelector, BoundingBox } from "@shared/types/core";

/**
 * Interface for different selector extraction strategies
 * Following Interface Segregation Principle
 */
interface SelectorStrategy {
  extract(element: Element): string | null;
  getPriority(): number;
  isValid(selector: string, element: Element): boolean;
}

/**
 * CSS selector extraction strategy
 */
class CssSelectorStrategy implements SelectorStrategy {
  /**
   * Extract CSS selector for the element
   * @param element - Target element
   * @returns CSS selector string or null
   */
  extract(element: Element): string | null {
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
    } catch (error) {
      console.warn("CssSelectorStrategy: Error extracting selector:", error);
      return null;
    }
  }

  /**
   * Get priority of this strategy (higher is better)
   */
  getPriority(): number {
    return 90;
  }

  /**
   * Check if the selector is valid for the element
   * @param selector - CSS selector to validate
   * @param element - Target element
   * @returns Whether the selector is valid
   */
  isValid(selector: string, element: Element): boolean {
    try {
      const found = document.querySelector(selector);
      return found === element;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a selector returns only one element
   * @param selector - CSS selector to check
   * @returns Whether the selector is unique
   * @private
   */
  private isUnique(selector: string): boolean {
    try {
      return document.querySelectorAll(selector).length === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate selector based on tag and attributes
   * @param element - Target element
   * @returns Tag + attribute selector
   * @private
   */
  private generateTagAttributeSelector(element: Element): string | null {
    const tag = element.tagName.toLowerCase();
    const attributes: string[] = [];

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
  private generateNthChildSelector(element: Element): string {
    const path: string[] = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase();

      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }

      path.unshift(selector);
      current = current.parentElement as Element;

      // Limit depth to avoid very long selectors
      if (path.length >= 5) break;
    }

    return path.join(" > ");
  }
}

/**
 * XPath selector extraction strategy
 */
class XPathSelectorStrategy implements SelectorStrategy {
  /**
   * Extract XPath selector for the element
   * @param element - Target element
   * @returns XPath selector string or null
   */
  extract(element: Element): string | null {
    try {
      const path: string[] = [];
      let current = element;

      while (current && current.nodeType === Node.ELEMENT_NODE) {
        const tagName = current.tagName.toLowerCase();

        if (current.id) {
          // Use ID for shorter XPath
          path.unshift(`//${tagName}[@id='${current.id}']`);
          break;
        } else if (current.parentElement) {
          const siblings = Array.from(current.parentElement.children);
          const sameTagSiblings = siblings.filter(
            (el) => el.tagName === current.tagName
          );

          if (sameTagSiblings.length === 1) {
            path.unshift(`/${tagName}`);
          } else {
            const index = sameTagSiblings.indexOf(current) + 1;
            path.unshift(`/${tagName}[${index}]`);
          }
        } else {
          path.unshift(`/${tagName}`);
        }

        current = current.parentElement as Element;

        // Limit depth
        if (path.length >= 6) break;
      }

      return path.length > 0 ? "/" + path.join("") : null;
    } catch (error) {
      console.warn("XPathSelectorStrategy: Error extracting selector:", error);
      return null;
    }
  }

  /**
   * Get priority of this strategy
   */
  getPriority(): number {
    return 70;
  }

  /**
   * Check if the XPath selector is valid for the element
   * @param selector - XPath selector to validate
   * @param element - Target element
   * @returns Whether the selector is valid
   */
  isValid(selector: string, element: Element): boolean {
    try {
      const result = document.evaluate(
        selector,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue === element;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Text-based selector extraction strategy
 */
class TextSelectorStrategy implements SelectorStrategy {
  /**
   * Extract text-based selector for the element
   * @param element - Target element
   * @returns Text selector string or null
   */
  extract(element: Element): string | null {
    try {
      const text = element.textContent?.trim();

      if (!text || text.length > 100) {
        return null; // Skip very long text or empty elements
      }

      // Check if text is unique
      const xpath = `//*[normalize-space(text())='${text.replace(/'/g, "\\'")}']`;
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      if (result.snapshotLength === 1) {
        return `text=${text}`;
      }

      // Try partial text match for longer text
      if (text.length > 10) {
        const partialText = text.slice(0, 20);
        const partialXpath = `//*[contains(normalize-space(text()),'${partialText.replace(/'/g, "\\'")}')]`;
        const partialResult = document.evaluate(
          partialXpath,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        if (partialResult.snapshotLength <= 3) {
          return `text*=${partialText}`;
        }
      }

      return null;
    } catch (error) {
      console.warn("TextSelectorStrategy: Error extracting selector:", error);
      return null;
    }
  }

  /**
   * Get priority of this strategy
   */
  getPriority(): number {
    return 60;
  }

  /**
   * Check if the text selector is valid for the element
   * @param selector - Text selector to validate
   * @param element - Target element
   * @returns Whether the selector is valid
   */
  isValid(selector: string, element: Element): boolean {
    try {
      const text = element.textContent?.trim();
      if (!text) return false;

      if (selector.startsWith("text=")) {
        return text === selector.substring(5);
      } else if (selector.startsWith("text*=")) {
        return text.includes(selector.substring(6));
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}

/**
 * ARIA/Role-based selector extraction strategy
 */
class RoleSelectorStrategy implements SelectorStrategy {
  /**
   * Extract role-based selector for the element
   * @param element - Target element
   * @returns Role selector string or null
   */
  extract(element: Element): string | null {
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
    } catch (error) {
      console.warn("RoleSelectorStrategy: Error extracting selector:", error);
      return null;
    }
  }

  /**
   * Get priority of this strategy
   */
  getPriority(): number {
    return 80;
  }

  /**
   * Check if the role selector is valid for the element
   * @param selector - Role selector to validate
   * @param element - Target element
   * @returns Whether the selector is valid
   */
  isValid(selector: string, element: Element): boolean {
    try {
      if (selector.startsWith("role=")) {
        const expectedRole = selector.substring(5);
        const actualRole =
          element.getAttribute("role") || this.getImplicitRole(element);
        return actualRole === expectedRole;
      }

      const found = document.querySelector(selector);
      return found === element;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get implicit ARIA role for common elements
   * @param element - Target element
   * @returns Implicit role or null
   * @private
   */
  private getImplicitRole(element: Element): string | null {
    const tagName = element.tagName.toLowerCase();

    // Handle input elements specially
    if (tagName === "input") {
      return this.getInputRole(element as HTMLInputElement);
    }

    const roleMap: { [key: string]: string } = {
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
  private getInputRole(input: HTMLInputElement): string {
    const type = (input.type || "text").toLowerCase();

    const inputRoles: { [key: string]: string } = {
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
export class SelectorExtractor {
  private strategies: SelectorStrategy[];

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
  extractSelectors(element: Element): ElementSelector[] {
    const selectors: ElementSelector[] = [];
    const boundingBox = this.getBoundingBox(element);

    // Extract selectors using each strategy
    for (const strategy of this.strategies) {
      try {
        const selector = strategy.extract(element);
        if (selector) {
          const confidence = this.calculateConfidence(
            selector,
            element,
            strategy
          );

          const elementSelector: ElementSelector = {
            confidence,
            boundingBox,
          };

          // Assign selector to appropriate property based on strategy
          if (strategy instanceof CssSelectorStrategy) {
            elementSelector.css = selector;
          } else if (strategy instanceof XPathSelectorStrategy) {
            elementSelector.xpath = selector;
          } else if (strategy instanceof TextSelectorStrategy) {
            elementSelector.text = selector;
          } else if (strategy instanceof RoleSelectorStrategy) {
            elementSelector.role = selector;
          }

          // Add element attributes for additional verification
          elementSelector.attributes = this.extractRelevantAttributes(element);

          selectors.push(elementSelector);
        }
      } catch (error) {
        console.warn(
          "SelectorExtractor: Error with strategy:",
          strategy.constructor.name,
          error
        );
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
  private calculateConfidence(
    selector: string,
    element: Element,
    strategy: SelectorStrategy
  ): number {
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
      } else {
        confidence -= 20;
      }
    } catch (error) {
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
  private getBoundingBox(element: Element): BoundingBox {
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
  private extractRelevantAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
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
  private createFallbackSelector(
    element: Element,
    boundingBox: BoundingBox
  ): ElementSelector {
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
