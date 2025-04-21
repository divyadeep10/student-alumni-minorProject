// This file provides polyfills for Node.js globals that are used by some libraries
// but not available in the browser environment

if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof process === 'undefined') {
  window.process = { env: {} };
}

// For Buffer, we don't use require since it's not available in browser
// Instead, we'll rely on the define in vite.config.js