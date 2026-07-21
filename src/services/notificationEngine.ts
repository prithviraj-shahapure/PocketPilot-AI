import { Transaction, Budget, Goal, Subscription, BillItem } from '../types';
import { notificationService } from './notificationService';

export const notificationEngine = {
  async evaluateNotifications(
    uid: string,
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    subscriptions: Subscription[],
    bills: BillItem[]
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // 1. Check Budget Limits
    for (const b of budgets) {
      const pct = (b.spentAmount / b.allocatedAmount) * 100;
      if (pct >= 100) {
        await notificationService.addNotification(uid, {
          title: `Budget Exceeded: ${b.category}`,
          message: `You have spent ₹${b.spentAmount.toLocaleString()} out of your ₹${b.allocatedAmount.toLocaleString()} cap.`,
          timestamp: 'Just now',
          type: 'Overspending',
          read: false,
        });
      } else if (pct >= 80) {
        await notificationService.addNotification(uid, {
          title: `Budget Warning: ${b.category}`,
          message: `${b.category} budget has reached ${Math.round(pct)}% of monthly limit.`,
          timestamp: 'Just now',
          type: 'Budget',
          read: false,
        });
      }
    }

    // 2. Check Large Transactions (> ₹5,000)
    const recentLargeTxs = transactions.filter(
      (t) => t.type === 'expense' && t.amount >= 5000 && t.date === today
    );
    for (const tx of recentLargeTxs) {
      await notificationService.addNotification(uid, {
        title: 'Large Expense Alert',
        message: `High value transaction recorded: ${tx.title} (₹${tx.amount.toLocaleString()}).`,
        timestamp: 'Just now',
        type: 'Overspending',
        read: false,
      });
    }

    // 3. Check Bills Due Soon
    for (const bill of bills) {
      if (bill.status === 'Upcoming' && bill.dueDate <= today) {
        await notificationService.addNotification(uid, {
          title: `Bill Due Today: ${bill.billName}`,
          message: `${bill.billName} (₹${bill.amount.toLocaleString()}) is due for payment.`,
          timestamp: 'Just now',
          type: 'Bill',
          read: false,
        });
      }
    }

    // 4. Check Goal Completion
    for (const goal of goals) {
      if (goal.completed) {
        await notificationService.addNotification(uid, {
          title: `Goal Milestone Achieved 🎉`,
          message: `Congratulations! Target for ${goal.title} has been reached!`,
          timestamp: 'Just now',
          type: 'Milestone',
          read: false,
        });
      }
    }
  }
};
