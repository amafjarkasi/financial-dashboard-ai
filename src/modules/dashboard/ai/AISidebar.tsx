import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Send, Loader2, PanelRightOpen, BarChart3, Sparkles } from 'lucide-react';
import { useAISidebar } from './aiStore';
import { useStore } from '../../state/store';
import { useDashboardNav } from '../navStore';

// NOTE: Placeholder AI inference. In a real integration you would call your MCP agent endpoint.
async function fakeAIFetch(question: string, context: any) {
  await new Promise(r => setTimeout(r, 700));
  if (/growth/i.test(question)) {
    const series = context.revenueSeries.slice(-2);
    if (series.length === 2) {
      const delta = ((series[1].revenue - series[0].revenue)/series[0].revenue)*100;
      return `Revenue grew ${(delta).toFixed(2)}% from ${series[0].month} to ${series[1].month}.`;
    }
  }
  if (/allocation|mix|breakdown/i.test(question)) {
    return 'Revenue allocation: ' + context.allocation.map((a:any) => `${a.label} ${a.value}%`).join(', ') + '.';
  }
  if (/churn/i.test(question)) {
    return `Current churn rate is ${context.metrics.churn.toFixed(2)}%.`;
  }
  return 'I need more context or a more specific question about revenue, churn, allocation, or KPIs.';
}

