import { create } from 'zustand';

export type DashboardPage = 'overview' | 'revenue' | 'billing' | 'settings';

interface NavState {
  page: DashboardPage;
  setPage(p: DashboardPage): void;
}

export const useDashboardNav = create<NavState>(set => ({
  page: 'overview',
  setPage: (p) => set({ page: p })
}));