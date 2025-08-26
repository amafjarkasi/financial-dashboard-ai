import React, { useMemo, useEffect } from 'react';
import { Server, CloudLightning, Shield, LifeBuoy, Database, ActivitySquare } from 'lucide-react';
import Sparkline from '../../../components/Sparkline';
import { useStore } from '../../state/store';

interface PulseItem {
  key: string;
  label: string;
  primary: string;
  change: string;
  status: 'ok' | 'warn' | 'crit';
  icon: React.ComponentType<any>;
  description: string;
}

function deltaFmt(delta:number, unit = '', fixed = 0) {
  const sign = delta>0? '+':'';
  return sign + delta.toFixed(fixed) + unit;
}

export const OperationalPulse: React.FC = () => {
  const ops = useStore(s=>s.ops);
  const simulateTick = useStore(s=>s.simulateTick);
  const spark = useMemo(()=> Array.from({length:6}).map(()=> Array.from({length:24}).map(()=> Math.random()*100)), []);
  useEffect(()=> { const id = setInterval(()=> simulateTick(), 30000); return ()=> clearInterval(id); }, [simulateTick]);
  const cards: PulseItem[] = [
    { key:'uptime', label:'Core API Uptime (30d)', primary: ops.uptime.toFixed(2)+'%', change: deltaFmt(ops.uptime-99.9,'%',2), status: ops.uptime < 99.7? 'warn':'ok', icon:Server, description:'Aggregated across regions' },
    { key:'latency', label:'p95 Latency', primary: Math.round(ops.p95Latency)+'ms', change: deltaFmt(-(340-ops.p95Latency),'ms'), status: ops.p95Latency>420? 'warn':'ok', icon:CloudLightning, description:'Edge CDN included' },
    { key:'secInc', label:'Security Incidents', primary: String(ops.securityIncidents), change: ops.securityIncidents? '+1 recent':'0 this month', status: ops.securityIncidents? 'crit':'ok', icon:Shield, description:'Validated alerts only' },
    { key:'supportBacklog', label:'Support Backlog', primary: String(ops.supportBacklog), change: deltaFmt(-(50-ops.supportBacklog)), status: ops.supportBacklog>80? 'warn':'ok', icon:LifeBuoy, description:'Unassigned tickets' },
    { key:'repLag', label:'Replica Lag', primary: ops.replicaLagMs+'ms', change: deltaFmt(-(55-ops.replicaLagMs),'ms'), status: ops.replicaLagMs>90? 'warn':'ok', icon:Database, description:'Primary ➝ analytics cluster' },
    { key:'healthScore', label:'Tenant Health Score', primary: ops.healthScore.toFixed(1), change: deltaFmt(ops.healthScore-8.4,'',1), status: ops.healthScore<7.2? 'warn':'ok', icon:ActivitySquare, description:'Weighted churn risk model' }
  ];
  return (
    <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-5">
      {cards.map((it,i) => {
        const positive = /^\+(.*)|^[0-9]|^0/.test(it.change) && !it.change.startsWith('-');
        const tone = it.status==='crit'? 'rose' : it.status==='warn'? 'amber':'emerald';
        return (
          <div key={it.key} className="group relative rounded-2xl border border-neutral-800/70 bg-neutral-900/55 backdrop-blur px-4 pt-4 pb-4 overflow-hidden ring-1 ring-inset shadow-soft flex flex-col gap-2">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-radial-fade" />
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">{it.label}</div>
                <div className="text-lg font-semibold tracking-tight text-neutral-100">{it.primary}</div>
              </div>
              <div className={`px-2 py-1 rounded-md text-[10px] font-mono tracking-wide ${positive ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30' : 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'}`}>{it.change}</div>
            </div>
            <div className="flex items-end justify-between gap-2 mt-auto">
              <Sparkline values={spark[i]} width={100} height={30} stroke={tone==='emerald'? '#10b981': tone==='amber'? '#f59e0b':'#f43f5e'} fill={tone==='emerald'? 'rgba(16,185,129,0.16)': tone==='amber'? 'rgba(245,158,11,0.16)':'rgba(244,63,94,0.16)'} />
              <it.icon className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-[9px] text-neutral-500 truncate">{it.description}</div>
          </div>
        );
      })}
    </div>
  );
};

export default OperationalPulse;