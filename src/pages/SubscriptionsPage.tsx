import React, { useState } from 'react';
import { Trash2, CreditCard, Calendar, RefreshCw, Plus, CheckCircle2, PauseCircle, PlayCircle, SkipForward } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { AddBillModal } from '../components/modals/AddBillModal';
import { AddRecurringModal } from '../components/modals/AddRecurringModal';
import { ToastContainer, ToastMessage } from '../components/ui/Toast';
import { Subscription, BillItem, RecurringTransaction } from '../types';

export const SubscriptionsPage: React.FC = () => {
  const { 
    subscriptions, 
    deleteSubscription, 
    bills, 
    markBillPaid, 
    toggleAutoPayBill, 
    deleteBill,
    recurring,
    togglePauseRecurring,
    skipNextRecurring,
    deleteRecurring
  } = useFinance();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'Subscriptions' | 'Recurring' | 'Bills'>('Subscriptions');
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: string; title: string; type: 'Subscription' | 'Bill' | 'Recurring' } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = { id: `toast-${Date.now()}`, message, type };
    setToasts((prev) => [...prev, newToast]);
  };

  const totalMonthlyCost = subscriptions
    .filter((s) => s.status === 'Active')
    .reduce((sum, s) => sum + (s.billingCycle === 'Yearly' ? Math.round(s.amount / 12) : s.amount), 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Recurring & Bills Operating Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage recurring SaaS subscriptions, scheduled EMIs/Salary, and upcoming utility bills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'Bills' && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddBillOpen(true)}>
              Add Bill
            </Button>
          )}
          {activeTab === 'Recurring' && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddRecurringOpen(true)}>
              Add Schedule
            </Button>
          )}
          <div className="text-right pl-4 border-l border-slate-800">
            <span className="text-xs text-slate-400">Monthly Burn</span>
            <h3 className="text-xl font-extrabold text-white">{user.currency}{totalMonthlyCost.toLocaleString()} / mo</h3>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('Subscriptions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'Subscriptions' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          SaaS Subscriptions ({subscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('Recurring')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'Recurring' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          Recurring Schedules ({recurring.length})
        </button>
        <button
          onClick={() => setActiveTab('Bills')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'Bills' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          Bills Manager ({bills.length})
        </button>
      </div>

      {/* Tab 1: SaaS Subscriptions Grid */}
      {activeTab === 'Subscriptions' && (
        subscriptions.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Recurring Subscriptions Tracked</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Connect Smart Sync or import bank statements to automatically detect active subscriptions.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              <Card key={sub.id} glow="indigo" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.logo}
                        alt={sub.name}
                        className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1 border border-slate-800"
                      />
                      <div>
                        <h3 className="text-base font-bold text-white">{sub.name}</h3>
                        <span className="text-[10px] text-slate-400">{sub.category}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {sub.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Billing Cycle</span>
                      <span className="font-bold text-white">{sub.billingCycle}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Renewal Date</span>
                      <span className="font-bold text-brand-400">{sub.renewalDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400">Cost</span>
                    <p className="text-base font-extrabold text-white">
                      {user.currency}{sub.amount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/{sub.billingCycle === 'Yearly' ? 'yr' : 'mo'}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setDeletingItem({ id: sub.id, title: sub.name, type: 'Subscription' })}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Cancel Subscription Tracking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Tab 2: Recurring Schedules Grid */}
      {activeTab === 'Recurring' && (
        recurring.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Recurring Schedules Configured</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Automate monthly salary inflows, house rent, or SIP investment payouts.
              </p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setIsAddRecurringOpen(true)}>
              Add First Schedule
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recurring.map((rec) => (
              <Card key={rec.id} glow={rec.status === 'Active' ? 'indigo' : 'none'} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-white">{rec.title}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      rec.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}>
                      {rec.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs mb-3">
                    <div className="flex justify-between"><span className="text-slate-400">Frequency</span><strong className="text-white">{rec.frequency}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Next Due</span><strong className="text-brand-400">{rec.nextDueDate}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Payment Method</span><span className="text-slate-300">{rec.paymentMethod}</span></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className={`text-base font-extrabold ${rec.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                    {rec.type === 'income' ? '+' : '-'}{user.currency}{rec.amount.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePauseRecurring(rec.id, rec.status)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title={rec.status === 'Active' ? 'Pause Schedule' : 'Resume Schedule'}
                    >
                      {rec.status === 'Active' ? <PauseCircle className="w-4 h-4 text-amber-400" /> : <PlayCircle className="w-4 h-4 text-emerald-400" />}
                    </button>

                    <button
                      onClick={() => { skipNextRecurring(rec.id, rec.nextDueDate, rec.frequency); showToast('Skipped next due date.'); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Skip Next Due Occurrence"
                    >
                      <SkipForward className="w-4 h-4 text-brand-400" />
                    </button>

                    <button
                      onClick={() => setDeletingItem({ id: rec.id, title: rec.title, type: 'Recurring' })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Tab 3: Bills Manager Grid */}
      {activeTab === 'Bills' && (
        bills.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Bills Recorded in Manager</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Add electricity, internet, or credit card bills to receive due notifications.
              </p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setIsAddBillOpen(true)}>
              Add First Bill
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((b) => (
              <Card key={b.id} glow={b.status === 'Overdue' ? 'danger' : b.status === 'Paid' ? 'emerald' : 'indigo'} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-white">{b.billName}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                      b.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      b.status === 'Overdue' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs mb-3">
                    <div className="flex justify-between"><span className="text-slate-400">Due Date</span><strong className="text-white">{b.dueDate}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Auto-Pay</span><span className={b.autoPay ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{b.autoPay ? 'Enabled' : 'Disabled'}</span></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">
                    {user.currency}{b.amount.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {b.status !== 'Paid' && (
                      <Button variant="secondary" size="sm" icon={CheckCircle2} onClick={() => { markBillPaid(b.id); showToast(`Marked ${b.billName} as Paid 🎉`); }}>
                        Paid
                      </Button>
                    )}
                    <button
                      onClick={() => setDeletingItem({ id: b.id, title: b.billName, type: 'Bill' })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Modals */}
      <AddBillModal isOpen={isAddBillOpen} onClose={() => setIsAddBillOpen(false)} onSuccessToast={(m) => showToast(m, 'success')} />
      <AddRecurringModal isOpen={isAddRecurringOpen} onClose={() => setIsAddRecurringOpen(false)} onSuccessToast={(m) => showToast(m, 'success')} />

      {deletingItem && (
        <DeleteConfirmModal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={() => {
            if (deletingItem.type === 'Subscription') deleteSubscription(deletingItem.id);
            else if (deletingItem.type === 'Bill') deleteBill(deletingItem.id);
            else if (deletingItem.type === 'Recurring') deleteRecurring(deletingItem.id);
            showToast(`Deleted ${deletingItem.title}.`, 'info');
          }}
          title={deletingItem.title}
          itemType={deletingItem.type}
        />
      )}
    </div>
  );
};
