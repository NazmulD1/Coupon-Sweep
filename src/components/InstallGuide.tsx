import React, { useState } from 'react';
import { Download, FolderArchive, Chrome, CheckCircle2, AlertTriangle, HelpCircle, ExternalLink, Sliders, PlayCircle, ShieldCheck, Store } from 'lucide-react';
import couponLoaderLogo from '../assets/images/couponsweep_logo_1789261566330.jpg';

interface InstallGuideProps {
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const INSTALL_STEPS = [
  {
    stepNumber: '01',
    title: 'Download & Extract the Extension ZIP',
    description: 'Click the "Download Extension (.zip)" button to get the pre-packaged Chrome Manifest V3 bundle. Extract/unzip the file into a folder on your computer (e.g. Documents/CouponSweep-Extension).',
    actionText: 'Download Extension .ZIP',
    tag: 'Step 1'
  },
  {
    stepNumber: '02',
    title: 'Open chrome://extensions in Chrome',
    description: 'Open a new tab in Google Chrome (or Edge / Brave) and navigate to chrome://extensions in the address bar, then press Enter.',
    tip: 'In Microsoft Edge, navigate to edge://extensions; in Brave, go to brave://extensions.',
    tag: 'Step 2'
  },
  {
    stepNumber: '03',
    title: 'Enable "Developer mode"',
    description: 'In the top-right corner of the Extensions manager page, toggle the "Developer mode" switch to ON. This reveals the unpacked extension loading buttons.',
    tag: 'Step 3'
  },
  {
    stepNumber: '04',
    title: 'Click "Load unpacked" and Select Folder',
    description: 'Click the "Load unpacked" button in the top-left toolbar. In the file picker, select the folder you extracted in Step 1 (the folder containing manifest.json).',
    tag: 'Step 4'
  },
  {
    stepNumber: '05',
    title: 'Pin & Click the Extension Icon!',
    description: 'Pin the blue extension icon to your Chrome toolbar. Click it once from ANY browser tab: it instantly directs you to the digital coupons page and automatically clips all available digital coupons to your loyalty card!',
    tag: 'Step 5'
  }
];

export function InstallGuide({ onDownloadZip, isDownloading }: InstallGuideProps) {
  const [activeTab, setActiveTab] = useState<'chrome' | 'troubleshooting' | 'bookmarklet'>('chrome');

  const bookmarkletCode = `javascript:(async function(){console.log("🚀 CouponSweep starting...");const sleep=m=>new Promise(r=>setTimeout(r,m));function getButtons(doc=document){let found=[];try{found=Array.from(doc.querySelectorAll('button,[role="button"],a[role="button"]'));}catch(e){}try{let iframes=doc.querySelectorAll('iframe');for(let f of iframes){try{if(f.contentDocument){found=found.concat(Array.from(f.contentDocument.querySelectorAll('button,[role="button"]')));} }catch(e){}} }catch(e){}return found;}const kws=['load coupon','clip coupon','add to card','clip offer','load offer','load to card','clip to card','save to card','clip','load'];const processed=new WeakSet();function isUnclipped(b){if(processed.has(b))return false;let t=((b.textContent||'')+' '+(b.getAttribute('aria-label')||'')).toLowerCase();if(t.includes('clipped')||t.includes('added')||t.includes('eligible')||t.includes('terms')||b.disabled)return false;return kws.some(k=>t.includes(k));}function findLoadMore(){const candidates=getButtons();for(let el of candidates){if(el.disabled)continue;const txt=((el.innerText||el.textContent||'')+' '+(el.getAttribute('aria-label')||'')).toLowerCase();if(txt.includes('load more')||txt.includes('show more')||txt.includes('view more')||txt.includes('more coupons'))return el;}return null;}function getScrollables(){let list=new Set();let divs=document.querySelectorAll('div,section,main,[role="dialog"]');for(let d of divs){if(d.scrollHeight>d.clientHeight+30&&d.clientHeight>120){let s=window.getComputedStyle(d);let ov=(s.overflowY||'')+(s.overflow||'');if(ov.includes('auto')||ov.includes('scroll'))list.add(d);}}return Array.from(list);}let total=0;let emptyRounds=0;while(emptyRounds<12){let unclipped=getButtons().filter(isUnclipped);if(unclipped.length>0){emptyRounds=0;for(let btn of unclipped){try{processed.add(btn);btn.scrollIntoView({behavior:'smooth',block:'center'});btn.style.outline='3px solid #6366f1';await sleep(120);btn.click();total++;await sleep(150);btn.style.outline='';}catch(e){}}window.scrollBy({top:600,behavior:'smooth'});for(let sc of getScrollables()){sc.scrollBy({top:600,behavior:'smooth'});}await sleep(700);continue;}let lm=findLoadMore();if(lm){try{lm.scrollIntoView({behavior:'smooth',block:'center'});lm.click();await sleep(1800);emptyRounds=0;continue;}catch(e){}}emptyRounds++;window.scrollBy({top:800,behavior:'smooth'});for(let sc of getScrollables()){sc.scrollBy({top:800,behavior:'smooth'});}await sleep(750);}alert('🎉 Done! Successfully clipped '+total+' coupons to your account!');})();`;

  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('chrome')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'chrome'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Chrome className="w-4 h-4 text-red-500" />
          <span>Chrome Installation (5 Easy Steps)</span>
        </button>

        <button
          onClick={() => setActiveTab('troubleshooting')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'troubleshooting'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>Troubleshooting & FAQ</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarklet')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'bookmarklet'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-500" />
          <span>1-Click Bookmarklet Alternative</span>
        </button>
      </div>

      {/* Chrome Guide */}
      {activeTab === 'chrome' && (
        <div className="space-y-6">
          {/* Manifest error quick-fix banner */}
          <div className="bg-amber-950/40 border-2 border-amber-500/50 rounded-xl p-4.5 text-xs text-amber-200 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                    Seeing "Manifest file is missing or unreadable"?
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Quick 10-Second Fix
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  This happens when Chrome is pointed at a parent folder instead of the exact folder containing <code className="text-amber-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">manifest.json</code>. When you unzip files, archive tools often create a subfolder.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-red-500/30 font-mono text-[11px]">
                    <div className="text-red-400 font-bold mb-1 flex items-center gap-1.5">
                      <span>❌ What causes the error:</span>
                    </div>
                    <div className="text-slate-400 space-y-0.5">
                      <div>📁 .../couponsweep-chrome-extension/ <span className="text-red-400 font-bold">&larr; Selected this</span></div>
                      <div className="pl-4">📁 couponsweep/</div>
                      <div className="pl-8 text-amber-300">📄 manifest.json (hidden inside!)</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-500/30 font-mono text-[11px]">
                    <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                      <span>✅ How to fix it:</span>
                    </div>
                    <div className="text-slate-300 space-y-1">
                      <div>1. Click <strong>Load unpacked</strong> again.</div>
                      <div>2. Double-click <strong>into</strong> your downloaded folder.</div>
                      <div>3. Select the folder that <strong>directly holds manifest.json</strong>!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-red-500/50 shadow-xl shadow-red-950/80 flex-shrink-0 bg-white p-0.5">
                <img
                  src={couponLoaderLogo}
                  alt="CouponSweep Logo"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span>Ready to Install in Chrome, Edge, or Brave</span>
                  <span className="text-[11px] bg-red-600/30 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono">
                    Manifest V3
                  </span>
                </h3>
                <p className="text-slate-400 text-xs mt-1 max-w-xl">
                  Takes less than 30 seconds. No store registration or developer account required because Chrome allows developer-mode sideloading.
                </p>
              </div>
            </div>
            <button
              onClick={onDownloadZip}
              disabled={isDownloading}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Packaging...' : 'Download Extension (.zip)'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {INSTALL_STEPS.map((step, idx) => (
              <div
                key={step.stepNumber}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 flex items-start gap-4 transition-all hover:border-slate-700"
              >
                <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 text-red-400 font-black text-sm flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-bold text-sm">{step.title}</h4>
                    <span className="text-[10px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      {step.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{step.description}</p>
                  {step.tip && (
                    <div className="mt-2 text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded inline-block">
                      💡 {step.tip}
                    </div>
                  )}
                  {step.actionText && (
                    <div className="mt-3">
                      <button
                        onClick={onDownloadZip}
                        disabled={isDownloading}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2"
                      >
                        <FolderArchive className="w-3.5 h-3.5 text-red-400" />
                        <span>{step.actionText}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pin Extension Pro Tip */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-white">Pro Tip: Pin the Extension to Your Toolbar</span>
              <p className="text-slate-400">
                Click the puzzle piece icon (🧩) in Chrome's top-right toolbar next to your profile, find <strong>CouponSweep Digital Coupon Loader</strong>, and click the Pin icon. This makes the button visible whenever you're shopping!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      {activeTab === 'troubleshooting' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-xl p-4.5 bg-amber-950/20">
            <h4 className="text-amber-300 font-bold text-sm mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Chrome says "Manifest file is missing or unreadable. Could not load manifest"?
            </h4>
            <div className="text-xs text-slate-300 space-y-2 mt-2 leading-relaxed">
              <p>
                <strong>Root Cause:</strong> Chrome's <em>"Load unpacked"</em> dialog requires you to select the folder that <strong>directly contains</strong> the <code className="text-amber-300">manifest.json</code> file. If your unzipping tool created an outer folder (for example, <code className="text-amber-200">couponsweep-digital-coupon-loader</code>), and placed the actual files in an inner subfolder, Chrome cannot locate the manifest.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                <div className="text-emerald-400 font-bold mb-1">To resolve in 10 seconds:</div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>In Chrome, click <strong>Load unpacked</strong> again.</li>
                  <li>In the file dialog, double-click into your folder (e.g. <em>couponsweep-digital-coupon-loader</em>).</li>
                  <li>Select the inner folder that has <strong>manifest.json</strong> sitting directly inside it.</li>
                  <li>Click <strong>Select Folder</strong> (or <strong>Open</strong>). The extension will load immediately!</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-xl p-4.5 bg-emerald-950/20">
            <h4 className="text-emerald-300 font-bold text-sm mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Fixed in v1.3.0: Counter stopped prematurely (e.g. at 34) while still clipping
            </h4>
            <div className="text-xs text-slate-300 space-y-2 mt-2 leading-relaxed">
              <p>
                <strong>Why this happened:</strong> Most retailer sites load digital coupons in batches. When the first batch was clipped, an auxiliary frame or brief lull in network rendering triggered an early "no offers found" exit condition, causing the notification to display before subsequent batches finished loading.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <div className="text-emerald-400 font-bold">What v1.3.0 does differently:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                  <li><strong>Single Active Clipper Leader:</strong> Elects one active clipper frame to eliminate race conditions between frames.</li>
                  <li><strong>Automated "Load More" Clicking:</strong> Detects and clicks "Load More" / "Show More" buttons between batches.</li>
                  <li><strong>Active Spinner & Server Request Detection:</strong> Detects pending network requests and loading spinners, pausing gracefully until new offers populate.</li>
                  <li><strong>Patient 12-Cycle Verification Loop:</strong> Extends verification passes from 4 to 12 with bidirectional scroll agitation to guarantee every single coupon is clipped before completion.</li>
                  <li><strong>Accurate Live HUD Synchronization:</strong> Synchronizes live counts in real-time through the background service worker so the HUD always reflects total clipped coupons.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
            <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Fixed in v1.2.0: "Successfully clipped 0 coupons" on Inner Window / Iframe
            </h4>
            <div className="text-xs text-slate-300 space-y-2 mt-2 leading-relaxed">
              <p>
                <strong>Why this happened:</strong> Retailer digital coupon sections are often rendered in an inner scrollable sub-window (e.g. an embedded scroll pane, modal dialog, or third-party iframe). Standard scripts only search the top-level <code className="text-amber-300">window</code> or get trapped in the first navigation header.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <div className="text-emerald-400 font-bold">What v1.2.0 does differently:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                  <li><strong>Multi-Frame Injection:</strong> Injects content scripts directly into all child frames and iframes (<code className="text-amber-300">all_frames: true</code>).</li>
                  <li><strong>Deep Container Discovery:</strong> Resolves scrollable parents directly from the coupon buttons, modals (<code className="text-amber-300">[role="dialog"]</code>), and flyouts rather than guessing an arbitrary div.</li>
                  <li><strong>Dual Scrolling:</strong> Concurrently scrolls both inner windows and the browser viewport, dispatching synthetic scroll & wheel events.</li>
                  <li><strong>Offers Already Clipped:</strong> If all visible coupons are already clipped to your Price Plus loyalty card, the extension will accurately inform you that all offers are loaded!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              Can I use this on different store locations or retailers?
            </h4>
            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                <strong>Yes, absolutely!</strong> CouponSweep works out-of-the-box on CVS, Walgreens, Family Dollar, ShopRite, and Kroger.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                <li><strong>Auto-Detection on Active Tab:</strong> If you are already on a supported coupons page, clicking the extension automatically detects and preserves your current session state without redirecting you.</li>
                <li><strong>Custom Default Store:</strong> In the <strong>Settings</strong> tab, you can enter any store number (such as 521 for ShopRite) or tweak default retailer targets.</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              What if the store changes their coupon button names?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Retailers occasionally tweak button text from "Load Coupon" to "Clip Coupon", "Add to Card", or "Clip Offer". CouponSweep matches all of these variations and also inspects accessibility <code className="text-amber-300">aria-label</code> tags. You can also customize target keywords in the <strong>Settings</strong> tab!
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Do I need to stay on the page while it clips?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yes, keep the tab open because it uses smooth in-page scrolling to trigger lazy loading. However, you can close the extension popup window — our extension mounts an in-page floating status HUD directly on the page so clipping continues smoothly in the background!
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-400" />
              Can I adjust the clipping speed if my computer lags?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yes! Open the extension popup, open the "Options" drawer, and select "Safe Mode (450ms)" or use our Speed Configurator in the web app to download an optimized configuration.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              Why does it stop scrolling before all coupons are loaded?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Most digital coupons use dynamic infinite scroll containers. The extension automatically detects scrollable parent <code className="text-amber-300">&lt;div&gt;</code> elements and falls back to window scrolling. If your internet connection is slow, increase the "Scroll Delay" in the Configurator to give the servers time to fetch the next batch.
            </p>
          </div>
        </div>
      )}

      {/* Bookmarklet tab */}
      {activeTab === 'bookmarklet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <span>Zero-Install Bookmarklet Option</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                Works on any browser
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              If you are on a restricted machine or don't want to install an extension, you can create a browser bookmark and paste this JavaScript snippet into the bookmark's URL. Clicking the bookmark on the coupons page runs the loader instantly!
            </p>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 relative">
            <pre className="text-[11px] font-mono text-amber-300/90 whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
              {bookmarkletCode}
            </pre>
            <button
              onClick={copyBookmarklet}
              className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedBookmarklet ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Copy Bookmarklet Code</span>
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <strong>How to create a bookmarklet:</strong>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
              <li>Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Ctrl+D</kbd> (or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Cmd+D</kbd>) to bookmark any page.</li>
              <li>Name it "Clip All Coupons".</li>
              <li>Click "Edit" or "More", replace the URL with the copied snippet above, and save.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
