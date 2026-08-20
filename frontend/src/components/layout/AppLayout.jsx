import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { X } from 'lucide-react';

export const AppLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Map path to page titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'AI Knowledge Assistant';
    if (path.startsWith('/history')) return 'Conversation History';
    if (path.startsWith('/documents')) return 'Knowledge Base Documents';
    if (path.startsWith('/sources')) return 'RAG Document Sources';
    if (path.startsWith('/settings')) return 'System Settings';
    if (path.startsWith('/about')) return 'About & Architecture';
    return 'AI Knowledge Assistant';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Desktop Sidebar (Left Pane) */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-panel-dark transition-transform duration-300 transform lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end p-4 border-b border-border-subtle bg-panel-dark">
          <button 
            onClick={() => setMobileOpen(false)}
            className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-panel-secondary"
          >
            <X size={20} />
          </button>
        </div>
        <div className="h-[calc(100%-60px)]">
          <Sidebar 
            collapsed={false} 
            setCollapsed={() => {}} 
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* Center + Right Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar title={getPageTitle()} onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
