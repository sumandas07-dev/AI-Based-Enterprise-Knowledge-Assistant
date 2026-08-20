import React from 'react';
import { Menu, User, Moon } from 'lucide-react';

export const Topbar = ({ title, onMobileMenuToggle }) => {
  return (
    <header className="h-16 bg-panel-dark border-b border-border-subtle flex items-center justify-between px-6 z-10 shrink-0">
      {/* Left side: Mobile menu & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-panel-secondary focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-semibold text-white tracking-wide">{title}</h1>
      </div>

      {/* Right side: Settings & profile */}
      <div className="flex items-center gap-4">
        {/* Dark Theme indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-panel-light border border-border-subtle rounded-lg text-[10px] font-semibold text-text-secondary">
          <Moon size={12} className="text-accent-purple" />
          <span>Dark Mode</span>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-4 border-l border-border-subtle">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-[11px] font-bold text-white">Enterprise Admin</span>
            <span className="text-[9px] text-text-secondary">admin@enterprise.com</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center border border-accent-purple/30 font-semibold text-xs shadow-md">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};
