import React, { useState } from 'react';
import { Bell, CheckCheck, Filter, AlertTriangle, Target, Receipt, Award } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinance } from '../context/FinanceContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useFinance();
  const [filterType, setFilterType] = useState<string>('All');

  const filtered = notifications.filter((n) => filterType === 'All' || n.type === filterType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Overspending': return AlertTriangle;
      case 'Goal': return Target;
      case 'Bill': return Receipt;
      case 'Milestone': return Award;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time alerts for budget limits, goal milestones, and upcoming bill renewals.
          </p>
        </div>

        <Button variant="glass" size="sm" icon={CheckCheck} onClick={markAllNotificationsRead}>
          Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {['All', 'Overspending', 'Goal', 'Bill', 'Milestone'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === type
                ? 'bg-brand-600 text-white border border-brand-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-xs text-slate-500">No notifications in this filter.</p>
          </Card>
        ) : (
          filtered.map((n) => {
            const IconComp = getTypeIcon(n.type);
            return (
              <Card
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 transition-all cursor-pointer ${
                  n.read ? 'opacity-75 border-slate-800' : 'border-brand-500/40 bg-slate-900/80 shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      n.type === 'Overspending' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      n.type === 'Goal' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-500" />
                        )}
                      </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
