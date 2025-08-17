/**
 * @fileoverview Workflow Execution Engine
 * @author Ayush Shukla
 * @description Playwright-based automation runner for executing workflows
 */

import { chromium, Browser, Page, BrowserContext } from "playwright";
import { TraceStep, Workflow } from "@shared/types/core";
import { logger } from "../utils/logger";
import { EventEmitter } from "events";

export interface ExecutionConfig {
  /** Whether to run in headless mode */
  headless: boolean;
  /** Slow down execution for reliability (ms) */
  slowMo: number;
  /** Global timeout for operations (ms) */
  timeout: number;
  /** Whether to take screenshots */
  screenshots: boolean;
  /** Screenshot directory */
  screenshotDir: string;
  /** Viewport size */
  viewport: { width: number; height: number };
  /** User agent string */
  userAgent?: string;
}

export interface ExecutionResult {
  success: boolean;
  workflowId: string;
  executionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  stepsExecuted: number;
  totalSteps: number;
  stepResults: StepExecutionResult[];
  error?: string;
  screenshots: string[];
  logs: ExecutionLog[];
}

export interface StepExecutionResult {
  stepId: string;
  stepIndex: number;
  action: string;
  success: boolean;
  duration: number;
  error?: string;
  screenshot?: string;
  retryCount: number;
  metadata?: Record<string, any>;
}

export interface ExecutionLog {
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  stepId?: string;
  metadata?: Record<string, any>;
}

export interface ExecutionProgress {
  executionId: string;
  workflowId: string;
  status: "starting" | "running" | "completed" | "failed" | "paused";
  currentStep: number;
  totalSteps: number;
  progress: number; // 0-100
  currentStepDescription?: string;
  estimatedTimeRemaining?: number;
}

/**
 * Main execution engine class
 */
export class ExecutionEngine extends EventEmitter {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: ExecutionConfig;
  private currentExecution: ExecutionResult | null = null;
  private isExecuting: boolean = false;

  constructor(config: Partial<ExecutionConfig> = {}) {
    super();

    this.config = {
      headless: false, // Visible by default for debugging
      slowMo: 1000,
      timeout: 30000,
      screenshots: true,
      screenshotDir: "./screenshots",
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ...config,
    };
  }

