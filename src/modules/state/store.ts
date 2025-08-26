import { create } from 'zustand';

export interface MetricSet {
  revenue: number; revenueDelta: number;
  customers: number; customersDelta: number;
  arr: number; arrDelta: number;
  churn: number; churnDelta: number;
}
export interface RevenuePoint { month: string; revenue: number; }
export interface AllocationSlice { label: string; value: number; }
export interface Transaction { id: string; customer: string; product: string; amount: number; status: 'paid'|'pending'|'failed'; date: string; }

interface StoreState {
  metrics: MetricSet;
  revenueSeries: RevenuePoint[];
  allocation: AllocationSlice[];
  transactions: Transaction[];
  ops: {
    uptime: number; // 0-100
    p95Latency: number; // ms
    securityIncidents: number;
    supportBacklog: number;
    replicaLagMs: number;
    healthScore: number; // 0-10
  };
  simulateTick(): void;
}

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const initialRevenue = months.slice(0, 8).map((m,i) => ({ month: m, revenue: 40000 + i*2500 + Math.random()*4000 }));

export const useStore = create<StoreState>((set,get) => ({
  metrics: { revenue: 325000, revenueDelta: 5.2, customers: 2380, customersDelta: 3.1, arr: 780000, arrDelta: 4.4, churn: 2.4, churnDelta: -0.2 },
  revenueSeries: initialRevenue,
  allocation: [
    { label: 'Subscriptions', value: 52 },
    { label: 'Services', value: 18 },
    { label: 'Marketplace', value: 12 },
    { label: 'Ads', value: 10 },
    { label: 'Other', value: 8 }
  ],
  transactions: Array.from({ length: 12 }).map((_,i) => ({
    id: `TX-${(10000+i).toString()}`,
    customer: ['Acme Inc','Globex','Soylent','Initech','Umbrella','Stark','Wayne','Wonka','Cyberdyne','Tyrell','Gringotts','Prestige'][i%12],
    product: ['Pro Plan','Consulting','Addon A','Enterprise','Upgrade','License'][i%6],
    amount: 100 + Math.random()*900,
    status: (['paid','paid','pending','failed'][Math.floor(Math.random()*4)]) as Transaction['status'],
    date: new Date(Date.now() - i*86400000).toISOString()
  })),
  ops: {
    uptime: 99.9,
    p95Latency: 340,
    securityIncidents: 0,
    supportBacklog: 42,
    replicaLagMs: 55,
    healthScore: 8.4
  },
  simulateTick() {
    const { revenueSeries, ops } = get();
    const nextMonth = months[revenueSeries.length % 12];
    const last = revenueSeries[revenueSeries.length -1];
    const newRev = Math.max(20000, last.revenue + (Math.random()*6000 - 2000));
    // mutate ops slightly
    const drift = (v:number, scale:number, min:number, max:number) => Math.min(max, Math.max(min, v + (Math.random()*2 -1)*scale));
    const newOps = {
      uptime: drift(ops.uptime, 0.02, 99.5, 100),
      p95Latency: drift(ops.p95Latency, 12, 240, 480),
      securityIncidents: ops.securityIncidents, // rare event
      supportBacklog: Math.max(0, Math.round(drift(ops.supportBacklog, 3, 10, 120))),
      replicaLagMs: Math.round(drift(ops.replicaLagMs, 8, 15, 120)),
      healthScore: parseFloat(drift(ops.healthScore, 0.15, 6.5, 9.5).toFixed(1))
    };
    if (Math.random() < 0.01) newOps.securityIncidents += 1;
    set(s => ({
      revenueSeries: [...s.revenueSeries, { month: nextMonth, revenue: newRev }].slice(-12),
      ops: newOps
    }));
  }
}));
