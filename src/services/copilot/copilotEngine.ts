import { Transaction, Budget, Goal, Subscription } from '../../types';

export interface CopilotResponse {
  text: string;
  metricCard?: {
    label: string;
    value: string;
    subtext?: string;
    type?: 'positive' | 'negative' | 'neutral';
  };
  suggestions?: string[];
  scenarioResult?: {
    title: string;
    impacts: { label: string; value: string; color?: string }[];
    summary: string;
  };
}

export const copilotEngine = {
  processQuery(
    rawQuery: string,
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    subscriptions: Subscription[],
    currency: string = '₹'
  ): CopilotResponse {
    const q = rawQuery.toLowerCase().trim();

    const monthlyIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netSavings = Math.max(0, monthlyIncome - monthlyExpense);

    // 1. Food / Swiggy / Dining query
    if (q.includes('food') || q.includes('swiggy') || q.includes('zomato') || q.includes('dining')) {
      const foodSpend = transactions
        .filter((t) => t.category === 'Food' && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

      return {
        text: `You have spent **${currency}${foodSpend.toLocaleString()}** on Food & Dining this month across ${transactions.filter((t) => t.category === 'Food').length} transactions.\n\n💡 *Tip: Cooking 3 extra meals per week can save ~${currency}3,500/mo.*`,
        metricCard: {
          label: 'Total Food Expense',
          value: `${currency}${foodSpend.toLocaleString()}`,
          subtext: `${transactions.filter((t) => t.category === 'Food').length} transactions`,
          type: foodSpend > 10000 ? 'negative' : 'neutral',
        },
        suggestions: ['Where can I save money?', 'Show my budgets', 'Compare this month with last month'],
      };
    }

    // 2. Subscriptions query
    if (q.includes('subscription') || q.includes('saas') || q.includes('netflix') || q.includes('spotify')) {
      const active = subscriptions.filter((s) => s.status === 'Active');
      const monthlyTotal = active.reduce((s, sub) => s + (sub.billingCycle === 'Yearly' ? Math.round(sub.amount / 12) : sub.amount), 0);

      return {
        text: `You currently have **${active.length} active recurring subscriptions** costing **${currency}${monthlyTotal.toLocaleString()}/mo** (${currency}${(monthlyTotal * 12).toLocaleString()}/yr).\n\nActive services:\n${active.map((s) => `- **${s.name}**: ${currency}${s.amount}/${s.billingCycle === 'Yearly' ? 'yr' : 'mo'}`).join('\n')}`,
        metricCard: {
          label: 'Subscription Burn Rate',
          value: `${currency}${monthlyTotal.toLocaleString()}/mo`,
          subtext: `${active.length} Active Services`,
          type: monthlyTotal > 2500 ? 'negative' : 'neutral',
        },
        suggestions: ['Where can I save money?', 'Can I afford a MacBook?', 'How much did I spend this month?'],
      };
    }

    // 3. Health Score query
    if (q.includes('health') || q.includes('score') || q.includes('index')) {
      const savingsRatio = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;
      let score = 70 + Math.min(25, Math.round(savingsRatio * 0.8));
      score = Math.min(98, Math.max(40, score));

      return {
        text: `Your current **Financial Health Score is ${score}/100** (${score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : 'Needs Work'}).\n\nYour net savings rate is **${Math.round(savingsRatio)}%** with a monthly surplus of **${currency}${netSavings.toLocaleString()}**.`,
        metricCard: {
          label: 'Financial Health Index',
          value: `${score} / 100`,
          subtext: `${Math.round(savingsRatio)}% Savings Rate`,
          type: score >= 75 ? 'positive' : 'neutral',
        },
        suggestions: ['Where can I save money?', 'Show biggest expenses', 'How close am I to my savings goal?'],
      };
    }

    // 4. Savings Goals / MacBook / Vacation query
    if (q.includes('goal') || q.includes('macbook') || q.includes('vacation') || q.includes('afford')) {
      if (goals.length === 0) {
        return {
          text: `You don't have any active savings goals configured yet. You can create one to track target milestones!`,
          suggestions: ['How much did I spend this month?', 'What is my Financial Health Score?'],
        };
      }

      const topGoal = goals[0];
      const pct = Math.min(100, Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100));
      const remaining = Math.max(0, topGoal.targetAmount - topGoal.currentAmount);

      return {
        text: `Your top savings target **"${topGoal.title}"** is **${pct}% complete**.\n\n- Saved: **${currency}${topGoal.currentAmount.toLocaleString()}**\n- Target: **${currency}${topGoal.targetAmount.toLocaleString()}**\n- Remaining: **${currency}${remaining.toLocaleString()}**\n- Target Deadline: **${topGoal.targetDate}**`,
        metricCard: {
          label: topGoal.title,
          value: `${pct}%`,
          subtext: `${currency}${remaining.toLocaleString()} remaining`,
          type: 'positive',
        },
        suggestions: ['What if I save ₹5000 more every month?', 'Where can I save money?'],
      };
    }

    // 5. Total Spend / Outflow query
    if (q.includes('spend') || q.includes('expense') || q.includes('outflow') || q.includes('month')) {
      return {
        text: `In the current billing period, your total monthly expense outflow is **${currency}${monthlyExpense.toLocaleString()}** against total income of **${currency}${monthlyIncome.toLocaleString()}**.\n\nNet Monthly Surplus: **${currency}${netSavings.toLocaleString()}**`,
        metricCard: {
          label: 'Total Monthly Expense',
          value: `${currency}${monthlyExpense.toLocaleString()}`,
          subtext: `Net Surplus: ${currency}${netSavings.toLocaleString()}`,
          type: 'neutral',
        },
        suggestions: ['Show biggest expenses', 'Where can I save money?', 'How much did I spend on food?'],
      };
    }

    // Default Fallback Response
    return {
      text: `I analyzed your live Firestore financial ledger.\n\n- Monthly Income: **${currency}${monthlyIncome.toLocaleString()}**\n- Monthly Expense: **${currency}${monthlyExpense.toLocaleString()}**\n- Net Savings Surplus: **${currency}${netSavings.toLocaleString()}**\n- Active Budgets: **${budgets.length}**\n- Savings Goals: **${goals.length}**`,
      metricCard: {
        label: 'Net Monthly Savings',
        value: `${currency}${netSavings.toLocaleString()}`,
        subtext: 'Live Firestore Ledger',
        type: 'positive',
      },
      suggestions: ['How much did I spend on food?', 'Where can I save money?', 'Can I afford a MacBook?'],
    };
  }
};
