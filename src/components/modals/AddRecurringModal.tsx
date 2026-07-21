import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CategoryType, PaymentMethod, TransactionType } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({ isOpen, onClose, onSuccessToast }) => {
  const { addRecurring } = useFinance();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<CategoryType>('Bills');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [nextDueDate, setNextDueDate] = useState('2026-08-01');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [merchant, setMerchant] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    try {
      await addRecurring({
        title,
        amount: amt,
        type,
        category,
        frequency,
        nextDueDate,
        paymentMethod,
        merchant: merchant || title,
        status: 'Active',
      });

      if (onSuccessToast) onSuccessToast(`Recurring schedule "${title}" added.`);
      setTitle('');
      setAmount('');
      onClose();
    } catch (err) {
      console.warn('Error adding recurring schedule:', err);
    }
  };

  const categories: CategoryType[] = ['Salary', 'Bills', 'Food', 'Shopping', 'Travel', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Investment', 'Other'];
  const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
  const paymentMethods: PaymentMethod[] = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Crypto'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Recurring Transaction Schedule"
      subtitle="Automate salary deposits, house rent, insurance EMIs, or SaaS subscriptions"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              type === 'expense' ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'text-slate-400'
            }`}
          >
            Recurring Outflow (-)
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              type === 'income' ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40' : 'text-slate-400'
            }`}
          >
            Recurring Inflow (+)
          </button>
        </div>

        <Input
          label="Schedule Title"
          required
          placeholder="e.g. Monthly Salary Payout, Apartment Rent, Car Loan EMI"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={`Amount (${user.currency})`}
            type="number"
            required
            placeholder="e.g. 35000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Repeat Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-500 outline-none"
            >
              {frequencies.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First Due Date"
            type="date"
            required
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-500 outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
