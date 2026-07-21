import React from 'react';
import { Clock, Sun, Sunset, Moon, Sunrise, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { categoryIcons } from '../components/modals/AddExpenseModal';
import { FinancialCalendar } from '../components/calendar/FinancialCalendar';

export const TimelinePage: React.FC = () => {
  const { timeline } = useFinance();
  const { user } = useAuth();

  const sections: { key: 'Morning' | 'Afternoon' | 'Evening' | 'Night'; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { key: 'Morning', label: 'Morning (06:00 AM - 12:00 PM)', icon: Sunrise, color: 'text-amber-400' },
    { key: 'Afternoon', label: 'Afternoon (12:00 PM - 05:00 PM)', icon: Sun, color: 'text-yellow-400' },
    { key: 'Evening', label: 'Evening (05:00 PM - 09:00 PM)', icon: Sunset, color: 'text-orange-400' },
    { key: 'Night', label: 'Night (09:00 PM - 05:00 AM)', icon: Moon, color: 'text-indigo-400' },
  ];

  const totalSpentToday = timeline.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-brand-400" />
            <span className="text-xs uppercase font-extrabold text-brand-300 tracking-wider">Chronological Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Daily Expense Timeline & Financial Calendar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Interactive monthly calendar grid and hour-by-hour daytime spending breakdown.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Total Spent Today</span>
          <h3 className="text-2xl font-extrabold text-white">{user.currency}{totalSpentToday.toLocaleString()}</h3>
        </div>
      </div>

      {/* Financial Calendar Component */}
      <FinancialCalendar />

      {/* Timeline Section Groups */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-400" /> Today's Hourly Spending Breakdown
        </h3>

        {sections.map((sec) => {
          const items = timeline.filter((t) => t.timeOfDay === sec.key);
          const IconComp = sec.icon;

          return (
            <div key={sec.key} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
                <IconComp className={`w-4 h-4 ${sec.color}`} />
                <span>{sec.label}</span>
                <span className="text-xs text-slate-500 font-normal">({items.length} items)</span>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-slate-500 italic px-4 py-2">No expenses recorded for this period.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const catInfo = categoryIcons[item.category] || categoryIcons['Other'];
                    const ItemCatIcon = catInfo.icon;

                    return (
                      <Card key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:border-brand-500/40">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${catInfo.bg}`}>
                            <ItemCatIcon className={`w-4 h-4 ${catInfo.color}`} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{item.title}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{item.time}</span>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">{item.paymentMethod}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-sm font-extrabold text-white">
                          -{user.currency}{item.amount.toLocaleString()}
                        </span>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Daily Summary Banner at Bottom */}
      <div className="glass-panel p-5 rounded-3xl border border-emerald-500/40 bg-emerald-950/20 shadow-xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/40">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">AI Daily Summary</h4>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.2 rounded border border-emerald-500/30">
              Optimal Velocity
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Your spending today is 14% lower than your daily average. No major impulse purchases detected in evening or night slots.
          </p>
        </div>
      </div>
    </div>
  );
};
