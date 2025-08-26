import React, { useMemo, useState } from 'react';
import { useStore } from '../../state/store';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { detectAnomalies } from '../utils/anomaly';
import { RefreshCcw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ChurnWatch } from '../components/ChurnWatch';

export const RevenuePage: React.FC = () => {
  const series = useStore(s => s.revenueSeries);
  const metrics = useStore(s => s.metrics);
  const areaData = series;
  const [view, setView] = useState<'area'|'bar'>(() => {
    try { return (localStorage.getItem('rev.view') as 'area'|'bar') || 'area'; } catch { return 'area'; }
  });
  const pct = (v:number, base:number) => base ? ((v-base)/base)*100 : 0;
  const [showRevenue, setShowRevenue] = useState(() => { try { return localStorage.getItem('rev.showRevenue') !== '0'; } catch { return true; } });
  const [showRolling, setShowRolling] = useState(() => { try { return localStorage.getItem('rev.showRolling') === '0' ? false : true; } catch { return true; } });
  const persist = (k:string,v:string) => { try { localStorage.setItem(k,v);} catch {/* ignore */} };
  const [smooth, setSmooth] = useState(() => { try { return localStorage.getItem('rev.smooth') === '0' ? false : true; } catch { return true; } });
  const rolling = useMemo(()=> areaData.map((d,i)=> ({...d, rolling: i<2? null : Math.round((areaData.slice(i-2,i+1).reduce((a,c)=>a+c.revenue,0)/3)) })), [areaData]);
  const enriched = useMemo(()=> detectAnomalies(rolling as any), [rolling]);
  const anomalies = enriched.filter(e=>e.isAnomaly);
  const severityColor = (severity: string | null) => {
    switch(severity){
      case 'major': return '#f87171';
      case 'moderate': return '#fb923c';
      case 'minor': return '#facc15';
      default: return '#38bdf8';
    }
  };

  // Custom anomaly-aware tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload.find((pl:any)=> pl.dataKey==='revenue') || payload[0];
    const meta = p && p.payload ? p.payload : null;
    const isAnom = meta?.isAnomaly;
    return (
      <div className="rounded-lg border border-neutral-700/70 bg-neutral-900/85 px-3 py-2 text-xs shadow-lg backdrop-blur">
        <div className="font-medium text-neutral-200 mb-1">{label}</div>
        {showRevenue && <div className="text-neutral-300">Revenue: <span className="font-mono">${meta.revenue.toLocaleString()}</span></div>}
        {showRolling && meta.rolling!=null && <div className="text-neutral-400">Rolling Avg: <span className="font-mono">${meta.rolling.toLocaleString()}</span></div>}
        {isAnom && (
          <div className="mt-1 text-[11px]">
            <div className="flex items-center gap-1 text-amber-300">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: severityColor(meta.severity) }} />
              <span className="uppercase tracking-wider font-semibold">Anomaly</span>
            </div>
            <div className="text-neutral-400 mt-0.5">Deviation {meta.deviationPct>0?'+':''}{meta.deviationPct.toFixed(1)}% ({meta.direction==='up'?'above':'below'} avg, {meta.severity})</div>
          </div>
        )}
      </div>
    );
  };

  // Custom dot renderer to highlight anomalies
  const anomalyDot = (props:any) => {
    const { cx, cy, payload } = props;
    if (!payload?.isAnomaly) return <g />; // return empty group to satisfy type
    const color = severityColor(payload.severity);
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill={color} fillOpacity={0.18} />
        <circle cx={cx} cy={cy} r={4} fill={color} fillOpacity={0.35} />
        <circle cx={cx} cy={cy} r={2.1} fill={color} />
        <title>{`${payload.month}: ${payload.direction==='up'?'+':''}${payload.deviationPct.toFixed(1)}% (${payload.severity})`}</title>
      </g>
    );
  };
  return (
    <div className="space-y-12">
      <PageHeader
        title="Revenue Intelligence"
        subtitle="Deep dive into growth dynamics, seasonality and retention pressure points. All data near real-time."
        rightSlot={(
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30">QoQ +7.4%</span>
            <span className="px-2 py-1 rounded-md bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30">Net $ Retention 116%</span>
            <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30">Churn {metrics.churn.toFixed(2)}%</span>
          </div>
        )}
      />
      <div className="grid md:grid-cols-4 gap-5">
        {[{label:'Total Revenue', value:`$${metrics.revenue.toLocaleString()}`, sub:'MTD'},{label:'ARR', value:`$${(metrics.arr/1000).toFixed(1)}k`, sub:'Annualized'},{label:'Churn', value:`${metrics.churn.toFixed(2)}%`, sub:'Net'},{label:'ARPU', value:`$${(metrics.revenue/420).toFixed(2)}`, sub:'Per User'}].map(k => (
          <div key={k.label} className="group relative overflow-hidden rounded-2xl bg-neutral-900/70 ring-1 ring-neutral-800/80 backdrop-blur p-5 shadow-soft flex flex-col">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-brand-primary/15 to-brand-accent/15" />
            <div className="relative flex-1 flex flex-col">
              <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1 font-semibold antialiased">{k.label}</div>
              <div className="text-2xl font-semibold text-neutral-100 tracking-tight">{k.value}</div>
              <div className="mt-auto text-[10px] text-neutral-500 tracking-wide">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>
  <div className="grid lg:grid-cols-3 gap-8">
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft space-y-4 lg:col-span-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] uppercase tracking-[0.2em] text-neutral-400 font-semibold antialiased">Trend Visualization</h3>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg p-1.5 bg-neutral-800/70 ring-1 ring-neutral-700/70 gap-1">
                {(['area','bar'] as const).map(m => (
                  <button key={m} onClick={()=>{ setView(m); try{localStorage.setItem('rev.view', m);}catch(e){ /* ignore */ } }} className={`px-3 py-1.5 rounded-md text-[11px] font-medium tracking-wide transition ${view===m? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}>{m}</button>
                ))}
              </div>
              <button onClick={()=>setSmooth(s=>{ const n=!s; try{localStorage.setItem('rev.smooth', n? '1':'0');}catch{ /* ignore */ } return n; })} className={`px-3 py-1.5 rounded-md text-[11px] font-medium tracking-wide ring-1 ring-neutral-700/60 transition ${smooth ? 'bg-neutral-700/60 text-neutral-200' : 'text-neutral-400 hover:text-neutral-200'}`}>{smooth ? 'Smooth ✓':'Smooth'}</button>
              <button className="p-2.5 rounded-md bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300" aria-label="Refresh data"><RefreshCcw className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <div className="inline-flex gap-1">
              <button onClick={()=>{ setShowRevenue(v=>{ const nv=!v; persist('rev.showRevenue', nv? '1':'0'); return nv; }); }} className={`px-2.5 py-1 rounded-md ring-1 ring-neutral-700/70 transition font-medium ${showRevenue? 'bg-sky-500/20 text-sky-300':'text-neutral-400 hover:text-neutral-200'}`}>Revenue</button>
              <button onClick={()=>{ setShowRolling(v=>{ const nv=!v; persist('rev.showRolling', nv? '1':'0'); return nv; }); }} className={`px-2.5 py-1 rounded-md ring-1 ring-neutral-700/70 transition font-medium ${showRolling? 'bg-indigo-500/20 text-indigo-300':'text-neutral-400 hover:text-neutral-200'}`}>Rolling Avg</button>
            </div>
            <span className="ml-2 text-neutral-500">{anomalies.length} anomalies</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {view==='area' ? (
              <AreaChart data={enriched} margin={{ top:10, right:10, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="85%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f242c" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#5b636e" axisLine={false} tickLine={false} tickMargin={12} interval={0} />
                <YAxis width={70} stroke="#5b636e" axisLine={false} tickLine={false} tickFormatter={v=>'$'+(v/1000).toFixed(0)+'k'} tickMargin={6} />
                <Tooltip content={<CustomTooltip />} />
                {showRevenue && (
                  <Area dataKey="revenue" type={smooth? 'monotone':'linear'} stroke="#3b82f6" strokeWidth={2.4} fill="url(#revArea)" activeDot={anomalyDot} dot={anomalyDot} />
                )}
                {showRolling && (
                  <Area hide={!enriched.some(e=>e.rolling!=null)} dataKey="rolling" type={smooth? 'monotone':'linear'} stroke="#6366f1" strokeWidth={1.6} fill="none" dot={false} />
                )}
              </AreaChart>
            ) : (
              <BarChart data={series} margin={{ top:10, right:10, left:0, bottom:0 }}>
                <CartesianGrid stroke="#1f242c" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#5b636e" axisLine={false} tickLine={false} tickMargin={12} interval={0} />
                <YAxis width={70} stroke="#5b636e" axisLine={false} tickLine={false} tickFormatter={v=>'$'+(v/1000).toFixed(0)+'k'} tickMargin={6} />
                <Tooltip content={<CustomTooltip />} />
                {showRevenue && <Bar dataKey="revenue" radius={[4,4,0,0]} fill="#2563eb" />}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        </div>
        {/* Quick Forecast Panel */}
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft flex flex-col gap-4">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">2‑Month Forecast (Heuristic)</h3>
          {(() => {
            // simple linear projection on last 4 points
            const recent = enriched.slice(-4);
            if (recent.length < 2) return <div className="text-xs text-neutral-500">Not enough data.</div>;
            const xs = recent.map((_,i)=>i);
            const ys = recent.map(r=>r.revenue);
            const n = xs.length;
            const sumX = xs.reduce((a,c)=>a+c,0);
            const sumY = ys.reduce((a,c)=>a+c,0);
            const sumXY = xs.reduce((a,c,i)=>a + c*ys[i],0);
            const sumX2 = xs.reduce((a,c)=>a + c*c,0);
            const slope = (n*sumXY - sumX*sumY)/(n*sumX2 - sumX*sumX || 1);
            const intercept = (sumY - slope*sumX)/n;
            const next1 = Math.round(intercept + slope * n);
            const next2 = Math.round(intercept + slope * (n+1));
            const last = recent[recent.length-1];
            const growth1 = ((next1 - last.revenue)/last.revenue)*100;
            const growth2 = ((next2 - next1)/next1)*100;
            return (
              <div className="space-y-4 text-[11px]">
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-lg bg-neutral-800/60 ring-1 ring-neutral-700/60 space-y-1">
                    <div className="uppercase tracking-wider text-neutral-500 font-semibold text-[10px]">Next Month</div>
                    <div className="text-neutral-200 font-mono text-sm">${next1.toLocaleString()}</div>
                    <div className={`text-[10px] ${growth1>=0?'text-emerald-400':'text-rose-400'}`}>{growth1>=0?'+':''}{growth1.toFixed(1)}%</div>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-neutral-800/60 ring-1 ring-neutral-700/60 space-y-1">
                    <div className="uppercase tracking-wider text-neutral-500 font-semibold text-[10px]">+1 Month</div>
                    <div className="text-neutral-200 font-mono text-sm">${next2.toLocaleString()}</div>
                    <div className={`text-[10px] ${growth2>=0?'text-emerald-400':'text-rose-400'}`}>{growth2>=0?'+':''}{growth2.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="text-neutral-500 leading-relaxed">Heuristic linear fit over last 4 actuals. Replace with ML forecast later. Confidence not computed.</div>
              </div>
            );
          })()}
        </div>
  <ChurnWatch />
  {/* Distribution / Mix Card */}
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft flex flex-col gap-5">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Channel Mix</h3>
          <div className="space-y-3 text-[11px]">
            {[
              { label: 'Self-Serve', val: 46, tone:'from-sky-500 to-sky-400' },
              { label: 'Enterprise', val: 32, tone:'from-violet-500 to-fuchsia-500' },
              { label: 'Partnerships', val: 15, tone:'from-emerald-500 to-emerald-400' },
              { label: 'Resellers', val: 7, tone:'from-amber-500 to-amber-400' }
            ].map(r => (
              <div key={r.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="tracking-wide text-neutral-300">{r.label}</span>
                  <span className="font-mono text-neutral-400">{r.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-800/80 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${r.tone}`} style={{ width: r.val+'%' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto text-[10px] text-neutral-500 tracking-wide">Last updated 2m ago</div>
        </div>
      </div>
      <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft">
        <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 mb-4 antialiased">Recent Monthly Revenue</h3>
        <div className="overflow-hidden rounded-lg border border-neutral-800/80">
           <table className="w-full text-[13px]">
             <thead className="bg-neutral-800/60 text-neutral-400 text-[11px] uppercase tracking-[0.14em]">
              <tr>
                <th className="py-2 px-4 text-left">Month</th>
                <th className="py-2 px-4 text-left">Revenue</th>
                <th className="py-2 px-4 text-left">MoM %</th>
                <th className="py-2 px-4 text-left">Δ vs Avg</th>
              </tr>
            </thead>
            <tbody>
              {series.map((r,i) => {
                const prev = series[i-1];
                const mom = prev ? ((r.revenue - prev.revenue)/prev.revenue)*100 : 0;
                const avg = i? (series.slice(0,i).reduce((a,c)=>a+c.revenue,0)/i): r.revenue;
                const diff = pct(r.revenue, avg);
                return (
                  <tr key={r.month} className="border-t border-neutral-800/80 hover:bg-neutral-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-neutral-200">{r.month}</td>
                    <td className="py-2.5 px-4 tabular-nums text-neutral-300">${r.revenue.toFixed(0)}</td>
                    <td className={`py-2.5 px-4 tabular-nums ${mom>0?'text-emerald-400':'text-rose-400'}`}>{mom.toFixed(2)}%</td>
                    <td className={`py-2.5 px-4 tabular-nums ${diff>=0?'text-emerald-300':'text-rose-300'}`}>{diff.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Capacity & Efficiency Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft flex flex-col gap-4">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Sales Efficiency</h3>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            {[{k:'Magic Number',v:'0.82',delta:'+0.06',pos:true},{k:'CAC Payback',v:'14.2m',delta:'-1.3m',pos:true},{k:'LTV / CAC',v:'4.7x',delta:'+0.2x',pos:true},{k:'Pipeline Coverage',v:'3.2x',delta:'-0.4x',pos:false}].map(m => (
              <div key={m.k} className="p-3 rounded-lg bg-neutral-800/60 ring-1 ring-neutral-700/60 flex flex-col gap-1">
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{m.k}</div>
                <div className="text-neutral-200 font-mono">{m.v}</div>
                <div className={`text-[10px] ${m.pos? 'text-emerald-400':'text-rose-400'}`}>{m.delta}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-neutral-500 tracking-wide">Snapshot of go‑to‑market capital efficiency indicators.</div>
        </div>
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft flex flex-col gap-4">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Retention Cohort Pulse</h3>
          <div className="flex-1 grid grid-cols-5 gap-1">
            {Array.from({length:25}).map((_,i)=> {
              const val = Math.random();
              const color = val>0.85? 'bg-emerald-400/80': val>0.7? 'bg-emerald-400/50': val>0.5? 'bg-emerald-400/30': 'bg-neutral-700/60';
              return <div key={i} className={`aspect-square rounded-sm ${color} transition`} title={`Month ${Math.floor(i/5)+1} Cohort ${i%5+1}`} />;
            })}
          </div>
          <div className="text-[10px] text-neutral-500 tracking-wide">Synthetic heatmap – replace with real cohort retention matrix.</div>
        </div>
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft flex flex-col gap-4">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Experiment Impact (Illustrative)</h3>
          <div className="space-y-3 text-[11px]">
            {[{exp:'Pricing Page Revamp',uplift:'+4.2%',conf:0.91},{exp:'Onboarding Emails',uplift:'+2.1%',conf:0.74},{exp:'Checkout A/B',uplift:'-1.3%',conf:0.65}].map(e => (
              <div key={e.exp} className="p-3 rounded-lg bg-neutral-800/60 ring-1 ring-neutral-700/60">
                <div className="flex items-center justify-between mb-1"><span className="text-neutral-300 font-medium tracking-wide">{e.exp}</span><span className={`text-[10px] font-mono ${e.uplift.startsWith('+')? 'text-emerald-400':'text-rose-400'}`}>{e.uplift}</span></div>
                <div className="h-1.5 w-full bg-neutral-700/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-primary to-brand-accent" style={{ width: (e.conf*100)+'%' }} />
                </div>
                <div className="mt-1 text-[10px] text-neutral-500">Confidence {(e.conf*100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-neutral-500 tracking-wide">Impact & confidence from recent GTM / product experiments.</div>
        </div>
      </div>
    </div>
  );
};
