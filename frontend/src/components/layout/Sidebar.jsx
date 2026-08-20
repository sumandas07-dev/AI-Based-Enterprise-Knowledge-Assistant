import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MessageSquare, 
  History, 
  FileText, 
  Database, 
  Settings, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Plus
} from 'lucide-react';
import { documentApi } from '../../api/api';

export const Sidebar = ({ 
  collapsed, 
  setCollapsed,
  onMobileClose
}) => {
  const [stats, setStats] = useState({ total: 0, indexed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const docs = await documentApi.getDocuments();
        const indexedDocs = docs.filter(d => d.status === 'Indexed');
        setStats({
          total: docs.length,
          indexed: indexedDocs.length
        });
      } catch (err) {
        console.error('Failed to load KB stats in sidebar:', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 8000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/dashboard', label: 'Chat History', icon: History },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/sources', label: 'Sources', icon: Database },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <div 
      className={`h-full bg-panel-dark border-r border-border-subtle flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div>
        {/* Branding header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-border-subtle">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-accent-purple rounded-lg shrink-0 text-white shadow-md">
              <BookOpen size={18} />
            </div>
            {!collapsed && (
              <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                Knowledge Assistant
              </span>
            )}
          </div>
          {!collapsed && (
            <button 
              onClick={() => setCollapsed(true)}
              className="hidden lg:block text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-panel-secondary"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {collapsed && (
            <button 
              onClick={() => setCollapsed(false)}
              className="hidden lg:block text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-panel-secondary mx-auto"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <NavLink
            to="/dashboard"
            onClick={onMobileClose}
            className={`flex items-center gap-2.5 px-3 py-2.5 bg-accent-purple hover:bg-accent-purpleHover text-white rounded-lg text-xs font-semibold shadow-md transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Plus size={16} className="shrink-0" />
            {!collapsed && <span>New Chat</span>}
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-panel-secondary text-white border-l-2 border-accent-purple' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-panel-secondary/30'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={16} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border-subtle flex flex-col gap-4">
        {/* Knowledge Base Stats card */}
        {!collapsed && (
          <div className="bg-panel-light p-3.5 rounded-xl border border-border-subtle flex flex-col gap-1.5 animate-fade-in">
            <span className="text-[9px] font-bold tracking-wider text-accent-purple uppercase">Knowledge Base</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-secondary">Documents</span>
                <span className="text-sm font-bold text-white mt-0.5">{stats.total}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-text-secondary">Indexed</span>
                <span className="text-sm font-bold text-green-400 mt-0.5">{stats.indexed}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
