import React, { useState } from 'react';
import { ShieldAlert, Plus, Calendar, Trash2, CheckCircle2, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

export const LoansPage: React.FC = () => {
  const { loans, totalDebtSummary, addLoan, deleteLoan } = useFinance();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [totalLoanAmount, setTotalLoanAmount] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [interestRatePct, setInterestRatePct] = useState('8.5');
  const [lender, setLender] = useState('');
  const [type, setType] = useState<'Personal Loan' | 'Home Loan' | 'Vehicle Loan' | 'Education Loan' | 'Credit Card EMI'>('Home Loan');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(totalLoanAmount);
    const out = parseFloat(outstandingBalance) || tot;
    const emi = parseFloat(emiAmount);
    if (!name || isNaN(tot) || isNaN(emi)) return;

    await addLoan({
      name,
      type,
      totalLoanAmount: tot,
      outstandingBalance: out,
      interestRatePct: parseFloat(interestRatePct) || 8.5,
      emiAmount: emi,
      remainingMonths: Math.ceil(out / emi) || 12,
      nextDueDate: '2026-08-05',
      lender: lender || 'Bank',
    });

    setName('');
    setTotalLoanAmount('');
    setOutstandingBalance('');
    setEmiAmount('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span className="text-xs uppercase font-extrabold text-red-300 tracking-wider">Liability Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Loan & EMI Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track Personal, Home, Vehicle loans, interest rates, monthly EMIs, and debt payoff progress.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(!isAddOpen)}>
          Add Loan Account
        </Button>
      </div>

      {/* Add Form */}
      {isAddOpen && (
        <Card className="p-5 space-y-4 border border-brand-500/40">
          <h3 className="text-sm font-bold text-white">Add Loan / EMI Account</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Loan Title (e.g. HDFC Home Loan)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="Home Loan">Home Loan</option>
              <option value="Vehicle Loan">Vehicle Loan</option>
              <option value="Personal Loan">Personal Loan</option>
              <option value="Education Loan">Education Loan</option>
              <option value="Credit Card EMI">Credit Card EMI</option>
            </select>
            <input
              type="number"
              placeholder={`Total Loan (${user.currency})`}
              value={totalLoanAmount}
              onChange={(e) => setTotalLoanAmount(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
            <input
              type="number"
              placeholder={`EMI (${user.currency}/mo)`}
              value={emiAmount}
              onChange={(e) => setEmiAmount(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
            <Button type="submit" variant="primary">Save Loan</Button>
          </form>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card glow="danger">
          <span className="text-xs uppercase font-bold text-slate-400">Total Outstanding Debt</span>
          <h2 className="text-3xl font-extrabold text-red-400 mt-1">{user.currency}{totalDebtSummary.totalOutstanding.toLocaleString()}</h2>
          <span className="text-xs font-bold text-slate-400 mt-1 block">Active Liabilities across {loans.length} Accounts</span>
        </Card>

        <Card glow="indigo">
          <span className="text-xs uppercase font-bold text-slate-400">Monthly EMI Outflow</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">{user.currency}{totalDebtSummary.totalMonthlyEmi.toLocaleString()} / mo</h2>
          <span className="text-xs font-bold text-brand-400 mt-1 block">Scheduled Automated Outflow</span>
        </Card>
      </div>

      {/* Loan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.map((loan) => {
          const paidAmount = Math.max(0, loan.totalLoanAmount - loan.outstandingBalance);
          const paidPct = Math.min(100, Math.round((paidAmount / loan.totalLoanAmount) * 100));

          return (
            <Card key={loan.id} glow="indigo" className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">{loan.name}</h3>
                  <span className="text-xs text-slate-400">{loan.type} • {loan.lender} ({loan.interestRatePct}% p.a.)</span>
                </div>
                <button onClick={() => deleteLoan(loan.id)} className="p-1 text-slate-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Outstanding Balance</span><strong className="text-red-400">{user.currency}{loan.outstandingBalance.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Monthly EMI</span><strong className="text-white">{user.currency}{loan.emiAmount.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Next EMI Due Date</span><strong className="text-brand-400">{loan.nextDueDate}</strong></div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Repayment Progress ({paidPct}%)</span>
                  <span className="text-emerald-400">{user.currency}{paidAmount.toLocaleString()} Paid</span>
                </div>
                <ProgressBar value={paidPct} color="bg-emerald-500" height="h-2" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
