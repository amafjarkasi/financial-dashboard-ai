import React, { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceDot } from 'recharts';

interface Point {
  idx: number;
  churn: number; // churn %
  avg: number;   // rolling avg
  marker?: string; // 'A' | 'B' | 'C'
  regime?: number;
  ts: number;
}

// Simple random walk generator with regime shifts
export const ChurnWatch: React.FC = () => {
  const [data, setData] = useState<Point[]>(() => {
    const base: Point[] = [];
    let v = 5; // start at 5%
    for (let i=0;i<20;i++) {
      v = clamp(v + randStep(0.25), 2, 12);
      base.push({ idx:i, churn: round(v), avg: round(v), ts: Date.now() - (20-i)*5000, regime:0 });
    }
    return base;
  });
  const [live, setLive] = useState<boolean>(() => {
    try { return localStorage.getItem('churn.live') !== '0'; } catch { return true; }
  });
  const [now, setNow] = useState(Date.now());
  const regimeRef = useRef(0);
  const letterRef = useRef(0); // index of next letter
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
  if (!live) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = window.setInterval(() => {
      setData(prev => {
        const last = prev[prev.length-1];
        let nextVal = last.churn + randStep(0.35 + regimeRef.current*0.2);
        if (Math.random() < 0.05) { // occasional regime shift
          regimeRef.current += 1;
          nextVal += (Math.random()*2 -1) * 2.5; // jump
        }
        nextVal = clamp(nextVal, 1.5, 15);
        const idx = last.idx + 1;
        const windowPoints = [...prev.slice(-5), { churn: nextVal } as any];
        const avg = round(windowPoints.reduce((a,c)=> a + c.churn,0)/windowPoints.length);
        const slope = nextVal - last.churn;
        let marker: string | undefined;
        if (letterRef.current < 3 && Math.abs(slope) > 0.9 && (!prev[prev.length-2] || Math.sign(slope) !== Math.sign(last.churn - (prev[prev.length-2]?.churn||last.churn)))) {
          marker = String.fromCharCode(65 + letterRef.current); // A,B,C
          letterRef.current += 1;
        }
        const next: Point = { idx, churn: round(nextVal), avg, ts: Date.now(), regime: regimeRef.current, marker };
        const updated = [...prev, next].slice(-60); // cap length
        // persist markers & last churn
        try {
          const markers = updated.filter(p=>p.marker).map(m=>({ marker:m.marker, churn:m.churn, idx:m.idx, ts:m.ts }));
          localStorage.setItem('churn.markers', JSON.stringify({ markers, last: { churn: next.churn, idx: next.idx, ts: next.ts } }));
        } catch { /* ignore */ }
        return updated;
      });
    }, 4000 + Math.random()*2000); // variable interval 4-6s
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [live]);

  // trail fade ticker
  useEffect(() => {
    const id = setInterval(()=> setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // persist live flag
  useEffect(()=> {
    try { localStorage.setItem('churn.live', live? '1':'0'); } catch { /* ignore */ }
  }, [live]);

  const lastIdx = data[data.length-1]?.idx;

  const lastPointDot = (props:any) => {
    const { cx, cy, payload } = props;
    if (payload?.idx !== lastIdx) return <g />;
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} className="animate-ping" fill="#f87171" fillOpacity={0.18} />
        <circle cx={cx} cy={cy} r={5.5} fill="#f87171" fillOpacity={0.45} />
        <circle cx={cx} cy={cy} r={3} fill="#f87171" />
        <title>Latest churn {payload.churn}%</title>
      </g>
    );
  };

  return (
    <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Churn Watch (Live)</h3>
        <div className="flex items-center gap-2 text-[11px]">
          <button onClick={()=>setLive(l=>!l)} className={`px-2.5 py-1 rounded-md ring-1 ring-neutral-700/60 font-medium transition ${live? 'bg-rose-500/20 text-rose-300':'text-neutral-400 hover:text-neutral-200'}`}>{live? 'Pause':'Resume'}</button>
          <span className="px-2 py-1 rounded-md bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30">Last {(Date.now()-data[data.length-1]?.ts)/1000 < 9 ? 'few s' : 'recent'}</span>
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top:10, right:8, left:0, bottom:4 }}>
            <defs>
              <linearGradient id="churnLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.6} />
                <stop offset="90%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1f242c" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="idx" hide />
            <YAxis width={50} stroke="#5b636e" axisLine={false} tickLine={false} tickMargin={6} tickFormatter={v=>v+'%'} domain={['dataMin-1','dataMax+1']} />
            <Tooltip contentStyle={{ background:'#0f1115', border:'1px solid #262b32', fontSize:12 }} formatter={(v:any)=>[v+'%','Churn']} labelFormatter={()=>'Point'} />
            <Line dataKey="churn" type="monotone" stroke="#f87171" strokeWidth={2} dot={lastPointDot} isAnimationActive={false} />
            <Line dataKey="avg" type="monotone" stroke="#fb923c" strokeWidth={1.2} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
            {data.filter(d=>d.marker).map(d => (
              <ReferenceDot
                key={d.idx}
                x={d.idx}
                y={d.churn}
                r={9}
                stroke="#facc15"
                strokeOpacity={0.8}
                fill="#facc15"
                fillOpacity={0.18}
                isFront
                label={{ value: d.marker, position: 'top', fill: '#facc15', fontSize: 11, fontWeight: 600 }}
              />
            ))}
            {/* Fading trail small dots for last N points */}
            {data.slice(-18).map(p => {
              const ageMs = now - p.ts;
              const age = ageMs / 12000; // ~12s full fade
              const opacity = Math.max(0, 1 - age);
              if (p.idx === lastIdx || opacity <= 0 || p.marker) return null;
              return (
                <ReferenceDot key={'trail'+p.idx} x={p.idx} y={p.churn} r={3} fill="#f87171" fillOpacity={opacity*0.5} stroke="none" />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-3 text-[10px] text-neutral-400">
        {['A','B','C'].map(l => {
          const found = data.find(d=>d.marker===l);
          return (
            <div key={l} className="flex flex-col gap-0.5 px-2 py-1 rounded-lg bg-neutral-800/50 ring-1 ring-neutral-700/50">
              <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> <span className="font-semibold text-neutral-300">{l}</span></div>
              <div>{found ? `${found.churn.toFixed(2)}% at +${(found.idx - data[0].idx)}pt` : 'Pending event'}</div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-neutral-500 tracking-wide">A/B/C mark first 3 significant slope reversals (&gt;0.9pp) with regime shift logic.</div>
    </div>
  );
};

function randStep(scale:number) { return (Math.random()*2 -1) * scale; }
function clamp(v:number, min:number, max:number) { return Math.min(max, Math.max(min, v)); }
function round(v:number) { return Math.round(v*100)/100; }

export default ChurnWatch;