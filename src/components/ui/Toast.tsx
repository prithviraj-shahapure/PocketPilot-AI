import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-400 flex-shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-300',
    error: 'border-red-500/40 bg-slate-900/95 text-red-300',
    info: 'border-brand-500/40 bg-slate-900/95 text-brand-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className={`glass-panel border p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 pointer-events-auto ${borderStyles[toast.type]}`}
    >
      <div className="flex items-center gap-3">
        {icons[toast.type]}
        <span className="text-xs font-semibold leading-snug text-white">{toast.message}</span>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
