import { Transaction, Budget, Goal, Subscription } from '../../types';

export interface SavingsOpportunity {
  id: string;
  title: string;
  description: string;
  monthlySavings: number;
  yearlySavings: number;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface SubscriptionIntel {
  monthlyTotal: number;
  yearlyTotal: number;
  expensiveCount: number;
  unusedAlerts: string[];
  recommendations: string[];
}

export interface MerchantIntel {
  mostVisited: { name: string; count: number };
  mostExpensive: { name: string; totalSpent: number };
  averageTx: number;
  largestTx: { title: string; amount: number; date: string };
  smallFrequentCount: number;
}

export interface CategoryIntel {
  highestCategory: { name: string; amount: number };
  fastestGrowingCategory: { name: string; growthPct: number };
  topCategoryPct: number;
}

export interface GoalPrediction {
  goalId: string;
  title: string;
  predictedDate: string;
  requiredMonthlySavings: number;
  isLate: boolean;
  progressPct: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progressPct: number;
}

export const recommendationEngine = {
  getSavingsOpportunities(transactions: Transaction[], subscriptions: Subscription[]): SavingsOpportunity[] {
    const opps: SavingsOpportunity[] = [];

    const foodSpend = transactions
      .filter((t) => t.category === 'Food' && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    if (foodSpend > 10000) {
      opps.push({
        id: 'opp-food',
        title: 'Optimize Food Delivery & Dining Out',
        description: 'You spent ₹' + foodSpend.toLocaleString() + ' on Food this month. Cooking 3 extra meals per week saves ~₹3,500/mo.',
        monthlySavings: 3500,
        yearlySavings: 42000,
        priority: 'High',
        category: 'Food',
      });
    }

    const shoppingSpend = transactions
      .filter((t) => t.category === 'Shopping' && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    if (shoppingSpend > 12000) {
      opps.push({
        id: 'opp-shop',
        title: 'Implement 48-Hour Shopping Pause',
        description: 'Shopping expenses reached ₹' + shoppingSpend.toLocaleString() + '. Pausing non-essential impulsive purchases reduces total bill by ~18%.',
        monthlySavings: 2800,
        yearlySavings: 33600,
        priority: 'High',
        category: 'Shopping',
      });
    }

    const activeSubs = subscriptions.filter((s) => s.status === 'Active');
    const subCost = activeSubs.reduce((s, sub) => s + (sub.billingCycle === 'Yearly' ? Math.round(sub.amount / 12) : sub.amount), 0);

    if (subCost > 2500) {
      opps.push({
        id: 'opp-subs',
        title: 'Audit & Consolidate Streaming Subscriptions',
        description: 'You currently have ' + activeSubs.length + ' active subscriptions costing ₹' + subCost.toLocaleString() + '/mo. Pausing 1 redundant service saves ₹649/mo.',
        monthlySavings: 649,
        yearlySavings: 7788,
        priority: 'Medium',
        category: 'Subscriptions',
      });
    }

    const transportSpend = transactions
      .filter((t) => t.category === 'Transport' && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    if (transportSpend > 4000) {
      opps.push({
        id: 'opp-trans',
        title: 'Shift Peak Premier Uber Rides to Standard Transit',
        description: 'Transport costs are at ₹' + transportSpend.toLocaleString() + '. Scheduling rides 15 mins earlier avoids surge pricing.',
        monthlySavings: 1200,
        yearlySavings: 14400,
        priority: 'Low',
        category: 'Transport',
      });
    }

    return opps;
  },

  getSubscriptionIntel(subscriptions: Subscription[]): SubscriptionIntel {
    const active = subscriptions.filter((s) => s.status === 'Active');
    const monthlyTotal = active.reduce(
      (sum, s) => sum + (s.billingCycle === 'Yearly' ? Math.round(s.amount / 12) : s.amount),
      0
    );
    const yearlyTotal = monthlyTotal * 12;

    const expensiveSubs = active.filter((s) => s.amount >= 1000);
    const unusedAlerts: string[] = [];

    if (active.some((s) => s.name.toLowerCase().includes('apple music') || s.name.toLowerCase().includes('spotify'))) {
      unusedAlerts.push('Potential duplicate music subscriptions detected (Spotify & Apple Music active concurrently).');
    }

    if (monthlyTotal > 3000) {
      unusedAlerts.push(`High subscription burn rate (₹${monthlyTotal.toLocaleString()}/mo). Consider annual billing plans for 15% discount.`);
    }

    return {
      monthlyTotal,
      yearlyTotal,
      expensiveCount: expensiveSubs.length,
      unusedAlerts,
      recommendations: [
        'Cancel Spotify Family Plan if Apple Music Hi-Fi is primary.',
        'Switch ChatGPT Plus to shared workspace tier if applicable.',
      ],
    };
  },

  getMerchantIntel(transactions: Transaction[]): MerchantIntel {
    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length === 0) {
      return {
        mostVisited: { name: 'N/A', count: 0 },
        mostExpensive: { name: 'N/A', totalSpent: 0 },
        averageTx: 0,
        largestTx: { title: 'N/A', amount: 0, date: '-' },
        smallFrequentCount: 0,
      };
    }

    const counts: Record<string, number> = {};
    const totals: Record<string, number> = {};

    expenses.forEach((t) => {
      counts[t.merchant] = (counts[t.merchant] || 0) + 1;
      totals[t.merchant] = (totals[t.merchant] || 0) + t.amount;
    });

    let mostVisitedName = expenses[0].merchant;
    let maxCount = 0;
    Object.entries(counts).forEach(([m, c]) => {
      if (c > maxCount) {
        maxCount = c;
        mostVisitedName = m;
      }
    });

    let mostExpensiveName = expenses[0].merchant;
    let maxSpent = 0;
    Object.entries(totals).forEach(([m, s]) => {
      if (s > maxSpent) {
        maxSpent = s;
        mostExpensiveName = m;
      }
    });

    const totalExpenseSum = expenses.reduce((s, t) => s + t.amount, 0);
    const averageTx = Math.round(totalExpenseSum / expenses.length);

    let largest = expenses[0];
    expenses.forEach((t) => {
      if (t.amount > largest.amount) largest = t;
    });

    const smallFrequentCount = expenses.filter((t) => t.amount <= 500).length;

    return {
      mostVisited: { name: mostVisitedName, count: maxCount },
      mostExpensive: { name: mostExpensiveName, totalSpent: maxSpent },
      averageTx,
      largestTx: { title: largest.title, amount: largest.amount, date: largest.date },
      smallFrequentCount,
    };
  },

  getCategoryIntel(transactions: Transaction[]): CategoryIntel {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    let highestName = 'Food';
    let highestAmt = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > highestAmt) {
        highestAmt = amt;
        highestName = cat;
      }
    });

    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    const topCategoryPct = totalExpense > 0 ? Math.round((highestAmt / totalExpense) * 100) : 0;

    return {
      highestCategory: { name: highestName, amount: highestAmt },
      fastestGrowingCategory: { name: 'Shopping', growthPct: 42 },
      topCategoryPct,
    };
  },

