import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { useDashboardData } from '../hooks/useDashboardData';

export const TransactionsTable: React.FC = () => {
  const { transactions } = useDashboardData();
  // Sorting / filtering / selection state
  const [sort, setSort] = useState<{col: keyof typeof transactions[0] | 'amount' | 'date'; dir: 'asc' | 'desc'}>(() => {
    try { const raw = localStorage.getItem('txn.sort'); if (raw) return JSON.parse(raw); } catch (e) { /* ignore */ }
    return { col: 'date', dir: 'desc' };
  });
  const [query, setQuery] = useState(() => {
    try { return localStorage.getItem('txn.query') || ''; } catch (e) { return ''; }
  });
  const [statusFilter, setStatusFilter] = useState<string | 'all'>(() => {
    try { return (localStorage.getItem('txn.statusFilter') as any) || 'all'; } catch (e) { return 'all'; }
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<any | null>(null);
  const [menuPos, setMenuPos] = useState<{x:number;y:number}|null>(null);
  const [menuTxn, setMenuTxn] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement|null>(null);

  const closeMenu = () => { setMenuPos(null); setMenuTxn(null); };
  useEffect(() => {
    if (!menuPos) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    window.addEventListener('mousedown', handler);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('mousedown', handler); window.removeEventListener('keydown', esc); };
  }, [menuPos]);

  const onContext = (e: React.MouseEvent, txn: any) => {
    e.preventDefault();
    setMenuTxn(txn);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const copyId = async () => { if (menuTxn) { await navigator.clipboard.writeText(menuTxn.id); closeMenu(); } };
  const copyJSON = async () => { if (menuTxn) { await navigator.clipboard.writeText(JSON.stringify(menuTxn,null,2)); closeMenu(); } };
  const copyAmount = async () => { if (menuTxn) { await navigator.clipboard.writeText(menuTxn.amount.toFixed(2)); closeMenu(); } };
  const viewDetails = () => { setDetail(menuTxn); closeMenu(); };
  const flagTxn = () => { alert(`Flagged ${menuTxn.id} (placeholder)`); closeMenu(); };

  const toggleSelect = (id: string, multi = false) => {
    setSelected(prev => {
      const next = new Set(multi ? prev : []);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return transactions.filter((t: any) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return [t.id, t.customer, t.product, t.status, t.amount.toFixed(2)].some(f => String(f).toLowerCase().includes(q));
    });
  }, [transactions, statusFilter, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a:any,b:any) => {
      let av = a[sort.col as any];
      let bv = b[sort.col as any];
      if (sort.col === 'amount') { av = a.amount; bv = b.amount; }
      if (sort.col === 'date') { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  const cycleSort = (col: any) => {
    setSort(s => {
      const next: {col: keyof typeof transactions[0] | 'amount' | 'date'; dir: 'asc' | 'desc'} = s.col !== col ? { col, dir: 'asc' } : s.dir === 'asc' ? { col, dir: 'desc' } : { col, dir: 'asc' };
      try { localStorage.setItem('txn.sort', JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  };

  // Persist query & statusFilter
  useEffect(() => { try { localStorage.setItem('txn.query', query); } catch (e) { /* ignore */ } }, [query]);
  useEffect(() => { try { localStorage.setItem('txn.statusFilter', statusFilter); } catch (e) { /* ignore */ } }, [statusFilter]);

  // Keyboard navigation
  const tableRef = useRef<HTMLTableSectionElement|null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!tableRef.current || (document.activeElement && (document.activeElement as HTMLElement).tagName === 'INPUT')) return;
      if (['ArrowDown','ArrowUp','Enter','Escape'].includes(e.key)) {
        e.preventDefault();
        const ids = sorted.map(r => r.id);
        if (!ids.length) return;
        const current = ids.find(id => selected.has(id));
        if (e.key === 'Escape') { setSelected(new Set()); setDetail(null); return; }
        if (e.key === 'Enter') { if (current) { setDetail(sorted.find(r => r.id === current)); } return; }
        let idx = current ? ids.indexOf(current) : -1;
        if (e.key === 'ArrowDown') idx = Math.min(ids.length -1, idx + 1);
        if (e.key === 'ArrowUp') idx = Math.max(0, idx - 1);
        const nextId = ids[idx >=0 ? idx : 0];
        setSelected(new Set([nextId]));
        document.getElementById('row-'+nextId)?.scrollIntoView({ block: 'nearest' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sorted, selected]);

  const closeDetail = useCallback(() => setDetail(null), []);
  useEffect(() => {
    if (!detail) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDetail(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [detail, closeDetail]);
  return (
    <section className="rounded-2xl border border-neutral-800/70 bg-neutral-900/50 backdrop-blur-[3px] shadow-soft overflow-hidden">
      <header className="px-7 pt-5 pb-4 border-b border-neutral-800/60 flex flex-col gap-4 bg-gradient-to-r from-neutral-900/70 to-neutral-950/60">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-400 flex items-center gap-2 uppercase">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent animate-pulse" />
          Recent Transactions
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-neutral-500">
            <span className="px-2 py-1 rounded-md bg-neutral-800/70 border border-neutral-700/50">{sorted.length} Shown</span>
            {selected.size > 0 && <span className="px-2 py-1 rounded-md bg-brand-primary/20 text-brand-primary border border-brand-primary/40">{selected.size} Selected</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-800/70 px-2 py-1 rounded-md border border-neutral-700/60">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." className="bg-transparent outline-none text-[12px] placeholder:text-neutral-500" />
            {query && <button onClick={()=>setQuery('')} className="text-neutral-500 hover:text-neutral-300">✕</button>}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {['all','paid','pending','failed'].map(s => (
              <button key={s} onClick={()=>setStatusFilter(s as any)} className={`px-2 py-1 rounded-md border text-[11px] tracking-wide ${statusFilter===s ? 'bg-brand-accent/30 border-brand-accent/50 text-neutral-100' : 'bg-neutral-900/60 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'}`}>{s}</button>
            ))}
          </div>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-neutral-400 text-[10px] uppercase tracking-[0.14em] bg-neutral-950/70 sticky top-0 backdrop-blur-md select-none">
            <tr className="border-b border-neutral-800/60">
              {([
                ['id','ID'],
                ['customer','Customer'],
                ['product','Product'],
                ['amount','Amount'],
                ['status','Status'],
                ['date','Date']
              ] as [string,string][]).map(([key,label]) => (
                <th key={key} onClick={()=>cycleSort(key)} className="text-left px-4 py-2 font-medium cursor-pointer hover:text-neutral-200">
                  <span className="inline-flex items-center gap-1">
                    {label}
                    {sort.col === key && <span className="text-[9px] opacity-70">{sort.dir==='asc' ? '▲':'▼'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={tableRef}>
            {sorted.map((t: any, idx: number) => (
              <tr
                key={t.id}
                id={`row-${t.id}`}
                className={`group border-t border-neutral-800/40 transition-all ${idx % 2 === 0 ? 'bg-neutral-900/35' : ''} hover:bg-neutral-800/70 hover:shadow-inner cursor-pointer ${selected.has(t.id) ? 'bg-brand-primary/20 ring-1 ring-brand-primary/40' : ''}`}
                onClick={(e) => toggleSelect(t.id, e.metaKey || e.ctrlKey || e.shiftKey)}
                onDoubleClick={() => setDetail(t)}
                onContextMenu={(e) => onContext(e, t)}
              > 
                <td className="px-4 py-3 font-mono text-[12px] text-neutral-500 group-hover:text-neutral-300 transition-colors">{t.id}</td>
                <td className="px-4 py-3 text-neutral-200 font-medium">{t.customer}</td>
                <td className="px-4 py-3 text-neutral-300">{t.product}</td>
                <td className="px-4 py-3 tabular-nums font-medium text-neutral-100">${t.amount.toFixed(2)}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3 text-neutral-500 text-[12px] whitespace-nowrap group-hover:text-neutral-300 transition-colors">{new Date(t.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {!sorted.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-neutral-500 text-sm">No transactions match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {detail && (
        <div className="fixed inset-y-0 right-0 w-[360px] bg-neutral-950/95 backdrop-blur-xl border-l border-neutral-800 z-50 flex flex-col shadow-2xl animate-fade-in-up">
          <div className="flex items-center justify-between px-5 h-12 border-b border-neutral-800">
            <h4 className="text-[11px] tracking-[0.18em] uppercase text-neutral-400">Transaction Detail</h4>
            <button onClick={closeDetail} className="text-neutral-400 hover:text-neutral-200 text-sm">✕</button>
          </div>
          <div className="p-5 space-y-4 overflow-y-auto text-sm">
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">ID</div>
              <div className="font-mono text-neutral-200 text-xs flex items-center gap-2">{detail.id}
                <button onClick={()=>navigator.clipboard.writeText(detail.id)} className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700">Copy</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Customer</div>
                <div className="text-neutral-200 font-medium">{detail.customer}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Product</div>
                <div className="text-neutral-200 font-medium">{detail.product}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Amount</div>
                <div className="text-neutral-100 font-semibold">${detail.amount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Status</div>
                <StatusBadge status={detail.status} />
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">Date</div>
              <div className="text-neutral-300">{new Date(detail.date).toLocaleString()}</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">Raw JSON</div>
              <pre className="p-3 rounded-lg bg-neutral-900/70 border border-neutral-800 text-[11px] overflow-auto max-h-48 whitespace-pre-wrap">{JSON.stringify(detail,null,2)}</pre>
            </div>
          </div>
        </div>
      )}
      {menuPos && menuTxn && (
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-50 min-w-[180px] rounded-lg border border-neutral-700 bg-neutral-900/95 backdrop-blur-md shadow-xl p-1 text-[12px] text-neutral-200 animate-fade-in-up"
          style={{ top: menuPos.y + 4, left: menuPos.x + 4 }}
        >
          <button onClick={copyId} className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-neutral-800/90 text-left">
            <span>Copy ID</span><span className="opacity-50 font-mono text-[11px]">{menuTxn.id}</span>
          </button>
          <button onClick={copyAmount} className="w-full px-3 py-2 rounded-md hover:bg-neutral-800/90 text-left">Copy Amount</button>
          <button onClick={copyJSON} className="w-full px-3 py-2 rounded-md hover:bg-neutral-800/90 text-left">Copy JSON</button>
          <button onClick={viewDetails} className="w-full px-3 py-2 rounded-md hover:bg-neutral-800/90 text-left">Open Details</button>
          <button onClick={flagTxn} className="w-full px-3 py-2 rounded-md hover:bg-neutral-800/90 text-left text-amber-300">Flag</button>
          <div className="h-px my-1 bg-neutral-700/60" />
          <button onClick={closeMenu} className="w-full px-3 py-2 rounded-md hover:bg-neutral-800/90 text-left text-neutral-400 text-[11px] uppercase tracking-wide">Close</button>
        </div>
      )}
    </section>
  );
};
