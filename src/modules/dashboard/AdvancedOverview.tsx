import React from 'react';
import { MetricsGrid } from './MetricsGrid';
import { ChartsPanel } from './ChartsPanel';
import { TransactionsTable } from './TransactionsTable';
// removed unused icon imports
import { OperationalPulse } from './components/OperationalPulse';

// Additional advanced widgets demonstrating 2025 dashboard trends: micro-panels, spark bars, goal tracking.
// legacy miniStats removed; replaced by OperationalPulse


export const AdvancedOverview: React.FC = () => {
  // legacy sparkData removed (replaced by OperationalPulse)
  return (
    <div className="space-y-10">
  <OperationalPulse />
      <MetricsGrid />
      <ChartsPanel />
      <TransactionsTable />
    </div>
  );
};
