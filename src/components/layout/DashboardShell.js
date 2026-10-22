'use client';

import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import MobileNavigation from './MobileNavigation';

export default function DashboardShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Desktop Sidebar (Only 4 primary items) */}
      <AppSidebar />

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-56 flex flex-col flex-1 pb-16 lg:pb-6">
        <AppHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-5 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
