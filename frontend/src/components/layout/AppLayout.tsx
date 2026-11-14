import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface AppLayoutProps {
  storeName?: string;
  storeSegment?: string;
  userEmail?: string;
  userRole?: string;
  isBackendHealthy?: boolean;
  onLogout?: () => void;
}

export function AppLayout({
  storeName,
  storeSegment,
  userEmail,
  userRole,
  isBackendHealthy = true,
  onLogout,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-surface-muted">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          storeName={storeName}
          storeSegment={storeSegment}
          userEmail={userEmail}
          userRole={userRole}
          isBackendHealthy={isBackendHealthy}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
