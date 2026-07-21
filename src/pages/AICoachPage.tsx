import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Search, 
  Lightbulb, 
  Activity, 
  Award, 
  Target, 
  CreditCard, 
  Download, 
  FileText, 
  Zap, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock,
  Receipt,
  PiggyBank,
  PieChart,
  Flame
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

import { financialScoreEngine } from '../services/ai/financialScoreEngine';
import { forecastEngine } from '../services/ai/forecastEngine';
import { recommendationEngine } from '../services/ai/recommendationEngine';
import { reportService } from '../services/ai/reportService';

export const AICoachPage: React.FC = () => {
  const { transactions, budgets, goals, subscriptions, userGamification, savingsChallenges } = useFinance();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [reportTab, setReportTab] = useState<'Weekly' | 'Monthly'>('Weekly');

  // Compute live algorithmic intelligence
  const scoreResult = useMemo(
    () => financialScoreEngine.calculateScore(transactions, budgets, goals, subscriptions),
    [transactions, budgets, goals, subscriptions]
  );

  const forecastResult = useMemo(
    () => forecastEngine.predictForecast(transactions, budgets),
    [transactions, budgets]
  );

  const savingsOpps = useMemo(
    () => recommendationEngine.getSavingsOpportunities(transactions, subscriptions),
    [transactions, subscriptions]
  );

  const subIntel = useMemo(
    () => recommendationEngine.getSubscriptionIntel(subscriptions),
    [subscriptions]
  );

  const merchantIntel = useMemo(
    () => recommendationEngine.getMerchantIntel(transactions),
    [transactions]
  );

  const categoryIntel = useMemo(
    () => recommendationEngine.getCategoryIntel(transactions),
    [transactions]
  );

  const goalPredictions = useMemo(
    () => recommendationEngine.getGoalPredictions(goals),
    [goals]
  );

  const badges = useMemo(
    () => recommendationEngine.getAchievementBadges(transactions, goals),
    [transactions, goals]
  );

  const weeklyReport = useMemo(() => reportService.generateWeeklyReport(transactions), [transactions]);
  const monthlyReport = useMemo(() => reportService.generateMonthlyReport(transactions), [transactions]);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return ShieldCheck;
      case 'Receipt': return Receipt;
      case 'Target': return Target;
      case 'PiggyBank': return PiggyBank;
      case 'PieChart': return PieChart;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-brand-500/40 shadow-xl shadow-brand-600/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-brand-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs uppercase font-extrabold text-brand-300 tracking-wider">
              Autonomous AI Financial Intelligence Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Financial Advisor Cockpit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic risk modeling, savings opportunity extraction, and gamified milestone badges.
          </p>
        </div>

        {/* Global AI Insights Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI insights, reports, badges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none"
          />
        </div>
      </div>

      {/* Row 0: Gamification Level & Streaks Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow="indigo" className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Mastery Rank</span>
            <h3 className="text-xl font-extrabold text-white mt-1">Level {userGamification.level}</h3>
            <span className="text-xs font-bold text-brand-400">{userGamification.levelTitle}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400">{userGamification.xp}</span>
            <span className="text-[10px] text-slate-400 block">Total XP</span>
          </div>
        </Card>

        <Card glow="emerald" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Daily Discipline Streak</span>
              <h3 className="text-xl font-extrabold text-white">{userGamification.dailyStreak} Days Active</h3>
            </div>
          </div>
        </Card>

        <Card glow="indigo" className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Discipline Score</span>
            <h3 className="text-xl font-extrabold text-emerald-400 mt-1">{userGamification.monthlyDiscipline}%</h3>
            <span className="text-[10px] text-slate-400">Zero impulse overspends</span>
          </div>
        </Card>
      </div>

      {/* Row 1: Health Score Circular Ring, Forecast, and Risk Meter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Health Score Circular Ring */}
        <Card glow="indigo" className="flex flex-col items-center text-center justify-between">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Financial Health Index</span>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 ${scoreResult.statusColor}`}>
              {scoreResult.status}
            </span>
          </div>

          <div className="my-3">
            <CircularProgress
              percentage={scoreResult.score}
              size={160}
              strokeWidth={14}
              color={scoreResult.score >= 80 ? '#22C55E' : '#4F46E5'}
              label={`${scoreResult.score}`}
              sublabel="Out of 100"
            />
          </div>

          <p className="text-xs text-slate-300">
            Monthly savings rate is <strong className="text-emerald-400">{scoreResult.savingsRate}%</strong>.
          </p>
        </Card>

        {/* Expense Forecast Card */}
        <Card glow="emerald" className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Expense Forecast</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              {forecastResult.confidencePct}% Confidence
            </span>
          </div>

          <div className="my-2">
            <span className="text-xs text-slate-400">Predicted Month-End Spend</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">
              {user.currency}{forecastResult.predictedMonthEnd.toLocaleString()}
            </h3>
            <p className="text-xs text-emerald-400 font-bold mt-1">
              Expected Surplus: {user.currency}{forecastResult.expectedSavings.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Spend</span>
              <span className="font-bold text-white">{user.currency}{forecastResult.currentSpend.toLocaleString()}</span>
            </div>
            <ProgressBar value={forecastResult.expectedBudgetUsagePct} color="bg-emerald-500" height="h-2" />
          </div>
        </Card>

        {/* Budget Risk Engine */}
        <Card glow="danger" className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Budget Risk Engine</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>

          <div className="space-y-3 my-2 max-h-48 overflow-y-auto no-scrollbar">
            {forecastResult.budgetRiskList.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-white">{item.category}</span>
                  <span className={`text-[10px] font-bold ${
                    item.status === 'Critical' ? 'text-red-400' : item.status === 'Warning' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {item.status === 'Critical' ? 'Critical' : item.daysUntilExceeded ? `${item.daysUntilExceeded} Days Left` : 'Safe'}
                  </span>
                </div>
                <ProgressBar
                  value={item.spentPct}
                  color={item.status === 'Critical' ? 'bg-red-500' : item.status === 'Warning' ? 'bg-amber-500' : 'bg-brand-500'}
                  height="h-2"
                />
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-[11px] text-red-300">
            ⚠ Shopping budget exceeded. Pause non-essential purchases.
          </div>
        </Card>
      </div>

      {/* Row 1.5: Active Savings Challenges */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" /> Active Savings Challenges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savingsChallenges.map((ch) => (
            <Card key={ch.id} glow={ch.completed ? 'emerald' : 'indigo'} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    +{ch.rewardXp} XP Reward
                  </span>
                  <span className={`text-xs font-bold ${ch.completed ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {ch.completed ? 'Completed 🎉' : `${ch.progressDays}/${ch.durationDays} Days`}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{ch.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{ch.description}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800">
                <ProgressBar value={(ch.progressDays / ch.durationDays) * 100} color={ch.completed ? 'bg-emerald-500' : 'bg-brand-500'} height="h-2" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Row 2: Savings Opportunities with Priority Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" /> Proactive Savings Opportunities
          </h3>
          <span className="text-xs text-slate-400">Estimated Annual Impact</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsOpps.map((opp) => (
            <Card key={opp.id} className="border-l-4 border-l-brand-500 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                    opp.priority === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    opp.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {opp.priority} Priority
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    Save +{user.currency}{opp.yearlySavings.toLocaleString()}/yr
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{opp.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{opp.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Monthly Impact: <strong className="text-white">+{user.currency}{opp.monthlySavings.toLocaleString()}/mo</strong></span>
                <span className="text-brand-400 font-semibold">{opp.category}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Row 3: Subscription, Merchant & Category Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Intelligence */}
        <Card glow="indigo">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-400" /> Subscription Audit
            </h3>
            <span className="text-xs font-bold text-white">{user.currency}{subIntel.monthlyTotal}/mo</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Yearly Total</span>
              <span className="font-bold text-white">{user.currency}{subIntel.yearlyTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Expensive Tier Services</span>
              <span className="font-bold text-amber-400">{subIntel.expensiveCount} Services</span>
            </div>
            {subIntel.unusedAlerts.map((alert, i) => (
              <div key={i} className="p-2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px]">
                ⚠ {alert}
              </div>
            ))}
          </div>
        </Card>

        {/* Merchant Intelligence */}
        <Card glow="emerald">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> Merchant Intelligence
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Most Visited</span>
              <span className="font-bold text-white">{merchantIntel.mostVisited.name} ({merchantIntel.mostVisited.count}x)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Highest Outflow</span>
              <span className="font-bold text-emerald-400">{merchantIntel.mostExpensive.name}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Average Transaction</span>
              <span className="font-bold text-white">{user.currency}{merchantIntel.averageTx}</span>
            </div>
          </div>
        </Card>

        {/* Category & Goal Predictions */}
        <Card glow="indigo">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" /> Category & Goal Predictions
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Top Category Weight</span>
              <span className="font-bold text-white">{categoryIntel.highestCategory.name} ({categoryIntel.topCategoryPct}%)</span>
            </div>
            {goalPredictions.slice(0, 2).map((gp) => (
              <div key={gp.goalId} className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-300">{gp.title}</span>
                <span className="font-bold text-brand-400">Target: {gp.predictedDate}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 4: Gamification & Achievement Badges */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Gamified Milestones & Badges
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {badges.map((b) => {
            const IconComp = getBadgeIcon(b.icon);
            return (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                  b.unlocked
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  b.unlocked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-900 text-slate-600'
                }`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-white leading-tight">{b.title}</h5>
                <span className="text-[9px] text-slate-400 mt-1">
                  {b.unlocked ? `Unlocked ${b.unlockedDate || ''}` : `${Math.round(b.progressPct)}% Progress`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 5: Weekly & Monthly Financial Reports */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-white">Automated Financial Intelligence Reports</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportTab('Weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                reportTab === 'Weekly' ? 'bg-brand-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Weekly Report
            </button>
            <button
              onClick={() => setReportTab('Monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                reportTab === 'Monthly' ? 'bg-brand-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Monthly Report
            </button>
          </div>
        </div>

        {/* Active Report Preview Card */}
        {reportTab === 'Weekly' ? (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">{weeklyReport.period}</span>
              <div className="flex gap-2">
                <Button variant="glass" size="sm" icon={Download} onClick={() => reportService.downloadReportFile(weeklyReport, 'PDF')}>
                  Export PDF
                </Button>
                <Button variant="glass" size="sm" icon={Download} onClick={() => reportService.downloadReportFile(weeklyReport, 'CSV')}>
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div><span className="text-slate-400 block">Weekly Inflow</span><strong className="text-emerald-400 text-sm">₹{weeklyReport.totalIncome.toLocaleString()}</strong></div>
              <div><span className="text-slate-400 block">Weekly Outflow</span><strong className="text-white text-sm">₹{weeklyReport.totalExpense.toLocaleString()}</strong></div>
              <div><span className="text-slate-400 block">Savings Rate</span><strong className="text-brand-400 text-sm">{weeklyReport.savingsRatePct}%</strong></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">{monthlyReport.period}</span>
              <div className="flex gap-2">
                <Button variant="glass" size="sm" icon={Download} onClick={() => reportService.downloadReportFile(monthlyReport, 'PDF')}>
                  Export PDF
                </Button>
                <Button variant="glass" size="sm" icon={Download} onClick={() => reportService.downloadReportFile(monthlyReport, 'CSV')}>
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div><span className="text-slate-400 block">Monthly Inflow</span><strong className="text-emerald-400 text-sm">₹{monthlyReport.totalIncome.toLocaleString()}</strong></div>
              <div><span className="text-slate-400 block">Monthly Outflow</span><strong className="text-white text-sm">₹{monthlyReport.totalExpense.toLocaleString()}</strong></div>
              <div><span className="text-slate-400 block">Savings Surplus</span><strong className="text-brand-400 text-sm">₹{monthlyReport.netSavings.toLocaleString()}</strong></div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
