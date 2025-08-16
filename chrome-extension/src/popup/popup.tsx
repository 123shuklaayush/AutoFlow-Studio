/**
 * @fileoverview Main popup component for AutoFlow Studio Chrome Extension
 * @author Ayush Shukla
 * @description React-based UI for controlling recording and managing workflows.
 * Follows Component-based architecture with hooks for state management.
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { TraceStep, Workflow as WorkflowType } from '@shared/types/core';

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
 * Main popup component
 * Follows functional component pattern with hooks
 */
const AutoFlowPopup: React.FC = () => {
  // State management
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    sessionId: null,
    activeTabId: null,
    stepCount: 0,
    duration: 0
  });

  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'main' | 'workflows' | 'settings'>('main');

  /**
   * Send message to background script
   * @param message - Message to send
   * @returns Promise resolving to response
   */
  const sendMessage = useCallback(async (message: ExtensionMessage): Promise<any> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Extension message error:', chrome.runtime.lastError);
          resolve({ error: chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }, []);

  /**
   * Load recording state from background script
   */
  const loadRecordingState = useCallback(async () => {
    try {
      const response = await sendMessage({ type: 'GET_RECORDING_STATE' });
      if (response && !response.error) {
        setRecordingState(response);
      }
    } catch (error) {
      console.error('Error loading recording state:', error);
    }
  }, [sendMessage]);

  /**
   * Load stored workflows
   */
  const loadWorkflows = useCallback(async () => {
    try {
      const response = await sendMessage({ type: 'GET_WORKFLOWS' });
      if (response && response.workflows) {
        setWorkflows(response.workflows);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  }, [sendMessage]);

  /**
   * Get current active tab
   */
  const getCurrentTab = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      setCurrentTab(tab);
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }, []);

  /**
   * Initialize popup data
   */
  useEffect(() => {
    const initializePopup = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadRecordingState(),
          loadWorkflows(),
          getCurrentTab()
        ]);
      } catch (error) {
        setError('Failed to initialize popup');
        console.error('Popup initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePopup();
  }, [loadRecordingState, loadWorkflows, getCurrentTab]);

  /**
   * Set up periodic state updates when recording
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (recordingState.isRecording) {
      interval = setInterval(() => {
        loadRecordingState();
      }, 1000); // Update every second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState.isRecording, loadRecordingState]);

  /**
   * Start recording workflow
   */
  const handleStartRecording = async () => {
    if (!currentTab) {
      setError('No active tab found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage({
        type: 'START_RECORDING',
        data: {
          url: currentTab.url,
          title: currentTab.title
        }
      });

      if (response.error) {
        setError(response.error);
      } else {
        await loadRecordingState();
      }
    } catch (error) {
      setError('Failed to start recording');
      console.error('Start recording error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Stop recording workflow
   */
  const handleStopRecording = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage({ type: 'STOP_RECORDING' });

      if (response.error) {
        setError(response.error);
      } else {
        await loadRecordingState();
        // Optionally show session summary
        if (response.sessionData) {
          console.log('Recording completed:', response.sessionData);
        }
      }
    } catch (error) {
      setError('Failed to stop recording');
      console.error('Stop recording error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Export current session
   */
  const handleExportSession = async () => {
    setIsLoading(true);

    try {
      const response = await sendMessage({ type: 'EXPORT_SESSION' });

      if (response.error) {
        setError(response.error);
      } else {
        // Download as JSON file
        const blob = new Blob([JSON.stringify(response, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `autoflow_session_${response.sessionId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      setError('Failed to export session');
      console.error('Export session error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format duration in human readable format
   * @param ms - Duration in milliseconds
   * @returns Formatted duration string
   */
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  /**
   * Render main recording controls
   */
  const renderMainView = () => (
    <div className="space-y-4">
      {/* Current Tab Info */}
      {currentTab && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Current Tab:</div>
          <div className="text-sm font-medium truncate">{currentTab.title}</div>
          <div className="text-xs text-gray-500 truncate">{currentTab.url}</div>
        </div>
      )}

      {/* Recording Status */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Recording Status</h3>
          <div className={`w-3 h-3 rounded-full ${
            recordingState.isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
          }`} />
        </div>

        {recordingState.isRecording ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Session: {recordingState.sessionId?.slice(-8)}
            </div>
            <div className="text-sm text-gray-600">
              Steps: {recordingState.stepCount}
            </div>
            <div className="text-sm text-gray-600">
              Duration: {formatDuration(recordingState.duration)}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Ready to record new workflow
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="space-y-2">
        {!recordingState.isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={isLoading || !currentTab}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 
                     disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Play size={18} />
            {isLoading ? 'Starting...' : 'Start Recording'}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleStopRecording}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 
                       disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Square size={18} />
              {isLoading ? 'Stopping...' : 'Stop Recording'}
            </button>

            <button
              onClick={handleExportSession}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 
                       disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              Export Session
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Render workflows view
   */
  const renderWorkflowsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">My Workflows</h3>
        <button className="text-blue-500 hover:text-blue-600">
          <Upload size={18} />
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Workflow size={48} className="mx-auto mb-2 text-gray-300" />
          <div className="text-sm">No workflows yet</div>
          <div className="text-xs">Record your first workflow to get started</div>
        </div>
      ) : (
        <div className="space-y-2">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white border border-gray-200 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{workflow.name}</div>
                  <div className="text-xs text-gray-500">
                    {workflow.steps.length} steps • {workflow.version}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-green-500 hover:text-green-600">
                    <Play size={16} />
                  </button>
                  <button className="text-blue-500 hover:text-blue-600">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /**
   * Render settings view
   */
  const renderSettingsView = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Settings</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Capture Screenshots</label>
          <input type="checkbox" className="rounded" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Auto-save Sessions</label>
          <input type="checkbox" className="rounded" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Smart Delays</label>
          <input type="checkbox" className="rounded" defaultChecked />
        </div>
      </div>
      
      <div className="border-t pt-3 mt-4">
        <div className="text-xs text-gray-500">
          AutoFlow Studio v1.0.0<br/>
          Built by Ayush Shukla
        </div>
      </div>
    </div>
  );

  /**
   * Main render function
   */
  return (
    <div className="w-96 bg-gray-50 min-h-96">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg 
                        flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">AutoFlow Studio</h1>
            <div className="text-xs text-gray-500">AI-Enhanced Browser Automation</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-1">
          {[
            { id: 'main', label: 'Record', icon: Play },
            { id: 'workflows', label: 'Workflows', icon: List },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                activeView === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* View Content */}
        {activeView === 'main' && renderMainView()}
        {activeView === 'workflows' && renderWorkflowsView()}
        {activeView === 'settings' && renderSettingsView()}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            Processing...
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoFlowPopup;
