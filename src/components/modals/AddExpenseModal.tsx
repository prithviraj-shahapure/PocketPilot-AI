import React, { useState } from 'react';
import { 
  Utensils, 
  ShoppingBag, 
  Plane, 
  Car, 
  Film, 
  Receipt, 
  HeartPulse, 
  GraduationCap, 
  TrendingUp, 
  Briefcase, 
  Building2, 
  DollarSign, 
  HelpCircle,
  Upload,
  Calendar,
  CreditCard,
  Tag,
  Check
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CategoryType, PaymentMethod, TransactionType } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const categoryIcons: Record<CategoryType, { icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  Food: { icon: Utensils, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' },
  Shopping: { icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-500/20 border-pink-500/40' },
  Travel: { icon: Plane, color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/40' },
  Transport: { icon: Car, color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40' },
  Entertainment: { icon: Film, color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/40' },
  Bills: { icon: Receipt, color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40' },
  Healthcare: { icon: HeartPulse, color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' },
  Education: { icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-500/20 border-indigo-500/40' },
  Investment: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
  Salary: { icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/40' },
  Business: { icon: Building2, color: 'text-teal-400', bg: 'bg-teal-500/20 border-teal-500/40' },
  Freelance: { icon: Briefcase, color: 'text-sky-400', bg: 'bg-sky-500/20 border-sky-500/40' },
  Other: { icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-500/20 border-slate-500/40' },
};

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinance();
  const { user } = useAuth();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Food');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receiptName, setReceiptName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      addTransaction({
        title: title || merchant || category,
        amount: parseFloat(amount),
        type,
        category,
        merchant: merchant || title || category,
        paymentMethod,
        date,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes,
        receiptUrl: receiptName ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c' : undefined,
        status: 'Completed',
      });
    } catch (err) {
      console.warn('Error adding transaction:', err);
    }

    // Reset and close
    setAmount('');
    setTitle('');
    setMerchant('');
    setNotes('');
    setReceiptName(null);
    onClose();
  };

  const categories: CategoryType[] = [
    'Food', 'Shopping', 'Travel', 'Transport', 'Entertainment', 'Bills', 
    'Healthcare', 'Education', 'Investment', 'Salary', 'Business', 'Freelance', 'Other'
  ];

  const paymentMethods: PaymentMethod[] = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Crypto'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'expense' ? 'Record New Expense' : 'Record Income'}
      subtitle="Track your cash flow with precision and AI auto-tagging"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Toggle Income vs Expense */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-red-600/30 text-red-400 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Amount Input */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
            Amount ({user.currency})
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-2xl font-bold text-brand-400">{user.currency}</span>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-2xl font-extrabold text-white placeholder-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
            />
          </div>
        </div>

        {/* Title & Merchant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Transaction Description"
            placeholder="e.g. Starbucks Espresso, Uber Premier"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Merchant / Payee"
            placeholder="e.g. Starbucks, Amazon, Zerodha"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>

        {/* Category Picker with Colorful Badges */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
            Select Category
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto no-scrollbar p-1">
            {categories.map((cat) => {
              const info = categoryIcons[cat];
              const IconComp = info.icon;
              const isSelected = category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? `${info.bg} text-white ring-1 ring-white/30 scale-105`
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${info.color}`} />
                  <span className="truncate">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Payment Method
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none transition-all appearance-none"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm} value={pm} className="bg-slate-900 text-white">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Receipt Upload Dropzone */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
            Receipt / Invoice (Optional)
          </label>
          <label className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-brand-500/50 bg-slate-950/40 transition-colors cursor-pointer text-center">
            <Upload className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-xs font-medium text-slate-300">
              {receiptName ? `Selected: ${receiptName}` : 'Click or drop bill receipt image here'}
            </span>
            <span className="text-[10px] text-slate-500">Supports PNG, JPG, PDF up to 5MB</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setReceiptName(e.target.files[0].name);
                }
              }}
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={type === 'expense' ? 'primary' : 'secondary'} icon={Check}>
            Save {type === 'expense' ? 'Expense' : 'Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
