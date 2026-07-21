import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Sparkles, 
  BarChart3 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const mobileLinks = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Txns', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'AI Coach', path: '/ai-coach', icon: Sparkles },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 lg:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mobileLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-brand-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{link.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
