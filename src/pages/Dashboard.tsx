import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  PieChart, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Target, 
  ShieldCheck, 
  ChevronRight,
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { categoryIcons } from '../components/modals/AddExpenseModal';
import { AddGoalModal } from '../components/modals/AddGoalModal';
import { AddBudgetModal } from '../components/modals/AddBudgetModal';
import { ToastContainer, ToastMessage } from '../components/ui/Toast';

export const Dashboard: React.FC<{ onOpenAddExpense: () => void }> = ({ onOpenAddExpense }) => {
  const { 
    totalBalance, 
    monthlyIncome, 
    monthlyExpense, 
    totalSavings, 
    budgetLeft, 
    financialHealthScore,
    transactions,
    budgets,
    goals,
    subscriptions,
  } = useFinance();
  const { user } = useAuth();

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = { id: `toast-${Date.now()}`, message, type };
    setToasts((prev) => [...prev, newToast]);
  };

  // Dynamically compute AreaChart cash flow data from Firestore transactions
  const monthlyExpenseData = useMemo(() => {
    if (transactions.length === 0) {
      return [{ day: 'No Data', expense: 0, income: 0 }];
    }
    const map: Record<string, { expense: number; income: number }> = {};
    transactions.forEach((t) => {
      const dateStr = t.date ? t.date.slice(5) : 'Today';
      if (!map[dateStr]) map[dateStr] = { expense: 0, income: 0 };
      if (t.type === 'expense') map[dateStr].expense += t.amount;
      else if (t.type === 'income') map[dateStr].income += t.amount;
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, val]) => ({ day, ...val }));
  }, [transactions]);

  // Dynamically compute PieChart category breakdown from Firestore transactions
  const categoryData = useMemo(() => {
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

  // Dynamically compute Weekly Spending Bar chart from Firestore transactions
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const dayName = days[d.getDay()];
          map[dayName] = (map[dayName] || 0) + t.amount;
        }
      });

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
      day,
      amount: map[day] || 0,
    }));
  }, [transactions]);

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Financial Cockpit
            </span>
            <span className="text-xs text-slate-400">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user.name ? user.name.split(' ')[0] : 'Pilot'} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Here's your real-time cash flow, AI predictive risk assessment, and savings trajectory.
          </p>
        </div>

        {/* Dashboard Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" icon={Minus} onClick={onOpenAddExpense}>
            Add Expense
          </Button>
          <Button variant="secondary" size="sm" icon={Plus} onClick={onOpenAddExpense}>
            Add Income
          </Button>
          <Button variant="glass" size="sm" icon={Target} onClick={() => setIsAddGoalOpen(true)}>
            Add Goal
          </Button>
          <Button variant="glass" size="sm" icon={PieChart} onClick={() => setIsAddBudgetOpen(true)}>
            Add Budget
          </Button>
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Balance */}
        <Card glow="indigo" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Balance</span>
            <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-3">{user.currency}{totalBalance.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" /> Real-time Net Balance
          </div>
        </Card>

        {/* Monthly Income */}
        <Card glow="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Monthly Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-3">{user.currency}{monthlyIncome.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-2">
            Total Inflow
          </div>
        </Card>

        {/* Monthly Expense */}
        <Card glow="danger">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Monthly Expense</span>
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-3">{user.currency}{monthlyExpense.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[11px] font-bold text-red-400 mt-2">
            Total Outflow
          </div>
        </Card>

        {/* Total Savings */}
        <Card glow="indigo">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Savings</span>
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-3">{user.currency}{totalSavings.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400 mt-2">
            {monthlyIncome > 0 ? `${Math.round((totalSavings / monthlyIncome) * 100)}% Savings Rate` : '0% Savings Rate'}
          </div>
        </Card>

        {/* Budget Left */}
        <Card glow="none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Budget Left</span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-3">{user.currency}{budgetLeft.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 mt-2">
            Remaining Cap
          </div>
        </Card>
      </div>

      {/* Main Charts & Financial Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expense Line Chart (2 cols) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Cash Flow & Expense Trajectory</h3>
              <p className="text-xs text-slate-400">Daily spending timeline from Firestore transactions</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-slate-900 border border-slate-800 text-brand-400">
              Real-time Ingestion
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="expense" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Financial Health Score & AI Insight */}
        <Card className="flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Health Index</span>
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>

          <div className="my-2">
            <CircularProgress
              percentage={financialHealthScore}
              size={150}
              strokeWidth={14}
              color={financialHealthScore > 80 ? '#22C55E' : '#4F46E5'}
              label={`${financialHealthScore}`}
              sublabel="Out of 100"
            />
          </div>

          <div className="p-3 rounded-2xl bg-brand-950/40 border border-brand-500/30 w-full text-left mt-2">
            <div className="flex items-center gap-1.5 text-brand-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> AI Cockpit Insight
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {transactions.length === 0 
                ? 'Add your first expense or income entry to initialize automated AI risk modeling.'
                : `Your financial health index is ${financialHealthScore}/100 based on active spending and budget caps.`}
            </p>
          </div>
        </Card>
      </div>

      {/* Category Breakdown & Weekly Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Category Pie Chart */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white">Category Distribution</h3>
            <NavLink to="/analytics" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              View All
            </NavLink>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            {categoryData.slice(0, 3).map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-300 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Spending Bar Chart */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white">Weekly Spend Breakdown</h3>
            <span className="text-xs text-slate-400">Mon - Sun</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Budget Progress & Warning */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white">Budget Guardrails</h3>
            <NavLink to="/budgets" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              Manage
            </NavLink>
          </div>
          <div className="space-y-4 max-h-56 overflow-y-auto no-scrollbar">
            {budgets.length > 0 ? (
              budgets.slice(0, 3).map((b) => {
                const pct = (b.spentAmount / b.allocatedAmount) * 100;
                const isExceeded = pct > 100;
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-white">{b.category}</span>
                      <span className={isExceeded ? 'text-red-400 font-bold' : 'text-slate-400'}>
                        {user.currency}{b.spentAmount.toLocaleString()} / {user.currency}{b.allocatedAmount.toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar value={pct} color={isExceeded ? 'bg-red-500' : b.color} height="h-2" />
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 py-3">No active monthly budgets set.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Recent Transactions & Goal / Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table (2 cols) */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
              <p className="text-xs text-slate-400 font-normal">Latest entries synced from Cloud Firestore</p>
            </div>
            <NavLink to="/transactions">
              <Button variant="ghost" size="sm" icon={ChevronRight}>
                View All
              </Button>
            </NavLink>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No transactions recorded yet. Click "Add Expense" or "Add Income" to begin.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {transactions.slice(0, 5).map((t) => {
                const catInfo = categoryIcons[t.category] || categoryIcons['Other'];
                const IconComp = catInfo.icon;
                return (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-900/40 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${catInfo.bg}`}>
                        <IconComp className={`w-5 h-5 ${catInfo.color}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs">{t.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{t.date}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{t.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-extrabold ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                        {t.type === 'income' ? '+' : '-'}{user.currency}{t.amount.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-400">{t.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Goals Progress & Upcoming Subscriptions */}
        <div className="space-y-6">
          {/* Top Savings Goal Progress */}
          <Card glow="indigo">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Top Goal Trajectory</h3>
              </div>
              <NavLink to="/goals" className="text-xs text-brand-400 font-semibold">Goals</NavLink>
            </div>
            {goals.length > 0 ? (
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-base font-extrabold text-white">{goals[0].title}</span>
                  <span className="text-xs font-bold text-brand-400">
                    {Math.round((goals[0].currentAmount / goals[0].targetAmount) * 100 || 0)}%
                  </span>
                </div>
                <ProgressBar
                  value={(goals[0].currentAmount / goals[0].targetAmount) * 100 || 0}
                  color="gradient-primary"
                  height="h-3"
                />
                <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                  <span>Saved: {user.currency}{goals[0].currentAmount.toLocaleString()}</span>
                  <span>Target: {user.currency}{goals[0].targetAmount.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3">No active savings goals. Create one to track trajectory.</p>
            )}
          </Card>

          {/* Upcoming Bills */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Upcoming Subscriptions</h3>
              </div>
              <NavLink to="/subscriptions" className="text-xs text-brand-400 font-semibold">View All</NavLink>
            </div>
            {subscriptions.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No active recurring subscriptions tracked.</p>
            ) : (
              <div className="space-y-2">
                {subscriptions.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <img src={sub.logo} alt={sub.name} className="w-6 h-6 rounded-md object-contain" />
                      <div>
                        <h5 className="text-xs font-bold text-white">{sub.name}</h5>
                        <span className="text-[10px] text-slate-400">Renews {sub.renewalDate}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white">{user.currency}{sub.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Add Modals */}
      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onSuccessToast={(msg) => showToast(msg, 'success')}
      />

      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        onSuccessToast={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};
