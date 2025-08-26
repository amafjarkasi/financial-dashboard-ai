import React, { useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';

export const BillingPage: React.FC = () => {
  const invoices = Array.from({ length: 6 }).map((_,i) => ({
    id: `INV-${(1000+i)}`, amount: (Math.random()*2000+200).toFixed(2), status: ['paid','open','overdue'][i%3], date: new Date(Date.now()-i*86400000).toISOString().slice(0,10)
  }));
  const [status, setStatus] = useState<'all'|'paid'|'open'|'overdue'>('all');
  const filtered = invoices.filter(i => status==='all' || i.status===status);
  const totals = useMemo(()=> ({
    amount: filtered.reduce((a,c)=> a + parseFloat(c.amount),0),
    overdue: filtered.filter(f=>f.status==='overdue').length
  }), [filtered]);
  return (
    <div className="space-y-12">
      <PageHeader
        title="Billing & Invoices"
        subtitle="Track invoice lifecycle, aging buckets and cash collection velocity to anticipate liquidity risk." />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft space-y-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Invoices</h3>
          <div className="flex items-center gap-2 text-[11px]">
            {(['all','paid','open','overdue'] as const).map(s => (
              <button key={s} onClick={()=>setStatus(s)} className={`px-2.5 py-1 rounded-md border text-[11px] font-medium tracking-wide transition ${status===s ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white border-transparent shadow' : 'border-neutral-700/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] text-neutral-400">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/60 ring-1 ring-neutral-700/60">
            <span className="uppercase tracking-wider">Count</span>
            <span className="text-neutral-200 font-semibold">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/60 ring-1 ring-neutral-700/60">
            <span className="uppercase tracking-wider">Total</span>
            <span className="text-neutral-200 font-semibold">${totals.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/60 ring-1 ring-neutral-700/60">
            <span className="uppercase tracking-wider">Overdue</span>
            <span className="text-rose-300 font-semibold">{totals.overdue}</span>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-800/80">
          <table className="w-full text-sm">
            <thead className="bg-neutral-800/60 text-neutral-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="py-2 px-4 text-left">Invoice</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className="border-t border-neutral-800/80 hover:bg-neutral-800/40">
                  <td className="py-2 px-4 font-medium text-neutral-200">{inv.id}</td>
                  <td className="py-2 px-4 text-neutral-400">{inv.date}</td>
                  <td className="py-2 px-4 tabular-nums text-neutral-300">${inv.amount}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${inv.status === 'paid' ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30' : inv.status === 'open' ? 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30' : 'bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/30'}`}>{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="p-6 text-center text-neutral-500 text-sm">No invoices match filter.</div>}
        </div>
        </div>
        {/* Aging Distribution Card */}
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft flex flex-col gap-6">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Aging Distribution</h3>
          <div className="space-y-4 text-[11px]">
            {[{bucket:'0-15d', val:52, tone:'from-emerald-500 to-emerald-400'},{bucket:'16-30d', val:28, tone:'from-sky-500 to-sky-400'},{bucket:'31-45d', val:14, tone:'from-amber-500 to-amber-400'},{bucket:'46d+', val:6, tone:'from-rose-500 to-rose-400'}].map(b => (
              <div key={b.bucket} className="space-y-1">
                <div className="flex items-center justify-between"><span className="tracking-wide text-neutral-300">{b.bucket}</span><span className="font-mono text-neutral-400">{b.val}%</span></div>
                <div className="h-1.5 w-full bg-neutral-800/80 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${b.tone}`} style={{ width: b.val+'%' }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-auto text-[10px] text-neutral-500 tracking-wide">Collection efficiency 94%</div>
        </div>
        {/* Collections Efficiency */}
        <div className="rounded-2xl bg-neutral-900/60 ring-1 ring-neutral-800 p-6 shadow-soft flex flex-col gap-5 lg:col-span-3">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-neutral-400 antialiased">Collections Efficiency</h3>
          <div className="grid sm:grid-cols-4 gap-4 text-[11px]">
            {[{k:'DSO',v:'38.4d',delta:'-1.2d',pos:true},{k:'CEI',v:'94%',delta:'+2%',pos:true},{k:'Bad Debt %',v:'0.7%',delta:'-0.1%',pos:true},{k:'Dispute Rate',v:'1.9%',delta:'+0.3%',pos:false}].map(i => (
              <div key={i.k} className="p-4 rounded-xl bg-neutral-800/60 ring-1 ring-neutral-700/60 flex flex-col gap-1">
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{i.k}</div>
                <div className="text-neutral-200 font-mono text-sm">{i.v}</div>
                <div className={`text-[10px] ${i.pos? 'text-emerald-400':'text-rose-400'}`}>{i.delta}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Risk Concentration</div>
              <div className="space-y-2 text-[11px]">
                {[{c:'Top 5 Customers',w:42,tone:'from-sky-500 to-sky-400'},{c:'Top 10 Customers',w:58,tone:'from-indigo-500 to-fuchsia-500'},{c:'Long-tail',w:15,tone:'from-emerald-500 to-emerald-400'}].map(r => (
                  <div key={r.c} className="space-y-1">
                    <div className="flex items-center justify-between"><span className="text-neutral-300 tracking-wide">{r.c}</span><span className="font-mono text-neutral-400">{r.w}%</span></div>
                    <div className="h-1.5 w-full bg-neutral-800/80 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${r.tone}`} style={{ width: r.w+'%' }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Action Queue (Illustrative)</div>
              <ul className="space-y-2 text-[11px] text-neutral-400">
                {['Escalate 2 invoices >45d','Send 7-day reminder batch','Review dispute INV-1032','Analyze spike in small overdue'].map(a => (
                  <li key={a} className="flex items-start gap-2"><span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" /> <span className="flex-1 leading-snug">{a}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 tracking-wide">Operational collection health & concentration snapshot (synthetic).</div>
        </div>
      </div>
    </div>
  );
};
