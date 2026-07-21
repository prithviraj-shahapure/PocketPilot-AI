import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { monthlyIncome, monthlyExpense, totalSavings, financialHealthScore, transactions } = useFinance();
  const { user } = useAuth();
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const triggerDownload = (format: string) => {
    setDownloadMsg(`PocketPilot_Financial_Report_July_2026.${format.toLowerCase()} generated successfully.`);
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-brand-400" />
            <span className="text-xs uppercase font-extrabold text-brand-300 tracking-wider">Statement Generator</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Reports & Exports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal tax-ready statements, monthly report cards, and raw data dumps.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="glass" size="sm" icon={Download} onClick={() => triggerDownload('PDF')}>
            Export PDF
          </Button>
          <Button variant="glass" size="sm" icon={Download} onClick={() => triggerDownload('CSV')}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" icon={FileSpreadsheet} onClick={() => triggerDownload('XLSX')}>
            Export Excel
          </Button>
        </div>
      </div>

      {downloadMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" /> {downloadMsg}
        </div>
      )}

      {/* Monthly Report Card */}
      <Card glow="indigo" className="p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400">Monthly Performance Card</span>
            <h2 className="text-xl font-extrabold text-white">July 2026 Audit Report</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            Score: {financialHealthScore}/100 Grade A+
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Total Inflow</span>
            <h4 className="text-xl font-extrabold text-emerald-400 mt-1">{user.currency}{monthlyIncome.toLocaleString()}</h4>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Total Outflow</span>
            <h4 className="text-xl font-extrabold text-white mt-1">{user.currency}{monthlyExpense.toLocaleString()}</h4>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Net Retained Surplus</span>
            <h4 className="text-xl font-extrabold text-brand-400 mt-1">{user.currency}{totalSavings.toLocaleString()}</h4>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-bold text-white">Audit Key Findings</h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Maintained 28.4% monthly savings rate (Goal: 20%).
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Zero overdue utility or credit bills.
            </li>
            <li className="flex items-center gap-2 text-amber-400">
              ⚠ Shopping exceeded budget allocation by 21%.
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
