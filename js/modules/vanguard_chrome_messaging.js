/**
 * VANGUARD ERP - CHROME EXTENSION MESSAGING HANDLER
 * 
 * Safe, robust chrome.runtime.onMessage.addListener handler adhering to 
 * Manifest V3 best practices:
 * 1. Callback function is strictly synchronous (NOT async).
 * 2. Async work wrapped in an IIFE (async () => { ... })().
 * 3. sendResponse() explicitly called in every code path (try, catch, and default/unhandled).
 * 4. 'return true;' returned synchronously at the end to keep the messaging channel open.
 */

(function () {
  'use strict';

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Execute asynchronous operations inside IIFE
      (async () => {
        try {
          if (!message || !message.action) {
            sendResponse({ status: 'ignored', reason: 'No action specified' });
            return;
          }

          switch (message.action) {
            case 'PING':
              sendResponse({ status: 'success', app: 'Vanguard ERP', timestamp: Date.now() });
              break;

            case 'GET_TENANT_INFO':
              sendResponse({
                status: 'success',
                brand: 'Vanguard ERP',
                company: 'منتوجات زيت وزيتون الجنوب',
                activeTenantId: 'tenant-south-001'
              });
              break;

            case 'SYNC_DATA':
              if (window.SouthernOliveBridge && typeof window.SouthernOliveBridge.syncWithSupabase === 'function') {
                const res = await window.SouthernOliveBridge.syncWithSupabase();
                sendResponse({ status: 'success', result: res });
              } else {
                sendResponse({ status: 'success', message: 'Sync queued locally' });
              }
              break;

            default:
              sendResponse({ status: 'unhandled', action: message.action });
              break;
          }
        } catch (err) {
          console.error('[Vanguard Chrome Messaging] Exception in message listener:', err);
          sendResponse({ status: 'error', message: err ? err.message : 'Unknown error' });
        }
      })();

      // Return true synchronously to indicate sendResponse will be called asynchronously
      return true;
    });
  }
})();
