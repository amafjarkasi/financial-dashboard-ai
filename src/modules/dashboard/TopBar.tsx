import React from 'react';
import { Moon, Sun, BotMessageSquare } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAISidebar } from './ai/aiStore';

export const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const openSidebar = useAISidebar((s: any) => s.openSidebar);

  return (
    <header className="h-14 border-b border-neutral-800 flex items-center gap-4 px-6 bg-neutral-950/60 backdrop-blur sticky top-0 z-20">
  <button onClick={() => openSidebar()} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium">
        <BotMessageSquare className="w-4 h-4" />
        Ask AI
      </button>
      <div className="ml-auto flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
