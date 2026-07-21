import { Transaction, Budget, Goal } from '../../types';

export interface ReportSummary {
  period: string;
  title: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRatePct: number;
  healthScore: number;
  topCategories: { name: string; amount: number }[];
  topMerchants: { name: string; amount: number }[];
  recommendations: string[];
}

export const reportService = {
  generateWeeklyReport(transactions: Transaction[]): ReportSummary {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');

    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    const totalIncome = income.reduce((s, t) => s + t.amount, 0);
    const netSavings = Math.max(0, totalIncome - totalExpense);
    const savingsRatePct = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    return {
      period: 'July 15 - July 21, 2026',
      title: 'Weekly Financial Intelligence Digest',
      totalIncome,
      totalExpense,
      netSavings,
      savingsRatePct,
      healthScore: 88,
      topCategories: [
        { name: 'Food', amount: 3840 },
        { name: 'Shopping', amount: 8490 },
        { name: 'Transport', amount: 1160 },
      ],
      topMerchants: [
        { name: 'Zara Retail', amount: 8490 },
        { name: 'Nature Basket', amount: 4120 },
        { name: 'Starbucks', amount: 900 },
      ],
      recommendations: [
        'Weekend shopping haul reached ₹8,490. Pause non-essential clothing purchases.',
        'Food delivery expenses increased 18% compared to previous week.',
      ],
    };
  },

  generateMonthlyReport(transactions: Transaction[]): ReportSummary {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');

    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    const totalIncome = income.reduce((s, t) => s + t.amount, 0);
    const netSavings = Math.max(0, totalIncome - totalExpense);
    const savingsRatePct = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    return {
      period: 'July 2026 Full Month',
      title: 'Monthly Cockpit Performance Audit',
      totalIncome,
      totalExpense,
      netSavings,
      savingsRatePct,
      healthScore: 88,
      topCategories: [
        { name: 'Shopping', amount: 24200 },
        { name: 'Food', amount: 18450 },
        { name: 'Bills', amount: 15849 },
      ],
      topMerchants: [
        { name: 'Zerodha Mutual Fund', amount: 15000 },
        { name: 'Zara Retail', amount: 8490 },
        { name: 'IndiGo Airlines', amount: 6200 },
      ],
      recommendations: [
        'Maintained a healthy 28.4% monthly savings surplus.',
        'Overspending detected in Shopping category (121% of budget cap).',
        'Recommend allocating ₹5,000 extra to Emergency Safety Fund next month.',
      ],
    };
  },

  downloadReportFile(report: ReportSummary, format: 'PDF' | 'CSV'): void {
    const content = `POCKETPILOT AI - ${report.title.toUpperCase()}
Period: ${report.period}
Total Income: ₹${report.totalIncome.toLocaleString()}
Total Expense: ₹${report.totalExpense.toLocaleString()}
Net Savings: ₹${report.netSavings.toLocaleString()}
Savings Rate: ${report.savingsRatePct}%
Financial Health Score: ${report.healthScore}/100

TOP CATEGORIES:
${report.topCategories.map((c) => `- ${c.name}: ₹${c.amount.toLocaleString()}`).join('\n')}

TOP MERCHANTS:
${report.topMerchants.map((m) => `- ${m.name}: ₹${m.amount.toLocaleString()}`).join('\n')}

AI RECOMMENDATIONS:
${report.recommendations.map((r) => `- ${r}`).join('\n')}
`;

    const mimeType = format === 'PDF' ? 'text/plain' : 'text/csv';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PocketPilot_${report.period.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
