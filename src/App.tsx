import React, { useState, useMemo } from 'react';
import { Download, PlayCircle, Code2, BookOpen, Settings2, Sparkles, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import couponLoaderLogo from './assets/images/couponsweep_logo_1789261566330.jpg';
import { CouponSweepLogo } from './components/CouponSweepLogo';
import { ExtensionConfig } from './types';
import { generateExtensionFiles } from './extension/generator';
import { buildExtensionZip, triggerDownload, createExtensionIconDataUrl } from './extension/zipBuilder';
import { Simulator } from './components/Simulator';
import { CodeViewer } from './components/CodeViewer';
import { InstallGuide } from './components/InstallGuide';
import { ConfigPanel } from './components/ConfigPanel';

const DEFAULT_CONFIG: ExtensionConfig = {
  clickDelay: 150,
  scrollDelay: 800,
  glideDelay: 250,
  scrollStep: 800,
  showHud: true,
  showAlert: true,
  playSound: false,
  customKeywords: ['load coupon', 'clip coupon', 'add to card', 'clip', 'clip offer'],
  targetUrl: 'https://www.shoprite.com/sm/planning/rsid/521/digital-coupon',
  storeRsid: '521',
  clippingStrategy: 'instant',
  extensionMode: 'popup',
  autoStartOnNavigation: true,
  overrideLoginCheck: false
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide' | 'settings'>('simulator');
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_CONFIG);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate files dynamically whenever config updates
  const files = useMemo(() => generateExtensionFiles(config), [config]);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zipBlob = await buildExtensionZip(config);
      triggerDownload(zipBlob, 'couponsweep-extension.zip');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to bundle extension ZIP:', err);
      alert('Error building extension ZIP file.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-red-500 selection:text-white">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-red-600/30 border border-red-500/40 flex-shrink-0 bg-white p-0.5">
              <img
                src={couponLoaderLogo}
                alt="CouponSweep Logo"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  CouponSweep
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  Chrome Extension
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Manifest V3 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auto-clip every digital coupon to your loyalty account with one click
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-header-download-zip"
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/25 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Packaging ZIP...' : 'Download Extension (.zip)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 sm:gap-2 overflow-x-auto text-xs font-semibold border-t border-slate-800/60 pt-1">
          <button
            id="tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`py-2.5 px-3.5 rounded-t-lg flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'border-red-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <PlayCircle className="w-4 h-4 text-red-400" />
            <span>Live Interactive Sandbox</span>
          </button>

          <button
            id="tab-code"
            onClick={() => setActiveTab('code')}
            className={`py-2.5 px-3.5 rounded-t-lg flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-red-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>Extension Files ({files.length})</span>
          </button>

          <button
            id="tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 px-3.5 rounded-t-lg flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-red-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Chrome Installation Guide</span>
          </button>

          <button
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3.5 rounded-t-lg flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-red-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Settings2 className="w-4 h-4 text-blue-400" />
            <span>Speed & Delay Settings</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Quick Explainer Bar */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-200">Packaged from your smooth-scrolling loader script:</span>
              <p className="text-slate-400 mt-0.5">
                We wrapped your code into a Chrome Manifest V3 extension featuring auto-scroll container detection, interactive popup controls, in-page floating status HUD, and zero-risk 1-click ZIP export.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('guide')}
              className="text-red-400 hover:text-red-300 font-semibold underline flex items-center gap-1"
            >
              <span>See 5-step install tutorial &rarr;</span>
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'simulator' && <Simulator config={config} />}

        {activeTab === 'code' && (
          <CodeViewer
            files={files}
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloading}
          />
        )}

        {activeTab === 'guide' && (
          <InstallGuide
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloading}
          />
        )}

        {activeTab === 'settings' && (
          <ConfigPanel
            config={config}
            onChange={setConfig}
            onReset={handleResetConfig}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>CouponSweep &bull; Chrome Manifest V3 Extension</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Fast smooth-scrolling</span>
            <span>&bull;</span>
            <span>Price Plus Loyalty Card</span>
            <span>&bull;</span>
            <button
              onClick={handleDownloadZip}
              className="text-red-400 hover:text-red-300 font-semibold"
            >
              Export ZIP
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
