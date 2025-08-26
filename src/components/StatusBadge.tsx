import React from 'react';

export type StatusType = 'paid' | 'pending' | 'failed';

interface StatusBadgeProps {
  status: StatusType;
  showCode?: boolean; // whether to show the right-hand code segment
  className?: string;
  pulsePending?: boolean; // allow disabling pulse in detail views if desired
}

const STATUS_META: Record<StatusType, { code: string; classes: string; dot: string }> = {
  paid: {
    code: '200',
    classes: 'bg-emerald-600/20 text-emerald-200',
    dot: 'bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
  },
  pending: {
    code: '102',
    classes: 'bg-amber-500/20 text-amber-200',
    dot: 'bg-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]',
  },
  failed: {
    code: '500',
    classes: 'bg-rose-600/20 text-rose-200',
    dot: 'bg-rose-400 shadow-[0_0_0_3px_rgba(244,63,94,0.18)]'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showCode = false, className = '', pulsePending = true }) => {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-stretch rounded-md overflow-hidden shadow-inner ring-1 ring-inset ring-neutral-700/60 text-[11px] font-medium ${className}`}>
      <span className={`${meta.classes} px-2 py-1 uppercase tracking-wide backdrop-blur-sm flex items-center gap-1`}> 
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${status === 'pending' && pulsePending ? 'animate-pulse-slow' : ''}`} />
        {status}
      </span>
      {showCode && (
        <span className="px-1.5 py-1 bg-neutral-800/70 text-[10px] font-mono text-neutral-400 border-l border-neutral-700/60 flex items-center">
          {meta.code}
        </span>
      )}
    </span>
  );
};

export default StatusBadge;
