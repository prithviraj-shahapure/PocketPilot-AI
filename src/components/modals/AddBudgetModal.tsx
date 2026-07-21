import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CategoryType, Budget } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
  onSuccessToast?: (msg: string) => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  budgetToEdit,
  onSuccessToast,
}) => {
  const { addBudget, updateBudget, budgets } = useFinance();
  const { user } = useAuth();

  const [category, setCategory] = useState<CategoryType>('Food');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [error, setError] = useState<string | null>(null);

  const availableCategories: CategoryType[] = [
    'Food', 'Shopping', 'Travel', 'Transport', 'Entertainment', 'Bills', 
    'Healthcare', 'Education', 'Investment', 'Other'
  ];

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setAllocatedAmount(budgetToEdit.allocatedAmount.toString());
      setColor(budgetToEdit.color);
    } else {
      setCategory('Food');
      setAllocatedAmount('');
      setColor('#4F46E5');
    }
    setError(null);
  }, [budgetToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const limitNum = parseFloat(allocatedAmount);
    if (isNaN(limitNum) || limitNum <= 0) {
      setError('Please enter a valid positive monthly limit.');
      return;
    }

    if (!budgetToEdit && budgets.some((b) => b.category === category)) {
      setError(`A budget limit for category "${category}" already exists.`);
      return;
    }

    try {
      if (budgetToEdit) {
        await updateBudget(budgetToEdit.id, limitNum);
        if (onSuccessToast) onSuccessToast(`Budget for ${category} updated to ${user.currency}${limitNum.toLocaleString()}.`);
      } else {
        await addBudget({
          category,
          allocatedAmount: limitNum,
          color,
        });
        if (onSuccessToast) onSuccessToast(`Budget limit for ${category} set successfully.`);
      }
    } catch (err) {
      console.warn('Error saving budget:', err);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Edit Monthly Budget Limit' : 'Create Monthly Budget Limit'}
      subtitle="Set spending guardrails to automatically trigger AI overspending warnings"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
            Category
          </label>
          <select
            value={category}
            disabled={!!budgetToEdit}
            onChange={(e) => setCategory(e.target.value as CategoryType)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none disabled:opacity-60"
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Input
          label={`Monthly Target Limit (${user.currency})`}
          type="number"
          required
          placeholder="e.g. 25000"
          value={allocatedAmount}
          onChange={(e) => setAllocatedAmount(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
            Badge Accent Color
          </label>
          <div className="flex gap-3">
            {['#4F46E5', '#22C55E', '#EF4444', '#EC4899', '#F59E0B', '#3B82F6', '#8B5CF6'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                  color === c ? 'scale-110 border-white ring-2 ring-brand-500' : 'border-transparent opacity-80'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {budgetToEdit ? 'Save Budget Changes' : 'Save Budget Limit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