  /**
   * Execute a complete workflow
   */
  async executeWorkflow(workflow: Workflow): Promise<ExecutionResult> {
    if (this.isExecuting) {
      throw new Error("Another workflow is currently executing");
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    this.currentExecution = {
      success: false,
      workflowId: workflow.id,
      executionId,
      startTime,
      stepsExecuted: 0,
      totalSteps: workflow.steps.length,
      stepResults: [],
      screenshots: [],
      logs: [],
    };

    this.isExecuting = true;

    try {
      logger.info(`Starting workflow execution: ${workflow.id}`, {
        executionId,
      });

      // Initialize browser
      await this.initializeBrowser();

      // Temporarily execute original order to avoid unintended reordering
      const normalizedSteps = workflow.steps;
      this.log(
        "info",
        `Executing ${normalizedSteps.length} steps (no normalization)`
      );

      // Execute each step
      for (let i = 0; i < normalizedSteps.length; i++) {
        const step = normalizedSteps[i];

        this.emitProgress({
          executionId,
          workflowId: workflow.id,
          status: "running",
          currentStep: i + 1,
          totalSteps: normalizedSteps.length,
          progress: Math.round(((i + 1) / normalizedSteps.length) * 100),
          currentStepDescription:
            step.metadata?.description || `${step.action} action`,
        });

        const stepResult = await this.executeStep(step, i);
        this.currentExecution.stepResults.push(stepResult);
        this.currentExecution.stepsExecuted++;

        if (!stepResult.success) {
          logger.error(`Step ${i + 1} failed: ${stepResult.error}`);

          // Decide whether to continue or stop
          if (step.metadata?.critical !== false) {
            this.currentExecution.error = `Critical step failed: ${stepResult.error}`;
            break;
          }
        }
      }

      // Mark as successful if we completed all steps or only non-critical steps failed
      const criticalStepsFailed = this.currentExecution.stepResults.some(
        (result, index) =>
          !result.success &&
          normalizedSteps[index]?.metadata?.critical !== false
      );

      this.currentExecution.success = !criticalStepsFailed;
      this.currentExecution.endTime = Date.now();
      this.currentExecution.duration =
        this.currentExecution.endTime - startTime;

      logger.info(`Workflow execution completed: ${workflow.id}`, {
        executionId,
        success: this.currentExecution.success,
        duration: this.currentExecution.duration,
        stepsExecuted: this.currentExecution.stepsExecuted,
      });

      this.emitProgress({
        executionId,
        workflowId: workflow.id,
        status: this.currentExecution.success ? "completed" : "failed",
        currentStep: this.currentExecution.stepsExecuted,
        totalSteps: normalizedSteps.length,
        progress: 100,
      });

      return { ...this.currentExecution };
    } catch (error: any) {
      logger.error("Workflow execution failed:", error);

      this.currentExecution.success = false;
      this.currentExecution.error = error.message;
      this.currentExecution.endTime = Date.now();
      this.currentExecution.duration =
        this.currentExecution.endTime - startTime;

      this.emitProgress({
        executionId,
        workflowId: workflow.id,
        status: "failed",
        currentStep: this.currentExecution.stepsExecuted,
        totalSteps: workflow.steps.length,
        progress: 0,
      });

      return { ...this.currentExecution };
    } finally {
      await this.cleanup();
      this.isExecuting = false;
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: TraceStep,
    stepIndex: number
  ): Promise<StepExecutionResult> {
    const startTime = Date.now();
    let retryCount = 0;
    const maxRetries = step.metadata?.retryConfig?.maxAttempts || 3;

    const result: StepExecutionResult = {
      stepId: step.id,
      stepIndex,
      action: step.action,
      success: false,
      duration: 0,
      retryCount: 0,
    };

    this.log(
      "info",
      `Executing step ${stepIndex + 1}: ${step.action}`,
      step.id
    );

    while (retryCount <= maxRetries) {
      try {
        result.retryCount = retryCount;

        // Take screenshot before step
        if (this.config.screenshots) {
          const screenshotPath = await this.takeScreenshot(
            `step_${stepIndex + 1}_before`
          );
          if (screenshotPath) {
            this.currentExecution!.screenshots.push(screenshotPath);
          }
        }

        // Execute the step based on action type
        await this.executeStepAction(step);

        // Take screenshot after step
        if (this.config.screenshots) {
          const screenshotPath = await this.takeScreenshot(
            `step_${stepIndex + 1}_after`
          );
          if (screenshotPath) {
            this.currentExecution!.screenshots.push(screenshotPath);
            result.screenshot = screenshotPath;
          }
        }

        result.success = true;
        result.duration = Date.now() - startTime;

        this.log(
          "info",
          `Step ${stepIndex + 1} completed successfully`,
          step.id
        );
        break;
      } catch (error: any) {
        retryCount++;
        result.error = error.message;

        this.log(
          "error",
          `Step ${stepIndex + 1} failed (attempt ${retryCount}): ${error.message}`,
          step.id
        );

        if (retryCount <= maxRetries) {
          const waitTime = step.metadata?.retryConfig?.delay || 2000;
          this.log(
            "info",
            `Retrying step ${stepIndex + 1} in ${waitTime}ms`,
            step.id
          );
          await this.wait(waitTime);
        }
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Execute specific step action
   */
  private async executeStepAction(step: TraceStep): Promise<void> {
    if (!this.page) {
      throw new Error("Browser page not initialized");
    }

    // Ensure we are on the correct page before attempting non-navigation actions
    if (
      step.url &&
      step.action !== "navigate" &&
      step.action !== "navigation"
    ) {
      await this.ensurePageForStep(step.url);
    }

    switch (step.action) {
      case "click":
        await this.executeClick(step);
        break;

      case "input":
        await this.executeInput(step);
        break;

      case "scroll":
        await this.executeScroll(step);
        break;

      case "navigate":
      case "navigation":
        await this.executeNavigation(step);
        break;

      case "wait":
        await this.executeWait(step);
        break;

      default:
        throw new Error(`Unknown action type: ${step.action}`);
    }
  }

  /**
   * Execute click action
   */
  private async executeClick(step: TraceStep): Promise<void> {
    if (!this.page) throw new Error("Page not initialized");

    const selector = this.getBestSelector(step);

    // Helper to try clicking within main page or any frame
    const tryClick = async (sel: string, timeout: number) => {
      // Main page
      try {
        const loc = this.page!.locator(sel);
        await loc.waitFor({ state: "visible", timeout });
        await loc.scrollIntoViewIfNeeded();
        await loc.click();
        return true;
      } catch {}
      // Frames
      for (const frame of this.page!.frames()) {
        try {
          const loc = frame.locator(sel);
          await loc.waitFor({
            state: "visible",
            timeout: Math.min(3000, timeout),
          });
          await loc.scrollIntoViewIfNeeded();
          await loc.click();
          return true;
        } catch {}
      }
      return false;
    };

    // 1) Primary selector
    let clicked = await tryClick(selector, this.config.timeout);

    // 1a) If the element exists but is disabled, press Enter as a fallback submit
    if (!clicked) {
      try {
        const isDisabled = await this.page!.locator(selector)
          .isDisabled({ timeout: 2000 })
          .catch(() => false);
        if (isDisabled) {
          await this.page!.keyboard.press("Enter");
          clicked = true;
        }
      } catch {}
    }

    // 2) Alternatives recorded
    if (!clicked) {
      const alts = ((step as any).selectors || []).slice(1);
      for (const alt of alts) {
        const rawAlt =
          typeof alt === "string"
            ? alt
            : alt?.selector || alt?.css || alt?.text || alt?.xpath;
        if (!rawAlt) continue;
        const altStr = this.sanitizeSelector(rawAlt);
        clicked = await tryClick(altStr, 5000);
        if (clicked) {
          this.log(
            "info",
            `Clicked via alternative selector: ${altStr}`,
            step.id
          );
          break;
        }
      }
    }

    // 3) Fallback using recorded role/text names if available
    if (!clicked) {
      const first = ((step as any).selectors || [])[0] || {};
      const text =
        typeof first === "string" ? undefined : first.text || first?.name;
      const candidates: string[] = [];
      if (text) {
        candidates.push(`role=button[name="${text}"]`);
        candidates.push(`text=${text}`);
        candidates.push(`button:has-text("${text}")`);
      }
      // Common generic submit selectors
      candidates.push('button[type="submit"]');
      candidates.push("form button");
      candidates.push('[data-testid="submit"], [data-test="submit"]');
      for (const c of candidates) {
        clicked = await tryClick(c, 4000);
        if (clicked) {
          this.log("info", `Clicked via fallback: ${c}`, step.id);
          break;
        }
      }
      // Playwright recommended API: getByRole, getByText (if available in our runtime)
      if (!clicked && text) {
        try {
          const byRole = this.page!.getByRole("button", { name: text });
          await byRole.waitFor({ timeout: 3000 });
          await byRole.click();
          this.log(
            "info",
            `Clicked via getByRole(button, name=${text})`,
            step.id
          );
          clicked = true;
        } catch {}
        if (!clicked) {
          try {
            const byText = this.page!.getByText(text, { exact: true });
            await byText.waitFor({ timeout: 3000 });
            await byText.click();
            this.log("info", `Clicked via getByText(${text})`, step.id);
            clicked = true;
          } catch {}
        }
      }
    }

    if (!clicked) {
      throw new Error(`Failed to click selector: ${selector}`);
    }

    // Wait for any navigation or loading
    await this.wait(1000);
  }

  /**
   * Execute input action
   */
  private async executeInput(step: TraceStep): Promise<void> {
    if (!this.page) throw new Error("Page not initialized");

    const selector = this.getBestSelector(step);
    // Prefer explicit inputValue; fall back to recorder's inputData.value
    const rawValue = step.inputValue ?? step.inputData?.value ?? "";
    const inputValue = String(rawValue);
    const isSensitive =
      Boolean(step.inputData?.sensitive) || step.inputData?.type === "password";

    // Wait and resolve locator
    const loc = this.page.locator(selector);
    await loc.waitFor({ state: "visible", timeout: this.config.timeout });

    // Focus, then fill atomically. If an auto-suggest dropdown blocks typing,
    // we clear first using keyboard shortcut as a fallback.
    await loc.focus();
    try {
      const existing = await loc.inputValue({ timeout: 1000 });
      if (existing !== inputValue && existing.length > 0) {
        await loc.clear();
      }
    } catch {}
    await loc.fill(inputValue);
    // Ensure reactive forms update (input/change) and blur to enable buttons
    try {
      await this.page.evaluate((sel) => {
        const el = document.querySelector(sel) as HTMLInputElement | null;
        if (!el) return;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, selector);
    } catch {}
    try {
      await loc.blur();
    } catch {}

    // Wait for any auto-complete or validation
    await this.wait(500);

    // Log (mask sensitive)
    this.log(
      "info",
      `Typed into ${selector}: ${isSensitive ? "***" : inputValue}`,
      step.id
    );

    // Heuristic: if the field looks like email/username and a submit is present, auto-submit once
    try {
      const shouldAutoSubmit = await this.page.evaluate((sel) => {
        const el = document.querySelector(sel) as HTMLInputElement | null;
        if (!el) return false;
        const type = (el.getAttribute("type") || "").toLowerCase();
        const name = (el.getAttribute("name") || "").toLowerCase();
        const placeholder = (
          el.getAttribute("placeholder") || ""
        ).toLowerCase();
        const likelyEmail =
          type === "email" ||
          name.includes("email") ||
          placeholder.includes("email");
        const form = el.closest("form");
        const submitBtn = form?.querySelector(
          'button[type="submit"], button:not([disabled])'
        );
        return Boolean(likelyEmail && submitBtn);
      }, selector);

      if (shouldAutoSubmit) {
        this.log(
          "info",
          "Auto-submit heuristic engaged (email field with submit present)",
          step.id
        );
        // Prefer clicking the submit/continue in form context
        const formLocator = this.page.locator(
          `${selector} >> xpath=ancestor::form[1]`
        );
        try {
          await formLocator
            .locator('button[type="submit"]')
            .click({ timeout: 2000 });
        } catch {
          // Try common text buttons
          const candidates = [
            'role=button[name="Continue"]',
            "text=Continue",
            'button:has-text("Continue")',
          ];
          for (const c of candidates) {
            try {
              await this.page.locator(c).click({ timeout: 1500 });
              break;
            } catch {}
          }
          // As last resort, press Enter
          try {
            await this.page.keyboard.press("Enter");
          } catch {}
        }
        await this.wait(500);
      }
    } catch {}
  }

  /**
   * Execute scroll action
   */
  private async executeScroll(step: TraceStep): Promise<void> {
    if (!this.page) throw new Error("Page not initialized");

    const scrollX = step.scrollPosition?.x || 0;
    const scrollY = step.scrollPosition?.y || 0;

    // Scroll to position
    await this.page.evaluate(
      ({ x, y }) => {
        window.scrollTo(x, y);
      },
      { x: scrollX, y: scrollY }
    );

    // Wait for scroll to complete
    await this.wait(500);
  }

  /**
   * Execute navigation action
   */
  private async executeNavigation(step: TraceStep): Promise<void> {
    if (!this.page) throw new Error("Page not initialized");

    // Navigate to URL
    await this.page.goto(step.url, {
      waitUntil: "domcontentloaded",
      timeout: this.config.timeout,
    });
    // Wait a bit extra for lazy UI
    await this.wait(500);
  }

  /**
   * Ensure the page is at (or navigates to) the expected URL
   */
  private async ensurePageForStep(expectedUrl: string): Promise<void> {
    if (!this.page) throw new Error("Page not initialized");

    try {
      const current = this.page.url();
      // If we are on about:blank or another origin, navigate first
      const needsNav =
        !current ||
        current === "about:blank" ||
        !current.startsWith(new URL(expectedUrl).origin);
      if (needsNav) {
        await this.page.goto(expectedUrl, {
          waitUntil: "domcontentloaded",
          timeout: this.config.timeout,
        });
      }
    } catch (e) {
      // Best effort navigation
      await this.page!.goto(expectedUrl, {
        waitUntil: "domcontentloaded",
        timeout: this.config.timeout,
      });
    }
  }

  /**
   * Execute wait action
   */
  private async executeWait(step: TraceStep): Promise<void> {
    const waitTime = step.waitTime || 1000;
    await this.wait(waitTime);
  }

  /**
   * Initialize browser and page
   */
  private async initializeBrowser(): Promise<void> {
    try {
      this.log("info", "Initializing browser");

      // Prefer native Chrome (or Brave) for closer parity with user browser
      const preferredBrowser = (
        process.env.AUTOFLOW_BROWSER || "brave"
      ).toLowerCase();

      const launchOptions: Parameters<typeof chromium.launch>[0] = {
        headless: this.config.headless,
        slowMo: this.config.slowMo,
        // Reduce automation detectability and align window behavior
        args: [
          "--disable-blink-features=AutomationControlled",
          "--disable-infobars",
          "--no-default-browser-check",
          "--disable-features=IsolateOrigins,site-per-process",
          "--window-position=0,0",
        ],
      };

      // Try channel first (Chrome). Fallback to Chromium. Support Brave via executablePath
      if (preferredBrowser === "chrome") {
        (launchOptions as any).channel = "chrome"; // Playwright will use installed Chrome
      } else if (preferredBrowser === "brave") {
        // Common Brave path on macOS
        (launchOptions as any).executablePath =
          "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
      }

      this.browser = await chromium.launch(launchOptions);

      // Use a fixed viewport for determinism and to avoid layout shifts
      this.context = await this.browser.newContext({
        viewport: this.config.viewport,
        userAgent: this.config.userAgent,
        deviceScaleFactor: 2, // closer to macOS Retina to avoid layout differences
      });

      this.page = await this.context.newPage();

      // Reduce automation fingerprints
      await this.page.addInitScript(() => {
        // @ts-ignore
        Object.defineProperty(navigator, "webdriver", { get: () => false });
      });

      // Set default timeout
      this.page.setDefaultTimeout(this.config.timeout);

      this.log("info", "Browser initialized successfully");
    } catch (error: any) {
      this.log("error", `Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Take a screenshot
   */
  private async takeScreenshot(name: string): Promise<string | null> {
    if (!this.page || !this.config.screenshots) return null;

    try {
      const timestamp = Date.now();
      const filename = `${name}_${timestamp}.png`;
      const path = `${this.config.screenshotDir}/${filename}`;

      await this.page.screenshot({
        path,
        fullPage: false,
      });

      return path;
    } catch (error: any) {
      this.log("warn", `Failed to take screenshot: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the best selector for an element
   */
  private getBestSelector(step: TraceStep): string {
    // Prefer robust selectors captured by the recorder. Fall back gracefully.
    const selectorsAny = (step as any)?.selectors || [];
    if (!Array.isArray(selectorsAny) || selectorsAny.length === 0) {
      return `[data-step-id="${step.id}"]`;
    }

    // Heuristic scoring: prefer stable selectors over positional nth-child
    type Candidate = { str: string; score: number };
    const candidates: Candidate[] = [];

    const pushCandidate = (str?: string, score: number = 0) => {
      if (!str) return;
      const s = this.sanitizeSelector(str);
      const penalty = /:nth-child\(/.test(s) ? 30 : 0;
      candidates.push({ str: s, score: score - penalty });
    };

    for (const raw of selectorsAny) {
      if (typeof raw === "string") {
        pushCandidate(raw, 10);
        continue;
      }
      const selObj = raw as any;
      // Explicit 'selector' key from some recorders
      if (selObj.selector) pushCandidate(selObj.selector, 95);
      const attrs = selObj.attributes || {};

      if (attrs.id) pushCandidate(`#${attrs.id}`, 100);
      if (attrs["data-testid"])
        pushCandidate(`[data-testid="${attrs["data-testid"]}"]`, 90);
      if (attrs.name) pushCandidate(`[name="${attrs.name}"]`, 80);

      if (selObj.role && selObj.name)
        pushCandidate(`role=${selObj.role}[name="${selObj.name}"]`, 85);
      if (selObj.text) pushCandidate(`text=${selObj.text}`, 75);
      if (selObj.css) pushCandidate(selObj.css, 60);
      if (selObj.xpath) pushCandidate(`xpath=${selObj.xpath}`, 40);

      if (attrs.class) {
        const cls = String(attrs.class)
          .split(" ")
          .filter((c: string) => c && c !== "autoflow-element-highlight")
          .slice(0, 2)
          .join(".");
        if (cls) pushCandidate(`.${cls}`, 50);
      }
    }

    if (candidates.length === 0) return `[data-step-id="${step.id}"]`;

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].str;
  }

  /** Remove transient highlight classes from selectors */
  private sanitizeSelector(selector: string): string {
    return selector
      .replace(/\.autoflow-element-highlight/g, "")
      .replace(/^css=/, "")
      .trim();
  }

  /**
   * Normalize noisy recorded steps: collapse repeated inputs on same field
   * and remove focus-only clicks immediately preceding an input on the same selector.
   */
  private normalizeSteps(steps: TraceStep[]): TraceStep[] {
    const result: TraceStep[] = [];
    const keyOf = (s: TraceStep) => {
      const sel = (s as any)?.selectors?.[0];
      if (!sel) return "";
      if (typeof sel === "string") return this.sanitizeSelector(sel);
      return this.sanitizeSelector(
        sel.css || sel.text || sel.xpath || sel.selector || ""
      );
    };

    for (let i = 0; i < steps.length; i++) {
      const cur = steps[i];
      if (cur.action === "input") {
        // Look ahead to find the final value typed into the same field
        const curKey = keyOf(cur);
        let j = i + 1;
        let last = cur;
        while (j < steps.length) {
          const nxt = steps[j];
          if (nxt.action === "input" && keyOf(nxt) === curKey) {
            last = nxt; // keep the latest input
            j++;
            continue;
          }
          // Remove an immediate click on the same element between inputs (focus noise)
          if (nxt.action === "click" && keyOf(nxt) === curKey) {
            j++;
            continue;
          }
          break;
        }
        result.push(last);
        i = j - 1; // skip consumed steps
        continue;
      }

      // Drop focus-only clicks directly before an input on same field
      const next = steps[i + 1];
      if (
        cur.action === "click" &&
        next &&
        next.action === "input" &&
        keyOf(cur) &&
        keyOf(cur) === keyOf(next)
      ) {
        // skip the click
        continue;
      }

      result.push(cur);
    }

    return result;
  }

  /**
   * Wait for specified time
   */
  private async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log execution events
   */
  private log(
    level: ExecutionLog["level"],
    message: string,
    stepId?: string,
    metadata?: Record<string, any>
  ): void {
    const logEntry: ExecutionLog = {
      timestamp: Date.now(),
      level,
      message,
      stepId,
      metadata,
    };

    if (this.currentExecution) {
      this.currentExecution.logs.push(logEntry);
    }

    // Also log to console
    logger[level](`[ExecutionEngine] ${message}`, { stepId, ...metadata });
  }

  /**
   * Emit progress updates
   */
  private emitProgress(progress: ExecutionProgress): void {
    this.emit("progress", progress);
  }

  /**
   * Cleanup browser resources
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }

      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      this.log("info", "Browser cleanup completed");
    } catch (error: any) {
      this.log("warn", `Cleanup error: ${error.message}`);
    }
  }

  /**
   * Get current execution status
   */
  getCurrentExecution(): ExecutionResult | null {
    return this.currentExecution ? { ...this.currentExecution } : null;
  }

  /**
   * Check if engine is currently executing
   */
  isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }

  /**
   * Stop current execution
   */
  async stopExecution(): Promise<void> {
    if (!this.isExecuting) {
      throw new Error("No execution in progress");
    }

    this.log("info", "Stopping execution");

    if (this.currentExecution) {
      this.currentExecution.success = false;
      this.currentExecution.error = "Execution stopped by user";
      this.currentExecution.endTime = Date.now();
      this.currentExecution.duration =
        this.currentExecution.endTime - this.currentExecution.startTime;
    }

    await this.cleanup();
    this.isExecuting = false;

    this.emitProgress({
      executionId: this.currentExecution?.executionId || "unknown",
      workflowId: this.currentExecution?.workflowId || "unknown",
      status: "failed",
      currentStep: this.currentExecution?.stepsExecuted || 0,
      totalSteps: this.currentExecution?.totalSteps || 0,
      progress: 0,
    });
  }
}

// Export singleton instance
export const executionEngine = new ExecutionEngine();
