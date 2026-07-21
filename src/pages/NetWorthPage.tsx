import React, { useState } from 'react';
import { Landmark, TrendingUp, ShieldAlert, Plus, DollarSign, Wallet, Building, PieChart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

export const NetWorthPage: React.FC = () => {
  const { netWorthAssets, totalNetWorth, totalAssets, totalLiabilities, addNetWorthAsset } = useFinance();
  const { user } = useAuth();

  const [assetName, setAssetName] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [assetType, setAssetType] = useState<'Asset' | 'Liability'>('Asset');
  const [assetCategory, setAssetCategory] = useState<'Cash' | 'Bank' | 'Investments' | 'Gold' | 'Property' | 'Loans' | 'Credit Cards' | 'Other'>('Bank');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(assetValue);
    if (!assetName || isNaN(val) || val <= 0) return;

    await addNetWorthAsset({
      name: assetName,
      type: assetType,
      category: assetCategory,
      value: val,
    });

    setAssetName('');
    setAssetValue('');
    setIsAddOpen(false);
  };

  const chartData = [
    { month: 'Jan', netWorth: Math.round(totalNetWorth * 0.82) },
    { month: 'Feb', netWorth: Math.round(totalNetWorth * 0.86) },
    { month: 'Mar', netWorth: Math.round(totalNetWorth * 0.89) },
    { month: 'Apr', netWorth: Math.round(totalNetWorth * 0.93) },
    { month: 'May', netWorth: Math.round(totalNetWorth * 0.97) },
    { month: 'Current', netWorth: totalNetWorth },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-5 h-5 text-brand-400" />
            <span className="text-xs uppercase font-extrabold text-brand-300 tracking-wider">Total Wealth Cockpit</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Net Worth Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Consolidated valuation of cash, bank balances, investments, real estate minus outstanding liabilities.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(!isAddOpen)}>
          Add Asset / Loan
        </Button>
      </div>

      {/* Inline Form */}
      {isAddOpen && (
        <Card className="p-5 space-y-4 border border-brand-500/40">
          <h3 className="text-sm font-bold text-white">Add Asset or Liability Entry</h3>
          <form onSubmit={handleAddAsset} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Asset or Loan Name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
            <input
              type="number"
              placeholder={`Value (${user.currency})`}
              value={assetValue}
              onChange={(e) => setAssetValue(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="Asset">Asset (+)</option>
              <option value="Liability">Liability (-)</option>
            </select>
            <Button type="submit" variant="primary">
              Save Entry
            </Button>
          </form>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glow="indigo" className="flex flex-col justify-between">
          <span className="text-xs uppercase font-extrabold text-slate-400">Total Net Worth</span>
          <h2 className="text-3xl font-black text-brand-400 mt-2">{user.currency}{totalNetWorth.toLocaleString()}</h2>
          <span className="text-[10px] text-emerald-400 font-bold mt-1">▲ +8.4% Year-to-Date Growth</span>
        </Card>

        <Card glow="emerald" className="flex flex-col justify-between">
          <span className="text-xs uppercase font-extrabold text-slate-400">Total Gross Assets</span>
          <h2 className="text-3xl font-black text-emerald-400 mt-2">{user.currency}{totalAssets.toLocaleString()}</h2>
          <span className="text-[10px] text-slate-400 mt-1">Liquid Cash, Accounts & Investments</span>
        </Card>

        <Card glow="danger" className="flex flex-col justify-between">
          <span className="text-xs uppercase font-extrabold text-slate-400">Total Liabilities</span>
          <h2 className="text-3xl font-black text-red-400 mt-2">{user.currency}{totalLiabilities.toLocaleString()}</h2>
          <span className="text-[10px] text-slate-400 mt-1">Mortgages, Vehicle Loans & EMIs</span>
        </Card>
      </div>

      {/* Recharts Timeline */}
      <Card glow="indigo">
        <h3 className="text-base font-bold text-white mb-4">Historical Net Worth Accumulation</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="netWorth" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Asset List Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Asset & Liability Ledger ({netWorthAssets.length} entries)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {netWorthAssets.map((a) => (
            <Card key={a.id} className="flex justify-between items-center p-4">
              <div>
                <h4 className="text-sm font-bold text-white">{a.name}</h4>
                <span className="text-[10px] text-slate-400">{a.category} • {a.type}</span>
              </div>
              <span className={`text-base font-extrabold ${a.type === 'Asset' ? 'text-emerald-400' : 'text-red-400'}`}>
                {a.type === 'Asset' ? '+' : '-'}{user.currency}{a.value.toLocaleString()}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
