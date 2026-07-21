import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Download, 
  Plus, 
  Menu, 
  Sparkles, 
  CheckCheck,
  Camera
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { usePWA } from '../../context/PWAContext';
import { Button } from '../ui/Button';
import { ReceiptScannerModal } from '../modals/ReceiptScannerModal';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
  onOpenAddExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen, onOpenAddExpense }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useFinance();
  const { user } = useAuth();
  const { installApp } = usePWA();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left side: Mobile Menu Toggle & Page Title/Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search */}
        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions, budgets, insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all"
          />
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* OCR Receipt Scanner Button */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-brand-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="OCR Smart Receipt Scanner"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Notifications ({unreadCount} Unread)</span>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[10px] text-brand-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No notifications.</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.read ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-brand-500/10 border-brand-500/30 text-white font-semibold'
                      }`}
                    >
                      <strong className="block text-[11px] text-white">{n.title}</strong>
                      <p className="text-[10px] text-slate-400 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <NavLink
                to="/notifications"
                onClick={() => setShowNotifications(false)}
                className="block text-center text-xs font-bold text-brand-400 hover:underline pt-1"
              >
                View Notification Center →
              </NavLink>
            </div>
          )}
        </div>

        {/* Add Expense Button */}
        <Button variant="primary" size="sm" icon={Plus} onClick={onOpenAddExpense}>
          Record Expense
        </Button>
      </div>

      <ReceiptScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </header>
  );
};
