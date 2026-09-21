import React, { useState } from 'react';
import { Copy, Check, FileCode, Info, ExternalLink, Download, FileDown, Image as ImageIcon } from 'lucide-react';
import { GeneratedFile } from '../types';
import { triggerFileDownload } from '../extension/zipBuilder';
import couponLoaderLogo from '../assets/images/couponsweep_logo_1789261566330.jpg';

interface CodeViewerProps {
  files: GeneratedFile[];
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export function CodeViewer({ files, onDownloadZip, isDownloading }: CodeViewerProps) {
  const [activeFileIndex, setActiveFileIndex] = useState<number | 'icons'>(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const activeFile = typeof activeFileIndex === 'number' ? (files[activeFileIndex] || files[0]) : null;

  const handleCopy = (filename: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadSingleFile = (file: GeneratedFile) => {
    let mime = 'text/plain';
    if (file.language === 'json') mime = 'application/json';
    else if (file.language === 'javascript') mime = 'application/javascript';
    else if (file.language === 'html') mime = 'text/html';
    else if (file.language === 'css') mime = 'text/css';
    triggerFileDownload(file.filename, file.content, mime);
  };

  const getLanguageBadge = (lang: string) => {
    switch (lang) {
      case 'json':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'javascript':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'html':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'css':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Top action toolbar */}
      <div className="bg-slate-950 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {files.map((file, idx) => (
            <button
              key={file.filename}
              onClick={() => setActiveFileIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeFileIndex === idx
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          ))}

          {/* Extension Icons Tab */}
          <button
            onClick={() => setActiveFileIndex('icons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeFileIndex === 'icons'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-900 text-amber-400 hover:text-amber-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>icons/ (PNGs)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeFile && (
            <>
              <button
                onClick={() => handleCopy(activeFile.filename, activeFile.content)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedFile === activeFile.filename ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied {activeFile.filename}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownloadSingleFile(activeFile)}
                title={`Download ${activeFile.filename} directly`}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Download {activeFile.filename}</span>
              </button>
            </>
          )}

          <button
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Bundling...' : 'Download .ZIP'}</span>
          </button>
        </div>
      </div>

      {activeFileIndex === 'icons' ? (
        /* Icons Preview Screen */
        <div className="p-6 bg-slate-950 flex flex-col gap-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Extension Icon Suite (CouponSweep Loader)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Exported inside <code className="text-amber-300">icons/</code> as required by Chrome Manifest V3 for toolbar actions and extension management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center text-center gap-3">
              <span className="text-[11px] font-bold text-slate-400">icon16.png (16x16 Favicon)</span>
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-300 shadow-sm flex items-center justify-center p-0.5">
                <img src={couponLoaderLogo} alt="16px Icon" className="w-5 h-5 object-cover rounded-xs" referrerPolicy="no-referrer" />
              </div>
              <span className="text-[10px] text-slate-500">Browser tab & address bar</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center text-center gap-3">
              <span className="text-[11px] font-bold text-slate-400">icon48.png (48x48 Toolbar)</span>
              <div className="w-16 h-16 rounded-xl bg-white border border-red-500/40 shadow-lg shadow-red-950/40 flex items-center justify-center p-1">
                <img src={couponLoaderLogo} alt="48px Icon" className="w-12 h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
              </div>
              <span className="text-[10px] text-slate-500">Chrome extension toolbar button</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center text-center gap-3">
              <span className="text-[11px] font-bold text-slate-400">icon128.png (128x128 High-Res)</span>
              <div className="w-24 h-24 rounded-2xl bg-white border-2 border-red-500/50 shadow-xl shadow-red-950/40 flex items-center justify-center p-1.5">
                <img src={couponLoaderLogo} alt="128px Icon" className="w-20 h-20 object-cover rounded-xl" referrerPolicy="no-referrer" />
              </div>
              <span className="text-[10px] text-slate-500">Chrome Web Store & Manage Extensions</span>
            </div>
          </div>
        </div>
      ) : activeFile ? (
        <>
          {/* File Description Header */}
          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300 font-semibold">{activeFile.path}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getLanguageBadge(activeFile.language)}`}>
                {activeFile.language}
              </span>
            </div>
            <p className="text-slate-400 text-xs truncate max-w-md hidden sm:block">
              {activeFile.description}
            </p>
          </div>

          {/* Code area */}
          <div className="relative">
            <pre className="p-4 text-xs font-mono text-slate-200 bg-slate-950 overflow-x-auto max-h-[500px] leading-relaxed select-text">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </>
      ) : null}

      {/* Manifest V3 Architecture Notes */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white">How Chrome Manifest V3 runs this extension:</span>
          <p className="text-slate-400 leading-relaxed">
            When you click the extension action on the coupons page, <code className="text-amber-300">popup.html</code> and <code className="text-amber-300">popup.js</code> check the current tab URL and trigger <code className="text-amber-300">content.js</code> via <code className="text-amber-300">chrome.scripting.executeScript</code>. The content script uses bidirectional <code className="text-amber-300">chrome.runtime</code> messaging to stream real-time coupon clipping progress, and mounts an unobtrusive floating HUD on the webpage so you can close the popup while clipping continues!
          </p>
        </div>
      </div>
    </div>
  );
}
