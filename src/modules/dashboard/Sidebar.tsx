import React, { useMemo } from 'react';
import { BarChart3, CreditCard, DollarSign, Settings } from 'lucide-react';
import { useDashboardNav } from './navStore';
import { useStore } from '../state/store';

const nav = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'settings', label: 'Settings', icon: Settings }
];

export const Sidebar: React.FC = () => {
  const current = useDashboardNav((s: any) => s.page);
  const setPage = useDashboardNav((s: any) => s.setPage);
  const churn = useStore(s => s.metrics.churn);
  const churnSeries = useMemo(()=>Array.from({length:12}).map((_,i)=> (churn + (Math.sin(i/2)*0.8) + (Math.random()*0.6-0.3))).map(v=>Math.max(0,v)),[churn]);
  const churnLatest = churnSeries[churnSeries.length-1];
  const churnPrev = churnSeries[churnSeries.length-2] || churnLatest;
  const churnDirUp = churnLatest > churnPrev;
  const churnMax = Math.max(...churnSeries);
  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-neutral-900 bg-neutral-950/90 backdrop-blur-sm relative shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-grid-sm opacity-10" />
  <div className="h-16 flex items-center px-6 text-lg font-semibold tracking-wide border-b border-neutral-900 bg-gradient-to-br from-neutral-900/80 to-neutral-950/80">
        <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent font-bold tracking-tight">FinDash</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <div className="space-y-1">
          {nav.map(item => {
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key as any)}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all overflow-hidden ring-1 ring-inset ${active ? 'text-white ring-brand-primary/60 bg-gradient-to-r from-brand-primary/25 to-brand-accent/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_12px_-2px_rgba(0,0,0,0.6)]' : 'text-neutral-400 ring-neutral-800/70 hover:text-neutral-200 hover:bg-neutral-900/60 hover:ring-neutral-700/80'}`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-brand-accent/10 rounded-[inherit]`} />
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-primary to-brand-accent rounded-r-md shadow-[0_0_0_1px_rgba(255,255,255,0.12)]" />
                )}
                <item.icon className={`w-4 h-4 flex-shrink-0 transition-all ${active ? 'text-brand-accent drop-shadow glow-sm' : 'opacity-60 group-hover:opacity-90'}`} />
                <span className="relative z-10">{item.label}</span>
                <span className="absolute inset-px rounded-[inherit] pointer-events-none border border-white/5" />
              </button>
            );
          })}
        </div>
        <div className="pt-6 space-y-4">
          <div className="px-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500/70">Dashboard Pulse</div>
          <div className="grid gap-4">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-neutral-900/75 to-neutral-950/80 ring-1 ring-neutral-800/80 text-[11px] text-neutral-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(59,130,246,0.22),transparent_65%)] opacity-40 pointer-events-none" />
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex flex-col leading-tight">
                  <span className="text-[9.5px] uppercase tracking-[0.18em] text-neutral-400 font-semibold">Run Rate</span>
                  <span className="text-[13px] font-semibold text-neutral-100 mt-1">$1.42M</span>
                </div>
                <div className="flex flex-col items-end leading-tight mt-0.5">
                  <span className="text-[10px] font-mono text-emerald-300">↑ 3.2%</span>
                </div>
              </div>
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[9.5px] tracking-wide text-neutral-500">
                  <span>Progress</span><span className="font-mono text-neutral-400">66%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-800/80 rounded-full overflow-hidden ring-1 ring-neutral-800/60">
                  <div className="h-full w-2/3 bg-gradient-to-r from-brand-primary via-brand-primary/70 to-brand-accent" />
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/15 via-brand-accent/10 to-brand-primary/15 ring-1 ring-brand-primary/30 text-[11px] text-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-rose-300 font-semibold">Churn Watch</div>
                <div className={`text-[10px] font-mono ${churnDirUp ? 'text-rose-300' : 'text-emerald-300'}`}>{churnDirUp? '↑':'↓'} {(Math.abs(churnLatest-churnPrev)).toFixed(2)}%</div>
              </div>
              <div className="flex items-end gap-0.5 h-10">
                {churnSeries.map((v,i)=> (
                  <span key={i} className={`flex-1 rounded-sm ${i===churnSeries.length-1 ? 'bg-gradient-to-t from-rose-500 to-rose-300' : 'bg-neutral-700/60'} transition-all`} style={{ height: `${(v/churnMax)*100}%` }} />
                ))}
              </div>
              <div className="text-[10px] tracking-wide text-neutral-400">Current: <span className="text-neutral-200 font-semibold">{churnLatest.toFixed(2)}%</span></div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/70 ring-1 ring-neutral-800/80 text-[11px] text-neutral-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">System Health</div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </div>
              </div>
              <div className="text-[11px] leading-relaxed">Latency normal. Ingestion queue <span className="text-amber-300">42%</span> utilized.</div>
              <div className="relative h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-emerald-400 to-brand-accent" />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="p-4 text-[10px] tracking-wider uppercase text-neutral-600 border-t border-neutral-900">v0.1.0</div>
    </aside>
  );
};
