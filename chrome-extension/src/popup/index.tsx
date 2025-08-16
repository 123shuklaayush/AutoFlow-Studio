/**
 * @fileoverview Entry point for the AutoFlow Studio popup
 * @author Ayush Shukla
 * @description React application entry point for the Chrome extension popup
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import AutoFlowPopup from './popup';
import './popup.css';

/**
 * Initialize and render the popup React application
 */
function initializePopup() {
  const container = document.getElementById('root');
  
  if (!container) {
    console.error('AutoFlow Popup: Root container not found');
    return;
  }

  // Create React root and render the popup component
  const root = createRoot(container);
  
  root.render(
    <React.StrictMode>
      <AutoFlowPopup />
    </React.StrictMode>
  );

  console.log('AutoFlow Popup: Application initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  initializePopup();
}
