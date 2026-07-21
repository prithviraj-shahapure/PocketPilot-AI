import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CategoryType, BillItem } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const AddBillModal: React.FC<AddBillModalProps> = ({ isOpen, onClose, onSuccessToast }) => {
  const { addBill } = useFinance();
  const { user } = useAuth();

  const [billName, setBillName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-08-01');
  const [category, setCategory] = useState<CategoryType>('Bills');
  const [autoPay, setAutoPay] = useState(false);
  const [reminderDays, setReminderDays] = useState('3');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!billName.trim()) {
      setError('Bill name is required.');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid positive bill amount.');
      return;
    }

    try {
      await addBill({
        billName,
        amount: amt,
        dueDate,
        category,
        autoPay,
        reminderDays: parseInt(reminderDays) || 3,
        status: 'Upcoming',
      });

      if (onSuccessToast) onSuccessToast(`Bill "${billName}" added to Manager.`);
      setBillName('');
      setAmount('');
      onClose();
    } catch (err) {
      console.warn('Error adding bill:', err);
    }
  };

  const categories: CategoryType[] = ['Bills', 'Food', 'Shopping', 'Travel', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Other'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Bill to Bills Manager"
      subtitle="Configure due dates, auto-pay toggles, and proactive reminder alerts"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Bill Name"
          required
          placeholder="e.g. BESCOM Electricity Bill, Airtel Broadband, Gym Membership"
          value={billName}
          onChange={(e) => setBillName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={`Amount (${user.currency})`}
            type="number"
            required
            placeholder="e.g. 2499"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            label="Due Date"
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Reminder Advance (Days)
            </label>
            <input
              type="number"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <input
            type="checkbox"
            id="autopay"
            checked={autoPay}
            onChange={(e) => setAutoPay(e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
          />
          <label htmlFor="autopay" className="text-xs text-white cursor-pointer select-none">
            Enable Auto-Pay Auto Settlement
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Bill
          </Button>
        </div>
      </form>
    </Modal>
  );
};
