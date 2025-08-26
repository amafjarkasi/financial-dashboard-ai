import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AdvancedOverview } from './AdvancedOverview';
import { useDashboardNav } from './navStore';
import { RevenuePage } from './pages/RevenuePage';
import { BillingPage } from './pages/BillingPage';
import { SettingsPage } from './pages/SettingsPage';
import { AISidebar } from './ai/AISidebar';

export const DashboardLayout: React.FC = () => {
  const page = useDashboardNav(s => s.page);
  return (
    <div className="h-full flex overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="p-6 space-y-6 overflow-y-auto">
          {page === 'overview' && (<AdvancedOverview />)}
          {page === 'revenue' && <RevenuePage />}
          {page === 'billing' && <BillingPage />}
          {page === 'settings' && <SettingsPage />}
        </main>
      </div>
      {/* AI Sidebar now rendered at the far right so it's visually on the right side */}
      <AISidebar />
    </div>
  );
};