export const AISidebar: React.FC = () => {
  const { open, closeSidebar, openSidebar, history, append, panelWidth, setPanelWidth, reducedMotion, hydrate, replaceLastAssistantContent, fontSize } = useAISidebar();
  const { compactMode } = useAISidebar();
  const { uiScale } = useAISidebar();
  const [hydrated, setHydrated] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const currentPage = useDashboardNav(s=>s.page);
  const contextData = useStore(s => ({
    metrics: s.metrics,
    revenueSeries: s.revenueSeries,
    allocation: s.allocation,
    page: currentPage
  }));

  // markdown mini parser (bold, italics, inline code, code blocks)
  const renderMarkdown = (text: string) => {
    // fenced code blocks
  const html = text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => `<pre class="mt-1 mb-2 p-3 rounded-lg bg-neutral-900/70 text-[12px] overflow-auto"><code class="language-${lang||'text'}">${code.replace(/</g,'&lt;')}</code></pre>`)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">$1</code>');
    return html;
  };

  const ask = async () => askQuestion();

  const askQuestion = async (override?: string) => {
    const raw = typeof override === 'string' ? override : input;
    if (!raw.trim()) return;
    const q = raw.trim();
    append('user', q);
    if (!override) setInput('');
    setLoading(true);
    try {
      // simulate streaming by splitting answer into tokens
      const full = await fakeAIFetch(q, contextData);
      const id = Math.random().toString(36).slice(2);
      append('assistant', '');
      // replace newly appended blank with streaming content
      const tokens = full.split(/(\s+)/);
      let assembled = '';
      for (const t of tokens) {
        assembled += t;
        replaceLastAssistantContent(history[history.length -1]?.id || id, assembled);
        await new Promise(r => setTimeout(r, reducedMotion ? 0 : 15));
      }
    } finally {
      setLoading(false);
    }
  };

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!resizing) return;
    const newWidth = Math.min(800, Math.max(360, (window as Window).innerWidth - e.clientX));
    setPanelWidth(newWidth);
  }, [resizing, setPanelWidth]);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('pointermove', onPointerMove);
      const up = () => setResizing(false);
      window.addEventListener('pointerup', up, { once: true });
      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', up);
      };
    }
  }, [resizing, onPointerMove]);

  // hydrate persisted settings
  useEffect(() => {
    if (!hydrated) {
      hydrate();
      setHydrated(true);
    }
  }, [hydrate, hydrated]);

  // persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
  localStorage.setItem('aiSidebar', JSON.stringify({ panelWidth, fontSize, compactMode, uiScale }));
    } catch { /* ignore persistence errors */ }
  }, [panelWidth, fontSize, compactMode, uiScale, hydrated]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        open ? closeSidebar() : openSidebar();
      } else if (e.key === 'Escape' && open) {
        closeSidebar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, openSidebar, closeSidebar]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }, [history, loading, reducedMotion]);

  return (
    <>
      {!open && (
        <button
          onClick={openSidebar}
          className="fixed bottom-4 right-4 z-30 md:right-6 md:bottom-6 p-2 rounded-full bg-gradient-to-br from-brand-primary/80 to-brand-accent/80 text-white shadow-lg hover:from-brand-primary hover:to-brand-accent transition-all"
          aria-label="Open AI Analyst"
        >
          <PanelRightOpen className="w-5 h-5" />
        </button>
      )}
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-neutral-950/35 backdrop-blur-[2px]`}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI Analyst"
        style={{ width: panelWidth }}
  className={`fixed top-0 right-0 h-full flex flex-col border-l border-neutral-200 dark:border-neutral-800 bg-white/92 dark:bg-neutral-950/85 backdrop-blur-[3px] transition-transform duration-300 z-50 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.25)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div
          onPointerDown={e => { e.preventDefault(); setResizing(true); }}
          className="absolute left-0 top-0 h-full w-1 cursor-ew-resize group"
        >
          <div className="absolute inset-y-0 -left-0.5 w-1 rounded-full opacity-0 group-hover:opacity-60 transition bg-gradient-to-b from-brand-primary/60 to-brand-accent/60" />
        </div>
  <header className="min-h-[68px] flex items-center pl-7 pr-4 py-5 border-b border-neutral-200 dark:border-neutral-800 gap-3 bg-gradient-to-r from-brand-primary/15 via-white/20 to-brand-accent/15 dark:from-brand-primary/10 dark:via-transparent dark:to-brand-accent/10" style={{ fontSize: fontSize * 0.85 }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-tr from-brand-primary/25 to-brand-accent/25 text-brand-primary dark:text-brand-accent shadow-inner">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-[11px] tracking-wider uppercase text-neutral-700 dark:text-neutral-300">AI Analyst</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={closeSidebar}
              className="p-2 rounded-md hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
              aria-label="Close AI Analyst"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>
  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 leading-relaxed font-[450] text-neutral-200" style={{ fontSize }}>
          {history.length <= 2 && !loading && (
            <div className="mb-3 space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between gap-2 pr-2">
                <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-neutral-400 flex items-center gap-1">Quick Prompts <Sparkles className="w-4 h-4" /></div>
                <button onClick={()=>{ /* future regenerate suggestions */ }} className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition">Refresh</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(() => {
                  const pagePrompts: Record<string,string[]> = {
                    overview: [
                      'Summarize key KPI shifts today',
                      'Highlight any anomaly in revenue vs rolling avg',
                      'Which allocation slice changed most this week?',
                      'List paid vs failed transaction ratio',
                      'Identify churn risk signals'
                    ],
                    revenue: [
                      'Break down revenue by month last quarter',
                      'Explain variance vs rolling average this month',
                      'Detect anomalies over 20% deviation',
                      'Forecast next 2 months (qualitatively)',
                      'Compare top 3 months by growth rate'
                    ],
                    billing: [
                      'Invoice aging summary',
                      'Overdue recovery suggestions',
                      'Cash collection efficiency trend',
                      'Identify largest overdue invoices',
                      'Suggest dunning strategy improvements'
                    ],
                    settings: [
                      'List personalization settings impact',
                      'Propose new experimental features',
                      'Evaluate theme usage benefits'
                    ]
                  };
                  return (pagePrompts[currentPage] || ['Revenue growth last month','Change in churn vs prior month','Explain allocation mix','List top 3 recent transactions','Break down run rate','Show top 5 customers']).map(p => p);
                })().map(p => (
                  <button
                    key={p}
          onClick={() => askQuestion(currentPage !== 'overview' ? `[${currentPage}] ${p}` : p)}
                    type="button"
                    className="group relative w-full text-left px-3 py-2 rounded-lg font-medium bg-neutral-850/70 dark:bg-neutral-800/70 hover:bg-neutral-700/70 border border-neutral-700/70 hover:border-neutral-600/70 text-neutral-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition flex items-center gap-2"
                    style={{ fontSize: Math.max(11, fontSize - 1), transform: `scale(${uiScale})` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent shadow" />
                    <span className="flex-1 leading-snug">{p}</span>
                  </button>
                ))}
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-neutral-300/40 dark:via-neutral-700/40 to-transparent" />
            </div>
          )}
      {history.map(h => (
            <div
              key={h.id}
              className={`group relative rounded-xl max-w-full whitespace-pre-wrap px-5 py-4 ring-1 ring-inset tracking-wide shadow-sm ${h.role === 'assistant' ? 'bg-neutral-900/70 ring-neutral-700 text-neutral-200' : 'bg-gradient-to-r from-brand-primary/45 to-brand-accent/45 ring-brand-primary/50 text-neutral-50'} animate-fade-in-up`}
              style={{ fontSize }}
            >
              <span className="block text-[11px] uppercase tracking-[0.2em] opacity-80 mb-2 font-semibold text-brand-primary/80">{h.role}</span>
        <span className="relative z-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(h.content) }} />
              {h.role === 'assistant' && (
                <div className="pointer-events-none absolute inset-px opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit] bg-radial-fade" />
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-neutral-400 text-sm animate-fade-in-up font-medium">
              <Loader2 className="animate-spin w-4 h-4" /> Thinking...
            </div>
          )}
      <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            ask();
          }}
          className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3 bg-white/90 dark:bg-neutral-950/70 backdrop-blur-sm"
          style={{ fontSize }}
        >
          <div className="relative flex-1">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about revenue, churn..."
              className="w-full rounded-lg bg-neutral-100/80 dark:bg-neutral-900/70 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent/40 px-3 py-2 placeholder:text-neutral-500 shadow-inner text-neutral-800 dark:text-neutral-100"
              style={{ fontSize }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-neutral-300/50 dark:ring-neutral-700/40" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="p-2 rounded-md bg-gradient-to-br from-brand-primary to-brand-accent hover:opacity-90 disabled:opacity-40 text-white shadow-soft transition-all"
            aria-label="Send question to AI" style={{ transform: `scale(${uiScale})` }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
  {/* Removed bottom controls per request */}
      </div>
    </>
  );
};
