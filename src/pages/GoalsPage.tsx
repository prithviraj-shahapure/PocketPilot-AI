import React, { useState } from 'react';
import { Plus, Target, Laptop, Plane, ShieldCheck, Bike, Home, Trash2, Edit2, CheckCircle2, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { AddGoalModal } from '../components/modals/AddGoalModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { ToastContainer, ToastMessage } from '../components/ui/Toast';
import { goalService } from '../services/goalService';
import { Goal } from '../types';

export const GoalsPage: React.FC = () => {
  const { goals, contributeToGoal, deleteGoal } = useFinance();
  const { user } = useAuth();

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = { id: `toast-${Date.now()}`, message, type };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDeposit = async (e: React.FormEvent, goal: Goal) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }

    await contributeToGoal(goal.id, amountNum);
    showToast(`Added ${user.currency}${amountNum.toLocaleString()} savings to ${goal.title}.`);
    setSelectedGoalId(null);
    setDepositAmount('');
  };

  const handleToggleComplete = async (goal: Goal) => {
    await goalService.toggleGoalComplete(goal.id, !!goal.completed);
    showToast(`Marked "${goal.title}" as ${!goal.completed ? 'Completed 🎉' : 'In Progress'}.`);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return Laptop;
      case 'Plane': return Plane;
      case 'ShieldCheck': return ShieldCheck;
      case 'Bike': return Bike;
      case 'Home': return Home;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Savings Targets</h1>
          <p className="text-xs text-slate-400 mt-1">
            Accelerate your major milestone purchases with automated progress tracking and deposit logs.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => { setEditingGoal(null); setIsAddGoalOpen(true); }}>
          Create New Savings Goal
        </Button>
      </div>

      {/* Goals Grid or Empty State */}
      {goals.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Savings Goals Configured Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Create target milestones for a MacBook, Japan vacation, or Emergency Fund to begin tracking.
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => { setEditingGoal(null); setIsAddGoalOpen(true); }}>
            Create Your First Savings Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const IconComp = getIcon(g.categoryIcon);
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <Card key={g.id} glow={g.completed ? 'emerald' : 'indigo'} className="flex flex-col items-center text-center justify-between relative overflow-hidden">
                {g.completed && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                    Completed 🎉
                  </div>
                )}

                <div className="w-full flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleComplete(g)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        g.completed ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                      }`}
                      title={g.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setEditingGoal(g); setIsAddGoalOpen(true); }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingGoal(g)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Circular Progress Ring */}
                <div className="my-3">
                  <CircularProgress
                    percentage={pct}
                    size={150}
                    strokeWidth={12}
                    color={g.completed ? '#22C55E' : g.color}
                    label={`${pct}%`}
                    sublabel="Achieved"
                  />
                </div>

                {/* Metrics */}
                <div className="w-full space-y-1.5 my-2 text-xs">
                  <h3 className="text-base font-bold text-white">{g.title}</h3>
                  <p className="text-[11px] text-slate-400">Estimated Deadline: <strong className="text-slate-200">{g.targetDate}</strong></p>
                  
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Saved</span>
                      <strong className="text-white">{user.currency}{g.currentAmount.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Target</span>
                      <strong className="text-white">{user.currency}{g.targetAmount.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Remaining</span>
                      <strong className={remaining === 0 ? 'text-emerald-400' : 'text-brand-400'}>
                        {user.currency}{remaining.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Quick Add Savings Form */}
                <div className="w-full pt-3 mt-2 border-t border-slate-800/80">
                  {selectedGoalId === g.id ? (
                    <form onSubmit={(e) => handleDeposit(e, g)} className="flex gap-2">
                      <input
                        type="number"
                        required
                        placeholder="Deposit Amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                      />
                      <Button type="submit" variant="primary" size="sm">Add</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedGoalId(null)}>X</Button>
                    </form>
                  ) : (
                    <Button
                      variant="glass"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setSelectedGoalId(g.id)}
                    >
                      + Quick Add Savings
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        goalToEdit={editingGoal}
        onSuccessToast={(msg) => showToast(msg, 'success')}
      />

      {/* Delete Confirmation Modal */}
      {deletingGoal && (
        <DeleteConfirmModal
          isOpen={!!deletingGoal}
          onClose={() => setDeletingGoal(null)}
          onConfirm={async () => {
            await deleteGoal(deletingGoal.id);
            showToast(`Deleted goal "${deletingGoal.title}".`, 'info');
          }}
          title={deletingGoal.title}
          itemType="Savings Goal"
        />
      )}
    </div>
  );
};
