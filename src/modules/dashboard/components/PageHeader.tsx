import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, rightSlot }) => {
  // Fixed uniform header height across all pages (previously variable with content wrap)
  return (
  <section className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-8 pt-5 h-[160px] min-h-[160px]">
      <div className="space-y-3 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent antialiased">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-neutral-400 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {rightSlot && (
        <div className="flex-shrink-0 self-start md:self-end">
          {rightSlot}
        </div>
      )}
    </section>
  );
};

export default PageHeader;