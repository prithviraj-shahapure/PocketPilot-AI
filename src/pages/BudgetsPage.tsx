import React, { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle2, Trash2, Edit2, PieChart, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { AddBudgetModal } from '../components/modals/AddBudgetModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { ToastContainer, ToastMessage } from '../components/ui/Toast';
import { categoryIcons } from '../components/modals/AddExpenseModal';
import { Budget } from '../types';

export const BudgetsPage: React.FC = () => {
  const { budgets, deleteBudget } = useFinance();
  const { user } = useAuth();

  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = { id: `toast-${Date.now()}`, message, type };
    setToasts((prev) => [...prev, newToast]);
  };

  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dayOfMonth = new Date().getDate();
  const daysLeft = daysInMonth - dayOfMonth;

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Monthly Budget Guardrails</h1>
          <p className="text-xs text-slate-400 mt-1">
            Proactive spending caps with real-time AI threshold alerts.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => { setEditingBudget(null); setIsAddBudgetOpen(true); }}>
          Set New Budget Limit
        </Button>
      </div>

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow="indigo">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Total Allocated Budget</span>
          <h3 className="text-2xl font-extrabold text-white mt-2">{user.currency}{totalAllocated.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">Across {budgets.length} spending categories</p>
        </Card>

        <Card glow="danger">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Total Spent Thus Far</span>
          <h3 className="text-2xl font-extrabold text-white mt-2">{user.currency}{totalSpent.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {Math.round((totalSpent / totalAllocated) * 100 || 0)}% of total monthly cap
          </p>
        </Card>

        <Card glow="emerald">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Remaining Safe Balance</span>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">{user.currency}{totalRemaining.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">{daysLeft} Days Remaining in Month</p>
        </Card>
      </div>

      {/* Budgets Grid or Empty State */}
      {budgets.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <PieChart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Monthly Budgets Configured Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Set category spending caps for Food, Shopping, or Transport to receive real-time risk alerts.
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => { setEditingBudget(null); setIsAddBudgetOpen(true); }}>
            Set Your First Budget Limit
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const catInfo = categoryIcons[b.category] || categoryIcons['Other'];
            const IconComp = catInfo.icon;
            const pct = Math.round((b.spentAmount / b.allocatedAmount) * 100);
            const isExceeded = b.spentAmount > b.allocatedAmount;
            const isWarning = pct >= 75 && !isExceeded;
            const remaining = b.allocatedAmount - b.spentAmount;

            return (
              <Card key={b.id} glow={isExceeded ? 'danger' : isWarning ? 'none' : 'indigo'} className="flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${catInfo.bg}`}>
                        <IconComp className={`w-5 h-5 ${catInfo.color}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{b.category}</h3>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {daysLeft} days left
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isExceeded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-extrabold">
                          <AlertTriangle className="w-3 h-3" /> Exceeded
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-extrabold">
                          <AlertTriangle className="w-3 h-3" /> Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3" /> Safe
                        </span>
                      )}

                      <button
                        onClick={() => { setEditingBudget(b); setIsAddBudgetOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Budget"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingBudget(b)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-baseline text-xs font-bold">
                      <span className="text-slate-300">Spent: {user.currency}{b.spentAmount.toLocaleString()}</span>
                      <span className={isExceeded ? 'text-red-400 font-extrabold' : isWarning ? 'text-amber-400' : 'text-slate-400'}>
                        {pct}%
                      </span>
                    </div>
                    <ProgressBar
                      value={pct}
                      color={isExceeded ? 'bg-red-500' : isWarning ? 'bg-amber-500' : b.color}
                      height="h-3"
                    />
                  </div>
                </div>

                {/* Footer Metric */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {isExceeded ? 'Overbudget by' : 'Remaining Runway'}
                  </span>
                  <span className={`font-extrabold ${isExceeded ? 'text-red-400' : 'text-emerald-400'}`}>
                    {user.currency}{Math.abs(remaining).toLocaleString()}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        budgetToEdit={editingBudget}
        onSuccessToast={(msg) => showToast(msg, 'success')}
      />

      {/* Delete Confirmation Modal */}
      {deletingBudget && (
        <DeleteConfirmModal
          isOpen={!!deletingBudget}
          onClose={() => setDeletingBudget(null)}
          onConfirm={async () => {
            await deleteBudget(deletingBudget.id);
            showToast(`Deleted budget limit for "${deletingBudget.category}".`, 'info');
          }}
          title={deletingBudget.category}
          itemType="Budget"
        />
      )}
    </div>
  );
};
