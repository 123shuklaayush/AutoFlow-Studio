/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/css-loader/dist/cjs.js!../node_modules/postcss-loader/dist/cjs.js!./src/popup/popup.css":
/*!***************************************************************************************************************!*\
  !*** ../node_modules/css-loader/dist/cjs.js!../node_modules/postcss-loader/dist/cjs.js!./src/popup/popup.css ***!
  \***************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "../node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "../node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/**
 * @fileoverview Styles for AutoFlow Studio popup
 * @author Ayush Shukla
 * @description CSS styles using Tailwind-inspired utility classes
 */

/* Reset and base styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
  color: #374151;
  background-color: #f9fafb;
}

/* Utility classes (Tailwind-inspired) */
.w-3 { width: 0.75rem; }
.w-4 { width: 1rem; }
.w-8 { width: 2rem; }
.w-96 { width: 24rem; }
.w-full { width: 100%; }

.h-3 { height: 0.75rem; }
.h-4 { height: 1rem; }
.h-8 { height: 2rem; }

.min-h-96 { min-height: 24rem; }
.min-w-0 { min-width: 0; }

.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-8 { padding: 2rem; }

.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }

.pt-3 { padding-top: 0.75rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mt-4 { margin-top: 1rem; }
.mx-auto { margin-left: auto; margin-right: auto; }

.space-y-1 > * + * { margin-top: 0.25rem; }
.space-y-2 > * + * { margin-top: 0.5rem; }
.space-y-3 > * + * { margin-top: 0.75rem; }
.space-y-4 > * + * { margin-top: 1rem; }

.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }

/* Flexbox utilities */
.flex { display: flex; }
.flex-1 { flex: 1 1 0%; }
.flex-shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

