import { useMemo } from 'react';
import { useStore } from '../state/store';

export const useDashboardData = () => {
  const metrics = useStore(s => s.metrics);
  const transactions = useStore(s => s.transactions);

  const kpis = useMemo(() => [
    { id: 'rev', label: 'Total Revenue', value: metrics.revenue, display: `$${metrics.revenue.toLocaleString()}`, delta: metrics.revenueDelta },
    { id: 'subs', label: 'Active Customers', value: metrics.customers, display: metrics.customers.toLocaleString(), delta: metrics.customersDelta },
    { id: 'arr', label: 'ARR', value: metrics.arr, display: `$${(metrics.arr/1000).toFixed(1)}k`, delta: metrics.arrDelta },
    { id: 'churn', label: 'Churn Rate', value: metrics.churn, display: `${metrics.churn.toFixed(2)}%`, delta: metrics.churnDelta }
  ], [metrics]);

  const revenueSeries = useStore(s => s.revenueSeries);
  const allocation = useStore(s => s.allocation);

  return { kpis, revenueSeries, allocation, transactions };
};
