import React from 'react';

export const ChatLayout = ({ children, header, sidebar }) => (
  <div className="flex h-screen bg-white dark:bg-[#0b0c15] text-slate-900 dark:text-white transition-all duration-500">
    {sidebar}
    <div className="flex-1 flex flex-col min-w-0">
      {header}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  </div>
);
