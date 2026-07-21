import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Transaction, 
  Budget, 
  Goal, 
  Subscription, 
  RecurringTransaction,
  BillItem,
  SavingsChallenge,
  UserGamification,
  InvestmentItem,
  LoanItem,
  DocumentVaultItem,
  NetWorthAsset,
  TimelineExpense, 
  SmartSyncSource, 
  NotificationItem, 
  AIInsightCard 
} from '../types';
import { 
  initialTransactions, 
  initialBudgets, 
  initialGoals, 
  initialSubscriptions, 
  initialTimeline, 
  initialSmartSyncSources, 
  initialNotifications, 
  initialAIInsights 
} from '../data/mockData';

import { useAuth } from './AuthContext';
import { transactionService } from '../services/transactionService';
import { budgetService } from '../services/budgetService';
import { goalService } from '../services/goalService';
import { subscriptionService } from '../services/subscriptionService';
import { notificationService } from '../services/notificationService';
import { recurringService } from '../services/recurringService';
import { billService } from '../services/billService';
import { netWorthService } from '../services/netWorthService';
import { investmentService } from '../services/investmentService';
import { loanService } from '../services/loanService';
import { documentVaultService } from '../services/documentVaultService';
import { notificationEngine } from '../services/notificationEngine';
import { gamificationService } from '../services/gamificationService';
import { offlineSyncEngine } from '../services/offlineSyncEngine';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  subscriptions: Subscription[];
  recurring: RecurringTransaction[];
  bills: BillItem[];
  netWorthAssets: NetWorthAsset[];
  investments: InvestmentItem[];
  loans: LoanItem[];
  documentVault: DocumentVaultItem[];
  timeline: TimelineExpense[];
  smartSyncSources: SmartSyncSource[];
  notifications: NotificationItem[];
  aiInsights: AIInsightCard[];
  userGamification: UserGamification;
  savingsChallenges: SavingsChallenge[];
  loading: boolean;
  
  // Computed Metrics
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalSavings: number;
  budgetLeft: number;
  financialHealthScore: number;
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  portfolioSummary: { totalInvested: number; totalCurrentValue: number; totalProfit: number; returnPct: number };
  totalDebtSummary: { totalOutstanding: number; totalMonthlyEmi: number };

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'spentAmount'>) => Promise<void>;
  updateBudget: (id: string, allocatedAmount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addSubscription: (sub: Omit<Subscription, 'id'>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  addRecurring: (rec: Omit<RecurringTransaction, 'id'>) => Promise<void>;
  togglePauseRecurring: (id: string, currentStatus: 'Active' | 'Paused') => Promise<void>;
  skipNextRecurring: (id: string, nextDueDate: string, frequency: string) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  addBill: (bill: Omit<BillItem, 'id'>) => Promise<void>;
  markBillPaid: (id: string) => Promise<void>;
  toggleAutoPayBill: (id: string, currentAutoPay: boolean) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  addNetWorthAsset: (asset: Omit<NetWorthAsset, 'id'>) => Promise<void>;
  addInvestment: (inv: Omit<InvestmentItem, 'id'>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  addLoan: (loan: Omit<LoanItem, 'id'>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  addDocument: (docData: Omit<DocumentVaultItem, 'id'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  toggleSmartSync: (id: string) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser } = useAuth();
  const uid = firebaseUser?.uid;

  // Initialize from LocalStorage to prevent zero resets during page reloads
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pocketpilot_txs');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('pocketpilot_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('pocketpilot_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('pocketpilot_subscriptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    const saved = localStorage.getItem('pocketpilot_recurring');
    return saved ? JSON.parse(saved) : [];
  });

  const [bills, setBills] = useState<BillItem[]>(() => {
    const saved = localStorage.getItem('pocketpilot_bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [netWorthAssets, setNetWorthAssets] = useState<NetWorthAsset[]>(() => {
    const saved = localStorage.getItem('pocketpilot_networth');
    return saved ? JSON.parse(saved) : [];
  });

  const [investments, setInvestments] = useState<InvestmentItem[]>(() => {
    const saved = localStorage.getItem('pocketpilot_investments');
    return saved ? JSON.parse(saved) : [];
  });

  const [loans, setLoans] = useState<LoanItem[]>(() => {
    const saved = localStorage.getItem('pocketpilot_loans');
    return saved ? JSON.parse(saved) : [];
  });

  const [documentVault, setDocumentVault] = useState<DocumentVaultItem[]>(() => {
    const saved = localStorage.getItem('pocketpilot_documents');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('pocketpilot_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [timeline, setTimeline] = useState<TimelineExpense[]>(() => {
    const saved = localStorage.getItem('pocketpilot_timeline');
    return saved ? JSON.parse(saved) : initialTimeline;
  });

  const [smartSyncSources, setSmartSyncSources] = useState<SmartSyncSource[]>(() => {
    const saved = localStorage.getItem('pocketpilot_smartsync');
    return saved ? JSON.parse(saved) : initialSmartSyncSources;
  });

  const [aiInsights] = useState<AIInsightCard[]>(initialAIInsights);

  // Sync to LocalStorage on state changes
  useEffect(() => { localStorage.setItem('pocketpilot_txs', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('pocketpilot_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('pocketpilot_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('pocketpilot_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('pocketpilot_recurring', JSON.stringify(recurring)); }, [recurring]);
  useEffect(() => { localStorage.setItem('pocketpilot_bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { localStorage.setItem('pocketpilot_networth', JSON.stringify(netWorthAssets)); }, [netWorthAssets]);
  useEffect(() => { localStorage.setItem('pocketpilot_investments', JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem('pocketpilot_loans', JSON.stringify(loans)); }, [loans]);
  useEffect(() => { localStorage.setItem('pocketpilot_documents', JSON.stringify(documentVault)); }, [documentVault]);
  useEffect(() => { localStorage.setItem('pocketpilot_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Firestore Real-Time Subscriptions via onSnapshot & Offline Replay Listener
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubTx = transactionService.subscribeTransactions(uid, (data) => setTransactions(data));
    const unsubBgt = budgetService.subscribeBudgets(uid, (data) => setBudgets(data));
    const unsubGoal = goalService.subscribeGoals(uid, (data) => setGoals(data));
    const unsubSub = subscriptionService.subscribeSubscriptions(uid, (data) => setSubscriptions(data));
    const unsubRec = recurringService.subscribeRecurring(uid, (data) => setRecurring(data));
    const unsubBill = billService.subscribeBills(uid, (data) => setBills(data));
    const unsubNw = netWorthService.subscribeAssets(uid, (data) => setNetWorthAssets(data));
    const unsubInv = investmentService.subscribeInvestments(uid, (data) => setInvestments(data));
    const unsubLoan = loanService.subscribeLoans(uid, (data) => setLoans(data));
    const unsubDoc = documentVaultService.subscribeDocuments(uid, (data) => setDocumentVault(data));
    const unsubNotif = notificationService.subscribeNotifications(uid, (data) => setNotifications(data));

    setLoading(false);

    // Replay offline queue when network reconnects
    const handleOnline = () => {
      offlineSyncEngine.replayQueue(uid, {
        addTransaction: (userId: string, p: any) => transactionService.addTransaction(userId, p),
        addGoal: (userId: string, p: any) => goalService.addGoal(userId, p),
        addBudget: (userId: string, p: any) => budgetService.addBudget(userId, p),
        addSubscription: (userId: string, p: any) => subscriptionService.addSubscription(userId, p),
        markBillPaid: (_: string, id: string) => billService.markBillPaid(id),
      });
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      unsubTx();
      unsubBgt();
      unsubGoal();
      unsubSub();
      unsubRec();
      unsubBill();
      unsubNw();
      unsubInv();
      unsubLoan();
      unsubDoc();
      unsubNotif();
    };
  }, [uid]);

  // Recalculate spending per budget category
  const updatedBudgets = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spentAmount: spent };
    });
  }, [budgets, transactions]);

  // Computed Metrics
  const monthlyIncome = useMemo(() => {
    return transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const monthlyExpense = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalBalance = useMemo(() => monthlyIncome - monthlyExpense, [monthlyIncome, monthlyExpense]);
  const totalSavings = useMemo(() => Math.max(0, monthlyIncome - monthlyExpense), [monthlyIncome, monthlyExpense]);

  const totalAllocatedBudget = useMemo(() => {
    return updatedBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  }, [updatedBudgets]);

  const budgetLeft = useMemo(() => Math.max(0, totalAllocatedBudget - monthlyExpense), [totalAllocatedBudget, monthlyExpense]);

  const financialHealthScore = useMemo(() => {
    if (monthlyIncome === 0) return 75;
    const savingsRatio = (totalSavings / monthlyIncome) * 100;
    const budgetOverspendCount = updatedBudgets.filter((b) => b.spentAmount > b.allocatedAmount).length;
    let score = 70 + Math.min(25, Math.round(savingsRatio * 0.8)) - budgetOverspendCount * 5;
    return Math.min(98, Math.max(40, score));
  }, [monthlyIncome, totalSavings, updatedBudgets]);

  const { totalAssets, totalLiabilities, netWorth: totalNetWorth } = useMemo(
    () => netWorthService.calculateNetWorth(netWorthAssets),
    [netWorthAssets]
  );

  const portfolioSummary = useMemo(
    () => investmentService.calculatePortfolio(investments),
    [investments]
  );

  const totalDebtSummary = useMemo(
    () => loanService.calculateTotalDebt(loans),
    [loans]
  );

  const userGamification = useMemo(
    () => gamificationService.calculateGamification(transactions, budgets, goals),
    [transactions, budgets, goals]
  );

  const savingsChallenges = useMemo(
    () => gamificationService.getSavingsChallenges(transactions),
    [transactions]
  );

  // Optimistic + Offline Queue + Firestore Handlers
  const addTransaction = async (txData: Omit<Transaction, 'id'>) => {
    const tempId = `tx-${Date.now()}`;
    setTransactions((prev) => [{ ...txData, id: tempId }, ...prev]);

    if (!navigator.onLine) {
      offlineSyncEngine.enqueue('addTransaction', txData);
      return;
    }

    if (uid) { try { await transactionService.addTransaction(uid, txData); } catch (err) {} }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (uid) { try { await transactionService.deleteTransaction(id); } catch (err) {} }
  };

  const addBudget = async (bData: Omit<Budget, 'id' | 'spentAmount'>) => {
    const tempId = `b-${Date.now()}`;
    setBudgets((prev) => [...prev, { ...bData, spentAmount: 0, id: tempId }]);

    if (!navigator.onLine) {
      offlineSyncEngine.enqueue('addBudget', { ...bData, spentAmount: 0 });
      return;
    }

    if (uid) { try { await budgetService.addBudget(uid, { ...bData, spentAmount: 0 }); } catch (err) {} }
  };

  const updateBudget = async (id: string, allocatedAmount: number) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, allocatedAmount } : b)));
    if (uid) { try { await budgetService.updateBudget(id, { allocatedAmount }); } catch (err) {} }
  };

  const deleteBudget = async (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    if (uid) { try { await budgetService.deleteBudget(id); } catch (err) {} }
  };

  const addGoal = async (gData: Omit<Goal, 'id'>) => {
    const tempId = `g-${Date.now()}`;
    setGoals((prev) => [...prev, { ...gData, id: tempId }]);

    if (!navigator.onLine) {
      offlineSyncEngine.enqueue('addGoal', gData);
      return;
    }

    if (uid) { try { await goalService.addGoal(uid, gData); } catch (err) {} }
  };

  const updateGoal = async (id: string, gData: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...gData } : g)));
    if (uid) { try { await goalService.updateGoal(id, gData); } catch (err) {} }
  };

  const contributeToGoal = async (id: string, amount: number) => {
    const target = goals.find((g) => g.id === id);
    if (!target) return;
    const newAmount = target.currentAmount + amount;
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, currentAmount: newAmount } : g)));
    if (uid) { try { await goalService.contributeToGoal(id, amount, target.currentAmount, target.targetAmount); } catch (err) {} }
  };

  const deleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (uid) { try { await goalService.deleteGoal(id); } catch (err) {} }
  };

  const addSubscription = async (sData: Omit<Subscription, 'id'>) => {
    const tempId = `s-${Date.now()}`;
    setSubscriptions((prev) => [...prev, { ...sData, id: tempId }]);

    if (!navigator.onLine) {
      offlineSyncEngine.enqueue('addSubscription', sData);
      return;
    }

    if (uid) { try { await subscriptionService.addSubscription(uid, sData); } catch (err) {} }
  };

  const deleteSubscription = async (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    if (uid) { try { await subscriptionService.deleteSubscription(id); } catch (err) {} }
  };

  const addRecurring = async (rData: Omit<RecurringTransaction, 'id'>) => {
    const tempId = `rec-${Date.now()}`;
    setRecurring((prev) => [...prev, { ...rData, id: tempId }]);
    if (uid) { try { await recurringService.addRecurring(uid, rData); } catch (err) {} }
  };

  const togglePauseRecurring = async (id: string, currentStatus: 'Active' | 'Paused') => {
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, status: currentStatus === 'Active' ? 'Paused' : 'Active' } : r)));
    if (uid) { try { await recurringService.togglePause(id, currentStatus); } catch (err) {} }
  };

  const skipNextRecurring = async (id: string, nextDueDate: string, frequency: string) => {
    if (uid) { try { await recurringService.skipNext(id, nextDueDate, frequency); } catch (err) {} }
  };

  const deleteRecurring = async (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
    if (uid) { try { await recurringService.deleteRecurring(id); } catch (err) {} }
  };

  const addBill = async (bData: Omit<BillItem, 'id'>) => {
    const tempId = `bill-${Date.now()}`;
    setBills((prev) => [...prev, { ...bData, id: tempId }]);
    if (uid) { try { await billService.addBill(uid, bData); } catch (err) {} }
  };

  const markBillPaid = async (id: string) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'Paid' } : b)));

    if (!navigator.onLine) {
      offlineSyncEngine.enqueue('markBillPaid', id);
      return;
    }

    if (uid) { try { await billService.markBillPaid(id); } catch (err) {} }
  };

  const toggleAutoPayBill = async (id: string, currentAutoPay: boolean) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, autoPay: !currentAutoPay } : b)));
    if (uid) { try { await billService.toggleAutoPay(id, currentAutoPay); } catch (err) {} }
  };

  const deleteBill = async (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    if (uid) { try { await billService.deleteBill(id); } catch (err) {} }
  };

  const addNetWorthAsset = async (nwData: Omit<NetWorthAsset, 'id'>) => {
    const tempId = `nw-${Date.now()}`;
    setNetWorthAssets((prev) => [...prev, { ...nwData, id: tempId }]);
    if (uid) { try { await netWorthService.addAsset(uid, nwData); } catch (err) {} }
  };

  const addInvestment = async (iData: Omit<InvestmentItem, 'id'>) => {
    const tempId = `inv-${Date.now()}`;
    setInvestments((prev) => [...prev, { ...iData, id: tempId }]);
    if (uid) { try { await investmentService.addInvestment(uid, iData); } catch (err) {} }
  };

  const deleteInvestment = async (id: string) => {
    setInvestments((prev) => prev.filter((i) => i.id !== id));
    if (uid) { try { await investmentService.deleteInvestment(id); } catch (err) {} }
  };

  const addLoan = async (lData: Omit<LoanItem, 'id'>) => {
    const tempId = `loan-${Date.now()}`;
    setLoans((prev) => [...prev, { ...lData, id: tempId }]);
    if (uid) { try { await loanService.addLoan(uid, lData); } catch (err) {} }
  };

  const deleteLoan = async (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
    if (uid) { try { await loanService.deleteLoan(id); } catch (err) {} }
  };

  const addDocument = async (dData: Omit<DocumentVaultItem, 'id'>) => {
    const tempId = `doc-${Date.now()}`;
    setDocumentVault((prev) => [...prev, { ...dData, id: tempId }]);
    if (uid) { try { await documentVaultService.addDocument(uid, dData); } catch (err) {} }
  };

  const deleteDocument = async (id: string) => {
    setDocumentVault((prev) => prev.filter((d) => d.id !== id));
    if (uid) { try { await documentVaultService.deleteDocument(id); } catch (err) {} }
  };

  const toggleSmartSync = (id: string) => {
    setSmartSyncSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, permissionStatus: s.permissionStatus === 'Connected' ? 'Disconnected' : 'Connected' } : s))
    );
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (uid) { try { await notificationService.markNotificationRead(id); } catch (err) {} }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (uid) { try { await notificationService.markAllNotificationsRead(uid); } catch (err) {} }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets: updatedBudgets,
        goals,
        subscriptions,
        recurring,
        bills,
        netWorthAssets,
        investments,
        loans,
        documentVault,
        timeline,
        smartSyncSources,
        notifications,
        aiInsights,
        userGamification,
        savingsChallenges,
        loading,
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        totalSavings,
        budgetLeft,
        financialHealthScore,
        totalNetWorth,
        totalAssets,
        totalLiabilities,
        portfolioSummary,
        totalDebtSummary,
        addTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        contributeToGoal,
        deleteGoal,
        addSubscription,
        deleteSubscription,
        addRecurring,
        togglePauseRecurring,
        skipNextRecurring,
        deleteRecurring,
        addBill,
        markBillPaid,
        toggleAutoPayBill,
        deleteBill,
        addNetWorthAsset,
        addInvestment,
        deleteInvestment,
        addLoan,
        deleteLoan,
        addDocument,
        deleteDocument,
        toggleSmartSync,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
