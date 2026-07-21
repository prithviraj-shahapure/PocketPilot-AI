import { Transaction, Goal, Budget } from '../../types';
import { CopilotResponse } from './copilotEngine';

export const scenarioEngine = {
  simulateExtraSavings(
    extraAmount: number,
    goals: Goal[],
    currency: string = '₹'
  ): CopilotResponse {
    const yearlyExtra = extraAmount * 12;
    const topGoal = goals[0];
    let goalImpactText = '';

    if (topGoal) {
      const remaining = Math.max(0, topGoal.targetAmount - topGoal.currentAmount);
      const originalMonths = Math.ceil(remaining / 5000) || 12;
      const acceleratedMonths = Math.ceil(remaining / (5000 + extraAmount)) || 6;
      const monthsSaved = Math.max(1, originalMonths - acceleratedMonths);

      goalImpactText = `You will reach your **"${topGoal.title}"** goal **${monthsSaved} months earlier**!`;
    } else {
      goalImpactText = `You will build an extra **${currency}${yearlyExtra.toLocaleString()}** in annual wealth buffer!`;
    }

    return {
      text: `### 🔮 Scenario Simulation: Save +${currency}${extraAmount.toLocaleString()}/mo\n\nBy increasing your monthly savings rate by **${currency}${extraAmount.toLocaleString()}**:\n\n- **12-Month Extra Savings**: +${currency}${yearlyExtra.toLocaleString()}\n- **Goal Acceleration**: ${goalImpactText}\n- **Health Score Impact**: Expected +6 Points boost in Financial Health Index.`,
      scenarioResult: {
        title: `Saving +${currency}${extraAmount.toLocaleString()} / Month`,
        impacts: [
          { label: 'Yearly Surplus', value: `+${currency}${yearlyExtra.toLocaleString()}`, color: 'text-emerald-400' },
          { label: 'Health Score Impact', value: '+6 Points', color: 'text-brand-400' },
        ],
        summary: goalImpactText,
      },
      suggestions: ['What if I buy an iPhone this month?', 'Where can I save money?'],
    };
  },

  simulatePurchase(
    purchaseTitle: string,
    itemCost: number,
    totalBalance: number,
    monthlyExpense: number,
    goals: Goal[],
    currency: string = '₹'
  ): CopilotResponse {
    const newBalance = totalBalance - itemCost;
    const isOverspent = newBalance < 0;
    const topGoal = goals[0];
    let goalDelayText = 'No active savings goals delayed.';

    if (topGoal) {
      goalDelayText = `Your **"${topGoal.title}"** target will be delayed by ~${Math.ceil(itemCost / 10000)} weeks.`;
    }

    return {
      text: `### 📱 Scenario Simulation: Purchase ${purchaseTitle} (${currency}${itemCost.toLocaleString()})\n\nIf you purchase **${purchaseTitle}** this month:\n\n- **Balance Impact**: Drops from **${currency}${totalBalance.toLocaleString()}** to **${currency}${newBalance.toLocaleString()}**.\n- **Goal Delay**: ${goalDelayText}\n- **Budget Warning**: ${isOverspent ? '⚠️ Critical risk of negative cash flow balance!' : 'Outflow increases significantly this month.'}`,
      scenarioResult: {
        title: `Purchase ${purchaseTitle}`,
        impacts: [
          { label: 'New Total Balance', value: `${currency}${newBalance.toLocaleString()}`, color: isOverspent ? 'text-red-400' : 'text-amber-400' },
          { label: 'Goal Impact', value: goalDelayText, color: 'text-amber-400' },
        ],
        summary: isOverspent ? '⚠️ High risk of liquidity strain!' : 'Manageable purchase, but slows goal progress.',
      },
      suggestions: ['What if I save ₹5000 more every month?', 'Where can I save money?'],
    };
  }
};
