import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Trash2, Edit2, Download, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { importService, ParsedImportItem } from '../../services/importService';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { CategoryType, PaymentMethod } from '../../types';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose }) => {
  const { transactions } = useFinance();
  const { firebaseUser } = useAuth();

  const [parsedItems, setParsedItems] = useState<ParsedImportItem[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rawParsed = importService.parseCSVText(text);
      const withDuplicates = importService.flagDuplicates(transactions, rawParsed);
      setParsedItems(withDuplicates);
    };
    reader.readAsText(file);
  };

  const handleDemoSampleCSV = () => {
    setFileName('Sample_Bank_Statement.csv');
    const demoCSV = `Date,Description,Amount,Type,PaymentMethod,Notes
2026-07-21,Amazon Retail India,3490,expense,Credit Card,Electronics haul
2026-07-20,Swiggy Gourmet Delivery,740,expense,UPI,Dinner with friends
2026-07-19,Acme Design Agency Payout,35000,income,Net Banking,Freelance Q2 UI milestone
2026-07-18,Uber Ride Premier,650,expense,UPI,Cab to airport
2026-07-17,Starbucks Artisan Espresso,450,expense,UPI,Team coffee break`;

    const rawParsed = importService.parseCSVText(demoCSV);
    const withDuplicates = importService.flagDuplicates(transactions, rawParsed);
    setParsedItems(withDuplicates);
  };

  const updateItemField = (tempId: string, field: keyof ParsedImportItem, value: any) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (tempId: string) => {
    setParsedItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const handleExecuteImport = async () => {
    if (!firebaseUser?.uid || parsedItems.length === 0) return;
    setIsProcessing(true);

    await importService.executeImportBatch(firebaseUser.uid, parsedItems, 'CSV', fileName || 'statement.csv');

    setIsProcessing(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setParsedItems([]);
      setFileName(null);
      onClose();
    }, 1500);
  };

  const categories: CategoryType[] = ['Food', 'Shopping', 'Travel', 'Transport', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Investment', 'Salary', 'Freelance', 'Other'];
  const paymentMethods: PaymentMethod[] = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Crypto'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CSV / Excel Bank Statement Auto-Import"
      subtitle="Parse, preview, edit categories, and resolve duplicates before committing to Firestore"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Dropzone or Sample trigger */}
        {parsedItems.length === 0 ? (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-700 hover:border-brand-500 bg-slate-950/60 transition-all cursor-pointer text-center group">
              <FileSpreadsheet className="w-10 h-10 text-brand-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-sm font-bold text-white">Click or drop CSV / Excel file here</span>
              <span className="text-xs text-slate-400 mt-1">Supports HDFC, ICICI, SBI, Axis, Zerodha, and custom CSV layouts</span>
              <input type="file" accept=".csv,.xlsx,.txt" className="hidden" onChange={handleFileUpload} />
            </label>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Don't have a CSV file ready?</span>
              <button
                type="button"
                onClick={handleDemoSampleCSV}
                className="text-brand-400 font-bold hover:text-brand-300 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Load Sample CSV Template
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-brand-400" />
                <span className="font-bold text-white">{fileName}</span>
                <span className="text-slate-400">({parsedItems.length} transactions detected)</span>
              </div>
              <button
                onClick={() => {
                  setParsedItems([]);
                  setFileName(null);
                }}
                className="text-slate-400 hover:text-white underline cursor-pointer"
              >
                Change File
              </button>
            </div>

            {/* Editable Preview Table */}
            <div className="max-h-72 overflow-y-auto overflow-x-auto no-scrollbar border border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 sticky top-0 uppercase font-semibold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Duplicate Action</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                  {parsedItems.map((item) => (
                    <tr key={item.tempId} className="hover:bg-slate-900/90 transition-colors">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItemField(item.tempId, 'title', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <select
                          value={item.category}
                          onChange={(e) => updateItemField(item.tempId, 'category', e.target.value as CategoryType)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-3">
                        <select
                          value={item.paymentMethod}
                          onChange={(e) => updateItemField(item.tempId, 'paymentMethod', e.target.value as PaymentMethod)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        >
                          {paymentMethods.map((pm) => (
                            <option key={pm} value={pm}>{pm}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-3 font-bold text-white">
                        ₹{item.amount.toLocaleString()}
                      </td>

                      <td className="py-2 px-3">
                        {item.isDuplicate ? (
                          <select
                            value={item.duplicateResolution}
                            onChange={(e) => updateItemField(item.tempId, 'duplicateResolution', e.target.value)}
                            className="bg-red-950/40 text-red-300 border border-red-500/40 rounded px-2 py-1 text-xs font-bold"
                          >
                            <option value="Skip">Skip (Duplicate)</option>
                            <option value="Replace">Replace Existing</option>
                            <option value="Keep">Keep Both</option>
                          </select>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            New
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => removeItem(item.tempId)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Ready to commit {parsedItems.filter((i) => !i.isDuplicate || i.duplicateResolution !== 'Skip').length} transactions to Firestore.
              </span>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button
                  variant="primary"
                  icon={isSuccess ? Check : Upload}
                  isLoading={isProcessing}
                  onClick={handleExecuteImport}
                >
                  {isSuccess ? 'Imported!' : 'Import Selected Rows'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
