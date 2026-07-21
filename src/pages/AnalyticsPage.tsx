import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart as RechartsPie, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, ArrowUpRight, Award, ShieldCheck, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

export const AnalyticsPage: React.FC = () => {
  const { transactions, monthlyIncome, monthlyExpense, totalSavings, totalBalance } = useFinance();
  const { user } = useAuth();

  // Compute Income vs Expense from live Firestore transactions
  const incomeVsExpenseData = useMemo(() => {
    if (transactions.length === 0) {
      return [{ month: 'Current Month', income: monthlyIncome, expense: monthlyExpense }];
    }
    const map: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const monthStr = t.date ? t.date.slice(0, 7) : 'Current';
      if (!map[monthStr]) map[monthStr] = { income: 0, expense: 0 };
      if (t.type === 'income') map[monthStr].income += t.amount;
      else if (t.type === 'expense') map[monthStr].expense += t.amount;
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, val]) => ({ month, ...val }));
  }, [transactions, monthlyIncome, monthlyExpense]);

  // Compute Category Distribution from live Firestore transactions
  const categoryDistribution = useMemo(() => {
    const categoryColors: Record<string, string> = {
      Food: '#4F46E5',
      Shopping: '#EF4444',
      Transport: '#3B82F6',
      Entertainment: '#8B5CF6',
      Bills: '#F59E0B',
      Travel: '#10B981',
      Healthcare: '#EC4899',
      Education: '#06B6D4',
      Investment: '#8B5CF6',
      Other: '#64748B',
    };

    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length === 0) {
      return [{ name: 'No Expenses Logged', value: 1, color: '#334155' }];
    }

    const map: Record<string, number> = {};
    expenses.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#6366F1',
    }));
  }, [transactions]);

  // Compute Savings Growth Trend from live Firestore transactions
  const savingsTrendData = useMemo(() => {
    return incomeVsExpenseData.map((d) => ({
      month: d.month,
      savings: Math.max(0, d.income - d.expense),
    }));
  }, [incomeVsExpenseData]);

  // Compute Net Worth Growth Trajectory
  const netWorthData = useMemo(() => {
    let cumulative = 0;
    return incomeVsExpenseData.map((d) => {
      cumulative += (d.income - d.expense);
      return {
        month: d.month,
        netWorth: cumulative,
      };
    });
  }, [incomeVsExpenseData]);

  // Compute Top Spending Categories list
  const topCategories = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    if (totalExp === 0) return [];

    const map: Record<string, number> = {};
    expenses.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    const categoryColors: Record<string, string> = {
      Food: 'bg-brand-500',
      Shopping: 'bg-red-500',
      Transport: 'bg-blue-500',
      Entertainment: 'bg-purple-500',
      Bills: 'bg-amber-500',
      Travel: 'bg-emerald-500',
    };

    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: `${Math.round((amount / totalExp) * 100)}%`,
        color: categoryColors[name] || 'bg-brand-500',
      }));
  }, [transactions]);

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-brand-400" />
          <span className="text-xs uppercase font-extrabold text-brand-300 tracking-wider">Financial Analytics Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Advanced Cash Flow & Trends</h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep-dive statistical visualisations computed strictly from real-time Firestore ledger documents.
        </p>
      </div>

      {/* Row 1: Income vs Expense Bar & Net Worth Growth Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Income vs Expense Timeline</h3>
              <p className="text-xs text-slate-400">Comparing total inflows against total outflows from Firestore</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
                />
                <Bar dataKey="income" fill="#22C55E" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Net Worth Growth Line Chart */}
        <Card className="flex flex-col justify-between" glow="indigo">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" /> Net Worth Accumulation Trajectory
              </h3>
              <p className="text-xs text-slate-400 font-normal">Cumulative surplus asset growth over time</p>
            </div>
            <span className="text-sm font-extrabold text-brand-400">{user.currency}{totalBalance.toLocaleString()}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={netWorthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="netWorth" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Category Pie & Top Outflow Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Expense Category Weights</h3>
              <p className="text-xs text-slate-400">Share of total outflow per category</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Spending Categories Ranking List */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Top Outflow Breakdown</h3>
              <p className="text-xs text-slate-400">Highest spending categories this period</p>
            </div>
          </div>

          {topCategories.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No expense categories logged yet.
            </div>
          ) : (
            <div className="space-y-4">
              {topCategories.map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white">{c.name}</span>
                    <span className="text-slate-400">{user.currency}{c.amount.toLocaleString()} ({c.pct})</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className={`h-full ${c.color}`} style={{ width: c.pct }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
