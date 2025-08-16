/**
 * @fileoverview Main popup component for AutoFlow Studio Chrome Extension
 * @author Ayush Shukla
 * @description React-based UI for controlling recording and managing workflows.
 * Follows Component-based architecture with hooks for state management.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  Square,
  Settings,
  Download,
  Upload,
  List,
  Clock,
  Workflow,
  Zap,
  Eye,
  AlertCircle,
} from "lucide-react";
import { TraceStep, Workflow as WorkflowType } from "@shared/types/core";

/**
 * Recording state interface
 */
interface RecordingState {
  isRecording: boolean;
  sessionId: string | null;
  activeTabId: number | null;
  stepCount: number;
  duration: number;
}

/**
 * Extension message interface
 */
interface ExtensionMessage {
  type: string;
  data?: any;
  sessionId?: string;
}

/**
 * Main popup component - Simplified for sidebar toggle
 * Follows functional component pattern with hooks
 */
const AutoFlowPopup: React.FC = () => {
  // State management
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  /**
   * Send message to background script
   * @param message - Message to send
   * @returns Promise resolving to response
   */
  const sendMessage = useCallback(
    async (message: ExtensionMessage): Promise<any> => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Extension message error:", chrome.runtime.lastError);
            resolve({ error: chrome.runtime.lastError.message });
          } else {
            resolve(response);
          }
        });
      });
    },
    []
  );

  /**
   * Toggle sidebar visibility on current tab
   */
  const toggleSidebar = async () => {
    if (!currentTab) {
      setError("No active tab found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("AutoFlow Popup: Sending TOGGLE_SIDEBAR message");

      // Create a timeout promise for the toggle operation
      const togglePromise = sendMessage({ type: "TOGGLE_SIDEBAR" });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), 10000)
      );

      const response = await Promise.race([togglePromise, timeoutPromise]);
      console.log("AutoFlow Popup: Received response:", response);

      if (response && response.success) {
        setSidebarVisible(!sidebarVisible);
        console.log("AutoFlow Popup: Sidebar toggled successfully");
        // Close popup after successful toggle
        setTimeout(() => window.close(), 300);
      } else {
        const errorMsg = response?.error || "Failed to toggle sidebar";
        setError(errorMsg);
        console.error("AutoFlow Popup: Toggle failed:", errorMsg);
      }
    } catch (error) {
      const errorMsg = (error as Error)?.message || "Unknown error";
      if (errorMsg === "Operation timed out") {
        setError(
          "Sidebar is taking longer than expected to load. Please try refreshing the page."
        );
      } else {
        setError(`Error toggling sidebar: ${errorMsg}`);
      }
      console.error("AutoFlow Popup: Toggle sidebar error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get current active tab
   */
  const getCurrentTab = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      setCurrentTab(tab);
    } catch (error) {
      console.error("Error getting current tab:", error);
    }
  }, []);

  /**
   * Initialize popup data
   */
  useEffect(() => {
    const initializePopup = async () => {
      setIsLoading(true);
      try {
        await getCurrentTab();
      } catch (error) {
        setError("Failed to initialize popup");
        console.error("Popup initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePopup();
  }, [getCurrentTab]);

  /**
   * Open sidebar help/documentation
   */
  const openHelp = () => {
    chrome.tabs.create({
      url: "https://github.com/123shuklaayush/AutoFlow-Studio/blob/main/README.md",
    });
  };

  /**
   * Main render function - Compact popup for sidebar control
   */
  return (
    <div style={{ width: 320, minHeight: 280, background: "#ffffff" }}>
      {/* Compact Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #3b82f6 0%, #9333ea 100%)",
          color: "#fff",
          padding: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={14} style={{ color: "white" }} />
          </div>
          <div>
            <h1 style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>
              AutoFlow Studio
            </h1>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Browser Automation</div>
          </div>
        </div>
      </div>

      {/* Compact Content */}
      <div style={{ padding: 12 }}>
        {/* Error Display - Compact */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded flex items-start gap-2">
            <AlertCircle
              size={14}
              className="text-red-500 mt-0.5 flex-shrink-0"
            />
            <div className="text-xs text-red-700">{error}</div>
          </div>
        )}

        {/* Current Tab Info - Minimal */}
        {currentTab && (
          <div className="mb-3 p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-500 mb-1">Current Tab</div>
            <div className="text-xs font-medium truncate">
              {currentTab.title}
            </div>
          </div>
        )}

        {/* Main Action - Compact */}
        <div style={{ marginTop: 8 }}>
          <button
            onClick={toggleSidebar}
            disabled={isLoading || !currentTab}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background:
                isLoading || !currentTab
                  ? "#d1d5db"
                  : "linear-gradient(to right, #3b82f6, #9333ea)",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              fontWeight: 500,
              fontSize: 14,
              cursor: isLoading || !currentTab ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Settings size={16} />
            {isLoading ? "Loading..." : "Open Sidebar"}
          </button>

          {/* Compact Secondary Actions */}
          <div className="flex gap-1">
            <button
              onClick={openHelp}
              className="flex-1 flex items-center justify-center gap-1 bg-gray-100 
                       hover:bg-gray-200 text-gray-600 px-2 py-2 rounded 
                       transition-colors text-xs"
            >
              <AlertCircle size={12} />
              Help
            </button>
            <button
              onClick={() => chrome.runtime.openOptionsPage()}
              className="flex-1 flex items-center justify-center gap-1 bg-gray-100 
                       hover:bg-gray-200 text-gray-600 px-2 py-2 rounded 
                       transition-colors text-xs"
            >
              <Settings size={12} />
              Options
            </button>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400 text-center">
            v1.0.0 • Built by Ayush Shukla
          </div>
        </div>
      </div>

      {/* Compact Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            Loading...
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoFlowPopup;
