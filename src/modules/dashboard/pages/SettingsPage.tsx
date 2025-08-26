import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAISidebar } from '../ai/aiStore';
import { PageHeader } from '../components/PageHeader';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { panelWidth, fontSize, setFontSize, compactMode, setCompactMode } = useAISidebar();
  return (
    <div className="space-y-12">
  <PageHeader title="Settings" subtitle="Fine‑tune analytics behavior, personalization and forthcoming governance capabilities." />
      <div className="grid xl:grid-cols-3 gap-8">
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 space-y-6 shadow-soft">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-neutral-200">Theme Mode</div>
              <div className="text-xs text-neutral-500">Current: {theme}</div>
            </div>
            <button onClick={toggleTheme} className="px-3 py-1.5 rounded-md bg-gradient-to-r from-brand-primary to-brand-accent text-white text-sm font-medium shadow-soft hover:opacity-90">Toggle</button>
          </div>
          <div className="h-px bg-neutral-800" />
          <div>
            <div className="font-medium text-neutral-200 mb-1">AI Panel Width</div>
            <div className="text-xs text-neutral-500">Current: {panelWidth}px (drag panel edge to resize)</div>
          </div>
          <div className="h-px bg-neutral-800" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium text-neutral-200">AI Font Size</div>
              <div className="text-xs text-neutral-500">{fontSize}px</div>
            </div>
            <div className="flex gap-2">
              {[
                { label: 'S', value: 13 },
                { label: 'M', value: 15 },
                { label: 'L', value: 17 },
                { label: 'XL', value: 19 }
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => setFontSize(p.value)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${fontSize === p.value ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white border-transparent' : 'border-neutral-700/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-500'}`}
                >{p.label}</button>
              ))}
            </div>
          </div>
          <div className="h-px bg-neutral-800" />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-neutral-200">Compact Mode</div>
              <div className="text-xs text-neutral-500">Tighter message spacing in AI panel</div>
            </div>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${compactMode ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white border-transparent' : 'border-neutral-700/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-500'}`}
            >{compactMode ? 'On' : 'Off'}</button>
          </div>
        </div>
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 space-y-6 shadow-soft">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Account</h3>
          <div className="space-y-4 text-xs text-neutral-400">
            <p>Link billing, configure usage limits and manage access policies.</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 rounded-md bg-neutral-800/70 hover:bg-neutral-700 text-neutral-200 text-xs font-medium ring-1 ring-neutral-700/70">Manage Team</button>
              <button className="px-3 py-2 rounded-md bg-neutral-800/70 hover:bg-neutral-700 text-neutral-200 text-xs font-medium ring-1 ring-neutral-700/70">Usage Limits</button>
              <button className="px-3 py-2 rounded-md bg-neutral-800/70 hover:bg-neutral-700 text-neutral-200 text-xs font-medium ring-1 ring-neutral-700/70 col-span-2">Access Policies</button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 space-y-6 shadow-soft">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Experimental</h3>
          <div className="space-y-4 text-xs text-neutral-400">
            <p>Early feature flags and beta capabilities for upcoming analytics modules.</p>
            <div className="space-y-3">
              {['Predictive Cohorts','Anomaly Alerts','Auto-Segmentation'].map(flag => (
                <label key={flag} className="flex items-center justify-between gap-4 px-3 py-2 rounded-lg bg-neutral-800/60 ring-1 ring-neutral-700/60">
                  <span className="text-neutral-300 font-medium tracking-wide text-[11px]">{flag}</span>
                  <input type="checkbox" className="accent-brand-primary" disabled />
                </label>
              ))}
            </div>
            <div className="text-[10px] text-neutral-500 tracking-wide">Feature flags are illustrative placeholders.</div>
          </div>
        </div>
      </div>
    </div>
  );
};