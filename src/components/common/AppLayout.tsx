import React from 'react';
import { SidebarNav } from './SidebarNav';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab,
  isSidebarOpen = true
}) => {
  return (
    <main className="flex-1 overflow-hidden bg-neutral-100 flex flex-row w-full max-w-full h-full min-w-0">
      {/* Left Sidebar Navigation on Fullscreen / Desktop / Tablet */}
      <SidebarNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden min-w-0 max-w-full w-full">
        {children}
      </div>
    </main>
  );
};
