import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';

export const FinancialCalendar: React.FC = () => {
  const { transactions, subscriptions } = useFinance();
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // July 2026
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map transactions to date strings (YYYY-MM-DD)
  const txMap: Record<string, Transaction[]> = {};
  transactions.forEach((t) => {
    if (!txMap[t.date]) txMap[t.date] = [];
    txMap[t.date].push(t);
  });

  const getDayFormatted = (dayNum: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = dayNum.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const selectedDayTxs = selectedDay ? txMap[selectedDay] || [] : [];

  return (
    <Card className="p-6 space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-bold text-white">
            Financial Calendar ({monthNames[month]} {year})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-xs uppercase border-b border-slate-800 pb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-950/20 border border-transparent" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = getDayFormatted(dayNum);
          const dayTxs = txMap[dateStr] || [];
          const hasExpense = dayTxs.some((t) => t.type === 'expense');
          const hasIncome = dayTxs.some((t) => t.type === 'income');
          const isSelected = selectedDay === dateStr;

          return (
            <button
              key={dayNum}
              onClick={() => setSelectedDay(dateStr)}
              className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between items-start text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-600/30 border-brand-500 ring-2 ring-brand-500/40'
                  : dayTxs.length > 0
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900/60 hover:bg-slate-900/40'
              }`}
            >
              <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {dayNum}
              </span>

              {dayTxs.length > 0 && (
                <div className="w-full space-y-0.5">
                  {hasIncome && (
                    <div className="w-full bg-emerald-500/20 text-emerald-400 rounded px-1 py-0.2 text-[9px] font-bold truncate">
                      +Inflow
                    </div>
                  )}
                  {hasExpense && (
                    <div className="w-full bg-red-500/20 text-red-400 rounded px-1 py-0.2 text-[9px] font-bold truncate">
                      -{dayTxs.filter((t) => t.type === 'expense').length} Exp
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Transaction Drawer */}
      {selectedDay && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-brand-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white">
              Transactions for {selectedDay} ({selectedDayTxs.length} entries)
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedDayTxs.length === 0 ? (
            <p className="text-xs text-slate-500">No transactions logged on this day.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {selectedDayTxs.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div>
                    <span className="font-bold text-white block">{t.title}</span>
                    <span className="text-[10px] text-slate-400">{t.category} • {t.paymentMethod}</span>
                  </div>

                  <span className={`font-extrabold ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                    {t.type === 'income' ? '+' : '-'}{user.currency}{t.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
