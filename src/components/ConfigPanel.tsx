import React, { useState } from 'react';
import { Sliders, Gauge, Eye, Bell, Zap, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { ExtensionConfig } from '../types';

interface ConfigPanelProps {
  config: ExtensionConfig;
  onChange: (newConfig: ExtensionConfig) => void;
  onReset: () => void;
}

export function ConfigPanel({ config, onChange, onReset }: ConfigPanelProps) {
  const [newKeyword, setNewKeyword] = useState('');

  const applyPreset = (type: 'fast' | 'balanced' | 'safe') => {
    if (type === 'fast') {
      onChange({
        ...config,
        clickDelay: 100,
        scrollDelay: 600,
        glideDelay: 150,
        scrollStep: 1000
      });
    } else if (type === 'balanced') {
      onChange({
        ...config,
        clickDelay: 150,
        scrollDelay: 800,
        glideDelay: 250,
        scrollStep: 800
      });
    } else {
      onChange({
        ...config,
        clickDelay: 350,
        scrollDelay: 1200,
        glideDelay: 400,
        scrollStep: 600
      });
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const kw = newKeyword.trim().toLowerCase();
    if (!config.customKeywords.includes(kw)) {
      onChange({
        ...config,
        customKeywords: [...config.customKeywords, kw]
      });
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (index: number) => {
    onChange({
      ...config,
      customKeywords: config.customKeywords.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-red-500" />
            <span>Extension Parameters & Auto-Pilot Tuning</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjust single-click target URL, execution modes, and scroll delays. Changes auto-update the generated extension files and ZIP bundle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Presets:</span>
          <button
            onClick={() => applyPreset('fast')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded border border-slate-700 flex items-center gap-1 transition-all"
          >
            <Zap className="w-3 h-3" /> Fast
          </button>
          <button
            onClick={() => applyPreset('balanced')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded border border-slate-700 flex items-center gap-1 transition-all"
          >
            <Gauge className="w-3 h-3" /> Balanced
          </button>
          <button
            onClick={() => applyPreset('safe')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded border border-slate-700 flex items-center gap-1 transition-all"
          >
            Safe
          </button>
          <button
            onClick={onReset}
            className="p-1 text-slate-400 hover:text-white"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clipping Strategy: 1-Click Instant Batch vs Individual Step-by-Step */}
      <div className="bg-slate-950 p-4 rounded-xl border border-red-900/30 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Coupon Loading Style (Clipping Strategy)</span>
          </label>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-medium">
            Toggleable Anytime
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => onChange({ ...config, clippingStrategy: 'instant' })}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                config.clippingStrategy === 'instant'
                  ? 'bg-amber-950/30 border-amber-500/70 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                    config.clippingStrategy === 'instant' ? 'border-amber-400 bg-amber-500' : 'border-slate-500'
                  }`}></span>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    ⚡ 1-Click Instant (Load All at Once)
                  </span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">Fast</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 pl-5 leading-relaxed">
                Clicks all available coupons in rapid concurrent batches at once without per-button wait delays. The entire page is loaded in seconds.
              </p>
            </div>

            <div
              onClick={() => onChange({ ...config, clippingStrategy: 'individual' })}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                config.clippingStrategy === 'individual'
                  ? 'bg-amber-950/30 border-amber-500/70 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                    config.clippingStrategy === 'individual' ? 'border-amber-400 bg-amber-500' : 'border-slate-500'
                  }`}></span>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    🎬 Scroll & Click Individually
                  </span>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">Visual</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 pl-5 leading-relaxed">
                Scrolls to each coupon, highlights with a golden outline, and clicks one-by-one with realistic human pacing.
              </p>
            </div>
          </div>
        </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Click Delay */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="cfg-click-delay" className="font-semibold text-slate-200">
              Post-Click Registration Wait
            </label>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {config.clickDelay} ms
            </span>
          </div>
          <input
            id="cfg-click-delay"
            type="range"
            min="50"
            max="600"
            step="25"
            value={config.clickDelay}
            onChange={e => onChange({ ...config, clickDelay: Number(e.target.value) })}
            className="w-full accent-red-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Pause after clicking a coupon so the retailer's loyalty API registers the offer to your card.
          </p>
        </div>

        {/* Glide / Scroll Into View Delay */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="cfg-glide-delay" className="font-semibold text-slate-200">
              Smooth Glide to Button Delay
            </label>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {config.glideDelay} ms
            </span>
          </div>
          <input
            id="cfg-glide-delay"
            type="range"
            min="100"
            max="600"
            step="25"
            value={config.glideDelay}
            onChange={e => onChange({ ...config, glideDelay: Number(e.target.value) })}
            className="w-full accent-red-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Time to center each coupon card in viewport smoothly before executing click.
          </p>
        </div>

        {/* Scroll Delay */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="cfg-scroll-delay" className="font-semibold text-slate-200">
              Batch Scroll Wait Delay
            </label>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {config.scrollDelay} ms
            </span>
          </div>
          <input
            id="cfg-scroll-delay"
            type="range"
            min="400"
            max="1800"
            step="50"
            value={config.scrollDelay}
            onChange={e => onChange({ ...config, scrollDelay: Number(e.target.value) })}
            className="w-full accent-red-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Allows the infinite-scrolling feed to fetch new coupon batches over the network.
          </p>
        </div>

        {/* Scroll Step */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="cfg-scroll-step" className="font-semibold text-slate-200">
              Scroll Step Height
            </label>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {config.scrollStep} px
            </span>
          </div>
          <input
            id="cfg-scroll-step"
            type="range"
            min="400"
            max="1600"
            step="50"
            value={config.scrollStep}
            onChange={e => onChange({ ...config, scrollStep: Number(e.target.value) })}
            className="w-full accent-red-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Pixel distance to advance each scroll iteration.
          </p>
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
        <label className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showHud}
            onChange={e => onChange({ ...config, showHud: e.target.checked })}
            className="mt-1 accent-red-500 rounded"
          />
          <div>
            <div className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>In-Page Floating Progress HUD</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Displays a real-time floating badge on the page showing coupons clipped and a Stop button.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showAlert}
            onChange={e => onChange({ ...config, showAlert: e.target.checked })}
            className="mt-1 accent-red-500 rounded"
          />
          <div>
            <div className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Completion Browser Alert</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Triggers a popup alert with the total clipped count when finished.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 cursor-pointer sm:col-span-2">
          <input
            type="checkbox"
            checked={Boolean(config.overrideLoginCheck)}
            onChange={e => onChange({ ...config, overrideLoginCheck: e.target.checked })}
            className="mt-1 accent-red-500 rounded"
          />
          <div>
            <div className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Override Retailer Login Check (Bypass Loyalty Guard)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Forces coupon clipping to start immediately without checking or pausing for loyalty account sign-in (useful on Publix, Walgreens, ShopRite, or Kroger if session detection reports false positives).
            </p>
          </div>
        </label>
      </div>

      {/* Keywords Management */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div>
          <h4 className="text-xs font-bold text-white">Target Button Match Keywords</h4>
          <p className="text-[11px] text-slate-400">Buttons containing any of these phrases will be targeted for clipping.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {config.customKeywords.map((kw, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg text-xs border border-slate-700"
            >
              <span>"{kw}"</span>
              {config.customKeywords.length > 1 && (
                <button
                  onClick={() => handleRemoveKeyword(i)}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Add new keyword (e.g. clip deal)"
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddKeyword()}
            className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-red-500"
          />
          <button
            onClick={handleAddKeyword}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
