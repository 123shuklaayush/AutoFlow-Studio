/**
 * Emergency script to clear Chrome extension storage
 * Run this in the browser console on any page where the extension is active
 */

// Clear all AutoFlow extension storage
chrome.runtime.sendMessage(
  "glmbhoinmnmoocdeghnccipddfkahojei",
  {
    type: "CLEAR_STORAGE",
  },
  (response) => {
    if (response && response.success) {
      console.log("✅ AutoFlow storage cleared successfully");
    } else {
      console.error("❌ Failed to clear storage:", response?.error);
    }
  }
);

console.log("🧹 Clearing AutoFlow extension storage...");
