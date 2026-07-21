import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  BarChart3, 
  Sparkles, 
  Clock, 
  Repeat, 
  RefreshCw, 
  FileText, 
  Bell, 
  User, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Landmark,
  TrendingUp,
  ShieldAlert,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const location = useLocation();
  const { notifications } = useFinance();
  const { user, logout } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Net Worth', path: '/net-worth', icon: Landmark, badge: 'New' },
    { name: 'Investments', path: '/investments', icon: TrendingUp },
    { name: 'Loans & EMIs', path: '/loans', icon: ShieldAlert },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Coach', path: '/ai-coach', icon: Sparkles, badge: 'AI' },
    { name: 'Timeline', path: '/timeline', icon: Clock },
    { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    { name: 'Document Vault', path: '/documents', icon: Shield },
    { name: 'Smart Sync', path: '/smart-sync', icon: RefreshCw, badge: 'Live' },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Security Center', path: '/security', icon: ShieldCheck },
    { name: 'Notifications', path: '/notifications', icon: Bell, badgeCount: unreadCount },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-950/90 border-r border-slate-800/80 backdrop-blur-xl transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo & Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-3 group overflow-hidden">
            {collapsed ? (
              <img src="/logo-icon.png" alt="PocketPilot AI" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform" />
            ) : (
              <img src="/logo.png" alt="PocketPilot AI" className="h-10 object-contain group-hover:scale-105 transition-transform" />
            )}
          </NavLink>

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 font-bold shadow-sm shadow-brand-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-white'}`} />
                  {!collapsed && <span>{item.name}</span>}
                </div>

                {!collapsed && (
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {item.badge}
                      </span>
                    )}
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-red-500 text-white">
                        {item.badgeCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer User Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-700/80 flex-shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