  getGoalPredictions(goals: Goal[]): GoalPrediction[] {
    return goals.map((g) => {
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const progressPct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
      
      // Calculate monthly savings needed to reach target by deadline
      const targetDateObj = new Date(g.targetDate);
      const now = new Date();
      const monthsLeft = Math.max(1, (targetDateObj.getFullYear() - now.getFullYear()) * 12 + (targetDateObj.getMonth() - now.getMonth()));
      const requiredMonthlySavings = Math.round(remaining / monthsLeft);

      return {
        goalId: g.id,
        title: g.title,
        predictedDate: g.targetDate,
        requiredMonthlySavings,
        isLate: monthsLeft < 2 && progressPct < 60,
        progressPct,
      };
    });
  },

  getAchievementBadges(transactions: Transaction[], goals: Goal[]): AchievementBadge[] {
    const txCount = transactions.length;
    const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
    const totalSavedAmount = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) -
                            transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return [
      {
        id: 'ach-1',
        title: '7 Days Under Budget',
        description: 'Maintained zero budget overspends for 7 consecutive days',
        icon: 'ShieldCheck',
        unlocked: true,
        unlockedDate: 'July 18, 2026',
        progressPct: 100,
      },
      {
        id: 'ach-2',
        title: '100 Transactions Logged',
        description: 'Recorded 100 financial transaction ledger entries',
        icon: 'Receipt',
        unlocked: txCount >= 10,
        progressPct: Math.min(100, (txCount / 10) * 100),
      },
      {
        id: 'ach-3',
        title: 'First Goal Milestone',
        description: 'Reached 75% or 100% target progress on a savings goal',
        icon: 'Target',
        unlocked: goals.some((g) => (g.currentAmount / g.targetAmount) >= 0.75),
        progressPct: 75,
      },
      {
        id: 'ach-4',
        title: 'Saved ₹10,000 Surplus',
        description: 'Retained ₹10,000+ net monthly savings surplus',
        icon: 'PiggyBank',
        unlocked: totalSavedAmount >= 10000,
        progressPct: Math.min(100, (Math.max(0, totalSavedAmount) / 10000) * 100),
      },
      {
        id: 'ach-5',
        title: 'Budget Master',
        description: 'Configured 5+ active category budget limits',
        icon: 'PieChart',
        unlocked: true,
        unlockedDate: 'July 01, 2026',
        progressPct: 100,
      },
      {
        id: 'ach-6',
        title: 'Financial Explorer',
        description: 'Connected 3+ Smart Sync ingestion vectors',
        icon: 'Sparkles',
        unlocked: true,
        unlockedDate: 'July 10, 2026',
        progressPct: 100,
      },
    ];
  }
};
