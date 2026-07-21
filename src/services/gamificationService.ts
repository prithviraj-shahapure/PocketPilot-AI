import { Transaction, Budget, Goal, SavingsChallenge, UserGamification } from '../types';

export const gamificationService = {
  calculateGamification(
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[]
  ): UserGamification {
    const txCount = transactions.length;
    const completedGoals = goals.filter((g) => g.completed).length;
    const budgetCount = budgets.length;

    // Calculate total XP points
    const xp = txCount * 25 + completedGoals * 300 + budgetCount * 50;

    // Level formula: level = Math.floor(xp / 250) + 1
    const level = Math.floor(xp / 250) + 1;

    let levelTitle = 'Financial Explorer';
    if (level >= 10) levelTitle = 'Financial Grandmaster';
    else if (level >= 7) levelTitle = 'Savings Mastermind';
    else if (level >= 4) levelTitle = 'Budget Architect';

    const dailyStreak = Math.min(30, Math.max(1, Math.floor(txCount / 2)));
    const weeklyStreak = Math.min(12, Math.max(1, Math.floor(txCount / 5)));
    const monthlyDiscipline = Math.min(100, Math.max(50, 70 + completedGoals * 10));

    return {
      xp,
      level,
      levelTitle,
      dailyStreak,
      weeklyStreak,
      monthlyDiscipline,
    };
  },

  getSavingsChallenges(transactions: Transaction[]): SavingsChallenge[] {
    const today = new Date().toISOString().split('T')[0];
    const todaySpend = transactions
      .filter((t) => t.type === 'expense' && t.date === today)
      .reduce((s, t) => s + t.amount, 0);

    const foodSpendWeek = transactions
      .filter((t) => t.type === 'expense' && t.category === 'Food')
      .reduce((s, t) => s + t.amount, 0);

    return [
      {
        id: 'ch-1',
        title: 'No Food Delivery for 7 Days',
        description: 'Zero online dining or delivery orders for 7 consecutive days',
        targetMetric: '7 Days',
        durationDays: 7,
        progressDays: foodSpendWeek < 1500 ? 5 : 2,
        rewardXp: 200,
        badgeIcon: 'Utensils',
        completed: foodSpendWeek < 500,
      },
      {
        id: 'ch-2',
        title: 'Spend Less Than ₹500 Today',
        description: 'Keep total daily discretionary outflow strictly under ₹500',
        targetMetric: '₹500 Max',
        durationDays: 1,
        progressDays: todaySpend <= 500 ? 1 : 0,
        rewardXp: 100,
        badgeIcon: 'Zap',
        completed: todaySpend > 0 && todaySpend <= 500,
      },
      {
        id: 'ch-3',
        title: 'Retain ₹5,000 Surplus This Month',
        description: 'Retain at least ₹5,000 net monthly savings surplus in your ledger',
        targetMetric: '₹5,000 Surplus',
        durationDays: 30,
        progressDays: 18,
        rewardXp: 350,
        badgeIcon: 'PiggyBank',
        completed: true,
      },
    ];
  }
};
