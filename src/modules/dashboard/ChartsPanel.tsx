import React, { useState, useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Area, Legend, Sector } from 'recharts';

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const formatCurrency = (v: number) => '$' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });

class ChartErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props:any){ super(props); this.state={hasError:false}; }
  static getDerivedStateFromError(){ return { hasError: true }; }
  componentDidCatch(err:any, info:any){
    try { if ((import.meta as any)?.env?.DEV) console.error('Chart error:', err, info); } catch { /* ignore */ }
  }
  render(){ if(this.state.hasError) return <div className="flex items-center justify-center h-full text-[12px] text-neutral-400">Chart unavailable</div>; return this.props.children; }
}

export const ChartsPanel: React.FC = () => {
  const { revenueSeries, allocation } = useDashboardData();
  const [showRevenue, setShowRevenue] = useState(true);
  // Allocation interactions
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggleSlice = (label: string) => setHidden(prev => { const n = new Set(prev); n.has(label) ? n.delete(label) : n.add(label); return n; });
  const visibleAllocation = useMemo(() => allocation.filter((a:any)=> !hidden.has(a.label)), [allocation, hidden]);
  const pieTotal = useMemo(() => visibleAllocation.reduce((a:any,c:any)=>a + c.value,0), [visibleAllocation]);
  const onEnter = (_:any, idx:number) => setActiveIndex(idx);
  const onLeave = () => setActiveIndex(null);
  const toggleRevenue = () => setShowRevenue(s => !s);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-900/95 px-3 py-2 text-[11px] shadow-lg">
        <div className="font-semibold tracking-wide text-neutral-200 mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-neutral-300">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: p.color }} />
            <span className="uppercase tracking-wider">{p.dataKey}</span>
            <span className="ml-auto font-medium text-neutral-100">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <section className="grid gap-6 lg:grid-cols-3">
  <div className="group relative rounded-xl2 border border-neutral-800/70 bg-neutral-900/55 p-5 col-span-2 overflow-hidden backdrop-blur-sm shadow-soft hover:shadow-glow transition-all">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-radial-fade" />
        <h3 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-400 mb-3 flex items-center gap-2 uppercase">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent animate-pulse" />
          Monthly Revenue
        </h3>
        <div className="h-72">
          <ChartErrorBoundary>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueSeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.55} />
                  <stop offset="60%" stopColor="#2563eb" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="35%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1f242c" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#636a75" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis stroke="#636a75" tickLine={false} axisLine={false} tickFormatter={(v)=> (v/1000).toFixed(0)+'k'} width={40} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
              {showRevenue && <>
                <Area type="monotone" dataKey="revenue" stroke="none" fill="url(#revGradient)" animationDuration={900} animationBegin={100} />
                <Line type="monotone" dataKey="revenue" stroke="url(#revStroke)" strokeWidth={2.8} dot={false} activeDot={{ r:5, strokeWidth: 0 }} animationDuration={900} animationBegin={100} />
              </>}
              <Legend formatter={(val) => val === 'revenue' ? 'Revenue' : val } onClick={toggleRevenue} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </LineChart>
          </ResponsiveContainer>
          </ChartErrorBoundary>
        </div>
      </div>
      <div className="group relative rounded-xl2 border border-neutral-800/70 bg-neutral-900/50 p-4 overflow-hidden backdrop-blur-sm shadow-soft hover:shadow-glow transition-all">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-radial-fade" />
        <h3 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-400 mb-3 flex items-center gap-2 uppercase">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-brand-accent to-brand-primary animate-pulse" />
          Allocation
        </h3>
        <div className="h-72 relative">
          <ChartErrorBoundary>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visibleAllocation}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                stroke="#0f1115"
                strokeWidth={2}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                activeIndex={activeIndex ?? undefined}
                activeShape={(props:any) => {
                  // Avoid relying on internal sectorPath (was causing undefined errors); use Sector component instead.
                  const RADIAN = Math.PI / 180;
                  const { cx, cy, midAngle, outerRadius, innerRadius, startAngle, endAngle, fill } = props;
                  const sin = Math.sin(-RADIAN * midAngle);
                  const cos = Math.cos(-RADIAN * midAngle);
                  return (
                    <g>
                      <defs>
                        <filter id="glowSlice" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Radial pointer line */}
                      <path
                        d={`M${cx},${cy} L${cx + outerRadius * cos},${cy + outerRadius * sin}`}
                        stroke={fill}
                        strokeOpacity={0.28}
                      />
                      {/* Main active slice with glow */}
                      <Sector
                        {...props}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        fill={fill}
                        filter="url(#glowSlice)"
                        stroke="#0f1115"
                        strokeWidth={2}
                        cornerRadius={2}
                      />
                      {/* Outline ring */}
                      <Sector
                        {...props}
                        innerRadius={outerRadius + 3}
                        outerRadius={outerRadius + 5}
                        fill="none"
                        stroke={fill}
                        strokeOpacity={0.45}
                        strokeWidth={1.5}
                        startAngle={startAngle - 0.8}
                        endAngle={endAngle + 0.8}
                      />
                    </g>
                  );
                }}
              >
                {visibleAllocation.map((slice: any, idx: number) => (
                  <Cell key={slice.label + idx} fill={COLORS[idx % COLORS.length]} fillOpacity={hidden.has(slice.label) ? 0.15 : 1} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background:'#0f1115', border:'1px solid #262b32', fontSize:12, borderRadius:8, color:'#e5e7eb' }}
                itemStyle={{ color:'#e5e7eb' }}
                labelFormatter={() => 'Allocation'}
                formatter={(val:any, name:any, p:any)=> [val+'%', p && p.payload ? p.payload.label : name]}
              />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-200 text-[11px] font-semibold leading-snug pointer-events-none">
                {activeIndex != null && visibleAllocation[activeIndex] ? (
                  <tspan>{visibleAllocation[activeIndex].label}</tspan>
                ) : <tspan>{pieTotal}%</tspan>}
                {activeIndex != null && visibleAllocation[activeIndex] && (
                  <tspan x="50%" dy="1.2em" className="fill-neutral-500 text-[10px]">{visibleAllocation[activeIndex].value}%</tspan>
                )}
              </text>
            </PieChart>
          </ResponsiveContainer>
          </ChartErrorBoundary>
          {/* Interactive Legend / Breakdown */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full pt-4 group-hover:translate-y-0 transition-transform duration-500">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {allocation.map((a:any, idx:number) => {
                const isHidden = hidden.has(a.label);
                const color = COLORS[idx % COLORS.length];
                return (
                  <button
                    key={a.label}
                    onClick={()=>toggleSlice(a.label)}
                    onMouseEnter={()=>{ const vidx = visibleAllocation.findIndex(v=>v.label===a.label); if (vidx >=0) setActiveIndex(vidx); }}
                    onMouseLeave={onLeave}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md border text-left transition-colors ${isHidden ? 'opacity-40 border-neutral-700 bg-neutral-800/40' : 'border-neutral-700/70 bg-neutral-800/70 hover:bg-neutral-700/70'}`}
                    aria-pressed={!isHidden}
                  >
                    <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
                    <span className="truncate flex-1 text-neutral-300">{a.label}</span>
                    <span className="font-mono text-[10px] text-neutral-400">{a.value}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
