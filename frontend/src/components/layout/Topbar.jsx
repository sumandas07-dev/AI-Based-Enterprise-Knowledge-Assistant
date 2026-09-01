import React from 'react';
import { Menu, LogOut, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ title, onMobileMenuToggle }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out of your session?")) {
      await logout();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

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
          <Moon size={12} className="text-indigo-400" />
          <span>Dark Mode</span>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-4 border-l border-border-subtle">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-[11px] font-bold text-white">{user?.name || 'User'}</span>
            <span className="text-[9px] text-text-secondary">{user?.email || ''}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 font-semibold text-xs shadow-md">
            {getInitials(user?.name)}
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="ml-2 p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-panel-secondary/50 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
