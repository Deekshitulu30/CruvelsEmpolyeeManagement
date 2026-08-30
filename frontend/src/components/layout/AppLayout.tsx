import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { CookieBanner } from '../shared/CookieBanner';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background text-on-surface overflow-hidden font-body-md antialiased">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-[72px]' : 'ml-[280px]'
        }`}
      >
        <TopNavbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-surface-bright">
          <div className="max-w-container-max mx-auto space-y-gutter">
            <Outlet />
          </div>
        </main>
      </div>

      <CookieBanner />
    </div>
  );
};

