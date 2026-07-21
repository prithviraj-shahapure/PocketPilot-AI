import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  X
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { categoryIcons } from '../components/modals/AddExpenseModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { Transaction } from '../types';

export const TransactionsPage: React.FC<{ onOpenAddExpense: () => void }> = ({ onOpenAddExpense }) => {
  const { transactions, deleteTransaction } = useFinance();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [dateSort] = useState<'desc' | 'asc'>('desc');

  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const categories: string[] = ['All', 'Food', 'Shopping', 'Travel', 'Transport', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Investment', 'Salary', 'Freelance', 'Other'];
  const paymentMethods: string[] = ['All', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Crypto'];

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                              t.merchant.toLowerCase().includes(search.toLowerCase()) ||
                              (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
        const matchesPayment = selectedPaymentMethod === 'All' || t.paymentMethod === selectedPaymentMethod;
        const matchesType = selectedType === 'All' || t.type === selectedType;

        return matchesSearch && matchesCategory && matchesPayment && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [transactions, search, selectedCategory, selectedPaymentMethod, selectedType, dateSort]);

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Transaction Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and audit all incoming and outgoing cash flows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" icon={Plus} onClick={onOpenAddExpense}>
            Record Expense / Income
          </Button>
        </div>
      </div>

      {/* Multi-Filter Controls */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant, title, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
            >
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  Payment: {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
            >
              <option value="All">Type: All</option>
              <option value="expense">Expenses Only (-)</option>
              <option value="income">Income Only (+)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {(search || selectedCategory !== 'All' || selectedPaymentMethod !== 'All' || selectedType !== 'All') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              Showing {filteredTransactions.length} of {transactions.length} entries
            </span>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedPaymentMethod('All');
                setSelectedType('All');
              }}
              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>
        )}
      </Card>

      {/* Transaction Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 uppercase font-semibold text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Transaction</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No transactions matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const catInfo = categoryIcons[t.category] || categoryIcons['Other'];
                  const IconComp = catInfo.icon;
                  return (
                    <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${catInfo.bg}`}>
                            <IconComp className={`w-4 h-4 ${catInfo.color}`} />
                          </div>
                          <div>
                            <span className="font-bold text-white block">{t.title}</span>
                            <span className="text-[10px] text-slate-400">{t.merchant}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${catInfo.bg} ${catInfo.color}`}>
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          {t.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {t.date} {t.time && `• ${t.time}`}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-sm">
                        <span className={t.type === 'income' ? 'text-emerald-400' : 'text-white'}>
                          {t.type === 'income' ? '+' : '-'}{user.currency}{t.amount.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setDeletingTx(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {deletingTx && (
        <DeleteConfirmModal
          isOpen={!!deletingTx}
          onClose={() => setDeletingTx(null)}
          onConfirm={() => deleteTransaction(deletingTx.id)}
          title={deletingTx.title}
          itemType="Transaction"
        />
      )}
    </div>
  );
};
