import React, { useState } from 'react';
import { TrendingUp, Plus, PieChart as PieIcon, Trash2, ArrowUpRight, DollarSign } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

export const InvestmentsPage: React.FC = () => {
  const { investments, portfolioSummary, addInvestment, deleteInvestment } = useFinance();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [type, setType] = useState<'Stocks' | 'Mutual Funds' | 'SIP' | 'FD' | 'Crypto' | 'Gold' | 'PPF' | 'EPF' | 'NPS' | 'Bonds'>('Mutual Funds');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = parseFloat(investedAmount);
    const curr = parseFloat(currentValue) || inv;
    if (!name || isNaN(inv) || inv <= 0) return;

    await addInvestment({
      name,
      type,
      investedAmount: inv,
      currentValue: curr,
      purchaseDate: new Date().toISOString().split('T')[0],
      category: type,
      color: '#4F46E5',
    });

    setName('');
    setInvestedAmount('');
    setCurrentValue('');
    setIsAddOpen(false);
  };

  const pieData = investments.map((inv) => ({
    name: inv.name,
    value: inv.currentValue,
  }));

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase font-extrabold text-emerald-300 tracking-wider">Asset Allocation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Investment Portfolio Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track Stocks, Equity Mutual Funds, SIPs, FDs, Gold, Crypto, and Retirement PPF accounts.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(!isAddOpen)}>
          Add Investment
        </Button>
      </div>

      {/* Add Form */}
      {isAddOpen && (
        <Card className="p-5 space-y-4 border border-brand-500/40">
          <h3 className="text-sm font-bold text-white">Add Investment Holding</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Asset Name (e.g. Nifty 50 Index)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="Mutual Funds">Mutual Funds</option>
              <option value="Stocks">Stocks</option>
              <option value="SIP">SIP</option>
              <option value="FD">FD</option>
              <option value="Gold">Gold</option>
              <option value="Crypto">Crypto</option>
              <option value="PPF">PPF</option>
            </select>
            <input
              type="number"
              placeholder={`Invested (${user.currency})`}
              value={investedAmount}
              onChange={(e) => setInvestedAmount(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
            <input
              type="number"
              placeholder={`Current Value (${user.currency})`}
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
            <Button type="submit" variant="primary">Save Holding</Button>
          </form>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glow="emerald">
          <span className="text-xs uppercase font-bold text-slate-400">Total Portfolio Value</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">{user.currency}{portfolioSummary.totalCurrentValue.toLocaleString()}</h2>
          <span className="text-xs font-bold text-emerald-400 mt-1 block">Invested: {user.currency}{portfolioSummary.totalInvested.toLocaleString()}</span>
        </Card>

        <Card glow="indigo">
          <span className="text-xs uppercase font-bold text-slate-400">Unrealized P&L</span>
          <h2 className={`text-3xl font-extrabold mt-1 ${portfolioSummary.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {portfolioSummary.totalProfit >= 0 ? '+' : ''}{user.currency}{portfolioSummary.totalProfit.toLocaleString()}
          </h2>
          <span className="text-xs font-bold text-brand-400 mt-1 block">{portfolioSummary.returnPct}% Total Returns</span>
        </Card>

        <Card glow="indigo" className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Total Holdings</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">{investments.length} Assets</h2>
          </div>
          <PieIcon className="w-10 h-10 text-brand-400" />
        </Card>
      </div>

      {/* Holdings List & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white">Active Investment Holdings</h3>
          {investments.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center">No investments added to portfolio yet.</p>
          ) : (
            <div className="space-y-3">
              {investments.map((inv) => {
                const profit = inv.currentValue - inv.investedAmount;
                const ret = inv.investedAmount > 0 ? (profit / inv.investedAmount) * 100 : 0;

                return (
                  <div key={inv.id} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{inv.name}</h4>
                      <span className="text-[10px] text-slate-400">{inv.type} • Invested: {user.currency}{inv.investedAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <strong className="text-white text-sm block">{user.currency}{inv.currentValue.toLocaleString()}</strong>
                        <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {profit >= 0 ? '+' : ''}{user.currency}{profit.toLocaleString()} ({Math.round(ret)}%)
                        </span>
                      </div>
                      <button onClick={() => deleteInvestment(inv.id)} className="p-1 text-slate-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Allocation Pie Chart */}
        <Card className="flex flex-col justify-between">
          <h3 className="text-base font-bold text-white mb-2">Portfolio Allocation</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
