import { ExtensionConfig, GeneratedFile } from '../types';

export function generateExtensionFiles(config: ExtensionConfig): GeneratedFile[] {
  const isAutopilot = config.extensionMode === 'autopilot';
  const shopriteUrl = config.shopriteTargetUrl || config.targetUrl || 'https://www.shoprite.com/sm/planning/rsid/521/digital-coupon';
  const walgreensUrl = config.walgreensTargetUrl || 'https://www.walgreens.com/offers/offers.jsp?ban=dl_dlsp_MegaMenu_Coupons';
  const familydollarUrl = config.familydollarTargetUrl || 'https://www.familydollar.com/smart-coupons';
  const cvsUrl = config.cvsTargetUrl || 'https://www.cvs.com/extracare/home';
  const krogerUrl = config.krogerTargetUrl || 'https://www.kroger.com/savings/cl/coupons/';

  const manifest: Record<string, any> = {
    manifest_version: 3,
    name: "CouponSweep — Digital Coupon Loader",
    version: "1.6.0",
    description: "Automatically clips all available digital coupons on ShopRite, Walgreens, Family Dollar, CVS, Kroger, and grocery loyalty programs.",
    permissions: [
      "activeTab",
      "scripting",
      "tabs",
      "storage"
    ],
    host_permissions: [
      "*://*.shoprite.com/*",
      "*://*.wakefern.com/*",
      "*://*.priceplus.com/*",
      "*://*.walgreens.com/*",
      "*://*.familydollar.com/*",
      "*://*.cvs.com/*",
      "*://*.kroger.com/*"
    ],
    content_scripts: [
      {
        matches: [
          "*://*.shoprite.com/*",
          "*://*.wakefern.com/*",
          "*://*.priceplus.com/*"
        ],
        js: ["content.js"],
        all_frames: true,
        run_at: "document_idle"
      }
    ],
    background: {
      service_worker: "background.js"
    },
    action: {
      default_title: "CouponSweep — Digital Coupon Loader",
      default_popup: "popup.html",
      default_icon: {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      }
    },
    icons: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  };

  // If user explicitly configured autopilot with no popup, remove default_popup
  if (isAutopilot) {
    delete (manifest.action as any).default_popup;
  }

  const backgroundJs = `// CouponSweep - Background Service Worker (Manifest V3)
// Multi-Retailer Support: ShopRite, Walgreens, Family Dollar, CVS, & Kroger

const DEFAULT_SHOPRITE_URL = ${JSON.stringify(shopriteUrl)};
const DEFAULT_WALGREENS_URL = ${JSON.stringify(walgreensUrl)};
const DEFAULT_FAMILYDOLLAR_URL = ${JSON.stringify(familydollarUrl)};
const DEFAULT_CVS_URL = ${JSON.stringify(cvsUrl)};
const DEFAULT_KROGER_URL = ${JSON.stringify(krogerUrl)};
const DEFAULT_TARGET_URL = ${JSON.stringify(config.targetUrl || shopriteUrl)};

const CONFIG = {
  autoStartOnNavigation: ${Boolean(config.autoStartOnNavigation)},
  extensionMode: ${JSON.stringify(config.extensionMode)},
  clippingStrategy: ${JSON.stringify(config.clippingStrategy)}
};

// Retailer Detection & Destination URL Resolution
function detectRetailerFromUrl(url = '') {
  if (!url) return 'generic';
  const lower = url.toLowerCase();
  if (lower.includes('shoprite.com') || lower.includes('wakefern.com') || lower.includes('priceplus')) {
    return 'shoprite';
  }
  if (lower.includes('walgreens.com')) {
    return 'walgreens';
  }
  if (lower.includes('familydollar.com')) {
    return 'familydollar';
  }
  if (lower.includes('cvs.com')) {
    return 'cvs';
  }
  if (lower.includes('kroger.com')) {
    return 'kroger';
  }
  return 'generic';
}

function resolveTargetUrl(tabUrl = '', targetRetailer = null) {
  const retailer = targetRetailer || detectRetailerFromUrl(tabUrl);

  if (retailer === 'shoprite') {
    if (tabUrl && tabUrl.includes("rsid/")) {
      const rsidMatch = tabUrl.match(new RegExp('/rsid/([a-zA-Z0-9_-]+)', 'i'));
      if (rsidMatch) {
        return 'https://www.shoprite.com/sm/planning/rsid/' + rsidMatch[1] + '/digital-coupon?cfrom=homenavigation';
      }
    }
    return DEFAULT_SHOPRITE_URL;
  }

  if (retailer === 'walgreens') {
    if (tabUrl && tabUrl.includes('walgreens.com/offers')) {
      return tabUrl;
    }
    return DEFAULT_WALGREENS_URL;
  }

  if (retailer === 'familydollar') {
    if (tabUrl && tabUrl.includes('familydollar.com')) {
      return tabUrl;
    }
    return DEFAULT_FAMILYDOLLAR_URL;
  }

  if (retailer === 'cvs') {
    if (tabUrl && (tabUrl.includes('cvs.com/extracare') || tabUrl.includes('cvs.com'))) {
      return tabUrl.includes('extracare') ? tabUrl : DEFAULT_CVS_URL;
    }
    return DEFAULT_CVS_URL;
  }

  if (retailer === 'kroger') {
    if (tabUrl && (tabUrl.includes('kroger.com/savings/cl/coupons') || tabUrl.includes('kroger.com'))) {
      return tabUrl.includes('coupons') ? tabUrl : (config.krogerTargetUrl || 'https://www.kroger.com/savings/cl/coupons/');
    }
    return config.krogerTargetUrl || 'https://www.kroger.com/savings/cl/coupons/';
  }

  return DEFAULT_TARGET_URL;
}

// Map of tabId -> session stats across all frames
const activeSessions = new Map();

// When user clicks toolbar icon directly (if no popup configured)
chrome.action.onClicked.addListener(async (tab) => {
  console.log("🚀 CouponSweep icon clicked! Tab URL:", tab?.url);
  if (!tab || !tab.id) return;

  const retailer = detectRetailerFromUrl(tab.url);
  const isAlreadyOnCouponsPage = tab.url && (
    tab.url.includes("coupon") || 
    tab.url.includes("offers") || 
    tab.url.includes("savings") || 
    tab.url.includes("circular")
  );

  if (isAlreadyOnCouponsPage) {
    console.log("Already on coupons page. Prompting mode selection in-page...");
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: ['content.js']
      });
      chrome.tabs.sendMessage(tab.id, { type: 'CS_PROMPT_MODE' });
    } catch (e) {
      await injectAndStartLoader(tab.id, 'instant');
    }
  } else {
    const destinationUrl = resolveTargetUrl(tab.url, retailer !== 'generic' ? retailer : 'shoprite');
    console.log("Directing tab to coupons page:", destinationUrl);
    await chrome.tabs.update(tab.id, { url: destinationUrl });

    const onTabUpdatedListener = (tabId, changeInfo) => {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(onTabUpdatedListener);
        console.log("Coupons page loaded. Prompting mode selection...");

        setTimeout(async () => {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tabId, allFrames: false },
              files: ['content.js']
            });
            chrome.tabs.sendMessage(tabId, { type: 'CS_PROMPT_MODE' });
          } catch(e) {
            await injectAndStartLoader(tabId, 'instant');
          }
        }, 2200);
      }
    };

    chrome.tabs.onUpdated.addListener(onTabUpdatedListener);
  }
});

// Centralized message router & multi-frame session coordinator
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CS_TRIGGER_MODE') {
    const targetTabId = message.tabId || sender.tab?.id;
    const selectedMode = message.mode || 'instant';
    const targetRetailer = message.retailer || null;
    if (!targetTabId) return;

    chrome.tabs.get(targetTabId, async (tab) => {
      if (!tab) return;
      const currentRetailer = detectRetailerFromUrl(tab.url);
      const isMatchingRetailer = !targetRetailer || targetRetailer === currentRetailer;
      const isAlreadyOnCoupons = isMatchingRetailer && tab.url && (
        tab.url.includes("coupon") || 
        tab.url.includes("offers") || 
        tab.url.includes("savings") || 
        tab.url.includes("circular")
      );

      if (isAlreadyOnCoupons) {
        await injectAndStartLoader(targetTabId, selectedMode);
      } else {
        const dest = message.targetUrl || resolveTargetUrl(tab.url, targetRetailer);
        await chrome.tabs.update(targetTabId, { url: dest });

        const navListener = (navTabId, changeInfo) => {
          if (navTabId === targetTabId && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(navListener);
            setTimeout(async () => {
              await injectAndStartLoader(targetTabId, selectedMode);
            }, 2500);
          }
        };
        chrome.tabs.onUpdated.addListener(navListener);
      }
    });
    sendResponse({ success: true, mode: selectedMode });
    return true;
  }

  const tabId = sender.tab?.id;
  if (!tabId) return;

  let session = activeSessions.get(tabId) || {
    totalClipped: 0,
    activeLeaderFrameId: null,
    isRunning: false
  };

  if (message.type === 'CS_CLAIM_CLIPPER') {
    const frameId = sender.frameId ?? 0;
    const count = message.buttonCount || 0;

    if (session.activeLeaderFrameId === frameId) {
      sendResponse({ isLeader: true, sessionClipped: session.totalClipped });
      return true;
    }

    if (session.activeLeaderFrameId === null && count > 0) {
      session.activeLeaderFrameId = frameId;
      session.isRunning = true;
      activeSessions.set(tabId, session);
      console.log(\`[Background] Tab \${tabId}: Frame \${frameId} elected as active clipper leader (\${count} buttons)\`);
      sendResponse({ isLeader: true, sessionClipped: session.totalClipped });
      return true;
    }

    sendResponse({ isLeader: false, sessionClipped: session.totalClipped });
    return true;
  }

  if (message.type === 'CS_COUPON_CLIPPED') {
    session.totalClipped += (message.count || 1);
    session.isRunning = true;
    activeSessions.set(tabId, session);

    chrome.tabs.sendMessage(tabId, {
      type: 'CS_UPDATE_AGGREGATE_COUNT',
      totalClipped: session.totalClipped,
      status: message.status || \`Clipped #\${session.totalClipped} offer...\`,
      title: message.title
    }).catch(() => {});
  }

  if (message.type === 'CS_STOP_BROADCAST') {
    if (activeSessions.has(tabId)) {
      const session = activeSessions.get(tabId);
      session.isRunning = false;
      session.activeLeaderFrameId = null;
      activeSessions.set(tabId, session);
    }
  }

  if (message.type === 'CS_CLIPPER_FINISHED') {
    const allAlreadyLoaded = message.allAlreadyLoaded || (session.totalClipped === 0);
    session.isRunning = false;
    session.activeLeaderFrameId = null;
    activeSessions.set(tabId, session);

    chrome.tabs.sendMessage(tabId, {
      type: 'CS_SESSION_COMPLETE',
      totalClipped: session.totalClipped,
      stopped: message.stopped || false,
      allAlreadyLoaded: allAlreadyLoaded
    }).catch(() => {});
  }

  if (message.type === 'CS_QUERY_STATUS') {
    sendResponse({
      isRunning: session.isRunning,
      clipped: session.totalClipped
    });
    return true;
  }
});

async function injectAndStartLoader(tabId, mode = CONFIG.clippingStrategy) {
  try {
    activeSessions.set(tabId, {
      totalClipped: 0,
      activeLeaderFrameId: null,
      isRunning: true
    });

    // Only inject into subframes for ShopRite (where Wakefern embeds the coupon app).
    // For Kroger, Walgreens, CVS, and Family Dollar, coupon controls are in the top window.
    // Injecting into subframes on Kroger triggers Dynatrace/PerimeterX sandbox errors and crashes the page!
    let needAllFrames = false;
    try {
      const tab = await chrome.tabs.get(tabId);
      const ret = detectRetailerFromUrl(tab?.url || '');
      needAllFrames = (ret === 'shoprite');
    } catch (e) {}

    await chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: needAllFrames },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tabId, { type: 'CS_START', auto: true, mode: mode || 'instant' }, () => {
      if (chrome.runtime.lastError) {}
    });
  } catch (err) {
    console.error("Failed to inject coupon loader:", err);
  }
}
`;

  const contentJs = `// CouponSweep - Stealth Content Script (Manifest V3)
// Works for ShopRite, Walgreens, Kroger, CVS, and Family Dollar

(function() {
  // 1. Strict Sandbox & Bot-Defense Isolation Guard
  // Immediately abort if executed in sandboxed about:blank, data:, blob:, or non-http contexts
  if (!window.location || 
      !window.location.protocol || 
      window.location.protocol === 'about:' || 
      window.location.href === 'about:blank' ||
      window.location.protocol === 'data:' || 
      window.location.protocol === 'blob:' ||
      window.location.protocol === 'chrome-extension:') {
    return;
  }

  let isTopFrame = false;
  try {
    isTopFrame = (window.self === window.top);
  } catch (e) {
    return;
  }

  const currentUrl = (window.location.href || '').toLowerCase();
  
  // Detect active retailer profile
  const isWalgreens = currentUrl.includes('walgreens.com');
  const isShopRite = currentUrl.includes('shoprite.com') || currentUrl.includes('wakefern.com') || currentUrl.includes('priceplus');
  const isFamilyDollar = currentUrl.includes('familydollar.com');
  const isCVS = currentUrl.includes('cvs.com');
  const isKroger = currentUrl.includes('kroger.com');

  // CRITICAL ANTI-DETECTION GUARD FOR KROGER & BOT MONITORS:
  // On Kroger, Walgreens, CVS, and Family Dollar, coupon buttons are strictly in the top window.
  // Kroger embeds Dynatrace OneAgent (ruxitagentjs) and PerimeterX (ZpTgQWYBw).
  // These sensors spin up hidden sandboxed about:blank frames to inspect execution context.
  // Executing extension code in subframes breaches their sandbox, causing 'Blocked script execution in about:blank'
  // and triggering recursive error handling loops that crash the page with 'RangeError: Maximum call stack size exceeded'!
  if (!isShopRite && !isTopFrame) {
    return;
  }

  // Prevent multiple injections using content script isolated world scope (clean, safe, no window prototype pollution)
  if (window.__cs_active) {
    return;
  }
  window.__cs_active = true;

  const retailerName = isWalgreens ? 'Walgreens' : (isShopRite ? 'ShopRite' : (isFamilyDollar ? 'Family Dollar' : (isCVS ? 'CVS' : (isKroger ? 'Kroger' : 'Retailer'))));
  const programName = isWalgreens ? 'myWalgreens™' : (isShopRite ? 'Price Plus®' : (isFamilyDollar ? 'Smart Coupons' : (isCVS ? 'ExtraCare®' : (isKroger ? 'Shopper\\'s Card' : 'Loyalty Card'))));

  // Stealth logger: do NOT spew [CouponSweep] identifiers into the page console where Kroger/PerimeterX inspects
  const DEBUG = false;
  const csLog = (...args) => { if (DEBUG) console.log('[CouponSweep]', ...args); };

  let isRunning = false;
  let shouldStop = false;
  let localClipped = 0;
  let aggregateClipped = 0;
  let hudElement = null;
  let currentStrategy = ${JSON.stringify(config.clippingStrategy)} || 'instant';
  const processedElements = new WeakSet();

  const sleep = m => new Promise(r => setTimeout(r, m));

  const CONFIG = {
    clickDelay: ${Number(config.clickDelay)},
    scrollDelay: ${Number(config.scrollDelay)},
    glideDelay: ${Number(config.glideDelay)},
    scrollStep: ${Number(config.scrollStep)},
    showHud: ${Boolean(config.showHud)},
    showAlert: ${Boolean(config.showAlert)},
    clippingStrategy: ${JSON.stringify(config.clippingStrategy)},
    overrideLoginCheck: ${Boolean(config.overrideLoginCheck)},
    keywords: ${JSON.stringify(config.customKeywords.length > 0 ? config.customKeywords : [
      'load coupon', 'clip coupon', 'add to card', 'clip', 'clip offer', 'load offer',
      'load to card', 'save to card', 'clip to card', 'add offer', 'save offer', 'load', 
      'clip digital coupon', 'clip deal', 'clip & save', 'clip and save'
    ])}
  };

  // Build retailer-specific HUD badge
  function getRetailerBadgeHtml() {
    if (isShopRite) {
      const rsidMatch = window.location.href.match(new RegExp('/rsid/([a-zA-Z0-9_-]+)', 'i'));
      const storeId = rsidMatch ? rsidMatch[1] : '218';
      return '<span style="color: #475569; font-size: 11px; font-weight: 700; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px;">• Store #' + storeId + '</span>';
    }
    if (isWalgreens) {
      return '<span style="color: #475569; font-size: 11px; font-weight: 700; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px;">• myWalgreens™</span>';
    }
    if (isFamilyDollar) {
      return '<span style="color: #475569; font-size: 11px; font-weight: 700; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px;">• Smart Coupons</span>';
    }
    if (isCVS) {
      return '<span style="color: #475569; font-size: 11px; font-weight: 700; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px;">• ExtraCare®</span>';
    }
    if (isKroger) {
      return '<span style="color: #475569; font-size: 11px; font-weight: 700; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px;">• Shopper\\'s Card</span>';
    }
    return '<span style="color: #475569; font-size: 11px; font-weight: 700; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px;">• Digital Offers</span>';
  }

  // In top window, display and update the floating status HUD
  function createOrUpdateHud(statusText, count, isWarning = false) {
    if (!CONFIG.showHud || !isTopFrame) return;

    const retailerBadgeHtml = getRetailerBadgeHtml();

    if (!hudElement) {
      hudElement = document.createElement('div');
      hudElement.id = 'cs-coupon-loader-hud';
      hudElement.innerHTML = [
        '<div style="',
        '  position: fixed;',
        '  bottom: 28px;',
        '  right: 28px;',
        '  z-index: 2147483647;',
        '  background: #ffffff;',
        '  color: #0f172a;',
        '  border: 1px solid #cbd5e1;',
        '  border-radius: 16px;',
        '  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 10px 10px -5px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05);',
        '  padding: 14px 18px;',
        '  font-family: -apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, sans-serif;',
        '  display: flex;',
        '  align-items: center;',
        '  gap: 14px;',
        '  min-width: 360px;',
        '  max-width: 520px;',
        '  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);',
        '">',
        '  <div style="position: relative; flex-shrink: 0;">',
        '    <div style="',
        '      width: 10px;',
        '      height: 10px;',
        '      border-radius: 50%;',
        '      background: #0f172a;',
        '      box-shadow: 0 0 10px rgba(15, 23, 42, 0.5);',
        '      animation: csPulse 2s infinite;',
        '    " id="cs-hud-indicator"></div>',
        '  </div>',
        '  <div style="flex: 1; min-width: 0;">',
        '    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">',
        '      <span style="font-weight: 800; color: #0f172a; font-size: 13.5px; letter-spacing: -0.01em;">CouponSweep</span>',
        '      ' + retailerBadgeHtml,
        '      <button id="cs-hud-mode-toggle" style="',
        '        background: #f1f5f9;',
        '        color: #334155;',
        '        border: 1px solid #cbd5e1;',
        '        border-radius: 6px;',
        '        padding: 2px 7px;',
        '        font-size: 10px;',
        '        font-weight: 700;',
        '        cursor: pointer;',
        '        margin-left: auto;',
        '        transition: all 0.2s;',
        '      " title="Toggle clipping strategy">' + (currentStrategy === 'instant' ? '⚡ Instant' : '🎬 Step-by-Step') + '</button>',
        '    </div>',
        '    <div id="cs-hud-status" style="color: #475569; font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + statusText + '</div>',
        '  </div>',
        '  <div id="cs-hud-count-box" style="text-align: center; flex-shrink: 0; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 10px; min-width: 76px;">',
        '    <div id="cs-hud-count" style="font-size: 20px; font-weight: 900; color: #0f172a; line-height: 1; font-variant-numeric: tabular-nums;">' + count + '</div>',
        '    <div id="cs-hud-count-label" style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-top: 3px; letter-spacing: 0.04em;">clipped</div>',
        '  </div>',
        '  <button id="cs-hud-override-btn" style="',
        '    display: ' + (isWarning || (statusText && statusText.toLowerCase().includes('sign in')) ? 'inline-block' : 'none') + ';',
        '    background: #0f172a;',
        '    color: #ffffff;',
        '    border: 1px solid #334155;',
        '    border-radius: 8px;',
        '    padding: 7px 11px;',
        '    font-size: 11.5px;',
        '    font-weight: 700;',
        '    cursor: pointer;',
        '    transition: all 0.15s ease;',
        '  " title="Override login check and clip offers immediately">⚡ Override</button>',
        '  <button id="cs-hud-stop-btn" style="',
        '    background: #f8fafc;',
        '    color: #475569;',
        '    border: 1px solid #cbd5e1;',
        '    border-radius: 8px;',
        '    padding: 7px 12px;',
        '    font-size: 11.5px;',
        '    font-weight: 700;',
        '    cursor: pointer;',
        '    transition: all 0.15s ease;',
        '  ">Stop</button>',
        '</div>',
        '<style>',
        '  @keyframes csPulse {',
        '    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.6); }',
        '    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(15, 23, 42, 0); }',
        '    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }',
        '  }',
        '  #cs-hud-stop-btn:hover { background: #e2e8f0; color: #0f172a; border-color: #94a3b8; }',
        '  #cs-hud-stop-btn:active { transform: translateY(0); }',
        '  #cs-hud-override-btn:hover { background: #1e293b; color: #38bdf8; border-color: #475569; }',
        '  #cs-hud-mode-toggle:hover { background: #e2e8f0; color: #0f172a; }',
        '</style>'
      ].join('\\n');
      document.body.appendChild(hudElement);

      const hudOverrideBtn = hudElement.querySelector('#cs-hud-override-btn');
      if (hudOverrideBtn) {
        hudOverrideBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.__cs_login_overridden = true;
          try { sessionStorage.setItem('__cs_login_override', 'true'); } catch (err) {}
          hudOverrideBtn.style.display = 'none';
          const banner = document.getElementById('cs-login-required-banner');
          if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
          updateStatus('⚡ Login check overridden! Scanning for offers...', count);
          if (!isRunning) {
            startLoader(currentStrategy);
          }
        });
      }

      const stopBtn = hudElement.querySelector('#cs-hud-stop-btn');
      if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          shouldStop = true;
          isRunning = false;
          updateStatus('Stopping loader...', count);
          try {
            chrome.runtime.sendMessage({ type: 'CS_STOP_BROADCAST' });
          } catch (err) {}
        });
      }

      const modeToggle = hudElement.querySelector('#cs-hud-mode-toggle');
      if (modeToggle) {
        modeToggle.addEventListener('click', () => {
          currentStrategy = currentStrategy === 'instant' ? 'individual' : 'instant';
          modeToggle.textContent = currentStrategy === 'instant' ? '⚡ Instant' : '🎬 Step-by-Step';
          updateStatus(
            currentStrategy === 'instant' ? '⚡ Switched to Instant mode' : '🎬 Switched to Step-by-Step mode',
            count
          );
        });
      }
    } else {
      const statusEl = hudElement.querySelector('#cs-hud-status');
      const countEl = hudElement.querySelector('#cs-hud-count');
      const countBox = hudElement.querySelector('#cs-hud-count-box');
      const countLabel = hudElement.querySelector('#cs-hud-count-label');
      const indicator = hudElement.querySelector('#cs-hud-indicator');
      const modeToggle = hudElement.querySelector('#cs-hud-mode-toggle');
      if (statusEl) statusEl.textContent = statusText;
      if (countEl) {
        if (count === 'Up to Date' || statusText.toLowerCase().includes('up to date')) {
          countEl.textContent = '✓';
          countEl.style.fontSize = '16px';
          countEl.style.color = '#059669';
          if (countBox) {
            countBox.style.background = '#ecfdf5';
            countBox.style.borderColor = '#a7f3d0';
          }
          if (countLabel) {
            countLabel.textContent = 'Up to Date';
            countLabel.style.color = '#059669';
          }
        } else {
          countEl.textContent = count;
          countEl.style.fontSize = '18px';
          countEl.style.color = '#0f172a';
          if (countLabel) {
            countLabel.textContent = 'clipped';
            countLabel.style.color = '#64748b';
          }
          if (countBox) {
            countBox.style.background = '#f8fafc';
            countBox.style.borderColor = '#e2e8f0';
          }
        }
      }
      if (modeToggle) modeToggle.textContent = currentStrategy === 'instant' ? '⚡ Instant' : '🎬 Step-by-Step';
      const hudOverrideBtn = hudElement.querySelector('#cs-hud-override-btn');
      if (hudOverrideBtn) {
        const isLoginWarning = isWarning || (statusText && (statusText.toLowerCase().includes('sign in') || statusText.toLowerCase().includes('loyalty status')));
        hudOverrideBtn.style.display = isLoginWarning ? 'inline-block' : 'none';
      }
      if (indicator) {
        indicator.style.background = isWarning ? '#e11d48' : '#0f172a';
        indicator.style.boxShadow = isWarning ? '0 0 10px rgba(225, 29, 72, 0.5)' : '0 0 10px rgba(15, 23, 42, 0.5)';
      }
    }
  }

  function removeHud() {
    if (hudElement && hudElement.parentNode) {
      hudElement.parentNode.removeChild(hudElement);
      hudElement = null;
    }
  }

  // Celebratory Banner on Completion
  function showCompletionBanner(count, stopped = false, isAllLoaded = false) {
    if (!isTopFrame) return;

    try {
      const hud = document.getElementById('cs-coupon-loader-hud');
      if (hud && hud.parentNode) {
        hud.parentNode.removeChild(hud);
      }

      const existing = document.getElementById('cs-completion-banner');
      if (existing) existing.remove();

      const banner = document.createElement('div');
      banner.id = 'cs-completion-banner';
      banner.style.cssText = [
        'position: fixed;',
        'top: 0;',
        'left: 0;',
        'width: 100vw;',
        'height: 100vh;',
        'background: rgba(15, 23, 42, 0.45);',
        'backdrop-filter: blur(4px);',
        'z-index: 2147483647;',
        'display: flex;',
        'align-items: center;',
        'justify-content: center;',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
        'opacity: 0;',
        'animation: csFadeIn 0.3s ease forwards;'
      ].join(' ');

      const isUpToDate = (count === 0 || isAllLoaded) && !stopped;
      const headerTitle = stopped ? 'Session Paused' : (isUpToDate ? 'Up to Date!' : 'All Set & Loaded!');
      const iconGradient = isUpToDate ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0f172a, #1e293b)';
      const iconShadow = isUpToDate ? '0 8px 16px -4px rgba(5, 150, 105, 0.4)' : '0 8px 16px -4px rgba(15, 23, 42, 0.4)';
      const iconStroke = isUpToDate ? '#a7f3d0' : '#cbd5e1';

      banner.innerHTML = [
        '<div style="background: #ffffff; border-radius: 24px; width: 360px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); transform: scale(0.95); animation: csPopIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; position: relative;">',
        '  <div style="background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%); padding: 36px 24px 24px; text-align: center; position: relative; border-bottom: 1px solid #dbeafe;">',
        '    <button id="cs-banner-close" style="position: absolute; top: 16px; right: 16px; background: #e0e7ff; border: none; width: 28px; height: 28px; border-radius: 50%; color: #4f46e5; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">',
        '      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>',
        '    </button>',
        '    <div style="width: 64px; height: 64px; background: ' + iconGradient + '; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; box-shadow: ' + iconShadow + '; border: 2px solid ' + iconStroke + ';">',
        '      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        '    </div>',
        '    <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">' + headerTitle + '</h2>',
        '    <div style="margin-top: 10px; display: inline-flex; align-items: center; gap: 4px; ' + (isUpToDate ? 'background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669;' : 'background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb;') + ' padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">',
        '      ' + (isUpToDate ? '✓ ALL ' + programName.toUpperCase() + ' COUPONS LOADED' : programName.toUpperCase() + ' SAVINGS ACTIVE'),
        '    </div>',
        '  </div>',
        '  <div style="padding: 24px; text-align: center;">',
        '    <div style="display: ' + (isUpToDate ? 'none' : 'flex') + '; align-items: baseline; justify-content: center; gap: 6px; margin-bottom: 12px;">',
        '      <span style="font-size: 48px; font-weight: 900; color: #0f172a; line-height: 1; letter-spacing: -2px;">' + count + '</span>',
        '      <span style="font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Coupons</span>',
        '    </div>',
        '    <p style="margin: 0 0 24px 0; font-size: 13px; color: #475569; line-height: 1.5; font-weight: 500;">',
        '      ' + (isUpToDate ? 'Up to date — all digital coupons are loaded to your ' + retailerName + ' (' + programName + ') account. No new offers to clip at this time.' : 'Successfully loaded to your ' + retailerName + ' account. All discounts will automatically apply at checkout.'),
        '    </p>',
        '    <button id="cs-banner-ok" style="width: 100%; padding: 14px; background: #0f172a; color: #ffffff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); display: flex; align-items: center; justify-content: center; gap: 8px;">',
        '      ✓ Got it, Thanks!',
        '    </button>',
        '    <div style="margin-top: 12px; font-size: 11px; color: #94a3b8; font-weight: 600;" id="cs-banner-countdown">Auto-dismissing in 12s</div>',
        '  </div>',
        '  <div style="background: #f1f5f9; height: 4px; width: 100%;">',
        '    <div id="cs-banner-progress" style="background: #4f46e5; height: 100%; width: 100%; transition: width 1s linear;"></div>',
        '  </div>',
        '</div>',
        '<style>',
        '  @keyframes csFadeIn { from { opacity: 0; } to { opacity: 1; } }',
        '  @keyframes csPopIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
        '  #cs-banner-ok:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }',
        '  #cs-banner-ok:active { transform: translateY(0); }',
        '  #cs-banner-close:hover { background: #c7d2fe; transform: scale(1.05); }',
        '</style>'
      ].join('\\n');

      document.body.appendChild(banner);

      let timeLeft = 12;
      let countdownInterval = null;

      const dismiss = (e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        if (countdownInterval) clearInterval(countdownInterval);
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.25s';
        setTimeout(() => {
          if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 300);
      };

      const closeBtn = banner.querySelector('#cs-banner-close');
      const okBtn = banner.querySelector('#cs-banner-ok');
      const countdownEl = banner.querySelector('#cs-banner-countdown');
      const progressEl = banner.querySelector('#cs-banner-progress');
      
      if (closeBtn) closeBtn.addEventListener('click', dismiss);
      if (okBtn) okBtn.addEventListener('click', dismiss);

      countdownInterval = setInterval(() => {
        timeLeft--;
        if (countdownEl) countdownEl.textContent = 'Auto-dismissing in ' + timeLeft + 's';
        if (progressEl) progressEl.style.width = ((timeLeft / 12) * 100) + '%';
        if (timeLeft <= 0) dismiss();
      }, 1000);
    } catch (e) {
      console.warn("Could not render completion banner:", e);
    }
  }

  // Akamai EdgeSuite / WAF Rate Limit Detection & Recovery Helper
  function showAkamaiRecoveryBanner(referenceId) {
    if (!isTopFrame) return;

    try {
      const existing = document.getElementById('cs-akamai-recovery-banner');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      const banner = document.createElement('div');
      banner.id = 'cs-akamai-recovery-banner';
      banner.style.cssText = [
        'position: fixed;',
        'top: 0;',
        'left: 0;',
        'width: 100vw;',
        'height: 100vh;',
        'background: rgba(15, 23, 42, 0.75);',
        'backdrop-filter: blur(6px);',
        'z-index: 2147483647;',
        'display: flex;',
        'align-items: center;',
        'justify-content: center;',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
        'animation: csFadeIn 0.25s ease forwards;'
      ].join(' ');

      banner.innerHTML = [
        '<div style="background: #ffffff; border-radius: 24px; width: 490px; max-width: 92vw; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); transform: scale(0.95); animation: csPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; position: relative; border: 1px solid #cbd5e1; color: #0f172a;">',
        '  <div style="background: #f8fafc; padding: 26px 24px 18px; text-align: center; position: relative; border-bottom: 1px solid #e2e8f0;">',
        '    <button id="cs-akamai-close" style="position: absolute; top: 16px; right: 16px; background: #f1f5f9; border: none; width: 28px; height: 28px; border-radius: 50%; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; transition: all 0.2s;">✕</button>',
        '    <div style="width: 54px; height: 54px; background: #0f172a; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.3);">',
        '      <span style="font-size: 24px;">🛡️</span>',
        '    </div>',
        '    <h2 style="margin: 0; font-size: 19px; font-weight: 800; color: #0f172a; letter-spacing: -0.4px;">Walgreens Rate Limit (Access Denied) Detected</h2>',
        '    <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 4px; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 6px; color: #475569; font-size: 11px; font-weight: 700;">',
        '      AKAMAI EDGESUITE PROTECTION ' + (referenceId ? ('• ' + referenceId) : ''),
        '    </div>',
        '  </div>',
        '  <div style="padding: 22px 24px;">',
        '    <p style="margin: 0 0 14px 0; font-size: 13.5px; color: #334155; line-height: 1.5;">',
        '      Walgreens uses Akamai anti-bot defense. When requests are sent too rapidly, Akamai issues a temporary rate-limit lock (HTTP 403).',
        '    </p>',
        '    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 18px; display: flex; flex-direction: column; gap: 10px;">',
        '      <div style="display: flex; gap: 10px; align-items: flex-start;">',
        '        <div style="background: #0f172a; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; margin-top: 1px;">1</div>',
        '        <div style="font-size: 12.5px; color: #334155; line-height: 1.4;"><strong style="color: #0f172a;">Wait 5–10 Minutes</strong>: Akamai automatically resets the temporary cooldown block for your IP.</div>',
        '      </div>',
        '      <div style="display: flex; gap: 10px; align-items: flex-start;">',
        '        <div style="background: #0f172a; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; margin-top: 1px;">2</div>',
        '        <div style="font-size: 12.5px; color: #334155; line-height: 1.4;"><strong style="color: #0f172a;">Clear Walgreens Cookies / Use Incognito</strong>: Delete <code>_abck</code> and <code>bm_sz</code> cookies in Chrome Settings → Privacy to clear the bot token immediately.</div>',
        '      </div>',
        '      <div style="display: flex; gap: 10px; align-items: flex-start;">',
        '        <div style="background: #0f172a; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; margin-top: 1px;">3</div>',
        '        <div style="font-size: 12.5px; color: #334155; line-height: 1.4;"><strong style="color: #0f172a;">Use Safe Stealth Mode</strong>: CouponSweep now includes built-in human stealth delays & random micro-pauses for Walgreens.</div>',
        '      </div>',
        '    </div>',
        '    <div style="display: flex; flex-direction: column; gap: 8px;">',
        '      <button id="cs-akamai-reload-btn" style="width: 100%; padding: 12px; background: #0f172a; color: #ffffff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">',
        '        🔄 Reload Walgreens Offers Page',
        '      </button>',
        '      <button id="cs-akamai-dismiss-btn" style="width: 100%; padding: 10px; background: #f8fafc; color: #64748b; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 12.5px; font-weight: 600; cursor: pointer;">',
        '        Dismiss Notice',
        '      </button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\\n');

      document.body.appendChild(banner);

      const dismiss = () => {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.2s';
        setTimeout(() => {
          if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 250);
      };

      const closeBtn = banner.querySelector('#cs-akamai-close');
      const dismissBtn = banner.querySelector('#cs-akamai-dismiss-btn');
      const reloadBtn = banner.querySelector('#cs-akamai-reload-btn');

      if (closeBtn) closeBtn.addEventListener('click', dismiss);
      if (dismissBtn) dismissBtn.addEventListener('click', dismiss);
      if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
          window.location.href = 'https://www.walgreens.com/offers/offers.jsp?ban=dl_dlsp_MegaMenu_Coupons';
        });
      }
    } catch (e) {
      console.warn('Could not render akamai recovery banner:', e);
    }
  }

  // Retailer Login Required Notification Modal
  function showLoginRequiredBanner() {
    if (!isTopFrame) return;

    try {
      const existing = document.getElementById('cs-login-required-banner');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      const banner = document.createElement('div');
      banner.id = 'cs-login-required-banner';
      banner.style.cssText = [
        'position: fixed;',
        'top: 0;',
        'left: 0;',
        'width: 100vw;',
        'height: 100vh;',
        'background: rgba(15, 23, 42, 0.65);',
        'backdrop-filter: blur(4px);',
        'z-index: 2147483647;',
        'display: flex;',
        'align-items: center;',
        'justify-content: center;',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
        'animation: csFadeIn 0.25s ease forwards;'
      ].join(' ');

      banner.innerHTML = [
        '<div style="background: #ffffff; border-radius: 24px; width: 420px; max-width: 90vw; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); transform: scale(0.95); animation: csPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; position: relative;">',
        '  <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 32px 24px 20px; text-align: center; position: relative; border-bottom: 1px solid #bfdbfe;">',
        '    <button id="cs-login-close" style="position: absolute; top: 16px; right: 16px; background: #dbeafe; border: none; width: 28px; height: 28px; border-radius: 50%; color: #2563eb; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; transition: all 0.2s;">✕</button>',
        '    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.4); border: 2px solid #93c5fd;">',
        '      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        '    </div>',
        '    <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">' + retailerName + ' Sign In Required</h2>',
        '    <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 4px; background: #eff6ff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 8px; color: #1d4ed8; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">',
        '      ' + programName.toUpperCase() + ' ACCOUNT',
        '    </div>',
        '  </div>',
        '  <div style="padding: 24px; text-align: center;">',
        '    <p style="margin: 0 0 14px 0; font-size: 16px; font-weight: 800; color: #1d4ed8; line-height: 1.4;">',
        '      Please sign in to your ' + retailerName + ' account to load coupons',
        '    </p>',
        '    <p style="margin: 0 0 22px 0; font-size: 13px; color: #475569; line-height: 1.5;">',
        '      We detected that you are currently signed out. Digital offers must be linked to your ' + retailerName + ' (' + programName + ') loyalty card so savings can automatically apply at checkout.',
        '    </p>',
        '    <div style="display: flex; flex-direction: column; gap: 10px;">',
        '      <button id="cs-login-signin-btn" style="width: 100%; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.25); display: flex; align-items: center; justify-content: center; gap: 8px;">',
        '        🔑 Click Here to Sign In / Register',
        '      </button>',
        '      <button id="cs-login-override-btn" style="width: 100%; padding: 12px; background: #0f172a; color: #ffffff; border: 1px solid #334155; border-radius: 12px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px;">',
        '        ⚡ Override Login Check & Clip Anyway',
        '      </button>',
        '      <button id="cs-login-dismiss-btn" style="width: 100%; padding: 10px; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">',
        '        Dismiss',
        '      </button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\\n');

      document.body.appendChild(banner);

      const dismiss = () => {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.2s';
        setTimeout(() => {
          if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 250);
      };

      const closeBtn = banner.querySelector('#cs-login-close');
      const dismissBtn = banner.querySelector('#cs-login-dismiss-btn');
      const signinBtn = banner.querySelector('#cs-login-signin-btn');
      const overrideBtn = banner.querySelector('#cs-login-override-btn');

      if (closeBtn) closeBtn.addEventListener('click', dismiss);
      if (dismissBtn) dismissBtn.addEventListener('click', dismiss);

      if (overrideBtn) {
        overrideBtn.addEventListener('click', () => {
          window.__cs_login_overridden = true;
          try { sessionStorage.setItem('__cs_login_override', 'true'); } catch (err) {}
          dismiss();
          updateStatus('⚡ Login check overridden! Scanning for offers...', aggregateClipped || localClipped || 0);
          if (!isRunning) {
            startLoader(currentStrategy);
          }
        });
      }

      if (signinBtn) {
        signinBtn.addEventListener('click', () => {
          dismiss();
          // Find and click retailer's Sign In button
          const target = document.querySelector('[data-testid="header-sub-title-testId"], #signInBtn, [data-element-name="Sign In"], .wag-signin-btn, .sign-in-link, a[href*="login"], a[href*="signin"]') ||
                         Array.from(document.querySelectorAll('a, button, span')).find(el => {
                           const t = (el.textContent || '').trim().toLowerCase();
                           return t.includes('sign in or register') || t === 'sign in' || t === 'log in';
                         });
          if (target) {
            const clickable = target.closest('button, a') || target;
            clickable.click();
            clickable.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    } catch (e) {
      console.warn('Could not render login required banner:', e);
    }
  }

  function updateStatus(status, count, isWarning = false) {
    createOrUpdateHud(status, count, isWarning);
    try {
      chrome.runtime.sendMessage({
        type: 'CS_PROGRESS',
        status: status,
        clipped: count,
        isRunning: isRunning
      });
    } catch (e) {}
  }

  // Deep element query across DOM, shadow roots, and child frames
  function queryAllDeep(selector, root = document) {
    let elements = [];
    try {
      elements = Array.from(root.querySelectorAll(selector));
    } catch (e) {}

    try {
      const walker = document.createTreeWalker(
        root.body || root,
        NodeFilter.SHOW_ELEMENT
      );
      let node;
      while ((node = walker.nextNode())) {
        if (node.tagName === 'IFRAME' || node.tagName === 'FRAME' || node.tagName === 'OBJECT') {
          continue;
        }
        if (node.shadowRoot) {
          elements = elements.concat(queryAllDeep(selector, node.shadowRoot));
        }
      }
    } catch (e) {}

    // ONLY inspect child iframes on ShopRite (where Wakefern embeds the digital coupons app).
    // NEVER touch or probe iframes on Kroger, Walgreens, CVS, or Family Dollar.
    if (isShopRite && root === document) {
      try {
        const iframes = document.querySelectorAll('iframe, frame');
        for (const iframe of iframes) {
          try {
            if (iframe.hasAttribute('sandbox') || !iframe.src || iframe.src === 'about:blank') {
              continue;
            }
            const src = (iframe.src || '').toLowerCase();
            if (src.includes('shoprite.com') || src.includes('wakefern.com') || src.includes('priceplus')) {
              if (iframe.contentDocument) {
                elements = elements.concat(queryAllDeep(selector, iframe.contentDocument));
              }
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    return elements;
  }

  // Test if an element is a genuine unclipped coupon button on ShopRite, Walgreens, or Kroger
  function isCouponButton(el) {
    if (!el) return false;
    if (el.getAttribute('data-cs-processed') === 'true' || processedElements.has(el)) return false;

    // 1. Exclude extension UI
    if (el.closest && el.closest('#cs-coupon-loader-hud, #cs-mode-modal, [id^="cs-"], [class*="cs-"]')) {
      return false;
    }

    // 2. Exclude headers, nav, footers
    if (el.closest && el.closest('header, nav, footer, [role="navigation"], [role="tablist"], [role="tab"], .site-header, .navbar, .site-footer, .breadcrumb, .menu, .sidebar-nav')) {
      return false;
    }

    // 3. Exclude disabled or hidden
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    if (el.offsetParent === null && el.getClientRects && el.getClientRects().length === 0) return false;

    // 4. Exclude standard link navigation
    const tag = el.tagName.toLowerCase();
    if (tag === 'a') {
      const href = (el.getAttribute('href') || '').trim();
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        return false;
      }
    }

    const rawText = (el.innerText || el.textContent || '').trim();
    const rawAria = (el.getAttribute('aria-label') || '').trim();
    const cleanText = rawText.replace(/[+\\r\\n\\t\\s]+/g, ' ').trim().toLowerCase();
    const cleanAria = rawAria.replace(/[+\\r\\n\\t\\s]+/g, ' ').trim().toLowerCase();
    const combined = (cleanText + ' ' + cleanAria).trim();

    // 5. Exclude Pagination / Load More
    const isPaginationOrLoadMore = combined.includes('load more') || combined.includes('show more') ||
      combined.includes('view more') || combined.includes('see more') || combined.includes('load all') ||
      combined.includes('more coupons') || combined.includes('more offers') || combined.includes('load 30') ||
      combined.includes('load 35') || combined.includes('load next') || combined.includes('next page') ||
      combined.includes('show 30') || combined.includes('show 35') || combined.includes('show next');
    if (isPaginationOrLoadMore) return false;

    // 6. Direct rejection of already clipped or non-clip buttons
    if (
      cleanText === 'clipped' || cleanText === 'loaded' || cleanText === 'already clipped' || cleanText === 'already loaded' ||
      cleanText === 'added' || cleanText === 'in card' || cleanText === 'on card' || cleanText === 'sent to card' || cleanText.includes('unclip') || cleanText === 'remove' ||
      cleanText.startsWith('clipped') || cleanText.startsWith('loaded') || cleanText.includes('clipped ✓') || cleanText.includes('loaded ✓') ||
      cleanText.includes('coupon clipped') || cleanText.includes('offer clipped') ||
      cleanText.includes('login to load') || cleanText.includes('sign in to load') || cleanText.includes('sign in to clip') ||
      cleanText === 'sign in' || cleanText === 'log in' || cleanText === 'sign up' || cleanText === 'register' ||
      cleanText === 'add to cart' || cleanText === 'add to list' || cleanText === 'shop now' || cleanText === 'view items' ||
      cleanText === 'terms' || cleanText === 'details' || cleanText === 'close' || cleanText === 'clear'
    ) {
      return false;
    }

    if (cleanAria === 'clipped' || cleanAria === 'loaded' || cleanAria === 'sent to card' || cleanAria.startsWith('already clipped') || cleanAria.startsWith('already loaded') || cleanAria.includes('unclip') || cleanAria.includes('remove')) {
      return false;
    }
    
    if (el.classList.contains('unclip') || el.classList.contains('is-clipped') || el.classList.contains('is-loaded') || el.classList.contains('wag-btn-clipped') || el.getAttribute('data-element-name') === 'Clipped') {
      return false;
    }

    // Kroger specific rejection for already clipped state or active state
    if (isKroger && (
      cleanText.includes('clipped') || cleanAria.includes('clipped') ||
      el.getAttribute('data-element-name') === 'Clipped' ||
      el.getAttribute('aria-pressed') === 'true'
    )) {
      return false;
    }

    // 7. Positive Coupon Clipping Action Verification (ShopRite & Walgreens & Kroger)
    const hasExactCouponText = 
      /^(clip|load|clip coupon|load coupon|clip to card|load to card|add to card|save to card|clip offer|load offer|clip digital coupon|load digital coupon|clip deal|load deal|add coupon|clip & save|clip and save)$/i.test(cleanText) ||
      /^(clip|load|clip coupon|load coupon|clip to card|load to card|add to card|save to card|clip offer|load offer|clip digital coupon|load digital coupon|clip deal|load deal|add coupon|clip & save|clip and save)$/i.test(cleanAria);

    // Walgreens specific clip patterns: e.g. "Clip $2.00 off", "Clip $1.50 off", "Clip deal", "Clip offer"
    const hasWalgreensClipFormat = 
      /^clip(\\s+\\$\\d+(\\.\\d{2})?.*|\\s+deal|\\s+offer|\\s+coupon)?$/i.test(cleanText) ||
      /^clip(\\s+\\$\\d+(\\.\\d{2})?.*|\\s+deal|\\s+offer|\\s+coupon)?$/i.test(cleanAria) ||
      el.classList.contains('wag-btn-clip') || 
      el.getAttribute('data-element-name') === 'Clip' ||
      (el.getAttribute('id') || '').includes('clip');

    const hasFamilyDollarClipFormat = 
      cleanText.includes('clip coupon') || cleanAria.includes('clip coupon') ||
      /^clip\\s+coupon$/i.test(cleanText) || /^clip\\s+coupon$/i.test(cleanAria) ||
      el.classList.contains('clip-coupon') || el.classList.contains('clip-btn');

    const hasCVSClipFormat = 
      cleanText.includes('send to card') || cleanAria.includes('send to card') || 
      (rawText === '+' && window.location.href.includes('cvs.com'));

    const hasKrogerClipFormat =
      isKroger && (
        el.getAttribute('data-testid') === 'CouponCard-button' ||
        el.getAttribute('data-element-name') === 'Clip' ||
        cleanText === 'clip' || cleanAria === 'clip' ||
        cleanText === 'clip coupon' || cleanAria === 'clip coupon' ||
        cleanText === 'clip deal' || cleanAria === 'clip deal' ||
        cleanText.startsWith('clip $') || cleanAria.startsWith('clip $') ||
        cleanText.includes('add card to clip') || cleanAria.includes('add card to clip')
      );

    const isClipKeyword = CONFIG.keywords.some(kw => cleanText.includes(kw) || cleanAria.includes(kw));
    const hasCouponKeywords = 
      /\\b(load|clip)\\b.*\\b(card|coupon|offer|deal|discount|savings|save)\\b/i.test(combined) ||
      /\\b(add|save)\\b.*\\b(to card|to loyalty|to account)\\b/i.test(combined) ||
      /^(clip|load)$/i.test(cleanText) ||
      (el.hasAttribute('data-coupon-id') && /\\b(load|clip)\\b/i.test(cleanText));

    if (!hasExactCouponText && !hasWalgreensClipFormat && !hasFamilyDollarClipFormat && !hasCVSClipFormat && !hasKrogerClipFormat && !isClipKeyword && !hasCouponKeywords) {
      if (!el.hasAttribute('data-coupon-id') && !el.classList.contains('clip-button') && !el.classList.contains('load-to-card')) {
        return false;
      }
    }

    return true;
  }

  // Check if coupon items exist on the page and all are already clipped
  function checkAllCouponsAlreadyLoaded() {
    const unclipped = findUnclippedButtons();
    if (unclipped.length > 0) {
      return {
        isAllLoaded: false,
        clippedCount: 0,
        unclippedCount: unclipped.length
      };
    }

    const clippedBadgesOrButtons = queryAllDeep('button, [role="button"], span, div').filter(el => {
      if (el.closest && el.closest('#cs-coupon-loader-hud, #cs-mode-modal, [id^="cs-"], [class*="cs-"]')) return false;
      if (el.closest && el.closest('header, nav, footer, [role="navigation"]')) return false;
      const t = (el.innerText || el.textContent || '').trim().toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
      return (
        t === 'clipped' || t === 'loaded' || t === 'in card' || t === 'on card' || t === 'sent to card' ||
        t === 'already clipped' || t === 'already loaded' || t === 'clipped ✓' ||
        t === 'loaded ✓' || t === 'unclip' || aria === 'clipped' || aria === 'loaded' || aria === 'unclip' || aria === 'sent to card' ||
        t.includes('coupon clipped') || t.includes('offer clipped') || t.includes('coupon loaded') ||
        el.classList.contains('is-clipped') || el.classList.contains('is-loaded') ||
        el.classList.contains('wag-btn-clipped') || el.getAttribute('data-element-name') === 'Clipped' ||
        el.classList.contains('unclip')
      );
    });

    return {
      isAllLoaded: clippedBadgesOrButtons.length > 0 && unclipped.length === 0,
      clippedCount: clippedBadgesOrButtons.length,
      unclippedCount: unclipped.length
    };
  }

  // Find unclipped coupon buttons
  function findUnclippedButtons() {
    const candidates = queryAllDeep(
      'button, [role="button"], a[role="button"], a[href*="coupon" i], a[href*="offer" i], input[type="button"], input[type="submit"], div[role="button"], [class*="clip" i], [class*="load" i], [class*="btn" i], [class*="button" i], [data-element-name="Clip"]'
    );
    return candidates.filter(isCouponButton);
  }

  // Check if active loaders exist
  function hasActiveSpinners() {
    const spinners = queryAllDeep('[class*="spinner" i], [class*="loading" i], [aria-busy="true"], .is-loading, [data-testid*="loading" i]');
    return spinners.some(s => s.offsetParent !== null);
  }

  // Find Load More button
  function findLoadMoreButton() {
    const candidates = queryAllDeep('button, [role="button"], a[role="button"], a');
    for (const el of candidates) {
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
      if (el.offsetParent === null) continue;
      const text = ((el.innerText || el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '')).trim().toLowerCase();
      const isLoadMore = text.includes('load more') || text.includes('show more') ||
        text.includes('view more') || text.includes('see more') ||
        text.includes('load all') || text.includes('more coupons') ||
        text.includes('more offers') || text.includes('load 30') || text.includes('load 35') ||
        text.includes('load next') || text.includes('next page');
      if (isLoadMore && !text.includes('filter') && !text.includes('terms') && !text.includes('close') && !text.includes('already')) {
        return el;
      }
    }
    return null;
  }

  // Find scroll containers
  function findScrollContainers(buttons = []) {
    const containers = new Set();

    for (const btn of buttons.slice(0, 8)) {
      let parent = btn.parentElement;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        const style = window.getComputedStyle(parent);
        const overflow = (style.overflowY || '') + (style.overflow || '');
        if ((overflow.includes('auto') || overflow.includes('scroll')) && parent.scrollHeight > parent.clientHeight + 30) {
          containers.add(parent);
        }
        parent = parent.parentElement;
      }
    }

    const modals = queryAllDeep(
      '[role="dialog"], [aria-modal="true"], .modal, .dialog, .drawer, .flyout, [class*="coupon" i], [class*="offer" i], [class*="window" i], [id*="coupon" i]'
    );
    for (const m of modals) {
      const style = window.getComputedStyle(m);
      const overflow = (style.overflowY || '') + (style.overflow || '');
      if ((overflow.includes('auto') || overflow.includes('scroll')) && m.scrollHeight > m.clientHeight + 40) {
        containers.add(m);
      }
    }

    if (containers.size === 0) {
      const divs = queryAllDeep('div, section, main, article, ul');
      for (const d of divs) {
        if (d.scrollHeight > d.clientHeight + 100 && d.clientHeight > 150) {
          const style = window.getComputedStyle(d);
          const overflow = (style.overflowY || '') + (style.overflow || '');
          if (overflow.includes('auto') || overflow.includes('scroll')) {
            const textContent = (d.innerText || '').toLowerCase();
            if (textContent.includes('coupon') || textContent.includes('offer') || textContent.includes('load') || textContent.includes('clip') || d.querySelectorAll('button, a').length > 3) {
              containers.add(d);
            }
          }
        }
      }
    }

    return Array.from(containers).filter(c => {
      return c !== window && c !== document.body && c !== document.documentElement;
    }).sort((a, b) => {
      let depthA = 0, depthB = 0;
      let curr = a; while (curr.parentElement) { depthA++; curr = curr.parentElement; }
      curr = b; while (curr.parentElement) { depthB++; curr = curr.parentElement; }
      return depthB - depthA;
    });
  }

  function checkAkamaiBlocked() {
    const text = (document.body ? document.body.innerText : '') || '';
    const title = (document.title || '').toLowerCase();
    const isDenied = title.includes('access denied') || 
                     text.includes('errors.edgesuite.net') || 
                     text.includes('Reference #') || 
                     (text.includes("You don't have permission to access") && text.includes('server')) ||
                     window.location.href.includes('edgesuite.net');
    let refId = '';
    const match = text.match(/Reference\s*#?\s*([a-zA-Z0-9.]+)/i);
    if (match) refId = match[1];
    return { isBlocked: isDenied, referenceId: refId };
  }

  // Detect Walgreens specific server-side rate limit or 200-coupon limit error toast
  function checkWalgreensClippingError() {
    const alerts = queryAllDeep('[role="alert"], [aria-live="assertive"], .toast, .alert, .wag-toast, .wag-error-message, .alert-danger, [class*="toast" i], [class*="error" i], [class*="alert" i], div, span');
    for (const el of alerts) {
      const txt = (el.innerText || el.textContent || '').toLowerCase();
      if (txt.includes('limit 200') || txt.includes('200 clipped coupons') || txt.includes('remove some coupons') || txt.includes('redeem or remove')) {
        return { isLimit200: true, isError: true, element: el, message: txt.slice(0, 100) };
      }
      if (txt.includes('cannot clip at this time') || txt.includes('try again later') || txt.includes('sorry, but you cannot') || txt.includes('unable to clip')) {
        return { isLimit200: false, isError: true, element: el, message: txt.slice(0, 80) };
      }
    }
    const bodyText = (document.body ? document.body.innerText : '') || '';
    const bodyLower = bodyText.toLowerCase();
    if (bodyLower.includes('limit 200') || bodyLower.includes('200 clipped coupons') || bodyLower.includes('remove some coupons')) {
      return { isLimit200: true, isError: true, element: null, message: 'Walgreens Limit: 200 clipped coupons reached. Please redeem or remove some coupons to make space for more savings.' };
    }
    if (bodyLower.includes('cannot clip at this time') || bodyLower.includes('Sorry, but you cannot clip')) {
      return { isLimit200: false, isError: true, element: null, message: 'Sorry, but you cannot clip at this time. Please try again later.' };
    }
    return { isLimit200: false, isError: false, element: null, message: '' };
  }

  // Wait for Walgreens coupon button to transition to 'Clipped' / 'Added' state
  async function waitForCouponConfirmation(btn, maxWaitMs = 2200) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      const text = (btn.textContent || btn.innerText || '').trim().toLowerCase();
      const ariaPressed = btn.getAttribute('aria-pressed');
      const isDisabled = btn.disabled || btn.getAttribute('aria-disabled') === 'true';
      const hasClippedClass = (btn.className || '').toLowerCase().includes('clipped') || (btn.className || '').toLowerCase().includes('added');
      
      if (text.includes('clipped') || text.includes('added') || text.includes('saved') || text.includes('loaded') || text.includes('unclip') || ariaPressed === 'true' || (isDisabled && !text.includes('clip')) || hasClippedClass) {
        return true;
      }
      await sleep(150);
    }
    return false;
  }

  function safeStealthClick(btn) {
    const rect = btn.getBoundingClientRect();
    const offsetX = Math.max(4, rect.width * (0.25 + Math.random() * 0.5));
    const offsetY = Math.max(4, rect.height * (0.25 + Math.random() * 0.5));
    const clientX = rect.left + offsetX;
    const clientY = rect.top + offsetY;

    const pointerInit = {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      screenX: clientX + (window.screenX || 0),
      screenY: clientY + (window.screenY || 0),
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      pressure: 0.5,
      buttons: 1
    };

    const mouseInit = {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      screenX: clientX + (window.screenX || 0),
      screenY: clientY + (window.screenY || 0),
      buttons: 1
    };

    try { btn.dispatchEvent(new PointerEvent('pointerover', pointerInit)); } catch (e) {}
    try { btn.dispatchEvent(new MouseEvent('mouseover', mouseInit)); } catch (e) {}
    try { btn.dispatchEvent(new PointerEvent('pointermove', pointerInit)); } catch (e) {}
    try { btn.dispatchEvent(new PointerEvent('pointerdown', pointerInit)); } catch (e) {}
    try { btn.dispatchEvent(new MouseEvent('mousedown', mouseInit)); } catch (e) {}
    
    try {
      if (typeof btn.focus === 'function') {
        btn.focus({ preventScroll: true });
      }
    } catch (e) {}

    try { btn.dispatchEvent(new PointerEvent('pointerup', pointerInit)); } catch (e) {}
    try { btn.dispatchEvent(new MouseEvent('mouseup', mouseInit)); } catch (e) {}
    
    // Dispatch a single synthetic click to avoid double-triggering toggle actions
    try { 
      btn.dispatchEvent(new MouseEvent('click', mouseInit)); 
    } catch (e) {
      try {
        if (typeof btn.click === 'function') {
          btn.click();
        }
      } catch (err) {}
    }
  }

  // Check login status for ShopRite & Walgreens
  function checkLoginStatus() {
    // 0. Explicit user override check or config bypass
    if (window.__cs_login_overridden || sessionStorage.getItem('__cs_login_override') === 'true' || Boolean(CONFIG.overrideLoginCheck)) {
      return true;
    }

    // 1. ShopRite check
    if (isShopRite) {
      const headerSubtitles = queryAllDeep('[data-testid="header-sub-title-testId"], .HeaderSubtitle--__sc-1cc0e6bb-6, [class*="HeaderSubtitle"]');
      for (const el of headerSubtitles) {
        const text = (el.textContent || el.innerText || '').trim().toLowerCase();
        if (text.includes('sign in') || text.includes('register')) {
          return false;
        }
      }
    }

    // 2. Walgreens check
    if (isWalgreens) {
      // Direct affirmative logged-in signals
      const hasSignOut = document.querySelector('a[href*="logout"], a[href*="signout"], [data-element-name="Sign Out"], [data-element-name="sign-out"], button[data-element-name="Sign Out"]');
      if (hasSignOut) return true;

      const bodyText = (document.body ? document.body.innerText : '') || '';
      if (bodyText.includes('Hi, ') || (bodyText.includes('Walgreens Cash') && (bodyText.includes('rewards balance') || bodyText.includes('Account balance')))) {
        return true;
      }

      const accountMenu = document.querySelector('.wag-header-account-name, [data-element-name="Your Account"], #wag-header-account, [data-element-name="account-menu"], [aria-label*="Account menu" i]');
      if (accountMenu) {
        const accText = (accountMenu.textContent || '').trim().toLowerCase();
        if (accText.length > 0 && !accText.includes('sign in') && !accText.includes('log in') && !accText.includes('register')) {
          return true;
        }
      }

      // Negative logged-out signals
      const hasSignInToClip = queryAllDeep('button, [role="button"]').some(b => {
        const text = (b.textContent || '').trim().toLowerCase();
        return text.includes('sign in to clip') || text.includes('sign in to load') || text.includes('log in to clip');
      });
      if (hasSignInToClip) return false;

      const signInElements = queryAllDeep('#signInBtn, [data-element-name="Sign In"], .wag-signin-btn, #header-sign-in, a[href*="/youraccount/default"], a[href*="/login"], a[href*="/signin"], button[aria-label*="Sign in" i]');
      for (const el of signInElements) {
        if (el && el.offsetParent !== null) {
          const text = (el.textContent || '').trim().toLowerCase();
          if (text.includes('sign in') || text.includes('log in')) {
            return false;
          }
        }
      }

      if (bodyText.includes('Sign in or register') || bodyText.includes('Sign In or Register')) {
        return false;
      }
    }
    
    // 3. CVS check
    if (isCVS) {
      const cvsSignInLinks = queryAllDeep('.sign-in-link, a[aria-label="Sign in"]');
      for (const el of cvsSignInLinks) {
        if (el.offsetParent !== null) {
          const text = (el.textContent || el.innerText || '').trim().toLowerCase();
          if (text === 'sign in') {
            return false;
          }
        }
      }
    }

    // 4. Family Dollar check
    if (isFamilyDollar) {
      const accountSpans = queryAllDeep('span');
      for (const el of accountSpans) {
        if (el.offsetParent !== null) {
          const text = (el.textContent || el.innerText || '').trim();
          if (text === 'Account') {
            return false;
          }
        }
      }
    }

    // 5. Kroger check
    if (isKroger) {
      const signInPrompt = document.querySelector('[data-testid="sign-in-button"], [data-testid="header-sign-in-button"], a[href*="/signin"], a[href*="/account/login"], button[aria-label*="Sign in" i]');
      if (signInPrompt && signInPrompt.offsetParent !== null) {
        const text = (signInPrompt.textContent || '').trim().toLowerCase();
        if (text.includes('sign in')) {
          const profileMenu = document.querySelector('[data-testid="header-profile-menu"], [aria-label*="Profile" i], [aria-label*="Account" i]');
          if (!profileMenu) return false;
        }
      }
    }

    const pageText = (document.body ? document.body.innerText : '') || '';
    const hasGuestIndicator = pageText.includes('Hi Guest') || pageText.includes('Sign In or Register') || pageText.includes('Sign in to clip');
    
    const hasLoginToLoadButtons = queryAllDeep('button, [role="button"]').some(b => {
      const text = (b.textContent || '').trim().toLowerCase();
      return text.includes('login to load') || text.includes('sign in to load') || text.includes('sign in to clip') || (isCVS && text.includes('sign in to send'));
    });

    if (hasGuestIndicator || hasLoginToLoadButtons) return false;

    return true;
  }

  // Main execution loop
  async function startLoader(mode) {
    if (mode) currentStrategy = mode;
    if (isRunning) return;
    isRunning = true;
    shouldStop = false;
    localClipped = 0;

    console.log(\`🚀 [CouponSweep] Starting initialization on \${retailerName} in \${isTopFrame ? 'TOP WINDOW' : 'FRAME'}...\`);
    updateStatus('Verifying ' + programName + ' loyalty status...', aggregateClipped || 0);
    await sleep(400);

    // Check if already blocked by Akamai WAF before starting
    const initialAkamai = checkAkamaiBlocked();
    if (initialAkamai.isBlocked) {
      console.warn('[CouponSweep] Akamai Access Denied page detected:', initialAkamai.referenceId);
      if (isTopFrame) {
        showAkamaiRecoveryBanner(initialAkamai.referenceId);
      }
      isRunning = false;
      return;
    }

    // Login check
    const isOverrideActive = window.__cs_login_overridden || sessionStorage.getItem('__cs_login_override') === 'true' || Boolean(CONFIG.overrideLoginCheck);
    const isLoggedIn = isOverrideActive || checkLoginStatus();
    if (!isLoggedIn) {
      const loginMsg = '⚠️ Please sign in to your ' + retailerName + ' account to load coupons';
      console.warn(\`[CouponSweep] \${loginMsg}\`);
      updateStatus(loginMsg, 0, true);

      if (isTopFrame) {
        showLoginRequiredBanner();
      }

      try {
        chrome.runtime.sendMessage({
          type: 'CS_LOGIN_REQUIRED',
          status: 'Please sign in to your ' + retailerName + ' account to load coupons',
          clipped: 0,
          isLoggedOut: true,
          isRunning: false
        });
      } catch (e) {}

      let attempts = 0;
      while (!shouldStop && attempts < 120) {
        if (window.__cs_login_overridden || sessionStorage.getItem('__cs_login_override') === 'true') {
          console.log("⚡ Login check overridden by user! Proceeding with coupon clipping...");
          updateStatus("⚡ Login check overridden! Scanning for offers...", 0);
          const banner = document.getElementById('cs-login-required-banner');
          if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
          break;
        }
        await sleep(1000);
        attempts++;
        if (checkLoginStatus()) {
          console.log("🎉 User signed in! Resuming digital coupon clipping...");
          updateStatus("Signed in! Starting digital coupon clipping...", 0);
          const banner = document.getElementById('cs-login-required-banner');
          if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
          break;
        }
      }
      if (shouldStop || attempts >= 120) {
        isRunning = false;
        return;
      }
    }

    // Wait for coupons to hydrate
    updateStatus('Scanning page for available ' + retailerName + ' offers...', aggregateClipped || 0);
    let waitAttempts = 0;
    const MAX_WAIT_ATTEMPTS = 12;
    let initialButtons = [];

    while (!shouldStop && waitAttempts < MAX_WAIT_ATTEMPTS) {
      initialButtons = findUnclippedButtons();
      if (initialButtons.length > 0) {
        console.log(\`✅ Found \${initialButtons.length} initial offers on \${retailerName}\`);
        break;
      }

      if (waitAttempts >= 5) {
        const statusCheck = checkAllCouponsAlreadyLoaded();
        if (statusCheck.isAllLoaded && statusCheck.clippedCount > 0) {
          console.log(\`🎉 All \${statusCheck.clippedCount} offers already loaded to \${programName} card!\`);
          break;
        }
      }

      waitAttempts++;
      await sleep(600);
    }

    if (shouldStop) {
      isRunning = false;
      return;
    }

    // Check if everything is already clipped
    const initialStatus = checkAllCouponsAlreadyLoaded();
    if (initialButtons.length === 0 && initialStatus.isAllLoaded && initialStatus.clippedCount > 0) {
      isRunning = false;
      console.log(\`[CouponSweep] Account is 100% up to date. \${initialStatus.clippedCount} coupons loaded.\`);
      
      try {
        chrome.runtime.sendMessage({
          type: 'CS_CLIPPER_FINISHED',
          clipped: 0,
          stopped: false,
          allAlreadyLoaded: true,
          loadedCount: initialStatus.clippedCount
        });
      } catch (e) {}
      return;
    }

    // Leader election
    let isLeader = false;
    try {
      const resp = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'CS_CLAIM_CLIPPER',
          buttonCount: initialButtons.length
        }, (res) => resolve(res || {}));
      });
      isLeader = resp.isLeader;
      if (resp.sessionClipped !== undefined) {
        aggregateClipped = resp.sessionClipped;
      }
    } catch (e) {
      isLeader = isTopFrame;
    }

    if (!isLeader) {
      console.log(\`[CouponSweep] Yielding execution to designated frame.\`);
      isRunning = false;
      return;
    }

    // Clipping Loop
    let consecutiveEmptyPasses = 0;
    const MAX_EMPTY_PASSES = 12;

    while (!shouldStop) {
      const buttons = findUnclippedButtons();

      if (buttons.length > 0) {
        consecutiveEmptyPasses = 0;

        if (currentStrategy === 'instant') {
          // ⚡ Instant / Safe Auto-Pacer Mode
          const isWalgreensSite = isWalgreens;
          updateStatus(
            isWalgreensSite 
              ? \`🛡️ Safe Auto-Pacer: Loading \${buttons.length} offers safely... (\${aggregateClipped || localClipped} clipped)\`
              : \`⚡ Rapid Batch: Loading \${buttons.length} offers... (\${aggregateClipped || localClipped} clipped)\`,
            aggregateClipped || localClipped
          );

          for (const btn of buttons) {
            if (shouldStop) break;
            try {
              btn.setAttribute('data-cs-processed', 'true');
              processedElements.add(btn);

              const rawTitle = btn.getAttribute('data-title') || btn.getAttribute('aria-label') || (btn.innerText || '').trim();
              const cleanTitle = rawTitle.slice(0, 32);

              if (isWalgreensSite) {
                btn.style.outline = '2px solid #0f172a';
              }

              safeStealthClick(btn);

              // On Walgreens: Wait for server response / button state transition
              if (isWalgreensSite) {
                updateStatus(\`⏳ Loading offer: \${cleanTitle}... (\${aggregateClipped || localClipped} clipped)\`, aggregateClipped || localClipped);
                await waitForCouponConfirmation(btn, 1800);
                btn.style.outline = '';
              }

              localClipped++;

              try {
                chrome.runtime.sendMessage({
                  type: 'CS_COUPON_CLIPPED',
                  count: 1,
                  title: cleanTitle,
                  status: isWalgreensSite 
                    ? \`🛡️ Safely loaded offer #\${(aggregateClipped || 0) + localClipped}: \${cleanTitle}\`
                    : \`⚡ Rapid batch: Loaded offer #\${(aggregateClipped || 0) + localClipped}: \${cleanTitle}\`
                });
              } catch (e) {}

              // Check for Walgreens throttling or 200 coupon limit error
              if (isWalgreensSite) {
                const errorCheck = checkWalgreensClippingError();
                if (errorCheck.isError) {
                  if (errorCheck.isLimit200) {
                    console.warn('[CouponSweep] Walgreens 200 clipped coupons limit reached.');
                    updateStatus(
                      \`⚠️ Walgreens Limit Reached: 200 clipped coupons maximum. Please redeem or remove some coupons.\`,
                      aggregateClipped || localClipped,
                      true
                    );
                    shouldStop = true;
                    isRunning = false;
                    return;
                  }
                  console.warn('[CouponSweep] Walgreens rate limit detected ("cannot clip at this time"). Triggering 8.5s cooldown recovery.');
                  updateStatus(
                    \`⚠️ Walgreens server cooldown ("Cannot clip at this time"). Pausing 8s for server to settle...\`,
                    aggregateClipped || localClipped,
                    true
                  );
                  if (errorCheck.element) {
                    try {
                      const closeBtn = errorCheck.element.querySelector('button, [aria-label*="close" i], .close');
                      if (closeBtn) closeBtn.click();
                    } catch (e) {}
                  }
                  await sleep(8500);
                  continue;
                }
              }

              // Check if rate-limit / Access Denied was triggered mid-run
              const midCheck = checkAkamaiBlocked();
              if (midCheck.isBlocked) {
                csLog('Rate limit triggered by Akamai WAF. Halting immediately.');
                if (isTopFrame) showAkamaiRecoveryBanner(midCheck.referenceId);
                shouldStop = true;
                isRunning = false;
                return;
              }

              // Anti-bot stealth pacing:
              // On Walgreens: 1,800ms - 2,500ms jitter (safe for Walgreens backend API & Akamai)
              // On Kroger: 420ms - 780ms jitter (safe for Krogerlytics & Apollo GraphQL)
              // On ShopRite: 160ms - 260ms jitter
              const delay = isWalgreensSite 
                ? (1800 + Math.floor(Math.random() * 700)) 
                : (isKroger
                    ? (420 + Math.floor(Math.random() * 360))
                    : (160 + Math.floor(Math.random() * 100)));
              await sleep(delay);

              // Cooldown pause every 5 offers on Walgreens to prevent backend rate-limit lock
              if (isWalgreensSite && localClipped % 5 === 0) {
                updateStatus(\`🛡️ Anti-bot server breathing pause (4.5s cooldown)... (\${aggregateClipped || localClipped} clipped)\`, aggregateClipped || localClipped);
                await sleep(4500 + Math.floor(Math.random() * 1200));
              }
            } catch (e) {
              console.error(e);
            }
          }

          await sleep(CONFIG.clickDelay);
        } else {
          // 🎬 Step-by-Step Mode: Smooth scroll & visual glide
          const isWalgreensSite = isWalgreens;
          for (const btn of buttons) {
            if (shouldStop) break;

            try {
              btn.setAttribute('data-cs-processed', 'true');
              processedElements.add(btn);

              const containers = findScrollContainers([btn]);
              if (containers.length > 0) {
                const container = containers[0];
                const btnRect = btn.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (btnRect.top < containerRect.top + 30 || btnRect.bottom > containerRect.bottom - 30) {
                  const offset = btnRect.top - containerRect.top - (containerRect.height / 2) + (btnRect.height / 2);
                  container.scrollBy({ top: offset, behavior: 'smooth' });
                }
              } else {
                try {
                  const btnRect = btn.getBoundingClientRect();
                  const absoluteY = window.pageYOffset + btnRect.top;
                  window.scrollTo({ top: absoluteY - (window.innerHeight / 2) + (btnRect.height / 2), behavior: 'smooth' });
                } catch (e) {
                  try { btn.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (err) {}
                }
              }

              const rawTitle = btn.getAttribute('data-title') || btn.getAttribute('aria-label') || (btn.innerText || '').trim();
              const cleanTitle = rawTitle.slice(0, 32);

              updateStatus(\`Gliding to offer: \${cleanTitle}...\`, aggregateClipped || localClipped);
              btn.style.outline = '3px solid #0f172a';
              await sleep(CONFIG.glideDelay);

              safeStealthClick(btn);

              // On Walgreens: Wait for server response / button state transition
              if (isWalgreensSite) {
                updateStatus(\`⏳ Loading offer: \${cleanTitle}... (\${aggregateClipped || localClipped} clipped)\`, aggregateClipped || localClipped);
                await waitForCouponConfirmation(btn, 1800);
              }

              localClipped++;

              try {
                chrome.runtime.sendMessage({
                  type: 'CS_COUPON_CLIPPED',
                  count: 1,
                  title: cleanTitle,
                  status: \`✓ Loaded offer to loyalty card: \${cleanTitle}\`
                });
              } catch (e) {}

              btn.style.outline = '';

              // Check for Walgreens throttling or 200 coupon limit error
              if (isWalgreensSite) {
                const errorCheck = checkWalgreensClippingError();
                if (errorCheck.isError) {
                  if (errorCheck.isLimit200) {
                    console.warn('[CouponSweep] Walgreens 200 clipped coupons limit reached.');
                    updateStatus(
                      \`⚠️ Walgreens Limit Reached: 200 clipped coupons maximum. Please redeem or remove some coupons.\`,
                      aggregateClipped || localClipped,
                      true
                    );
                    shouldStop = true;
                    isRunning = false;
                    return;
                  }
                  console.warn('[CouponSweep] Walgreens rate limit detected ("cannot clip at this time"). Triggering 8.5s cooldown recovery.');
                  updateStatus(
                    \`⚠️ Walgreens server cooldown ("Cannot clip at this time"). Pausing 8s for server to settle...\`,
                    aggregateClipped || localClipped,
                    true
                  );
                  if (errorCheck.element) {
                    try {
                      const closeBtn = errorCheck.element.querySelector('button, [aria-label*="close" i], .close');
                      if (closeBtn) closeBtn.click();
                    } catch (e) {}
                  }
                  await sleep(8500);
                  continue;
                }
              }

              const midCheck = checkAkamaiBlocked();
              if (midCheck.isBlocked) {
                if (isTopFrame) showAkamaiRecoveryBanner(midCheck.referenceId);
                shouldStop = true;
                isRunning = false;
                return;
              }

              // Humanized delay between clips
              // On Walgreens: 1,900ms - 2,800ms
              // On Kroger: 450ms - 800ms
              // On ShopRite: CONFIG.clickDelay + jitter
              const stepClickDelay = isWalgreensSite 
                ? (1900 + Math.floor(Math.random() * 900))
                : (isKroger
                    ? (450 + Math.floor(Math.random() * 350))
                    : (CONFIG.clickDelay + Math.floor(Math.random() * 150)));

              await sleep(stepClickDelay);

              // Cooldown pause every 5 offers on Walgreens
              if (isWalgreensSite && localClipped % 5 === 0) {
                updateStatus(\`🛡️ Anti-bot server breathing pause (4.5s cooldown)... (\${aggregateClipped || localClipped} clipped)\`, aggregateClipped || localClipped);
                await sleep(4500 + Math.floor(Math.random() * 1200));
              }
            } catch (err) {
              console.error(err);
            }
          }
        }

        const scrollContainers = findScrollContainers(buttons);
        if (scrollContainers.length > 0) {
          scrollContainers[0].scrollBy({ top: CONFIG.scrollStep, behavior: 'smooth' });
        } else {
          window.scrollBy({ top: CONFIG.scrollStep, behavior: 'smooth' });
        }
        await sleep(CONFIG.scrollDelay);
        continue;
      }

      // Check for Load More button
      const loadMoreBtn = findLoadMoreButton();
      if (loadMoreBtn) {
        updateStatus(\`Loading more \${retailerName} coupons... (\${aggregateClipped || localClipped} clipped)\`, aggregateClipped || localClipped);
        try {
          loadMoreBtn.style.outline = '3px solid #0f172a';
          await sleep(250);
          safeStealthClick(loadMoreBtn);
          await sleep(2200);
          loadMoreBtn.style.outline = '';
        } catch (e) {}
        consecutiveEmptyPasses = 0;
        continue;
      }

      // Infinite scroll agitation
      consecutiveEmptyPasses++;
      updateStatus(
        \`Scanning for next coupon batch... (\${aggregateClipped || localClipped} clipped) [\${consecutiveEmptyPasses}/\${MAX_EMPTY_PASSES}]\`,
        aggregateClipped || localClipped
      );

      const scrollContainers = findScrollContainers([]);
      if (scrollContainers.length > 0) {
        const activeContainer = scrollContainers[0];
        activeContainer.scrollBy({ top: CONFIG.scrollStep + 200, behavior: 'smooth' });
        activeContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
        await sleep(CONFIG.scrollDelay);
        
        activeContainer.scrollBy({ top: -100, behavior: 'smooth' });
        await sleep(150);
        activeContainer.scrollBy({ top: 150, behavior: 'smooth' });
      } else {
        window.scrollBy({ top: CONFIG.scrollStep + 200, behavior: 'smooth' });
        window.dispatchEvent(new Event('scroll', { bubbles: true }));
        await sleep(CONFIG.scrollDelay);
        
        window.scrollBy({ top: -100, behavior: 'smooth' });
        await sleep(150);
        window.scrollBy({ top: 150, behavior: 'smooth' });
      }

      if (consecutiveEmptyPasses >= MAX_EMPTY_PASSES) {
        console.log(\`Exhausted all passes. All available \${retailerName} coupons processed.\`);
        break;
      }
    }

    isRunning = false;
    const finalCount = aggregateClipped || localClipped;

    try {
      chrome.runtime.sendMessage({
        type: 'CS_CLIPPER_FINISHED',
        clipped: finalCount,
        stopped: shouldStop
      });
    } catch (e) {}
  }

  function stopLoader() {
    if (shouldStop) return;
    shouldStop = true;
    isRunning = false;
    updateStatus('Stopping loader...', aggregateClipped || localClipped);
    try {
      chrome.runtime.sendMessage({ type: 'CS_STOP_BROADCAST' });
    } catch(e) {}
  }

  // In-page Mode Selector Dialog
  function showModeSelectionModal(callback) {
    if (!isTopFrame) return;
    const existing = document.getElementById('cs-mode-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'cs-mode-modal';
    overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 2147483647; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
    
    const instantTitle = isWalgreens ? '🛡️ Safe Stealth Mode' : '⚡ Instant Batch Mode';
    const instantBadge = isWalgreens ? 'Akamai-Safe' : 'Fastest';
    const instantDesc = isWalgreens 
      ? 'Intelligent human-pacing with jitter and micro-pauses. Prevents Akamai rate-limits and Access Denied locks.'
      : 'Loads all available coupons in rapid concurrent batches at once. Entire page is clipped in seconds.';

    overlay.innerHTML = [
      '<div style="background: #ffffff; border-radius: 20px; padding: 24px; max-width: 440px; width: 92%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #cbd5e1; color: #0f172a;">',
      '  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">',
      '    <div style="display: flex; align-items: center; gap: 10px;">',
      '      <div style="width: 36px; height: 36px; background: #0f172a; color: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 15px;">CS</div>',
      '      <div>',
      '        <h2 style="font-size: 16px; font-weight: 800; margin: 0; line-height: 1.2; color: #0f172a;">CouponSweep • ' + retailerName + '</h2>',
      '        <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">Select loading option for ' + programName + '</p>',
      '      </div>',
      '    </div>',
      '    <button id="cs-close-mode-modal" style="background: #f1f5f9; border: none; border-radius: 50%; width: 28px; height: 28px; font-size: 14px; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center;">✕</button>',
      '  </div>',
      '  <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">',
      '    <button id="cs-choose-instant" style="text-align: left; padding: 14px 16px; background: #0f172a; border: 1.5px solid #0f172a; border-radius: 12px; cursor: pointer; transition: all 0.2s; color: #ffffff;">',
      '      <div style="display: flex; align-items: center; justify-content: space-between;">',
      '        <span style="font-size: 14px; font-weight: 800; color: #ffffff;">' + instantTitle + '</span>',
      '        <span style="font-size: 10px; background: rgba(255, 255, 255, 0.2); color: #ffffff; font-weight: 700; padding: 2px 8px; border-radius: 10px;">' + instantBadge + '</span>',
      '      </div>',
      '      <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">' + instantDesc + '</div>',
      '    </button>',
      '    <button id="cs-choose-step" style="text-align: left; padding: 14px 16px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; cursor: pointer; transition: all 0.2s; color: #0f172a;">',
      '      <div style="display: flex; align-items: center; justify-content: space-between;">',
      '        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">🎬 Step-by-Step Mode</span>',
      '        <span style="font-size: 10px; background: #e2e8f0; color: #334155; font-weight: 700; padding: 2px 8px; border-radius: 10px;">Visual</span>',
      '      </div>',
      '      <div style="font-size: 11.5px; color: #64748b; margin-top: 4px; line-height: 1.4;">Smoothly scrolls to each coupon, highlights clearly, and clips one-by-one.</div>',
      '    </button>',
      '  </div>',
      '  <div style="font-size: 11px; color: #94a3b8; text-align: center;">You can pause or stop clipping anytime using the on-screen Stop button.</div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('cs-close-mode-modal');
    if (closeBtn) closeBtn.onclick = () => overlay.remove();

    const instantBtn = document.getElementById('cs-choose-instant');
    if (instantBtn) {
      instantBtn.onclick = () => {
        overlay.remove();
        if (callback) callback('instant');
      };
    }

    const stepBtn = document.getElementById('cs-choose-step');
    if (stepBtn) {
      stepBtn.onclick = () => {
        overlay.remove();
        if (callback) callback('individual');
      };
    }
  }

  // Runtime message listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CS_PROMPT_MODE') {
      if (isTopFrame && !isRunning) {
        showModeSelectionModal((selectedMode) => {
          startLoader(selectedMode);
        });
        sendResponse({ success: true, prompted: true });
      }
      return true;
    }
    if (message.type === 'CS_OVERRIDE_LOGIN') {
      window.__cs_login_overridden = true;
      try { sessionStorage.setItem('__cs_login_override', 'true'); } catch (err) {}
      const banner = document.getElementById('cs-login-required-banner');
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      sendResponse({ success: true, message: 'Login check overridden' });
      if (!isRunning) {
        startLoader(message.mode || currentStrategy);
      }
      return true;
    }
    if (message.type === 'CS_START') {
      if (message.overrideLogin) {
        window.__cs_login_overridden = true;
        try { sessionStorage.setItem('__cs_login_override', 'true'); } catch (err) {}
      }
      if (message.mode) currentStrategy = message.mode;
      if (!isRunning) {
        startLoader(message.mode);
        sendResponse({ success: true, message: 'Loader started in mode: ' + currentStrategy });
      } else {
        sendResponse({ success: false, message: 'Already running' });
      }
    } else if (message.type === 'CS_STOP' || message.type === 'CS_STOP_BROADCAST') {
      stopLoader();
      sendResponse({ success: true, message: 'Stopping...' });
    } else if (message.type === 'CS_QUERY_STATUS') {
      const isLoggedOut = !checkLoginStatus();
      sendResponse({
        isRunning: isRunning,
        clipped: aggregateClipped || localClipped,
        isLoggedOut: isLoggedOut
      });
    } else if (message.type === 'CS_UPDATE_AGGREGATE_COUNT') {
      if (message.totalClipped !== undefined) {
        aggregateClipped = message.totalClipped;
        updateStatus(message.status || \`Clipped #\${aggregateClipped} offer...\`, aggregateClipped);
      }
    } else if (message.type === 'CS_SESSION_COMPLETE') {
      isRunning = false;
      const count = message.totalClipped ?? (aggregateClipped || localClipped);
      const isUpToDate = message.allAlreadyLoaded || (count === 0 && !message.stopped);
      let finalMsg = '';

      if (message.stopped) {
        finalMsg = \`⏹️ Stopped! Clipped \${count} coupons to your account.\`;
      } else if (isUpToDate) {
        finalMsg = \`✅ Up to date — all coupons are loaded to your \${programName} card.\`;
      } else {
        finalMsg = \`🎉 All Done! Successfully clipped \${count} coupons to your \${retailerName} account!\`;
      }

      csLog(\`Completion: \${finalMsg}\`);
      updateStatus(finalMsg, isUpToDate ? 'Up to Date' : count);

      if (isTopFrame) {
        showCompletionBanner(count, message.stopped, isUpToDate);
        const indicator = document.getElementById('cs-hud-indicator');
        if (indicator) {
          indicator.style.background = '#10b981';
          indicator.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.6)';
          indicator.style.animation = 'none';
        }
      }

      setTimeout(() => {
        if (!isRunning) removeHud();
      }, 18000);
    }
    return true;
  });
})();
`;

  const popupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CouponSweep — Digital Coupon Loader</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="app-container">
    <header class="header">
      <div class="logo-area" style="margin-bottom: 4px;">
        <div style="width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; background: #0f172a; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px;">CS</div>
        <div>
          <h1 class="title">CouponSweep</h1>
          <p class="subtitle">Digital Coupon Loader</p>
        </div>
      </div>
      <div id="status-pill" class="status-pill status-ready">Ready</div>
    </header>

    <!-- Retailer Switcher / Indicator Pill -->
    <div id="retailer-banner" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <span id="retailer-icon" style="font-size: 13px;">🛒</span>
        <span id="retailer-name" style="font-weight: 800; color: #0f172a;">ShopRite, Walgreens, Family Dollar, CVS, Kroger</span>
      </div>
      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
        <button id="btn-switch-shoprite" class="btn-micro" title="Quick launch ShopRite digital coupons">ShopRite</button>
        <button id="btn-switch-walgreens" class="btn-micro" title="Quick launch Walgreens digital coupons">Walgreens</button>
        <button id="btn-switch-familydollar" class="btn-micro" title="Quick launch Family Dollar digital coupons">Family Dollar</button>
        <button id="btn-switch-cvs" class="btn-micro" title="Quick launch CVS digital coupons">CVS</button>
        <button id="btn-switch-kroger" class="btn-micro" title="Quick launch Kroger digital coupons">Kroger</button>
      </div>
    </div>

    <!-- 2 Choice Options: Instant Load All vs Step-by-Step -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 6px;">
      <div style="font-size: 11px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <span>Select Loading Option:</span>
        <span style="font-size: 10px; color: #64748b; font-weight: 600;">Choose to start</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button id="btn-clip-instant" class="btn btn-direct" title="Loads all available coupons safely">
          <span class="direct-icon">⚡</span>
          <div class="direct-text">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <span id="instant-title" class="direct-title">Instant Mode</span>
              <span id="instant-badge" style="font-size: 9px; font-weight: 800; background: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">Fastest</span>
            </div>
            <span id="instant-sub" class="direct-sub">Loads all coupons in rapid batches</span>
          </div>
        </button>

        <button id="btn-clip-individual" class="btn btn-step" title="Scrolls to each coupon and clips individually">
          <span class="direct-icon">🎬</span>
          <div class="direct-text">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <span class="direct-title">Step-by-Step Mode</span>
              <span style="font-size: 9px; font-weight: 800; background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">Visual</span>
            </div>
            <span class="direct-sub">Scrolls to each coupon & clips one-by-one with visual glide</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Stats Card -->
    <div class="stats-card">
      <div class="stat-group">
        <span class="stat-label">STATUS / COUPONS</span>
        <span id="stat-count" class="stat-value">Ready</span>
      </div>
      <div class="stat-meta">
        <span id="speed-label" class="badge">Multi-Store</span>
        <span id="session-time" class="time-label">0s</span>
      </div>
    </div>

    <!-- Progress Status -->
    <div class="progress-section">
      <div class="status-text-row">
        <span id="status-message" class="status-message">Select an option above to begin</span>
      </div>
      <div class="progress-track">
        <div id="progress-bar" class="progress-fill"></div>
      </div>
    </div>

    <!-- Stop and Override Buttons -->
    <div class="actions-row" style="flex-direction: column; gap: 6px;">
      <button id="btn-override-login" class="btn" style="display: none; background: #0f172a; color: #ffffff; border: 1px solid #334155; padding: 10px; border-radius: 10px; font-size: 12px; font-weight: 700; width: 100%; cursor: pointer; text-align: center;">
        ⚡ Override Login Check & Clip Now
      </button>
      <button id="btn-stop" class="btn btn-secondary" disabled>
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="6" width="12" height="12" rx="2"></rect>
        </svg>
        <span>Stop Execution</span>
      </button>
    </div>

    <footer class="footer">
      <span>Auto-clips grocery & pharmacy loyalty coupons</span>
      <span class="version">v1.5.0</span>
    </footer>
  </div>

  <script src="popup.js"></script>
</body>
</html>
`;

  const popupCss = `/* CouponSweep Popup CSS */
:root {
  --primary: #0f172a;
  --primary-hover: #1e293b;
  --primary-glow: rgba(15, 23, 42, 0.15);
  --bg: #ffffff;
  --surface: #f8fafc;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-muted: #64748b;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  width: 350px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  padding: 0;
  margin: 0;
  user-select: none;
}

.app-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.subtitle {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.status-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 20px;
  text-transform: uppercase;
}

.status-ready {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-running {
  background: #f8fafc;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}

.status-paused {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
}

.btn-micro {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-micro:hover {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.btn-direct {
  background: #0f172a;
  color: white;
  border: 1px solid #0f172a;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
  text-align: left;
  transition: transform 0.15s, background 0.15s;
}

.btn-direct:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.btn-direct:active {
  transform: translateY(0);
}

.direct-icon {
  font-size: 22px;
}

.direct-title {
  display: block;
  font-weight: 800;
  font-size: 13px;
  line-height: 1.2;
}

.direct-sub {
  display: block;
  font-size: 10.5px;
  color: #cbd5e1;
  margin-top: 2px;
  font-weight: 500;
}

.btn-step {
  background: #ffffff;
  color: #0f172a;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s, background 0.15s, border-color 0.15s;
}

.btn-step:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.btn-step:active {
  transform: translateY(0);
}

.btn-step .direct-sub {
  color: #64748b;
}

.stats-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
}

.stat-value {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
}

.badge {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.time-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-message {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-track {
  height: 5px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 0%;
  background: #0f172a;
  transition: width 0.3s;
}

.progress-fill.animating {
  animation: barSlide 1.5s infinite linear;
}

@keyframes barSlide {
  0% { transform: translateX(-100%); width: 40%; }
  100% { transform: translateX(250%); width: 40%; }
}

.actions-row {
  display: flex;
  gap: 8px;
}

.btn-secondary {
  width: 100%;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 8px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 11.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-secondary:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.footer {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #94a3b8;
  border-top: 1px solid #e2e8f0;
  padding-top: 6px;
}
`;

  const popupJs = `// CouponSweep Digital Coupon Loader - Popup Script (ShopRite, Walgreens, Family Dollar, CVS, Kroger)
const SHOPRITE_URL = "${shopriteUrl}";
const WALGREENS_URL = "${walgreensUrl}";
const DEFAULT_URL = "${config.targetUrl || shopriteUrl}";
const CVS_URL = "${cvsUrl}";
const KROGER_URL = "${krogerUrl}";

function detectRetailer(url = '') {
  const lower = url.toLowerCase();
  if (lower.includes('familydollar.com')) return 'familydollar';
  if (lower.includes('walgreens.com')) return 'walgreens';
  if (lower.includes('shoprite.com') || lower.includes('wakefern.com') || lower.includes('priceplus')) return 'shoprite';
  if (lower.includes('cvs.com')) return 'cvs';
  if (lower.includes('kroger.com')) return 'kroger';
  return 'generic';
}

function resolveTargetUrl(tabUrl = '', targetRetailer = null) {
  const r = targetRetailer || detectRetailer(tabUrl);
  if (r === 'familydollar') {
    return 'https://www.familydollar.com/smart-coupons';
  }
  if (r === 'cvs') {
    if (tabUrl.includes('cvs.com/extracare')) return tabUrl;
    return CVS_URL;
  }
  if (r === 'kroger') {
    if (tabUrl.includes('kroger.com/savings/cl/coupons')) return tabUrl;
    return KROGER_URL;
  }
  if (r === 'walgreens') {
    if (tabUrl.includes('walgreens.com/offers')) return tabUrl;
    return WALGREENS_URL;
  }
  if (r === 'shoprite') {
    const rsidMatch = tabUrl.match(/\\/rsid\\/([a-zA-Z0-9_-]+)/i);
    if (rsidMatch) {
      return 'https://www.shoprite.com/sm/planning/rsid/' + rsidMatch[1] + '/digital-coupon?cfrom=homenavigation';
    }
    return SHOPRITE_URL;
  }
  return DEFAULT_URL;
}

document.addEventListener('DOMContentLoaded', async () => {
  const btnClipInstant = document.getElementById('btn-clip-instant');
  const btnClipIndividual = document.getElementById('btn-clip-individual');
  const btnStop = document.getElementById('btn-stop');
  const statCount = document.getElementById('stat-count');
  const statusMessage = document.getElementById('status-message');
  const statusPill = document.getElementById('status-pill');
  const progressBar = document.getElementById('progress-bar');
  const sessionTime = document.getElementById('session-time');
  const retailerNameEl = document.getElementById('retailer-name');
  const btnSwitchShoprite = document.getElementById('btn-switch-shoprite');
  const btnSwitchWalgreens = document.getElementById('btn-switch-walgreens');
  const btnSwitchFamilyDollar = document.getElementById('btn-switch-familydollar');
  const btnOverrideLogin = document.getElementById('btn-override-login');

  let timer = null;
  let seconds = 0;
  let activeRetailerOverride = null;

  function setRunning(isRunning) {
    if (btnOverrideLogin) btnOverrideLogin.style.display = 'none';
    if (isRunning) {
      statusPill.className = 'status-pill status-running';
      statusPill.textContent = 'Loading...';
      btnStop.disabled = false;
      progressBar.classList.add('animating');
      clearInterval(timer);
      seconds = 0;
      timer = setInterval(() => {
        seconds++;
        sessionTime.textContent = \`\${seconds}s\`;
      }, 1000);
    } else {
      statusPill.className = 'status-pill status-ready';
      statusPill.textContent = 'Ready';
      btnStop.disabled = true;
      progressBar.classList.remove('animating');
      clearInterval(timer);
    }
  }

  function showUpToDateStatus() {
    setRunning(false);
    if (btnOverrideLogin) btnOverrideLogin.style.display = 'none';
    statCount.textContent = 'Up to Date';
    statCount.style.fontSize = '16px';
    statCount.style.color = '#059669';
    statusMessage.textContent = '✓ All digital coupons are loaded to your loyalty card';
    statusPill.className = 'status-pill status-ready';
    statusPill.textContent = 'Up to Date';
    statusPill.style.background = '#ecfdf5';
    statusPill.style.color = '#059669';
    statusPill.style.borderColor = '#a7f3d0';
  }

  function showLoginRequiredStatus(retailer = 'Retailer') {
    setRunning(false);
    statCount.textContent = 'Sign In';
    statCount.style.fontSize = '16px';
    statCount.style.color = '#0f172a';
    statusMessage.textContent = \`Please sign in to your \${retailer} account to load coupons\`;
    statusPill.className = 'status-pill status-paused';
    statusPill.textContent = 'Sign In Required';
    statusPill.style.background = '#f8fafc';
    statusPill.style.color = '#0f172a';
    statusPill.style.borderColor = '#cbd5e1';
    if (btnOverrideLogin) btnOverrideLogin.style.display = 'block';
  }

  // Detect current active tab & retailer
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    const currentR = detectRetailer(tab.url);
    if (currentR === 'shoprite') {
      retailerNameEl.textContent = 'ShopRite (Price Plus®)';
      if (document.getElementById('instant-title')) document.getElementById('instant-title').textContent = 'Rapid Batch Mode';
      if (document.getElementById('instant-sub')) document.getElementById('instant-sub').textContent = 'Loads all coupons in rapid concurrent batches at once';
      if (document.getElementById('instant-badge')) document.getElementById('instant-badge').textContent = 'Fastest';
    } else if (currentR === 'walgreens') {
      retailerNameEl.textContent = 'Walgreens (myWalgreens™)';
      if (document.getElementById('instant-title')) document.getElementById('instant-title').textContent = '🛡️ Safe Auto-Pacer';
      if (document.getElementById('instant-sub')) document.getElementById('instant-sub').textContent = 'Paced clipping + confirmation verify & rate-limit recovery';
      if (document.getElementById('instant-badge')) document.getElementById('instant-badge').textContent = 'Anti-Throttle';
    } else if (currentR === 'familydollar') {
      retailerNameEl.textContent = 'Family Dollar (Smart Coupons)';
    } else if (currentR === 'kroger') {
      retailerNameEl.textContent = 'Kroger (Shopper\\'s Card)';
    } else if (currentR === 'cvs') {
      retailerNameEl.textContent = 'CVS (ExtraCare®)';
    } else {
      retailerNameEl.textContent = 'CouponSweep — Multi-Store';
    }

    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'CS_QUERY_STATUS' }, (res) => {
        if (!chrome.runtime.lastError && res) {
          if (res.isRunning) {
            setRunning(true);
            statCount.textContent = res.clipped || 0;
          } else if (res.isLoggedOut) {
            showLoginRequiredStatus(currentR === 'walgreens' ? 'Walgreens' : (currentR === 'cvs' ? 'CVS' : (currentR === 'kroger' ? 'Kroger' : 'ShopRite')));
          } else if (res.allAlreadyLoaded || (res.clipped === 0 && res.loadedCount > 0)) {
            showUpToDateStatus();
          } else if (res.clipped > 0) {
            statCount.textContent = res.clipped;
            statusMessage.textContent = \`\${res.clipped} coupons loaded\`;
          }
        }
      });
    }
  }

  if (btnSwitchShoprite) {
    btnSwitchShoprite.addEventListener('click', () => {
      activeRetailerOverride = 'shoprite';
      retailerNameEl.textContent = 'ShopRite (Price Plus®)';
      triggerClip('instant', 'shoprite');
    });
  }

  if (btnSwitchWalgreens) {
    btnSwitchWalgreens.addEventListener('click', () => {
      activeRetailerOverride = 'walgreens';
      retailerNameEl.textContent = 'Walgreens (myWalgreens™)';
      triggerClip('instant', 'walgreens');
    });
  }

  if (btnSwitchFamilyDollar) {
    btnSwitchFamilyDollar.addEventListener('click', () => {
      activeRetailerOverride = 'familydollar';
      retailerNameEl.textContent = 'Family Dollar (Smart Coupons)';
      triggerClip('instant', 'familydollar');
    });
  }

  const btnSwitchCvs = document.getElementById('btn-switch-cvs');
  if (btnSwitchCvs) {
    btnSwitchCvs.addEventListener('click', () => {
      activeRetailerOverride = 'cvs';
      retailerNameEl.textContent = 'CVS (ExtraCare®)';
      triggerClip('instant', 'cvs');
    });
  }

  const btnSwitchKroger = document.getElementById('btn-switch-kroger');
  if (btnSwitchKroger) {
    btnSwitchKroger.addEventListener('click', () => {
      activeRetailerOverride = 'kroger';
      retailerNameEl.textContent = "Kroger (Shopper's Card)";
      triggerClip('instant', 'kroger');
    });
  }

  async function triggerClip(mode = 'instant', forceRetailer = null) {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!currentTab) return;

    setRunning(true);
    const targetRetailer = forceRetailer || activeRetailerOverride || detectRetailer(currentTab.url);
    const currentTabRetailer = detectRetailer(currentTab.url);

    const isAlreadyOnCoupons = currentTabRetailer === targetRetailer && currentTab.url && 
      (currentTab.url.includes("coupon") || currentTab.url.includes("offers") || currentTab.url.includes("savings") || currentTab.url.includes("circular"));

    if (isAlreadyOnCoupons) {
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id, allFrames: targetRetailer === 'shoprite' },
        files: ['content.js']
      });
      chrome.tabs.sendMessage(currentTab.id, { type: 'CS_START', mode: mode });
    } else {
      chrome.runtime.sendMessage({
        type: 'CS_TRIGGER_MODE',
        tabId: currentTab.id,
        mode: mode,
        retailer: targetRetailer,
        targetUrl: resolveTargetUrl(currentTab.url, targetRetailer)
      });
    }

    setTimeout(() => {
      try {
        window.close();
      } catch (e) {}
    }, 120);
  }

  if (btnClipInstant) {
    btnClipInstant.addEventListener('click', () => triggerClip('instant'));
  }
  if (btnClipIndividual) {
    btnClipIndividual.addEventListener('click', () => triggerClip('individual'));
  }

  if (btnOverrideLogin) {
    btnOverrideLogin.addEventListener('click', async () => {
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!currentTab) return;
      setRunning(true);
      btnOverrideLogin.style.display = 'none';
      statusMessage.textContent = '⚡ Overriding login check & starting clip...';
      const targetRetailer = activeRetailerOverride || detectRetailer(currentTab.url);
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id, allFrames: targetRetailer === 'shoprite' },
        files: ['content.js']
      });
      chrome.tabs.sendMessage(currentTab.id, { type: 'CS_OVERRIDE_LOGIN', mode: 'instant' });
      setTimeout(() => {
        try { window.close(); } catch (e) {}
      }, 150);
    });
  }

  btnStop.addEventListener('click', async () => {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (currentTab) {
      chrome.tabs.sendMessage(currentTab.id, { type: 'CS_STOP_BROADCAST' });
      chrome.runtime.sendMessage({ type: 'CS_STOP_BROADCAST' });
      setRunning(false);
      statusMessage.textContent = 'Stopped by user';
    }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'CS_LOGIN_REQUIRED' || msg.isLoggedOut) {
      showLoginRequiredStatus();
    } else if (msg.type === 'CS_PROGRESS') {
      statCount.textContent = msg.clipped;
      statusMessage.textContent = msg.status;
      if (msg.isRunning !== undefined) setRunning(msg.isRunning);
    } else if (msg.type === 'CS_COMPLETED' || msg.type === 'CS_SESSION_COMPLETE') {
      setRunning(false);
      if (msg.allAlreadyLoaded || (msg.clipped === 0 && !msg.stopped)) {
        showUpToDateStatus();
      } else {
        const finalCount = msg.clipped ?? msg.totalClipped ?? 0;
        statCount.textContent = finalCount;
        statusMessage.textContent = \`Finished! \${finalCount} coupons clipped.\`;
      }
    }
  });
});
`;

  const readme = `# CouponSweep — Digital Coupon Loader Chrome Extension (Manifest V3)
## Multi-Retailer Support: ShopRite, Walgreens, CVS, Family Dollar, and Kroger

> **Disclaimer:** Independent coupon loader extension for automated grocery & pharmacy savings. Not affiliated with the respective retailers.

Clicking the extension icon navigates directly to your loyalty coupon page:
- **ShopRite**: Digital Coupons (\`shoprite.com/sm/planning/digital-coupon\`) with dynamic store RSID preservation
- **Walgreens**: Digital Offers (\`walgreens.com/offers/offers.jsp\`) for myWalgreens™ Cash Rewards & discounts
- **CVS**: ExtraCare Deals (\`cvs.com/extracare/home\`)
- **Family Dollar**: Smart Coupons (\`familydollar.com/smart-coupons\`)
- **Kroger**: Shopper's Card Digital Coupons (\`kroger.com/savings/cl/coupons/\`)

## Key Features
- **Multi-Retailer Engine**: Detects whether you are browsing ShopRite, Walgreens, CVS, Family Dollar, or Kroger and loads the appropriate coupon engine.
- **Universal Store RSID**: Works with **any** ShopRite store number (e.g. \`rsid/521\`, \`rsid/218\`, etc.).
- **1-Click Auto-Pilot**: Directs you to the digital coupons page and immediately loads all available offers.
- **Instant vs Step-by-Step Modes**: Choose between ultra-fast batch loading (Instant) or visual glide highlighting (Step-by-Step).
- **Login Detection**: Detects if you are signed out and alerts you to sign in.
- **In-Page Floating HUD**: Displays live clipping counter and Stop button directly on the page.
- **Manifest V3 Compliant**: Uses background service workers and host permissions for instant execution.

## Quick 30-Second Chrome Installation

1. **Download & Extract**:
   - Click **Download Extension (.zip)** in the app.
   - Extract the downloaded ZIP to a folder (e.g. \`CouponSweep-Extension\`).

2. **Open Extensions in Chrome**:
   - Navigate to \`chrome://extensions\` in Google Chrome.

3. **Enable Developer Mode**:
   - In the top-right corner, switch **Developer mode** to **ON**.

4. **Load Unpacked**:
   - Click **Load unpacked** (top-left) and select the unzipped folder.

5. **Pin & Click!**:
   - Pin the extension icon to your Chrome toolbar.
   - Click it once from any tab to load all coupons to your loyalty card!
`;

  return [
    {
      filename: 'manifest.json',
      path: 'manifest.json',
      language: 'json',
      content: JSON.stringify(manifest, null, 2),
      description: 'Manifest V3 configuration with host permissions for ShopRite and Walgreens digital coupon platforms.'
    },
    {
      filename: 'background.js',
      path: 'background.js',
      language: 'javascript',
      content: backgroundJs,
      description: 'Background service worker supporting multi-retailer URL routing, active tab detection, and multi-frame clipper coordination.'
    },
    {
      filename: 'content.js',
      path: 'content.js',
      language: 'javascript',
      content: contentJs,
      description: 'In-page engine with retailer-specific login detection (ShopRite Price Plus & Walgreens myWalgreens), smooth scrolling, and floating progress HUD.'
    },
    {
      filename: 'popup.html',
      path: 'popup.html',
      language: 'html',
      content: popupHtml,
      description: 'Extension popup with Retailer selector, Instant Mode, Step-by-Step Mode, and live coupon counter.'
    },
    {
      filename: 'popup.js',
      path: 'popup.js',
      language: 'javascript',
      content: popupJs,
      description: 'Popup logic coordinating retailer routing, mode selection, and status updates.'
    },
    {
      filename: 'popup.css',
      path: 'popup.css',
      language: 'css',
      content: popupCss,
      description: 'Modern neutral styling for the extension popup.'
    },
    {
      filename: 'README.md',
      path: 'README.md',
      language: 'markdown',
      content: readme,
      description: 'Step-by-step setup guide for loading the unpacked extension into Chrome.'
    }
  ];
}
