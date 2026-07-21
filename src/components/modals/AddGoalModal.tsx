import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Goal, CategoryType } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
  onSuccessToast?: (msg: string) => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
  onSuccessToast,
}) => {
  const { addGoal, updateGoal } = useFinance();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [color, setColor] = useState('#4F46E5');
  const [categoryIcon, setCategoryIcon] = useState('Target');
  const [category, setCategory] = useState<CategoryType>('Shopping');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentAmount(goalToEdit.currentAmount.toString());
      setTargetDate(goalToEdit.targetDate);
      setColor(goalToEdit.color);
      setCategoryIcon(goalToEdit.categoryIcon);
      setCategory(goalToEdit.category || 'Shopping');
      setNotes(goalToEdit.notes || '');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('2026-12-31');
      setColor('#4F46E5');
      setCategoryIcon('Target');
      setCategory('Shopping');
      setNotes('');
    }
    setError(null);
  }, [goalToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Goal name cannot be empty.');
      return;
    }

    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      setError('Please enter a valid positive target amount.');
      return;
    }

    const currentNum = parseFloat(currentAmount) || 0;
    if (currentNum < 0) {
      setError('Saved amount cannot be negative.');
      return;
    }

    if (new Date(targetDate) < new Date(new Date().setHours(0,0,0,0))) {
      setError('Completion deadline cannot be in the past.');
      return;
    }

    try {
      if (goalToEdit) {
        await updateGoal(goalToEdit.id, {
          title,
          targetAmount: targetNum,
          currentAmount: currentNum,
          targetDate,
          color,
          categoryIcon,
          category,
          notes,
        });
        if (onSuccessToast) onSuccessToast(`Goal "${title}" updated successfully.`);
      } else {
        await addGoal({
          title,
          targetAmount: targetNum,
          currentAmount: currentNum,
          targetDate,
          color,
          categoryIcon,
          category,
          notes,
          completed: currentNum >= targetNum,
        });
        if (onSuccessToast) onSuccessToast(`Savings Goal "${title}" created successfully.`);
      }
    } catch (err) {
      console.warn('Error saving goal:', err);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      subtitle="Track your progress with animated circular indicators and target milestones"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Goal Name"
          required
          placeholder="e.g. MacBook Pro, Trip to Japan, Bike, House"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={`Target Amount (${user.currency})`}
            type="number"
            required
            placeholder="e.g. 150000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
          />

          <Input
            label={`Initial Saved Amount (${user.currency})`}
            type="number"
            placeholder="e.g. 25000"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Target Completion Deadline"
            type="date"
            required
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-500 outline-none"
            >
              {['Shopping', 'Travel', 'Bills', 'Transport', 'Food', 'Healthcare', 'Education', 'Investment', 'Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Notes / Description (Optional)"
          placeholder="e.g. Saving for M3 Max upgrade before October launch"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
            Accent Color
          </label>
          <div className="flex gap-3">
            {['#4F46E5', '#EC4899', '#22C55E', '#F59E0B', '#06B6D4', '#8B5CF6'].map((c) => (
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
            {goalToEdit ? 'Save Goal Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
