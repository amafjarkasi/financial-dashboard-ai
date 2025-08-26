import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const MetricsGrid: React.FC = () => {
  const { kpis } = useDashboardData();
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map(k => (
        <div key={k.id} className="group relative overflow-hidden rounded-xl2 border border-neutral-800/70 bg-neutral-900/60 backdrop-blur-sm px-5 pt-4 pb-5 flex flex-col shadow-soft hover:shadow-glow transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-radial-fade" />
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-400 font-semibold">{k.label}</div>
            <div className={`text-[10px] px-2 py-1 rounded-md font-semibold bg-neutral-800/70 ${k.delta >=0 ? 'text-emerald-300' : 'text-red-300'}`}>{k.delta >=0 ? '▲' : '▼'} {Math.abs(k.delta).toFixed(1)}%</div>
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-neutral-100 drop-shadow-sm animate-fade-in-up">{k.display}</div>
          <div className={`mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium ${k.delta >=0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {k.delta >=0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span className="opacity-80">vs last month</span>
          </div>
        </div>
      ))}
    </section>
  );
};
