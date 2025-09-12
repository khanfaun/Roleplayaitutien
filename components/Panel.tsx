
import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

interface PanelProps {
  title: string;
  icon: React.ReactElement<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  startCollapsed?: boolean;
  contentNoOverflow?: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Panel: React.FC<PanelProps> = ({ title, icon, children, className, contentNoOverflow = false, isCollapsed, onToggle }) => {
  return (
    <div className={`bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 text-white flex flex-col transition-all duration-300 ${className} ${isCollapsed ? 'flex-none' : ''}`}>
      <h2 className="flex items-center justify-between gap-3 text-lg font-bold p-3 border-b border-slate-700/50 text-yellow-300 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3">
          {React.cloneElement(icon, { className: "w-6 h-6" })}
          <span>{title}</span>
        </div>
        <button className="p-1 rounded-full hover:bg-slate-700/50 transition-colors">
          {isCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
        </button>
      </h2>
      {!isCollapsed && (
        <div className={`p-4 min-h-0 flex-1 ${!contentNoOverflow ? 'overflow-y-auto styled-scrollbar' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Panel;
