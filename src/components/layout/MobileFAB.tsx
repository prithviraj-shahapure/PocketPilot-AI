import React from 'react';
import { Plus } from 'lucide-react';

interface MobileFABProps {
  onOpen: () => void;
}

export const MobileFAB: React.FC<MobileFABProps> = ({ onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="fixed right-5 bottom-20 z-40 lg:hidden w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-500 text-white shadow-xl shadow-brand-600/40 flex items-center justify-center border border-white/20 active:scale-95 transition-all cursor-pointer"
      aria-label="Add Expense"
    >
      <Plus className="w-7 h-7" />
    </button>
  );
};
