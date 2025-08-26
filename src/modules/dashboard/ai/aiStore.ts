import { create } from 'zustand';

interface AISidebarState {
  open: boolean;
  history: { id: string; role: 'user' | 'assistant'; content: string }[];
  panelWidth: number; // user-adjustable width
  fontSize: number; // base font size in px
  compactMode: boolean; // tighter spacing
  uiScale: number; // control/button scale multiplier (0.9 - 1.3)
  reducedMotion: boolean;
  openSidebar(): void;
  closeSidebar(): void;
  toggleSidebar(): void;
  append(role: 'user' | 'assistant', content: string): void;
  setPanelWidth(w: number): void;
  setFontSize(s: number): void;
  setCompactMode(v: boolean): void;
  setUiScale(v: number): void;
  replaceLastAssistantContent(id: string, content: string): void;
  hydrate(): void;
}

export const useAISidebar = create<AISidebarState>(set => ({
  open: false,
  history: [
    { id: 'w1', role: 'assistant', content: 'Hi! I can answer questions about your financial metrics. Ask something like: **What was revenue growth month over month?**' }
  ],
  panelWidth: 400,
  fontSize: 15,
  compactMode: false,
  uiScale: 1,
  reducedMotion: typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  openSidebar: () => set({ open: true }),
  closeSidebar: () => set({ open: false }),
  toggleSidebar: () => set(s => ({ open: !s.open })),
  append: (role, content) => set(s => ({ history: [...s.history, { id: Math.random().toString(36).slice(2), role, content }] })),
  setPanelWidth: (w) => set({ panelWidth: w }),
  setFontSize: (s) => set({ fontSize: Math.min(20, Math.max(12, s)) }),
  setCompactMode: (v) => set({ compactMode: v }),
  setUiScale: (v) => set({ uiScale: Math.min(1.3, Math.max(0.9, parseFloat(v as any))) }),
  replaceLastAssistantContent: (id, content) => set(s => ({ history: s.history.map(h => h.id === id ? { ...h, content } : h) })),
  hydrate: () => set(s => {
    try {
      const stored = localStorage.getItem('aiSidebar');
      if (stored) {
        const parsed = JSON.parse(stored);
        const next: Partial<AISidebarState> = {};
        if (typeof parsed.panelWidth === 'number') next.panelWidth = Math.min(800, Math.max(360, parsed.panelWidth));
        if (typeof parsed.fontSize === 'number') next.fontSize = Math.min(22, Math.max(11, parsed.fontSize));
  if (typeof parsed.compactMode === 'boolean') next.compactMode = parsed.compactMode;
  if (typeof parsed.uiScale === 'number') next.uiScale = Math.min(1.3, Math.max(0.9, parsed.uiScale));
        return { ...s, ...next };
      }
    } catch { /* ignore corrupt storage */ }
    return s;
  })
}));
