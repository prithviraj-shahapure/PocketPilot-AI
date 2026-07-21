import { Transaction, Budget, Goal, Subscription } from '../../types';

export interface HealthScoreResult {
  score: number; // 0 - 100
  status: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
  statusColor: string;
  savingsRate: number;
  budgetAdherenceScore: number;
  incomeVsExpenseScore: number;
  goalProgressScore: number;
  subscriptionBurdenScore: number;
  insights: string[];
}

export const financialScoreEngine = {
  calculateScore(
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    subscriptions: Subscription[]
  ): HealthScoreResult {
    const monthlyIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSavings = Math.max(0, monthlyIncome - monthlyExpense);
    const savingsRate = monthlyIncome > 0 ? (totalSavings / monthlyIncome) * 100 : 0;

    // 1. Savings Rate Score (Max 30 pts)
    let savingsScore = 0;
    if (savingsRate >= 30) savingsScore = 30;
    else if (savingsRate >= 20) savingsScore = 25;
    else if (savingsRate >= 10) savingsScore = 18;
    else if (savingsRate > 0) savingsScore = 10;

    // 2. Budget Adherence Score (Max 25 pts)
    const overbudgetCount = budgets.filter((b) => b.spentAmount > b.allocatedAmount).length;
    let budgetAdherenceScore = 25;
    if (overbudgetCount === 1) budgetAdherenceScore = 18;
    else if (overbudgetCount === 2) budgetAdherenceScore = 12;
    else if (overbudgetCount >= 3) budgetAdherenceScore = 5;

    // 3. Income vs Expense Ratio Score (Max 25 pts)
    let incomeVsExpenseScore = 25;
    if (monthlyIncome === 0) incomeVsExpenseScore = 15;
    else {
      const expenseRatio = (monthlyExpense / monthlyIncome) * 100;
      if (expenseRatio > 90) incomeVsExpenseScore = 5;
      else if (expenseRatio > 75) incomeVsExpenseScore = 15;
      else if (expenseRatio > 50) incomeVsExpenseScore = 22;
    }

    // 4. Goal Target Progress Score (Max 10 pts)
    let goalProgressScore = 5;
    if (goals.length > 0) {
      const avgGoalPct =
        goals.reduce((sum, g) => sum + Math.min(100, (g.currentAmount / g.targetAmount) * 100), 0) /
        goals.length;
      goalProgressScore = Math.round((avgGoalPct / 100) * 10);
    }

    // 5. Subscription Burden Score (Max 10 pts)
    const activeSubCost = subscriptions
      .filter((s) => s.status === 'Active')
      .reduce((sum, s) => sum + (s.billingCycle === 'Yearly' ? Math.round(s.amount / 12) : s.amount), 0);
    
    let subscriptionBurdenScore = 10;
    if (monthlyIncome > 0 && (activeSubCost / monthlyIncome) > 0.1) subscriptionBurdenScore = 4;
    else if (activeSubCost > 5000) subscriptionBurdenScore = 6;

    const rawTotal = savingsScore + budgetAdherenceScore + incomeVsExpenseScore + goalProgressScore + subscriptionBurdenScore;
    const finalScore = Math.min(98, Math.max(35, rawTotal));

    let status: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical' = 'Good';
    let statusColor = 'text-emerald-400';

    if (finalScore >= 85) {
      status = 'Excellent';
      statusColor = 'text-emerald-400';
    } else if (finalScore >= 70) {
      status = 'Good';
      statusColor = 'text-brand-400';
    } else if (finalScore >= 50) {
      status = 'Needs Improvement';
      statusColor = 'text-amber-400';
    } else {
      status = 'Critical';
      statusColor = 'text-red-400';
    }

    const insights: string[] = [];
    if (savingsRate >= 25) insights.push(`High savings rate of ${Math.round(savingsRate)}% provides strong financial runway.`);
    if (overbudgetCount > 0) insights.push(`${overbudgetCount} budget categories have exceeded their monthly target caps.`);
    if (activeSubCost > 3000) insights.push(`Active subscriptions contribute ₹${activeSubCost.toLocaleString()}/mo to recurring expenses.`);

    return {
      score: finalScore,
      status,
      statusColor,
      savingsRate: Math.round(savingsRate),
      budgetAdherenceScore,
      incomeVsExpenseScore,
      goalProgressScore,
      subscriptionBurdenScore,
      insights,
    };
  }
};