/* Background colors */
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-300 { background-color: #d1d5db; }
.bg-gray-600 { background-color: #4b5563; }
.bg-red-50 { background-color: #fef2f2; }
.bg-red-500 { background-color: #ef4444; }
.bg-blue-100 { background-color: #dbeafe; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-blue-600 { background-color: #2563eb; }

/* Gradient backgrounds */
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0)); }
.to-purple-600 { --tw-gradient-to: #9333ea; }

/* Text colors */
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-900 { color: #111827; }
.text-red-500 { color: #ef4444; }
.text-red-700 { color: #b91c1c; }
.text-blue-500 { color: #3b82f6; }
.text-blue-600 { color: #2563eb; }
.text-green-500 { color: #10b981; }
.text-green-600 { color: #059669; }

/* Text utilities */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

.text-center { text-align: center; }
.truncate { 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

/* Border utilities */
.border { border-width: 1px; }
.border-t { border-top-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-gray-200 { border-color: #e5e7eb; }
.border-red-200 { border-color: #fecaca; }

.rounded { border-radius: 0.25rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-full { border-radius: 9999px; }

/* Shadows */
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

/* Positioning */
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }

/* Animations */
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-spin { animation: spin 1s linear infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.transition-colors { 
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Hover states */
.hover\\:bg-gray-100:hover { background-color: #f3f4f6; }
.hover\\:bg-gray-700:hover { background-color: #374151; }
.hover\\:bg-red-600:hover { background-color: #dc2626; }
.hover\\:bg-blue-600:hover { background-color: #2563eb; }
.hover\\:text-blue-600:hover { color: #2563eb; }
.hover\\:text-green-600:hover { color: #059669; }

/* Disabled states */
.disabled\\:bg-gray-300:disabled { background-color: #d1d5db; }

/* Button styles */
button {
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  font: inherit;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Form elements */
input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
}

input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Loading spinner */
.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Responsive design */
@media (max-width: 400px) {
  .w-96 {
    width: 100vw;
  }
  
  #root {
    width: 100vw !important;
  }
}

/* Dark mode support (future enhancement) */
@media (prefers-color-scheme: dark) {
  /* Dark mode styles can be added here */
}
`, "",{"version":3,"sources":["webpack://./src/popup/popup.css"],"names":[],"mappings":"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","sourcesContent":["/**\n * @fileoverview Styles for AutoFlow Studio popup\n * @author Ayush Shukla\n * @description CSS styles using Tailwind-inspired utility classes\n */\n\n/* Reset and base styles */\n* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',\n    'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;\n  line-height: 1.5;\n  color: #374151;\n  background-color: #f9fafb;\n}\n\n/* Utility classes (Tailwind-inspired) */\n.w-3 { width: 0.75rem; }\n.w-4 { width: 1rem; }\n.w-8 { width: 2rem; }\n.w-96 { width: 24rem; }\n.w-full { width: 100%; }\n\n.h-3 { height: 0.75rem; }\n.h-4 { height: 1rem; }\n.h-8 { height: 2rem; }\n\n.min-h-96 { min-height: 24rem; }\n.min-w-0 { min-width: 0; }\n\n.p-2 { padding: 0.5rem; }\n.p-3 { padding: 0.75rem; }\n.p-4 { padding: 1rem; }\n.p-8 { padding: 2rem; }\n\n.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }\n.px-4 { padding-left: 1rem; padding-right: 1rem; }\n.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }\n.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }\n.py-8 { padding-top: 2rem; padding-bottom: 2rem; }\n\n.pt-3 { padding-top: 0.75rem; }\n.mb-2 { margin-bottom: 0.5rem; }\n.mb-3 { margin-bottom: 0.75rem; }\n.mb-4 { margin-bottom: 1rem; }\n.mt-4 { margin-top: 1rem; }\n.mx-auto { margin-left: auto; margin-right: auto; }\n\n.space-y-1 > * + * { margin-top: 0.25rem; }\n.space-y-2 > * + * { margin-top: 0.5rem; }\n.space-y-3 > * + * { margin-top: 0.75rem; }\n.space-y-4 > * + * { margin-top: 1rem; }\n\n.gap-1 { gap: 0.25rem; }\n.gap-2 { gap: 0.5rem; }\n.gap-3 { gap: 0.75rem; }\n\n/* Flexbox utilities */\n.flex { display: flex; }\n.flex-1 { flex: 1 1 0%; }\n.flex-shrink-0 { flex-shrink: 0; }\n.items-center { align-items: center; }\n.items-start { align-items: flex-start; }\n.justify-center { justify-content: center; }\n.justify-between { justify-content: space-between; }\n\n/* Background colors */\n.bg-white { background-color: #ffffff; }\n.bg-gray-50 { background-color: #f9fafb; }\n.bg-gray-100 { background-color: #f3f4f6; }\n.bg-gray-300 { background-color: #d1d5db; }\n.bg-gray-600 { background-color: #4b5563; }\n.bg-red-50 { background-color: #fef2f2; }\n.bg-red-500 { background-color: #ef4444; }\n.bg-blue-100 { background-color: #dbeafe; }\n.bg-blue-500 { background-color: #3b82f6; }\n.bg-blue-600 { background-color: #2563eb; }\n\n/* Gradient backgrounds */\n.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }\n.from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0)); }\n.to-purple-600 { --tw-gradient-to: #9333ea; }\n\n/* Text colors */\n.text-white { color: #ffffff; }\n.text-gray-300 { color: #d1d5db; }\n.text-gray-500 { color: #6b7280; }\n.text-gray-600 { color: #4b5563; }\n.text-gray-700 { color: #374151; }\n.text-gray-900 { color: #111827; }\n.text-red-500 { color: #ef4444; }\n.text-red-700 { color: #b91c1c; }\n.text-blue-500 { color: #3b82f6; }\n.text-blue-600 { color: #2563eb; }\n.text-green-500 { color: #10b981; }\n.text-green-600 { color: #059669; }\n\n/* Text utilities */\n.text-xs { font-size: 0.75rem; line-height: 1rem; }\n.text-sm { font-size: 0.875rem; line-height: 1.25rem; }\n.font-medium { font-weight: 500; }\n.font-semibold { font-weight: 600; }\n.font-bold { font-weight: 700; }\n\n.text-center { text-align: center; }\n.truncate { \n  overflow: hidden; \n  text-overflow: ellipsis; \n  white-space: nowrap; \n}\n\n/* Border utilities */\n.border { border-width: 1px; }\n.border-t { border-top-width: 1px; }\n.border-b { border-bottom-width: 1px; }\n.border-gray-200 { border-color: #e5e7eb; }\n.border-red-200 { border-color: #fecaca; }\n\n.rounded { border-radius: 0.25rem; }\n.rounded-lg { border-radius: 0.5rem; }\n.rounded-full { border-radius: 9999px; }\n\n/* Shadows */\n.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }\n\n/* Positioning */\n.relative { position: relative; }\n.absolute { position: absolute; }\n.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }\n\n/* Animations */\n.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }\n.animate-spin { animation: spin 1s linear infinite; }\n\n@keyframes pulse {\n  0%, 100% { opacity: 1; }\n  50% { opacity: 0.5; }\n}\n\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n\n/* Transitions */\n.transition-colors { \n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n/* Hover states */\n.hover\\:bg-gray-100:hover { background-color: #f3f4f6; }\n.hover\\:bg-gray-700:hover { background-color: #374151; }\n.hover\\:bg-red-600:hover { background-color: #dc2626; }\n.hover\\:bg-blue-600:hover { background-color: #2563eb; }\n.hover\\:text-blue-600:hover { color: #2563eb; }\n.hover\\:text-green-600:hover { color: #059669; }\n\n/* Disabled states */\n.disabled\\:bg-gray-300:disabled { background-color: #d1d5db; }\n\n/* Button styles */\nbutton {\n  cursor: pointer;\n  border: none;\n  background: none;\n  padding: 0;\n  font: inherit;\n}\n\nbutton:disabled {\n  cursor: not-allowed;\n  opacity: 0.6;\n}\n\n/* Form elements */\ninput[type=\"checkbox\"] {\n  width: 1rem;\n  height: 1rem;\n  border-radius: 0.25rem;\n  border: 1px solid #d1d5db;\n  background-color: #ffffff;\n}\n\ninput[type=\"checkbox\"]:checked {\n  background-color: #3b82f6;\n  border-color: #3b82f6;\n}\n\n/* Custom scrollbar */\n::-webkit-scrollbar {\n  width: 6px;\n}\n\n::-webkit-scrollbar-track {\n  background: #f1f1f1;\n}\n\n::-webkit-scrollbar-thumb {\n  background: #c1c1c1;\n  border-radius: 3px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n  background: #a1a1a1;\n}\n\n/* Loading spinner */\n.loading-spinner {\n  border: 2px solid #f3f3f3;\n  border-top: 2px solid #3b82f6;\n  border-radius: 50%;\n  animation: spin 1s linear infinite;\n}\n\n/* Responsive design */\n@media (max-width: 400px) {\n  .w-96 {\n    width: 100vw;\n  }\n  \n  #root {\n    width: 100vw !important;\n  }\n}\n\n/* Dark mode support (future enhancement) */\n@media (prefers-color-scheme: dark) {\n  /* Dark mode styles can be added here */\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/popup/index.tsx":
/*!*****************************!*\
  !*** ./src/popup/index.tsx ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "../node_modules/react/jsx-runtime.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-dom/client */ "../node_modules/react-dom/client.js");
/* harmony import */ var _popup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./popup */ "./src/popup/popup.tsx");
/* harmony import */ var _popup_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./popup.css */ "./src/popup/popup.css");

/**
 * @fileoverview Entry point for the AutoFlow Studio popup
 * @author Ayush Shukla
 * @description React application entry point for the Chrome extension popup
 */




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
    const root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_2__.createRoot)(container);
    root.render((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)((react__WEBPACK_IMPORTED_MODULE_1___default().StrictMode), { children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_popup__WEBPACK_IMPORTED_MODULE_3__["default"], {}) }));
    console.log('AutoFlow Popup: Application initialized');
}
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePopup);
}
else {
    initializePopup();
}


/***/ }),

/***/ "./src/popup/popup.css":
/*!*****************************!*\
  !*** ./src/popup/popup.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "../node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "../node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "../node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "../node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!../../../node_modules/postcss-loader/dist/cjs.js!./popup.css */ "../node_modules/css-loader/dist/cjs.js!../node_modules/postcss-loader/dist/cjs.js!./src/popup/popup.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());
options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/popup/popup.tsx":
/*!*****************************!*\
  !*** ./src/popup/popup.tsx ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "../node_modules/react/jsx-runtime.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/alert-circle.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/download.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/eye.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/list.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/play.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/settings.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/square.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/upload.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/workflow.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! lucide-react */ "../node_modules/lucide-react/dist/esm/icons/zap.js");

/**
 * @fileoverview Main popup component for AutoFlow Studio Chrome Extension
 * @author Ayush Shukla
 * @description React-based UI for controlling recording and managing workflows.
 * Follows Component-based architecture with hooks for state management.
 */


/**
 * Main popup component
 * Follows functional component pattern with hooks
 */
const AutoFlowPopup = () => {
    // State management
    const [recordingState, setRecordingState] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({
        isRecording: false,
        sessionId: null,
        activeTabId: null,
        stepCount: 0,
        duration: 0
    });
    const [workflows, setWorkflows] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [currentTab, setCurrentTab] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [activeView, setActiveView] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('main');
    /**
     * Send message to background script
     * @param message - Message to send
     * @returns Promise resolving to response
     */
    const sendMessage = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async (message) => {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Extension message error:', chrome.runtime.lastError);
                    resolve({ error: chrome.runtime.lastError.message });
                }
                else {
                    resolve(response);
                }
            });
        });
    }, []);
    /**
     * Load recording state from background script
     */
    const loadRecordingState = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        try {
            const response = await sendMessage({ type: 'GET_RECORDING_STATE' });
            if (response && !response.error) {
                setRecordingState(response);
            }
        }
        catch (error) {
            console.error('Error loading recording state:', error);
        }
    }, [sendMessage]);
    /**
     * Load stored workflows
     */
    const loadWorkflows = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        try {
            const response = await sendMessage({ type: 'GET_WORKFLOWS' });
            if (response && response.workflows) {
                setWorkflows(response.workflows);
            }
        }
        catch (error) {
            console.error('Error loading workflows:', error);
        }
    }, [sendMessage]);
    /**
     * Get current active tab
     */
    const getCurrentTab = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            setCurrentTab(tab);
        }
        catch (error) {
            console.error('Error getting current tab:', error);
        }
    }, []);
    /**
     * Initialize popup data
     */
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        const initializePopup = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    loadRecordingState(),
                    loadWorkflows(),
                    getCurrentTab()
                ]);
            }
            catch (error) {
                setError('Failed to initialize popup');
                console.error('Popup initialization error:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        initializePopup();
    }, [loadRecordingState, loadWorkflows, getCurrentTab]);
    /**
     * Set up periodic state updates when recording
     */
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        let interval = null;
        if (recordingState.isRecording) {
            interval = setInterval(() => {
                loadRecordingState();
            }, 1000); // Update every second
        }
        return () => {
            if (interval)
                clearInterval(interval);
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
            }
            else {
                await loadRecordingState();
            }
        }
        catch (error) {
            setError('Failed to start recording');
            console.error('Start recording error:', error);
        }
        finally {
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
            }
            else {
                await loadRecordingState();
                // Optionally show session summary
                if (response.sessionData) {
                    console.log('Recording completed:', response.sessionData);
                }
            }
        }
        catch (error) {
            setError('Failed to stop recording');
            console.error('Stop recording error:', error);
        }
        finally {
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
            }
            else {
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
        }
        catch (error) {
            setError('Failed to export session');
            console.error('Export session error:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    /**
     * Format duration in human readable format
     * @param ms - Duration in milliseconds
     * @returns Formatted duration string
     */
    const formatDuration = (ms) => {
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
    const renderMainView = () => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-4", children: [currentTab && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-gray-50 p-3 rounded-lg", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-sm text-gray-600", children: "Current Tab:" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-sm font-medium truncate", children: currentTab.title }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-xs text-gray-500 truncate", children: currentTab.url })] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white border border-gray-200 p-4 rounded-lg", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-gray-900", children: "Recording Status" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `w-3 h-3 rounded-full ${recordingState.isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}` })] }), recordingState.isRecording ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-sm text-gray-600", children: ["Session: ", recordingState.sessionId?.slice(-8)] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-sm text-gray-600", children: ["Steps: ", recordingState.stepCount] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-sm text-gray-600", children: ["Duration: ", formatDuration(recordingState.duration)] })] })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-sm text-gray-500", children: "Ready to record new workflow" }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "space-y-2", children: !recordingState.isRecording ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: handleStartRecording, disabled: isLoading || !currentTab, className: "w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 \n                     disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_6__["default"], { size: 18 }), isLoading ? 'Starting...' : 'Start Recording'] })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: handleStopRecording, disabled: isLoading, className: "w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 \n                       disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_8__["default"], { size: 18 }), isLoading ? 'Stopping...' : 'Stop Recording'] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: handleExportSession, disabled: isLoading, className: "w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 \n                       disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__["default"], { size: 16 }), "Export Session"] })] })) })] }));
    /**
     * Render workflows view
     */
    const renderWorkflowsView = () => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-gray-900", children: "My Workflows" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { className: "text-blue-500 hover:text-blue-600", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_9__["default"], { size: 18 }) })] }), workflows.length === 0 ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-center text-gray-500 py-8", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_10__["default"], { size: 48, className: "mx-auto mb-2 text-gray-300" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-sm", children: "No workflows yet" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-xs", children: "Record your first workflow to get started" })] })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "space-y-2", children: workflows.map((workflow) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "bg-white border border-gray-200 p-3 rounded-lg", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 min-w-0", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "font-medium text-sm truncate", children: workflow.name }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-xs text-gray-500", children: [workflow.steps.length, " steps \u2022 ", workflow.version] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { className: "text-green-500 hover:text-green-600", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_6__["default"], { size: 16 }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { className: "text-blue-500 hover:text-blue-600", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_4__["default"], { size: 16 }) })] })] }) }, workflow.id))) }))] }));
    /**
     * Render settings view
     */
    const renderSettingsView = () => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-gray-900", children: "Settings" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { className: "text-sm text-gray-700", children: "Capture Screenshots" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { className: "text-sm text-gray-700", children: "Auto-save Sessions" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { className: "text-sm text-gray-700", children: "Smart Delays" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true })] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "border-t pt-3 mt-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-xs text-gray-500", children: ["AutoFlow Studio v1.0.0", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("br", {}), "Built by Ayush Shukla"] }) })] }));
    /**
     * Main render function
     */
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "w-96 bg-gray-50 min-h-96", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "bg-white border-b border-gray-200 p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg \n                        flex items-center justify-center", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_11__["default"], { size: 18, className: "text-white" }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h1", { className: "font-bold text-gray-900", children: "AutoFlow Studio" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-xs text-gray-500", children: "AI-Enhanced Browser Automation" })] })] }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "bg-white border-b border-gray-200 px-4 py-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center gap-1", children: [
                        { id: 'main', label: 'Record', icon: lucide_react__WEBPACK_IMPORTED_MODULE_6__["default"] },
                        { id: 'workflows', label: 'Workflows', icon: lucide_react__WEBPACK_IMPORTED_MODULE_5__["default"] },
                        { id: 'settings', label: 'Settings', icon: lucide_react__WEBPACK_IMPORTED_MODULE_7__["default"] }
                    ].map((tab) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: () => setActiveView(tab.id), className: `flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${activeView === tab.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100'}`, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(tab.icon, { size: 16 }), tab.label] }, tab.id))) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "p-4", children: [error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__["default"], { size: 16, className: "text-red-500 mt-0.5 flex-shrink-0" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-sm text-red-700", children: error })] })), activeView === 'main' && renderMainView(), activeView === 'workflows' && renderWorkflowsView(), activeView === 'settings' && renderSettingsView()] }), isLoading && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2 text-gray-600", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" }), "Processing..."] }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AutoFlowPopup);


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
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"popup": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkautoflow_studio_extension"] = self["webpackChunkautoflow_studio_extension"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/popup/index.tsx")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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b3B1cC5jc3MiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi8uL3NyYy9wb3B1cC9pbmRleC50c3giLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi8uL3NyYy9wb3B1cC9wb3B1cC5jc3M/NjE1YiIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uLy4vc3JjL3BvcHVwL3BvcHVwLnRzeCIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9hdXRvZmxvdy1zdHVkaW8tZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvbm9kZSBtb2R1bGUgZGVjb3JhdG9yIiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vYXV0b2Zsb3ctc3R1ZGlvLWV4dGVuc2lvbi93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2F1dG9mbG93LXN0dWRpby1leHRlbnNpb24vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAvKipcbiAqIEBmaWxlb3ZlcnZpZXcgU3R5bGVzIGZvciBBdXRvRmxvdyBTdHVkaW8gcG9wdXBcbiAqIEBhdXRob3IgQXl1c2ggU2h1a2xhXG4gKiBAZGVzY3JpcHRpb24gQ1NTIHN0eWxlcyB1c2luZyBUYWlsd2luZC1pbnNwaXJlZCB1dGlsaXR5IGNsYXNzZXNcbiAqL1xuXG4vKiBSZXNldCBhbmQgYmFzZSBzdHlsZXMgKi9cbioge1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xufVxuXG5ib2R5IHtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xuICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCAnUm9ib3RvJywgJ094eWdlbicsXG4gICAgJ1VidW50dScsICdDYW50YXJlbGwnLCAnT3BlbiBTYW5zJywgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZjtcbiAgbGluZS1oZWlnaHQ6IDEuNTtcbiAgY29sb3I6ICMzNzQxNTE7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmOWZhZmI7XG59XG5cbi8qIFV0aWxpdHkgY2xhc3NlcyAoVGFpbHdpbmQtaW5zcGlyZWQpICovXG4udy0zIHsgd2lkdGg6IDAuNzVyZW07IH1cbi53LTQgeyB3aWR0aDogMXJlbTsgfVxuLnctOCB7IHdpZHRoOiAycmVtOyB9XG4udy05NiB7IHdpZHRoOiAyNHJlbTsgfVxuLnctZnVsbCB7IHdpZHRoOiAxMDAlOyB9XG5cbi5oLTMgeyBoZWlnaHQ6IDAuNzVyZW07IH1cbi5oLTQgeyBoZWlnaHQ6IDFyZW07IH1cbi5oLTggeyBoZWlnaHQ6IDJyZW07IH1cblxuLm1pbi1oLTk2IHsgbWluLWhlaWdodDogMjRyZW07IH1cbi5taW4tdy0wIHsgbWluLXdpZHRoOiAwOyB9XG5cbi5wLTIgeyBwYWRkaW5nOiAwLjVyZW07IH1cbi5wLTMgeyBwYWRkaW5nOiAwLjc1cmVtOyB9XG4ucC00IHsgcGFkZGluZzogMXJlbTsgfVxuLnAtOCB7IHBhZGRpbmc6IDJyZW07IH1cblxuLnB4LTMgeyBwYWRkaW5nLWxlZnQ6IDAuNzVyZW07IHBhZGRpbmctcmlnaHQ6IDAuNzVyZW07IH1cbi5weC00IHsgcGFkZGluZy1sZWZ0OiAxcmVtOyBwYWRkaW5nLXJpZ2h0OiAxcmVtOyB9XG4ucHktMiB7IHBhZGRpbmctdG9wOiAwLjVyZW07IHBhZGRpbmctYm90dG9tOiAwLjVyZW07IH1cbi5weS0zIHsgcGFkZGluZy10b3A6IDAuNzVyZW07IHBhZGRpbmctYm90dG9tOiAwLjc1cmVtOyB9XG4ucHktOCB7IHBhZGRpbmctdG9wOiAycmVtOyBwYWRkaW5nLWJvdHRvbTogMnJlbTsgfVxuXG4ucHQtMyB7IHBhZGRpbmctdG9wOiAwLjc1cmVtOyB9XG4ubWItMiB7IG1hcmdpbi1ib3R0b206IDAuNXJlbTsgfVxuLm1iLTMgeyBtYXJnaW4tYm90dG9tOiAwLjc1cmVtOyB9XG4ubWItNCB7IG1hcmdpbi1ib3R0b206IDFyZW07IH1cbi5tdC00IHsgbWFyZ2luLXRvcDogMXJlbTsgfVxuLm14LWF1dG8geyBtYXJnaW4tbGVmdDogYXV0bzsgbWFyZ2luLXJpZ2h0OiBhdXRvOyB9XG5cbi5zcGFjZS15LTEgPiAqICsgKiB7IG1hcmdpbi10b3A6IDAuMjVyZW07IH1cbi5zcGFjZS15LTIgPiAqICsgKiB7IG1hcmdpbi10b3A6IDAuNXJlbTsgfVxuLnNwYWNlLXktMyA+ICogKyAqIHsgbWFyZ2luLXRvcDogMC43NXJlbTsgfVxuLnNwYWNlLXktNCA+ICogKyAqIHsgbWFyZ2luLXRvcDogMXJlbTsgfVxuXG4uZ2FwLTEgeyBnYXA6IDAuMjVyZW07IH1cbi5nYXAtMiB7IGdhcDogMC41cmVtOyB9XG4uZ2FwLTMgeyBnYXA6IDAuNzVyZW07IH1cblxuLyogRmxleGJveCB1dGlsaXRpZXMgKi9cbi5mbGV4IHsgZGlzcGxheTogZmxleDsgfVxuLmZsZXgtMSB7IGZsZXg6IDEgMSAwJTsgfVxuLmZsZXgtc2hyaW5rLTAgeyBmbGV4LXNocmluazogMDsgfVxuLml0ZW1zLWNlbnRlciB7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbi5pdGVtcy1zdGFydCB7IGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0OyB9XG4uanVzdGlmeS1jZW50ZXIgeyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxuLmp1c3RpZnktYmV0d2VlbiB7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgfVxuXG4vKiBCYWNrZ3JvdW5kIGNvbG9ycyAqL1xuLmJnLXdoaXRlIHsgYmFja2dyb3VuZC1jb2xvcjogI2ZmZmZmZjsgfVxuLmJnLWdyYXktNTAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmYWZiOyB9XG4uYmctZ3JheS0xMDAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNGY2OyB9XG4uYmctZ3JheS0zMDAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZDFkNWRiOyB9XG4uYmctZ3JheS02MDAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjNGI1NTYzOyB9XG4uYmctcmVkLTUwIHsgYmFja2dyb3VuZC1jb2xvcjogI2ZlZjJmMjsgfVxuLmJnLXJlZC01MDAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZWY0NDQ0OyB9XG4uYmctYmx1ZS0xMDAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZGJlYWZlOyB9XG4uYmctYmx1ZS01MDAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjM2I4MmY2OyB9XG4uYmctYmx1ZS02MDAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjMjU2M2ViOyB9XG5cbi8qIEdyYWRpZW50IGJhY2tncm91bmRzICovXG4uYmctZ3JhZGllbnQtdG8tciB7IGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byByaWdodCwgdmFyKC0tdHctZ3JhZGllbnQtc3RvcHMpKTsgfVxuLmZyb20tYmx1ZS01MDAgeyAtLXR3LWdyYWRpZW50LWZyb206ICMzYjgyZjY7IC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10bywgcmdiYSg1OSwgMTMwLCAyNDYsIDApKTsgfVxuLnRvLXB1cnBsZS02MDAgeyAtLXR3LWdyYWRpZW50LXRvOiAjOTMzM2VhOyB9XG5cbi8qIFRleHQgY29sb3JzICovXG4udGV4dC13aGl0ZSB7IGNvbG9yOiAjZmZmZmZmOyB9XG4udGV4dC1ncmF5LTMwMCB7IGNvbG9yOiAjZDFkNWRiOyB9XG4udGV4dC1ncmF5LTUwMCB7IGNvbG9yOiAjNmI3MjgwOyB9XG4udGV4dC1ncmF5LTYwMCB7IGNvbG9yOiAjNGI1NTYzOyB9XG4udGV4dC1ncmF5LTcwMCB7IGNvbG9yOiAjMzc0MTUxOyB9XG4udGV4dC1ncmF5LTkwMCB7IGNvbG9yOiAjMTExODI3OyB9XG4udGV4dC1yZWQtNTAwIHsgY29sb3I6ICNlZjQ0NDQ7IH1cbi50ZXh0LXJlZC03MDAgeyBjb2xvcjogI2I5MWMxYzsgfVxuLnRleHQtYmx1ZS01MDAgeyBjb2xvcjogIzNiODJmNjsgfVxuLnRleHQtYmx1ZS02MDAgeyBjb2xvcjogIzI1NjNlYjsgfVxuLnRleHQtZ3JlZW4tNTAwIHsgY29sb3I6ICMxMGI5ODE7IH1cbi50ZXh0LWdyZWVuLTYwMCB7IGNvbG9yOiAjMDU5NjY5OyB9XG5cbi8qIFRleHQgdXRpbGl0aWVzICovXG4udGV4dC14cyB7IGZvbnQtc2l6ZTogMC43NXJlbTsgbGluZS1oZWlnaHQ6IDFyZW07IH1cbi50ZXh0LXNtIHsgZm9udC1zaXplOiAwLjg3NXJlbTsgbGluZS1oZWlnaHQ6IDEuMjVyZW07IH1cbi5mb250LW1lZGl1bSB7IGZvbnQtd2VpZ2h0OiA1MDA7IH1cbi5mb250LXNlbWlib2xkIHsgZm9udC13ZWlnaHQ6IDYwMDsgfVxuLmZvbnQtYm9sZCB7IGZvbnQtd2VpZ2h0OiA3MDA7IH1cblxuLnRleHQtY2VudGVyIHsgdGV4dC1hbGlnbjogY2VudGVyOyB9XG4udHJ1bmNhdGUgeyBcbiAgb3ZlcmZsb3c6IGhpZGRlbjsgXG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOyBcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDsgXG59XG5cbi8qIEJvcmRlciB1dGlsaXRpZXMgKi9cbi5ib3JkZXIgeyBib3JkZXItd2lkdGg6IDFweDsgfVxuLmJvcmRlci10IHsgYm9yZGVyLXRvcC13aWR0aDogMXB4OyB9XG4uYm9yZGVyLWIgeyBib3JkZXItYm90dG9tLXdpZHRoOiAxcHg7IH1cbi5ib3JkZXItZ3JheS0yMDAgeyBib3JkZXItY29sb3I6ICNlNWU3ZWI7IH1cbi5ib3JkZXItcmVkLTIwMCB7IGJvcmRlci1jb2xvcjogI2ZlY2FjYTsgfVxuXG4ucm91bmRlZCB7IGJvcmRlci1yYWRpdXM6IDAuMjVyZW07IH1cbi5yb3VuZGVkLWxnIHsgYm9yZGVyLXJhZGl1czogMC41cmVtOyB9XG4ucm91bmRlZC1mdWxsIHsgYm9yZGVyLXJhZGl1czogOTk5OXB4OyB9XG5cbi8qIFNoYWRvd3MgKi9cbi5zaGFkb3ctc20geyBib3gtc2hhZG93OiAwIDFweCAycHggMCByZ2JhKDAsIDAsIDAsIDAuMDUpOyB9XG5cbi8qIFBvc2l0aW9uaW5nICovXG4ucmVsYXRpdmUgeyBwb3NpdGlvbjogcmVsYXRpdmU7IH1cbi5hYnNvbHV0ZSB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgfVxuLmluc2V0LTAgeyB0b3A6IDA7IHJpZ2h0OiAwOyBib3R0b206IDA7IGxlZnQ6IDA7IH1cblxuLyogQW5pbWF0aW9ucyAqL1xuLmFuaW1hdGUtcHVsc2UgeyBhbmltYXRpb246IHB1bHNlIDJzIGN1YmljLWJlemllcigwLjQsIDAsIDAuNiwgMSkgaW5maW5pdGU7IH1cbi5hbmltYXRlLXNwaW4geyBhbmltYXRpb246IHNwaW4gMXMgbGluZWFyIGluZmluaXRlOyB9XG5cbkBrZXlmcmFtZXMgcHVsc2Uge1xuICAwJSwgMTAwJSB7IG9wYWNpdHk6IDE7IH1cbiAgNTAlIHsgb3BhY2l0eTogMC41OyB9XG59XG5cbkBrZXlmcmFtZXMgc3BpbiB7XG4gIHRvIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxufVxuXG4vKiBUcmFuc2l0aW9ucyAqL1xuLnRyYW5zaXRpb24tY29sb3JzIHsgXG4gIHRyYW5zaXRpb24tcHJvcGVydHk6IGNvbG9yLCBiYWNrZ3JvdW5kLWNvbG9yLCBib3JkZXItY29sb3IsIHRleHQtZGVjb3JhdGlvbi1jb2xvciwgZmlsbCwgc3Ryb2tlO1xuICB0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbjogY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgdHJhbnNpdGlvbi1kdXJhdGlvbjogMTUwbXM7XG59XG5cbi8qIEhvdmVyIHN0YXRlcyAqL1xuLmhvdmVyXFxcXDpiZy1ncmF5LTEwMDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICNmM2Y0ZjY7IH1cbi5ob3ZlclxcXFw6YmctZ3JheS03MDA6aG92ZXIgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzc0MTUxOyB9XG4uaG92ZXJcXFxcOmJnLXJlZC02MDA6aG92ZXIgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZGMyNjI2OyB9XG4uaG92ZXJcXFxcOmJnLWJsdWUtNjAwOmhvdmVyIHsgYmFja2dyb3VuZC1jb2xvcjogIzI1NjNlYjsgfVxuLmhvdmVyXFxcXDp0ZXh0LWJsdWUtNjAwOmhvdmVyIHsgY29sb3I6ICMyNTYzZWI7IH1cbi5ob3ZlclxcXFw6dGV4dC1ncmVlbi02MDA6aG92ZXIgeyBjb2xvcjogIzA1OTY2OTsgfVxuXG4vKiBEaXNhYmxlZCBzdGF0ZXMgKi9cbi5kaXNhYmxlZFxcXFw6YmctZ3JheS0zMDA6ZGlzYWJsZWQgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZDFkNWRiOyB9XG5cbi8qIEJ1dHRvbiBzdHlsZXMgKi9cbmJ1dHRvbiB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgYm9yZGVyOiBub25lO1xuICBiYWNrZ3JvdW5kOiBub25lO1xuICBwYWRkaW5nOiAwO1xuICBmb250OiBpbmhlcml0O1xufVxuXG5idXR0b246ZGlzYWJsZWQge1xuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xuICBvcGFjaXR5OiAwLjY7XG59XG5cbi8qIEZvcm0gZWxlbWVudHMgKi9cbmlucHV0W3R5cGU9XCJjaGVja2JveFwiXSB7XG4gIHdpZHRoOiAxcmVtO1xuICBoZWlnaHQ6IDFyZW07XG4gIGJvcmRlci1yYWRpdXM6IDAuMjVyZW07XG4gIGJvcmRlcjogMXB4IHNvbGlkICNkMWQ1ZGI7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmZmZmY7XG59XG5cbmlucHV0W3R5cGU9XCJjaGVja2JveFwiXTpjaGVja2VkIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzNiODJmNjtcbiAgYm9yZGVyLWNvbG9yOiAjM2I4MmY2O1xufVxuXG4vKiBDdXN0b20gc2Nyb2xsYmFyICovXG46Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgd2lkdGg6IDZweDtcbn1cblxuOjotd2Via2l0LXNjcm9sbGJhci10cmFjayB7XG4gIGJhY2tncm91bmQ6ICNmMWYxZjE7XG59XG5cbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xuICBiYWNrZ3JvdW5kOiAjYzFjMWMxO1xuICBib3JkZXItcmFkaXVzOiAzcHg7XG59XG5cbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIge1xuICBiYWNrZ3JvdW5kOiAjYTFhMWExO1xufVxuXG4vKiBMb2FkaW5nIHNwaW5uZXIgKi9cbi5sb2FkaW5nLXNwaW5uZXIge1xuICBib3JkZXI6IDJweCBzb2xpZCAjZjNmM2YzO1xuICBib3JkZXItdG9wOiAycHggc29saWQgIzNiODJmNjtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBhbmltYXRpb246IHNwaW4gMXMgbGluZWFyIGluZmluaXRlO1xufVxuXG4vKiBSZXNwb25zaXZlIGRlc2lnbiAqL1xuQG1lZGlhIChtYXgtd2lkdGg6IDQwMHB4KSB7XG4gIC53LTk2IHtcbiAgICB3aWR0aDogMTAwdnc7XG4gIH1cbiAgXG4gICNyb290IHtcbiAgICB3aWR0aDogMTAwdncgIWltcG9ydGFudDtcbiAgfVxufVxuXG4vKiBEYXJrIG1vZGUgc3VwcG9ydCAoZnV0dXJlIGVuaGFuY2VtZW50KSAqL1xuQG1lZGlhIChwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyaykge1xuICAvKiBEYXJrIG1vZGUgc3R5bGVzIGNhbiBiZSBhZGRlZCBoZXJlICovXG59XG5gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9wb3B1cC9wb3B1cC5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7Ozs7RUFJRTs7QUFFRiwwQkFBMEI7QUFDMUI7RUFDRSxzQkFBc0I7QUFDeEI7O0FBRUE7RUFDRSxTQUFTO0VBQ1QsVUFBVTtFQUNWO29FQUNrRTtFQUNsRSxnQkFBZ0I7RUFDaEIsY0FBYztFQUNkLHlCQUF5QjtBQUMzQjs7QUFFQSx3Q0FBd0M7QUFDeEMsT0FBTyxjQUFjLEVBQUU7QUFDdkIsT0FBTyxXQUFXLEVBQUU7QUFDcEIsT0FBTyxXQUFXLEVBQUU7QUFDcEIsUUFBUSxZQUFZLEVBQUU7QUFDdEIsVUFBVSxXQUFXLEVBQUU7O0FBRXZCLE9BQU8sZUFBZSxFQUFFO0FBQ3hC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QXFCO0FBQ3JCO0VBQ0UsVUFBVTtBQUNaOztBQUVBO0VBQ0UsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsbUJBQW1CO0VBQ25CLGtCQUFrQjtBQUNwQjs7QUFFQTtFQUNFLG1CQUFtQjtBQUNyQjs7QUFFQSxvQkFBb0I7QUFDcEI7RUFDRSx5QkFBeUI7RUFDekIsNkJBQTZCO0VBQzdCLGtCQUFrQjtFQUNsQixrQ0FBa0M7QUFDcEM7O0FBRUEsc0JBQXNCO0FBQ3RCO0VBQ0U7SUFDRSxZQUFZO0VBQ2Q7O0VBRUE7SUFDRSx1QkFBdUI7RUFDekI7QUFDRjs7QUFFQSwyQ0FBMkM7QUFDM0M7RUFDRSx1Q0FBdUM7QUFDekNcIixcInNvdXJjZXNDb250ZW50XCI6W1wiLyoqXFxuICogQGZpbGVvdmVydmlldyBTdHlsZXMgZm9yIEF1dG9GbG93IFN0dWRpbyBwb3B1cFxcbiAqIEBhdXRob3IgQXl1c2ggU2h1a2xhXFxuICogQGRlc2NyaXB0aW9uIENTUyBzdHlsZXMgdXNpbmcgVGFpbHdpbmQtaW5zcGlyZWQgdXRpbGl0eSBjbGFzc2VzXFxuICovXFxuXFxuLyogUmVzZXQgYW5kIGJhc2Ugc3R5bGVzICovXFxuKiB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG5cXG5ib2R5IHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCAnUm9ib3RvJywgJ094eWdlbicsXFxuICAgICdVYnVudHUnLCAnQ2FudGFyZWxsJywgJ09wZW4gU2FucycsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWY7XFxuICBsaW5lLWhlaWdodDogMS41O1xcbiAgY29sb3I6ICMzNzQxNTE7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmYWZiO1xcbn1cXG5cXG4vKiBVdGlsaXR5IGNsYXNzZXMgKFRhaWx3aW5kLWluc3BpcmVkKSAqL1xcbi53LTMgeyB3aWR0aDogMC43NXJlbTsgfVxcbi53LTQgeyB3aWR0aDogMXJlbTsgfVxcbi53LTggeyB3aWR0aDogMnJlbTsgfVxcbi53LTk2IHsgd2lkdGg6IDI0cmVtOyB9XFxuLnctZnVsbCB7IHdpZHRoOiAxMDAlOyB9XFxuXFxuLmgtMyB7IGhlaWdodDogMC43NXJlbTsgfVxcbi5oLTQgeyBoZWlnaHQ6IDFyZW07IH1cXG4uaC04IHsgaGVpZ2h0OiAycmVtOyB9XFxuXFxuLm1pbi1oLTk2IHsgbWluLWhlaWdodDogMjRyZW07IH1cXG4ubWluLXctMCB7IG1pbi13aWR0aDogMDsgfVxcblxcbi5wLTIgeyBwYWRkaW5nOiAwLjVyZW07IH1cXG4ucC0zIHsgcGFkZGluZzogMC43NXJlbTsgfVxcbi5wLTQgeyBwYWRkaW5nOiAxcmVtOyB9XFxuLnAtOCB7IHBhZGRpbmc6IDJyZW07IH1cXG5cXG4ucHgtMyB7IHBhZGRpbmctbGVmdDogMC43NXJlbTsgcGFkZGluZy1yaWdodDogMC43NXJlbTsgfVxcbi5weC00IHsgcGFkZGluZy1sZWZ0OiAxcmVtOyBwYWRkaW5nLXJpZ2h0OiAxcmVtOyB9XFxuLnB5LTIgeyBwYWRkaW5nLXRvcDogMC41cmVtOyBwYWRkaW5nLWJvdHRvbTogMC41cmVtOyB9XFxuLnB5LTMgeyBwYWRkaW5nLXRvcDogMC43NXJlbTsgcGFkZGluZy1ib3R0b206IDAuNzVyZW07IH1cXG4ucHktOCB7IHBhZGRpbmctdG9wOiAycmVtOyBwYWRkaW5nLWJvdHRvbTogMnJlbTsgfVxcblxcbi5wdC0zIHsgcGFkZGluZy10b3A6IDAuNzVyZW07IH1cXG4ubWItMiB7IG1hcmdpbi1ib3R0b206IDAuNXJlbTsgfVxcbi5tYi0zIHsgbWFyZ2luLWJvdHRvbTogMC43NXJlbTsgfVxcbi5tYi00IHsgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbi5tdC00IHsgbWFyZ2luLXRvcDogMXJlbTsgfVxcbi5teC1hdXRvIHsgbWFyZ2luLWxlZnQ6IGF1dG87IG1hcmdpbi1yaWdodDogYXV0bzsgfVxcblxcbi5zcGFjZS15LTEgPiAqICsgKiB7IG1hcmdpbi10b3A6IDAuMjVyZW07IH1cXG4uc3BhY2UteS0yID4gKiArICogeyBtYXJnaW4tdG9wOiAwLjVyZW07IH1cXG4uc3BhY2UteS0zID4gKiArICogeyBtYXJnaW4tdG9wOiAwLjc1cmVtOyB9XFxuLnNwYWNlLXktNCA+ICogKyAqIHsgbWFyZ2luLXRvcDogMXJlbTsgfVxcblxcbi5nYXAtMSB7IGdhcDogMC4yNXJlbTsgfVxcbi5nYXAtMiB7IGdhcDogMC41cmVtOyB9XFxuLmdhcC0zIHsgZ2FwOiAwLjc1cmVtOyB9XFxuXFxuLyogRmxleGJveCB1dGlsaXRpZXMgKi9cXG4uZmxleCB7IGRpc3BsYXk6IGZsZXg7IH1cXG4uZmxleC0xIHsgZmxleDogMSAxIDAlOyB9XFxuLmZsZXgtc2hyaW5rLTAgeyBmbGV4LXNocmluazogMDsgfVxcbi5pdGVtcy1jZW50ZXIgeyBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuLml0ZW1zLXN0YXJ0IHsgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7IH1cXG4uanVzdGlmeS1jZW50ZXIgeyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcbi5qdXN0aWZ5LWJldHdlZW4geyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG5cXG4vKiBCYWNrZ3JvdW5kIGNvbG9ycyAqL1xcbi5iZy13aGl0ZSB7IGJhY2tncm91bmQtY29sb3I6ICNmZmZmZmY7IH1cXG4uYmctZ3JheS01MCB7IGJhY2tncm91bmQtY29sb3I6ICNmOWZhZmI7IH1cXG4uYmctZ3JheS0xMDAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNGY2OyB9XFxuLmJnLWdyYXktMzAwIHsgYmFja2dyb3VuZC1jb2xvcjogI2QxZDVkYjsgfVxcbi5iZy1ncmF5LTYwMCB7IGJhY2tncm91bmQtY29sb3I6ICM0YjU1NjM7IH1cXG4uYmctcmVkLTUwIHsgYmFja2dyb3VuZC1jb2xvcjogI2ZlZjJmMjsgfVxcbi5iZy1yZWQtNTAwIHsgYmFja2dyb3VuZC1jb2xvcjogI2VmNDQ0NDsgfVxcbi5iZy1ibHVlLTEwMCB7IGJhY2tncm91bmQtY29sb3I6ICNkYmVhZmU7IH1cXG4uYmctYmx1ZS01MDAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjM2I4MmY2OyB9XFxuLmJnLWJsdWUtNjAwIHsgYmFja2dyb3VuZC1jb2xvcjogIzI1NjNlYjsgfVxcblxcbi8qIEdyYWRpZW50IGJhY2tncm91bmRzICovXFxuLmJnLWdyYWRpZW50LXRvLXIgeyBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gcmlnaHQsIHZhcigtLXR3LWdyYWRpZW50LXN0b3BzKSk7IH1cXG4uZnJvbS1ibHVlLTUwMCB7IC0tdHctZ3JhZGllbnQtZnJvbTogIzNiODJmNjsgLS10dy1ncmFkaWVudC1zdG9wczogdmFyKC0tdHctZ3JhZGllbnQtZnJvbSksIHZhcigtLXR3LWdyYWRpZW50LXRvLCByZ2JhKDU5LCAxMzAsIDI0NiwgMCkpOyB9XFxuLnRvLXB1cnBsZS02MDAgeyAtLXR3LWdyYWRpZW50LXRvOiAjOTMzM2VhOyB9XFxuXFxuLyogVGV4dCBjb2xvcnMgKi9cXG4udGV4dC13aGl0ZSB7IGNvbG9yOiAjZmZmZmZmOyB9XFxuLnRleHQtZ3JheS0zMDAgeyBjb2xvcjogI2QxZDVkYjsgfVxcbi50ZXh0LWdyYXktNTAwIHsgY29sb3I6ICM2YjcyODA7IH1cXG4udGV4dC1ncmF5LTYwMCB7IGNvbG9yOiAjNGI1NTYzOyB9XFxuLnRleHQtZ3JheS03MDAgeyBjb2xvcjogIzM3NDE1MTsgfVxcbi50ZXh0LWdyYXktOTAwIHsgY29sb3I6ICMxMTE4Mjc7IH1cXG4udGV4dC1yZWQtNTAwIHsgY29sb3I6ICNlZjQ0NDQ7IH1cXG4udGV4dC1yZWQtNzAwIHsgY29sb3I6ICNiOTFjMWM7IH1cXG4udGV4dC1ibHVlLTUwMCB7IGNvbG9yOiAjM2I4MmY2OyB9XFxuLnRleHQtYmx1ZS02MDAgeyBjb2xvcjogIzI1NjNlYjsgfVxcbi50ZXh0LWdyZWVuLTUwMCB7IGNvbG9yOiAjMTBiOTgxOyB9XFxuLnRleHQtZ3JlZW4tNjAwIHsgY29sb3I6ICMwNTk2Njk7IH1cXG5cXG4vKiBUZXh0IHV0aWxpdGllcyAqL1xcbi50ZXh0LXhzIHsgZm9udC1zaXplOiAwLjc1cmVtOyBsaW5lLWhlaWdodDogMXJlbTsgfVxcbi50ZXh0LXNtIHsgZm9udC1zaXplOiAwLjg3NXJlbTsgbGluZS1oZWlnaHQ6IDEuMjVyZW07IH1cXG4uZm9udC1tZWRpdW0geyBmb250LXdlaWdodDogNTAwOyB9XFxuLmZvbnQtc2VtaWJvbGQgeyBmb250LXdlaWdodDogNjAwOyB9XFxuLmZvbnQtYm9sZCB7IGZvbnQtd2VpZ2h0OiA3MDA7IH1cXG5cXG4udGV4dC1jZW50ZXIgeyB0ZXh0LWFsaWduOiBjZW50ZXI7IH1cXG4udHJ1bmNhdGUgeyBcXG4gIG92ZXJmbG93OiBoaWRkZW47IFxcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7IFxcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDsgXFxufVxcblxcbi8qIEJvcmRlciB1dGlsaXRpZXMgKi9cXG4uYm9yZGVyIHsgYm9yZGVyLXdpZHRoOiAxcHg7IH1cXG4uYm9yZGVyLXQgeyBib3JkZXItdG9wLXdpZHRoOiAxcHg7IH1cXG4uYm9yZGVyLWIgeyBib3JkZXItYm90dG9tLXdpZHRoOiAxcHg7IH1cXG4uYm9yZGVyLWdyYXktMjAwIHsgYm9yZGVyLWNvbG9yOiAjZTVlN2ViOyB9XFxuLmJvcmRlci1yZWQtMjAwIHsgYm9yZGVyLWNvbG9yOiAjZmVjYWNhOyB9XFxuXFxuLnJvdW5kZWQgeyBib3JkZXItcmFkaXVzOiAwLjI1cmVtOyB9XFxuLnJvdW5kZWQtbGcgeyBib3JkZXItcmFkaXVzOiAwLjVyZW07IH1cXG4ucm91bmRlZC1mdWxsIHsgYm9yZGVyLXJhZGl1czogOTk5OXB4OyB9XFxuXFxuLyogU2hhZG93cyAqL1xcbi5zaGFkb3ctc20geyBib3gtc2hhZG93OiAwIDFweCAycHggMCByZ2JhKDAsIDAsIDAsIDAuMDUpOyB9XFxuXFxuLyogUG9zaXRpb25pbmcgKi9cXG4ucmVsYXRpdmUgeyBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4uYWJzb2x1dGUgeyBwb3NpdGlvbjogYWJzb2x1dGU7IH1cXG4uaW5zZXQtMCB7IHRvcDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDsgbGVmdDogMDsgfVxcblxcbi8qIEFuaW1hdGlvbnMgKi9cXG4uYW5pbWF0ZS1wdWxzZSB7IGFuaW1hdGlvbjogcHVsc2UgMnMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC42LCAxKSBpbmZpbml0ZTsgfVxcbi5hbmltYXRlLXNwaW4geyBhbmltYXRpb246IHNwaW4gMXMgbGluZWFyIGluZmluaXRlOyB9XFxuXFxuQGtleWZyYW1lcyBwdWxzZSB7XFxuICAwJSwgMTAwJSB7IG9wYWNpdHk6IDE7IH1cXG4gIDUwJSB7IG9wYWNpdHk6IDAuNTsgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIHNwaW4ge1xcbiAgdG8geyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XFxufVxcblxcbi8qIFRyYW5zaXRpb25zICovXFxuLnRyYW5zaXRpb24tY29sb3JzIHsgXFxuICB0cmFuc2l0aW9uLXByb3BlcnR5OiBjb2xvciwgYmFja2dyb3VuZC1jb2xvciwgYm9yZGVyLWNvbG9yLCB0ZXh0LWRlY29yYXRpb24tY29sb3IsIGZpbGwsIHN0cm9rZTtcXG4gIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xcbiAgdHJhbnNpdGlvbi1kdXJhdGlvbjogMTUwbXM7XFxufVxcblxcbi8qIEhvdmVyIHN0YXRlcyAqL1xcbi5ob3ZlclxcXFw6YmctZ3JheS0xMDA6aG92ZXIgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNGY2OyB9XFxuLmhvdmVyXFxcXDpiZy1ncmF5LTcwMDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICMzNzQxNTE7IH1cXG4uaG92ZXJcXFxcOmJnLXJlZC02MDA6aG92ZXIgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZGMyNjI2OyB9XFxuLmhvdmVyXFxcXDpiZy1ibHVlLTYwMDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICMyNTYzZWI7IH1cXG4uaG92ZXJcXFxcOnRleHQtYmx1ZS02MDA6aG92ZXIgeyBjb2xvcjogIzI1NjNlYjsgfVxcbi5ob3ZlclxcXFw6dGV4dC1ncmVlbi02MDA6aG92ZXIgeyBjb2xvcjogIzA1OTY2OTsgfVxcblxcbi8qIERpc2FibGVkIHN0YXRlcyAqL1xcbi5kaXNhYmxlZFxcXFw6YmctZ3JheS0zMDA6ZGlzYWJsZWQgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZDFkNWRiOyB9XFxuXFxuLyogQnV0dG9uIHN0eWxlcyAqL1xcbmJ1dHRvbiB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBib3JkZXI6IG5vbmU7XFxuICBiYWNrZ3JvdW5kOiBub25lO1xcbiAgcGFkZGluZzogMDtcXG4gIGZvbnQ6IGluaGVyaXQ7XFxufVxcblxcbmJ1dHRvbjpkaXNhYmxlZCB7XFxuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xcbiAgb3BhY2l0eTogMC42O1xcbn1cXG5cXG4vKiBGb3JtIGVsZW1lbnRzICovXFxuaW5wdXRbdHlwZT1cXFwiY2hlY2tib3hcXFwiXSB7XFxuICB3aWR0aDogMXJlbTtcXG4gIGhlaWdodDogMXJlbTtcXG4gIGJvcmRlci1yYWRpdXM6IDAuMjVyZW07XFxuICBib3JkZXI6IDFweCBzb2xpZCAjZDFkNWRiO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZmZmZjtcXG59XFxuXFxuaW5wdXRbdHlwZT1cXFwiY2hlY2tib3hcXFwiXTpjaGVja2VkIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMzYjgyZjY7XFxuICBib3JkZXItY29sb3I6ICMzYjgyZjY7XFxufVxcblxcbi8qIEN1c3RvbSBzY3JvbGxiYXIgKi9cXG46Oi13ZWJraXQtc2Nyb2xsYmFyIHtcXG4gIHdpZHRoOiA2cHg7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2sge1xcbiAgYmFja2dyb3VuZDogI2YxZjFmMTtcXG59XFxuXFxuOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XFxuICBiYWNrZ3JvdW5kOiAjYzFjMWMxO1xcbiAgYm9yZGVyLXJhZGl1czogM3B4O1xcbn1cXG5cXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iOmhvdmVyIHtcXG4gIGJhY2tncm91bmQ6ICNhMWExYTE7XFxufVxcblxcbi8qIExvYWRpbmcgc3Bpbm5lciAqL1xcbi5sb2FkaW5nLXNwaW5uZXIge1xcbiAgYm9yZGVyOiAycHggc29saWQgI2YzZjNmMztcXG4gIGJvcmRlci10b3A6IDJweCBzb2xpZCAjM2I4MmY2O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgYW5pbWF0aW9uOiBzcGluIDFzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuXFxuLyogUmVzcG9uc2l2ZSBkZXNpZ24gKi9cXG5AbWVkaWEgKG1heC13aWR0aDogNDAwcHgpIHtcXG4gIC53LTk2IHtcXG4gICAgd2lkdGg6IDEwMHZ3O1xcbiAgfVxcbiAgXFxuICAjcm9vdCB7XFxuICAgIHdpZHRoOiAxMDB2dyAhaW1wb3J0YW50O1xcbiAgfVxcbn1cXG5cXG4vKiBEYXJrIG1vZGUgc3VwcG9ydCAoZnV0dXJlIGVuaGFuY2VtZW50KSAqL1xcbkBtZWRpYSAocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspIHtcXG4gIC8qIERhcmsgbW9kZSBzdHlsZXMgY2FuIGJlIGFkZGVkIGhlcmUgKi9cXG59XFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRW50cnkgcG9pbnQgZm9yIHRoZSBBdXRvRmxvdyBTdHVkaW8gcG9wdXBcbiAqIEBhdXRob3IgQXl1c2ggU2h1a2xhXG4gKiBAZGVzY3JpcHRpb24gUmVhY3QgYXBwbGljYXRpb24gZW50cnkgcG9pbnQgZm9yIHRoZSBDaHJvbWUgZXh0ZW5zaW9uIHBvcHVwXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSAncmVhY3QtZG9tL2NsaWVudCc7XG5pbXBvcnQgQXV0b0Zsb3dQb3B1cCBmcm9tICcuL3BvcHVwJztcbmltcG9ydCAnLi9wb3B1cC5jc3MnO1xuLyoqXG4gKiBJbml0aWFsaXplIGFuZCByZW5kZXIgdGhlIHBvcHVwIFJlYWN0IGFwcGxpY2F0aW9uXG4gKi9cbmZ1bmN0aW9uIGluaXRpYWxpemVQb3B1cCgpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpO1xuICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG9GbG93IFBvcHVwOiBSb290IGNvbnRhaW5lciBub3QgZm91bmQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBDcmVhdGUgUmVhY3Qgcm9vdCBhbmQgcmVuZGVyIHRoZSBwb3B1cCBjb21wb25lbnRcbiAgICBjb25zdCByb290ID0gY3JlYXRlUm9vdChjb250YWluZXIpO1xuICAgIHJvb3QucmVuZGVyKF9qc3goUmVhY3QuU3RyaWN0TW9kZSwgeyBjaGlsZHJlbjogX2pzeChBdXRvRmxvd1BvcHVwLCB7fSkgfSkpO1xuICAgIGNvbnNvbGUubG9nKCdBdXRvRmxvdyBQb3B1cDogQXBwbGljYXRpb24gaW5pdGlhbGl6ZWQnKTtcbn1cbi8vIEluaXRpYWxpemUgd2hlbiBET00gaXMgcmVhZHlcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdGlhbGl6ZVBvcHVwKTtcbn1cbmVsc2Uge1xuICAgIGluaXRpYWxpemVQb3B1cCgpO1xufVxuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi8uLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanMhLi9wb3B1cC5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcbm9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vcG9wdXAuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQGZpbGVvdmVydmlldyBNYWluIHBvcHVwIGNvbXBvbmVudCBmb3IgQXV0b0Zsb3cgU3R1ZGlvIENocm9tZSBFeHRlbnNpb25cbiAqIEBhdXRob3IgQXl1c2ggU2h1a2xhXG4gKiBAZGVzY3JpcHRpb24gUmVhY3QtYmFzZWQgVUkgZm9yIGNvbnRyb2xsaW5nIHJlY29yZGluZyBhbmQgbWFuYWdpbmcgd29ya2Zsb3dzLlxuICogRm9sbG93cyBDb21wb25lbnQtYmFzZWQgYXJjaGl0ZWN0dXJlIHdpdGggaG9va3MgZm9yIHN0YXRlIG1hbmFnZW1lbnQuXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUGxheSwgU3F1YXJlLCBTZXR0aW5ncywgRG93bmxvYWQsIFVwbG9hZCwgTGlzdCwgV29ya2Zsb3csIFphcCwgRXllLCBBbGVydENpcmNsZSB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIE1haW4gcG9wdXAgY29tcG9uZW50XG4gKiBGb2xsb3dzIGZ1bmN0aW9uYWwgY29tcG9uZW50IHBhdHRlcm4gd2l0aCBob29rc1xuICovXG5jb25zdCBBdXRvRmxvd1BvcHVwID0gKCkgPT4ge1xuICAgIC8vIFN0YXRlIG1hbmFnZW1lbnRcbiAgICBjb25zdCBbcmVjb3JkaW5nU3RhdGUsIHNldFJlY29yZGluZ1N0YXRlXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgaXNSZWNvcmRpbmc6IGZhbHNlLFxuICAgICAgICBzZXNzaW9uSWQ6IG51bGwsXG4gICAgICAgIGFjdGl2ZVRhYklkOiBudWxsLFxuICAgICAgICBzdGVwQ291bnQ6IDAsXG4gICAgICAgIGR1cmF0aW9uOiAwXG4gICAgfSk7XG4gICAgY29uc3QgW3dvcmtmbG93cywgc2V0V29ya2Zsb3dzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbY3VycmVudFRhYiwgc2V0Q3VycmVudFRhYl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2FjdGl2ZVZpZXcsIHNldEFjdGl2ZVZpZXddID0gdXNlU3RhdGUoJ21haW4nKTtcbiAgICAvKipcbiAgICAgKiBTZW5kIG1lc3NhZ2UgdG8gYmFja2dyb3VuZCBzY3JpcHRcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gc2VuZFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHJlc3BvbnNlXG4gICAgICovXG4gICAgY29uc3Qgc2VuZE1lc3NhZ2UgPSB1c2VDYWxsYmFjayhhc3luYyAobWVzc2FnZSkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKG1lc3NhZ2UsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXh0ZW5zaW9uIG1lc3NhZ2UgZXJyb3I6JywgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IGVycm9yOiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogTG9hZCByZWNvcmRpbmcgc3RhdGUgZnJvbSBiYWNrZ3JvdW5kIHNjcmlwdFxuICAgICAqL1xuICAgIGNvbnN0IGxvYWRSZWNvcmRpbmdTdGF0ZSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoeyB0eXBlOiAnR0VUX1JFQ09SRElOR19TVEFURScgfSk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgc2V0UmVjb3JkaW5nU3RhdGUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbG9hZGluZyByZWNvcmRpbmcgc3RhdGU6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSwgW3NlbmRNZXNzYWdlXSk7XG4gICAgLyoqXG4gICAgICogTG9hZCBzdG9yZWQgd29ya2Zsb3dzXG4gICAgICovXG4gICAgY29uc3QgbG9hZFdvcmtmbG93cyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoeyB0eXBlOiAnR0VUX1dPUktGTE9XUycgfSk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2Uud29ya2Zsb3dzKSB7XG4gICAgICAgICAgICAgICAgc2V0V29ya2Zsb3dzKHJlc3BvbnNlLndvcmtmbG93cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBsb2FkaW5nIHdvcmtmbG93czonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCBbc2VuZE1lc3NhZ2VdKTtcbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBhY3RpdmUgdGFiXG4gICAgICovXG4gICAgY29uc3QgZ2V0Q3VycmVudFRhYiA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XG4gICAgICAgICAgICBzZXRDdXJyZW50VGFiKHRhYik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGN1cnJlbnQgdGFiOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHBvcHVwIGRhdGFcbiAgICAgKi9cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBpbml0aWFsaXplUG9wdXAgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICAgICAgbG9hZFJlY29yZGluZ1N0YXRlKCksXG4gICAgICAgICAgICAgICAgICAgIGxvYWRXb3JrZmxvd3MoKSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0Q3VycmVudFRhYigpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcignRmFpbGVkIHRvIGluaXRpYWxpemUgcG9wdXAnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQb3B1cCBpbml0aWFsaXphdGlvbiBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpbml0aWFsaXplUG9wdXAoKTtcbiAgICB9LCBbbG9hZFJlY29yZGluZ1N0YXRlLCBsb2FkV29ya2Zsb3dzLCBnZXRDdXJyZW50VGFiXSk7XG4gICAgLyoqXG4gICAgICogU2V0IHVwIHBlcmlvZGljIHN0YXRlIHVwZGF0ZXMgd2hlbiByZWNvcmRpbmdcbiAgICAgKi9cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsZXQgaW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICBpZiAocmVjb3JkaW5nU3RhdGUuaXNSZWNvcmRpbmcpIHtcbiAgICAgICAgICAgIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxvYWRSZWNvcmRpbmdTdGF0ZSgpO1xuICAgICAgICAgICAgfSwgMTAwMCk7IC8vIFVwZGF0ZSBldmVyeSBzZWNvbmRcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGludGVydmFsKVxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICB9O1xuICAgIH0sIFtyZWNvcmRpbmdTdGF0ZS5pc1JlY29yZGluZywgbG9hZFJlY29yZGluZ1N0YXRlXSk7XG4gICAgLyoqXG4gICAgICogU3RhcnQgcmVjb3JkaW5nIHdvcmtmbG93XG4gICAgICovXG4gICAgY29uc3QgaGFuZGxlU3RhcnRSZWNvcmRpbmcgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghY3VycmVudFRhYikge1xuICAgICAgICAgICAgc2V0RXJyb3IoJ05vIGFjdGl2ZSB0YWIgZm91bmQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1NUQVJUX1JFQ09SRElORycsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGN1cnJlbnRUYWIudXJsLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogY3VycmVudFRhYi50aXRsZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgbG9hZFJlY29yZGluZ1N0YXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBzZXRFcnJvcignRmFpbGVkIHRvIHN0YXJ0IHJlY29yZGluZycpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU3RhcnQgcmVjb3JkaW5nIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFN0b3AgcmVjb3JkaW5nIHdvcmtmbG93XG4gICAgICovXG4gICAgY29uc3QgaGFuZGxlU3RvcFJlY29yZGluZyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoeyB0eXBlOiAnU1RPUF9SRUNPUkRJTkcnIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgbG9hZFJlY29yZGluZ1N0YXRlKCk7XG4gICAgICAgICAgICAgICAgLy8gT3B0aW9uYWxseSBzaG93IHNlc3Npb24gc3VtbWFyeVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zZXNzaW9uRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjb3JkaW5nIGNvbXBsZXRlZDonLCByZXNwb25zZS5zZXNzaW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBzdG9wIHJlY29yZGluZycpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU3RvcCByZWNvcmRpbmcgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhwb3J0IGN1cnJlbnQgc2Vzc2lvblxuICAgICAqL1xuICAgIGNvbnN0IGhhbmRsZUV4cG9ydFNlc3Npb24gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoeyB0eXBlOiAnRVhQT1JUX1NFU1NJT04nIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRG93bmxvYWQgYXMgSlNPTiBmaWxlXG4gICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeShyZXNwb25zZSwgbnVsbCwgMildLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgICAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICAgICAgYS5kb3dubG9hZCA9IGBhdXRvZmxvd19zZXNzaW9uXyR7cmVzcG9uc2Uuc2Vzc2lvbklkfS5qc29uYDtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpO1xuICAgICAgICAgICAgICAgIGEuY2xpY2soKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGEpO1xuICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gZXhwb3J0IHNlc3Npb24nKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cG9ydCBzZXNzaW9uIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEZvcm1hdCBkdXJhdGlvbiBpbiBodW1hbiByZWFkYWJsZSBmb3JtYXRcbiAgICAgKiBAcGFyYW0gbXMgLSBEdXJhdGlvbiBpbiBtaWxsaXNlY29uZHNcbiAgICAgKiBAcmV0dXJucyBGb3JtYXR0ZWQgZHVyYXRpb24gc3RyaW5nXG4gICAgICovXG4gICAgY29uc3QgZm9ybWF0RHVyYXRpb24gPSAobXMpID0+IHtcbiAgICAgICAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IobXMgLyAxMDAwKTtcbiAgICAgICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvIDYwKTtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nU2Vjb25kcyA9IHNlY29uZHMgJSA2MDtcbiAgICAgICAgaWYgKG1pbnV0ZXMgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7bWludXRlc31tICR7cmVtYWluaW5nU2Vjb25kc31zYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYCR7cmVtYWluaW5nU2Vjb25kc31zYDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbmRlciBtYWluIHJlY29yZGluZyBjb250cm9sc1xuICAgICAqL1xuICAgIGNvbnN0IHJlbmRlck1haW5WaWV3ID0gKCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktNFwiLCBjaGlsZHJlbjogW2N1cnJlbnRUYWIgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWdyYXktNTAgcC0zIHJvdW5kZWQtbGdcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMFwiLCBjaGlsZHJlbjogXCJDdXJyZW50IFRhYjpcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRydW5jYXRlXCIsIGNoaWxkcmVuOiBjdXJyZW50VGFiLnRpdGxlIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMCB0cnVuY2F0ZVwiLCBjaGlsZHJlbjogY3VycmVudFRhYi51cmwgfSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBwLTQgcm91bmRlZC1sZ1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0zXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMFwiLCBjaGlsZHJlbjogXCJSZWNvcmRpbmcgU3RhdHVzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGB3LTMgaC0zIHJvdW5kZWQtZnVsbCAke3JlY29yZGluZ1N0YXRlLmlzUmVjb3JkaW5nID8gJ2JnLXJlZC01MDAgYW5pbWF0ZS1wdWxzZScgOiAnYmctZ3JheS0zMDAnfWAgfSldIH0pLCByZWNvcmRpbmdTdGF0ZS5pc1JlY29yZGluZyA/IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDBcIiwgY2hpbGRyZW46IFtcIlNlc3Npb246IFwiLCByZWNvcmRpbmdTdGF0ZS5zZXNzaW9uSWQ/LnNsaWNlKC04KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMFwiLCBjaGlsZHJlbjogW1wiU3RlcHM6IFwiLCByZWNvcmRpbmdTdGF0ZS5zdGVwQ291bnRdIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDBcIiwgY2hpbGRyZW46IFtcIkR1cmF0aW9uOiBcIiwgZm9ybWF0RHVyYXRpb24ocmVjb3JkaW5nU3RhdGUuZHVyYXRpb24pXSB9KV0gfSkpIDogKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwXCIsIGNoaWxkcmVuOiBcIlJlYWR5IHRvIHJlY29yZCBuZXcgd29ya2Zsb3dcIiB9KSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMlwiLCBjaGlsZHJlbjogIXJlY29yZGluZ1N0YXRlLmlzUmVjb3JkaW5nID8gKF9qc3hzKFwiYnV0dG9uXCIsIHsgb25DbGljazogaGFuZGxlU3RhcnRSZWNvcmRpbmcsIGRpc2FibGVkOiBpc0xvYWRpbmcgfHwgIWN1cnJlbnRUYWIsIGNsYXNzTmFtZTogXCJ3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgYmctcmVkLTUwMCBob3ZlcjpiZy1yZWQtNjAwIFxcbiAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOmJnLWdyYXktMzAwIHRleHQtd2hpdGUgcHgtNCBweS0zIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1jb2xvcnNcIiwgY2hpbGRyZW46IFtfanN4KFBsYXksIHsgc2l6ZTogMTggfSksIGlzTG9hZGluZyA/ICdTdGFydGluZy4uLicgOiAnU3RhcnQgUmVjb3JkaW5nJ10gfSkpIDogKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMlwiLCBjaGlsZHJlbjogW19qc3hzKFwiYnV0dG9uXCIsIHsgb25DbGljazogaGFuZGxlU3RvcFJlY29yZGluZywgZGlzYWJsZWQ6IGlzTG9hZGluZywgY2xhc3NOYW1lOiBcInctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBiZy1ncmF5LTYwMCBob3ZlcjpiZy1ncmF5LTcwMCBcXG4gICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOmJnLWdyYXktMzAwIHRleHQtd2hpdGUgcHgtNCBweS0zIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1jb2xvcnNcIiwgY2hpbGRyZW46IFtfanN4KFNxdWFyZSwgeyBzaXplOiAxOCB9KSwgaXNMb2FkaW5nID8gJ1N0b3BwaW5nLi4uJyA6ICdTdG9wIFJlY29yZGluZyddIH0pLCBfanN4cyhcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IGhhbmRsZUV4cG9ydFNlc3Npb24sIGRpc2FibGVkOiBpc0xvYWRpbmcsIGNsYXNzTmFtZTogXCJ3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgYmctYmx1ZS01MDAgaG92ZXI6YmctYmx1ZS02MDAgXFxuICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDpiZy1ncmF5LTMwMCB0ZXh0LXdoaXRlIHB4LTQgcHktMiByb3VuZGVkLWxnIHRyYW5zaXRpb24tY29sb3JzXCIsIGNoaWxkcmVuOiBbX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgXCJFeHBvcnQgU2Vzc2lvblwiXSB9KV0gfSkpIH0pXSB9KSk7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIHdvcmtmbG93cyB2aWV3XG4gICAgICovXG4gICAgY29uc3QgcmVuZGVyV29ya2Zsb3dzVmlldyA9ICgpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwXCIsIGNoaWxkcmVuOiBcIk15IFdvcmtmbG93c1wiIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtYmx1ZS01MDAgaG92ZXI6dGV4dC1ibHVlLTYwMFwiLCBjaGlsZHJlbjogX2pzeChVcGxvYWQsIHsgc2l6ZTogMTggfSkgfSldIH0pLCB3b3JrZmxvd3MubGVuZ3RoID09PSAwID8gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIHRleHQtZ3JheS01MDAgcHktOFwiLCBjaGlsZHJlbjogW19qc3goV29ya2Zsb3csIHsgc2l6ZTogNDgsIGNsYXNzTmFtZTogXCJteC1hdXRvIG1iLTIgdGV4dC1ncmF5LTMwMFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IFwiTm8gd29ya2Zsb3dzIHlldFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHNcIiwgY2hpbGRyZW46IFwiUmVjb3JkIHlvdXIgZmlyc3Qgd29ya2Zsb3cgdG8gZ2V0IHN0YXJ0ZWRcIiB9KV0gfSkpIDogKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0yXCIsIGNoaWxkcmVuOiB3b3JrZmxvd3MubWFwKCh3b3JrZmxvdykgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBwLTMgcm91bmRlZC1sZ1wiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG1pbi13LTBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtbWVkaXVtIHRleHQtc20gdHJ1bmNhdGVcIiwgY2hpbGRyZW46IHdvcmtmbG93Lm5hbWUgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogW3dvcmtmbG93LnN0ZXBzLmxlbmd0aCwgXCIgc3RlcHMgXFx1MjAyMiBcIiwgd29ya2Zsb3cudmVyc2lvbl0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmVlbi01MDAgaG92ZXI6dGV4dC1ncmVlbi02MDBcIiwgY2hpbGRyZW46IF9qc3goUGxheSwgeyBzaXplOiAxNiB9KSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWJsdWUtNTAwIGhvdmVyOnRleHQtYmx1ZS02MDBcIiwgY2hpbGRyZW46IF9qc3goRXllLCB7IHNpemU6IDE2IH0pIH0pXSB9KV0gfSkgfSwgd29ya2Zsb3cuaWQpKSkgfSkpXSB9KSk7XG4gICAgLyoqXG4gICAgICogUmVuZGVyIHNldHRpbmdzIHZpZXdcbiAgICAgKi9cbiAgICBjb25zdCByZW5kZXJTZXR0aW5nc1ZpZXcgPSAoKSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS00XCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMFwiLCBjaGlsZHJlbjogXCJTZXR0aW5nc1wiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTNcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4KFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNzAwXCIsIGNoaWxkcmVuOiBcIkNhcHR1cmUgU2NyZWVuc2hvdHNcIiB9KSwgX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3goXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS03MDBcIiwgY2hpbGRyZW46IFwiQXV0by1zYXZlIFNlc3Npb25zXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4KFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNzAwXCIsIGNoaWxkcmVuOiBcIlNtYXJ0IERlbGF5c1wiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNsYXNzTmFtZTogXCJyb3VuZGVkXCIsIGRlZmF1bHRDaGVja2VkOiB0cnVlIH0pXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYm9yZGVyLXQgcHQtMyBtdC00XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS01MDBcIiwgY2hpbGRyZW46IFtcIkF1dG9GbG93IFN0dWRpbyB2MS4wLjBcIiwgX2pzeChcImJyXCIsIHt9KSwgXCJCdWlsdCBieSBBeXVzaCBTaHVrbGFcIl0gfSkgfSldIH0pKTtcbiAgICAvKipcbiAgICAgKiBNYWluIHJlbmRlciBmdW5jdGlvblxuICAgICAqL1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy05NiBiZy1ncmF5LTUwIG1pbi1oLTk2XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgcC00XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy04IGgtOCBiZy1ncmFkaWVudC10by1yIGZyb20tYmx1ZS01MDAgdG8tcHVycGxlLTYwMCByb3VuZGVkLWxnIFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFphcCwgeyBzaXplOiAxOCwgY2xhc3NOYW1lOiBcInRleHQtd2hpdGVcIiB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJmb250LWJvbGQgdGV4dC1ncmF5LTkwMFwiLCBjaGlsZHJlbjogXCJBdXRvRmxvdyBTdHVkaW9cIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS01MDBcIiwgY2hpbGRyZW46IFwiQUktRW5oYW5jZWQgQnJvd3NlciBBdXRvbWF0aW9uXCIgfSldIH0pXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgcHgtNCBweS0yXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGlkOiAnbWFpbicsIGxhYmVsOiAnUmVjb3JkJywgaWNvbjogUGxheSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBpZDogJ3dvcmtmbG93cycsIGxhYmVsOiAnV29ya2Zsb3dzJywgaWNvbjogTGlzdCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBpZDogJ3NldHRpbmdzJywgbGFiZWw6ICdTZXR0aW5ncycsIGljb246IFNldHRpbmdzIH1cbiAgICAgICAgICAgICAgICAgICAgXS5tYXAoKHRhYikgPT4gKF9qc3hzKFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gc2V0QWN0aXZlVmlldyh0YWIuaWQpLCBjbGFzc05hbWU6IGBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMSBweC0zIHB5LTIgdGV4dC1zbSByb3VuZGVkLWxnIHRyYW5zaXRpb24tY29sb3JzICR7YWN0aXZlVmlldyA9PT0gdGFiLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTYwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICd0ZXh0LWdyYXktNjAwIGhvdmVyOmJnLWdyYXktMTAwJ31gLCBjaGlsZHJlbjogW19qc3godGFiLmljb24sIHsgc2l6ZTogMTYgfSksIHRhYi5sYWJlbF0gfSwgdGFiLmlkKSkpIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTRcIiwgY2hpbGRyZW46IFtlcnJvciAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWItNCBwLTMgYmctcmVkLTUwIGJvcmRlciBib3JkZXItcmVkLTIwMCByb3VuZGVkLWxnIGZsZXggaXRlbXMtc3RhcnQgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IHNpemU6IDE2LCBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG10LTAuNSBmbGV4LXNocmluay0wXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXJlZC03MDBcIiwgY2hpbGRyZW46IGVycm9yIH0pXSB9KSksIGFjdGl2ZVZpZXcgPT09ICdtYWluJyAmJiByZW5kZXJNYWluVmlldygpLCBhY3RpdmVWaWV3ID09PSAnd29ya2Zsb3dzJyAmJiByZW5kZXJXb3JrZmxvd3NWaWV3KCksIGFjdGl2ZVZpZXcgPT09ICdzZXR0aW5ncycgJiYgcmVuZGVyU2V0dGluZ3NWaWV3KCldIH0pLCBpc0xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LWdyYXktNjAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IGJvcmRlci0yIGJvcmRlci1ncmF5LTMwMCBib3JkZXItdC1ibHVlLTUwMCByb3VuZGVkLWZ1bGwgYW5pbWF0ZS1zcGluXCIgfSksIFwiUHJvY2Vzc2luZy4uLlwiXSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBBdXRvRmxvd1BvcHVwO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0bG9hZGVkOiBmYWxzZSxcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG5cdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubm1kID0gKG1vZHVsZSkgPT4ge1xuXHRtb2R1bGUucGF0aHMgPSBbXTtcblx0aWYgKCFtb2R1bGUuY2hpbGRyZW4pIG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xuXHRyZXR1cm4gbW9kdWxlO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJwb3B1cFwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmthdXRvZmxvd19zdHVkaW9fZXh0ZW5zaW9uXCJdID0gc2VsZltcIndlYnBhY2tDaHVua2F1dG9mbG93X3N0dWRpb19leHRlbnNpb25cIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9yXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3BvcHVwL2luZGV4LnRzeFwiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9