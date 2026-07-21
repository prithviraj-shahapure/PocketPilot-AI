import React, { useState } from 'react';
import { Upload, Camera, FileText, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ocrService } from '../../services/ocrService';
import { ReceiptOCRResult, CategoryType, PaymentMethod } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({ isOpen, onClose, onSuccessToast }) => {
  const { addTransaction } = useFinance();
  const { user } = useAuth();

  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<ReceiptOCRResult | null>(null);
  const [merchantName, setMerchantName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Shopping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const res = await ocrService.scanReceipt(file);
      setOcrResult(res);
      setMerchantName(res.merchantName);
      setTotalAmount(res.totalAmount.toString());
      setCategory(res.category);
      setPaymentMethod(res.paymentMethod);
      setDate(res.date);
    } catch (err) {
      console.warn('OCR scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleSaveTransaction = async () => {
    const amt = parseFloat(totalAmount);
    if (isNaN(amt) || amt <= 0) return;

    try {
      await addTransaction({
        title: merchantName || 'Receipt Expense',
        amount: amt,
        type: 'expense',
        category,
        merchant: merchantName || 'Merchant',
        paymentMethod,
        date,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: ocrResult ? `OCR Extracted (${ocrResult.confidenceScore}% Confidence)` : 'Scanned Receipt',
        status: 'Completed',
      });

      if (onSuccessToast) onSuccessToast(`Receipt transaction for ${merchantName} created 🎉`);
      setOcrResult(null);
      onClose();
    } catch (err) {
      console.warn('Error saving receipt transaction:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OCR Smart Receipt Scanner"
      subtitle="Upload or capture receipts to automatically extract merchant, tax, and total amount"
    >
      <div className="space-y-4">
        {!ocrResult ? (
          <div className="p-8 border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-3xl text-center space-y-4 bg-slate-950/60 transition-colors">
            <div className="w-16 h-16 rounded-3xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto">
              {scanning ? <Sparkles className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
            </div>

            {scanning ? (
              <div>
                <h4 className="text-sm font-bold text-white">Extracting Receipt Fields with OCR...</h4>
                <p className="text-xs text-slate-400 mt-1">Detecting merchant, GST tax, and total outflow</p>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-bold text-white">Upload Receipt Image or PDF Invoice</h4>
                <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WEBP, and PDF documents</p>
                <label className="inline-block mt-4">
                  <span className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold cursor-pointer transition-all">
                    Choose File
                  </span>
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> OCR Extracted Successfully
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                {ocrResult.confidenceScore}% Confidence
              </span>
            </div>

            <Input
              label="Merchant Name"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={`Total Amount (${user.currency})`}
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />

              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {ocrResult.items.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-400 font-bold block mb-1">Detected Receipt Line Items</span>
                {ocrResult.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span>{it.name}</span>
                    <strong className="text-white">{user.currency}{it.price}</strong>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setOcrResult(null)}>
                Rescan
              </Button>
              <Button variant="primary" onClick={handleSaveTransaction}>
                Save Transaction
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
