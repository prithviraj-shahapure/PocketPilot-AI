export type CategoryType = 
  | 'Food' 
  | 'Shopping' 
  | 'Travel' 
  | 'Transport' 
  | 'Entertainment' 
  | 'Bills' 
  | 'Healthcare' 
  | 'Education' 
  | 'Investment' 
  | 'Salary' 
  | 'Business' 
  | 'Freelance' 
  | 'Other';

export type PaymentMethod = 
  | 'UPI' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'Net Banking' 
  | 'Cash' 
  | 'Crypto';

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
  merchant: string;
  paymentMethod: PaymentMethod;
  date: string; // ISO string format YYYY-MM-DD
  time?: string;
  notes?: string;
  receiptUrl?: string;
  status: 'Completed' | 'Pending' | 'Flagged';
  createdAt?: any;
  updatedAt?: any;
}

export interface Budget {
  id: string;
  userId?: string;
  category: CategoryType;
  allocatedAmount: number; // monthlyLimit
  spentAmount: number; // spent
  color: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Goal {
  id: string;
  userId?: string;
  title: string; // goalName
  targetAmount: number;
  currentAmount: number; // savedAmount
  targetDate: string; // deadline
  categoryIcon: string; // icon
  category?: CategoryType;
  notes?: string;
  completed?: boolean;
  color: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Subscription {
  id: string;
  userId?: string;
  name: string; // serviceName
  logo: string;
  amount: number; // monthlyCost
  billingCycle: 'Monthly' | 'Yearly';
  renewalDate: string;
  category: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  createdAt?: any;
  updatedAt?: any;
}

export interface RecurringTransaction {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  nextDueDate: string;
  paymentMethod: PaymentMethod;
  status: 'Active' | 'Paused';
  merchant: string;
  createdAt?: any;
}

export interface BillItem {
  id: string;
  userId?: string;
  billName: string;
  amount: number;
  dueDate: string;
  category: CategoryType;
  autoPay: boolean;
  reminderDays: number;
  status: 'Upcoming' | 'Paid' | 'Overdue';
  createdAt?: any;
}

export interface SavingsChallenge {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  durationDays: number;
  progressDays: number;
  rewardXp: number;
  badgeIcon: string;
  completed: boolean;
}

export interface UserGamification {
  xp: number;
  level: number;
  levelTitle: string;
  dailyStreak: number;
  weeklyStreak: number;
  monthlyDiscipline: number;
}

export interface InvestmentItem {
  id: string;
  userId?: string;
  name: string;
  type: 'Stocks' | 'Mutual Funds' | 'SIP' | 'FD' | 'Crypto' | 'Gold' | 'PPF' | 'EPF' | 'NPS' | 'Bonds';
  investedAmount: number;
  currentValue: number;
  quantity?: number;
  purchaseDate: string;
  category: string;
  color: string;
  createdAt?: any;
}

export interface LoanItem {
  id: string;
  userId?: string;
  name: string; // e.g. HDFC Home Loan
  type: 'Personal Loan' | 'Home Loan' | 'Vehicle Loan' | 'Education Loan' | 'Credit Card EMI';
  totalLoanAmount: number;
  outstandingBalance: number;
  interestRatePct: number;
  emiAmount: number;
  remainingMonths: number;
  nextDueDate: string;
  lender: string;
  createdAt?: any;
}

export interface DocumentVaultItem {
  id: string;
  userId?: string;
  title: string;
  category: 'Receipt' | 'Invoice' | 'Tax Document' | 'Insurance' | 'Warranty' | 'Bank Statement' | 'Loan Doc';
  fileUrl: string;
  uploadDate: string;
  fileSize: string;
  notes?: string;
  linkedTransactionId?: string;
}

export interface NetWorthAsset {
  id: string;
  name: string;
  type: 'Asset' | 'Liability';
  category: 'Cash' | 'Bank' | 'Investments' | 'Gold' | 'Property' | 'Loans' | 'Credit Cards' | 'Other';
  value: number;
  institution?: string;
}

export interface ReceiptOCRResult {
  merchantName: string;
  totalAmount: number;
  subtotal?: number;
  taxAmount?: number;
  discount?: number;
  date: string;
  category: CategoryType;
  paymentMethod: PaymentMethod;
  confidenceScore: number; // e.g. 96%
  items: { name: string; price: number }[];
}

export interface TimelineExpense {
  id: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  time: string;
  title: string;
  category: CategoryType;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface SmartSyncSource {
  id: string;
  name: string;
  type: 'SMS' | 'Notification' | 'Gmail' | 'Bank Statement' | 'Manual';
  description: string;
  permissionStatus: 'Connected' | 'Disconnected' | 'Pending';
  lastSync: string;
  icon: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'Budget' | 'Goal' | 'Overspending' | 'Bill' | 'Milestone' | 'System';
  read: boolean;
  actionUrl?: string;
  createdAt?: any;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  currency: '₹' | '$' | '€' | '£';
  currencyCode: 'INR' | 'USD' | 'EUR' | 'GBP';
  country: string;
  monthlyIncome: number;
  occupation: string;
  theme: 'dark' | 'light' | 'system';
  notificationPreferences: {
    budgetAlerts: boolean;
    overspending: boolean;
    weeklyDigest: boolean;
    goalMilestones: boolean;
  };
}

export interface AIInsightCard {
  id: string;
  type: 'alert' | 'opportunity' | 'summary' | 'forecast';
  title: string;
  message: string;
  metric?: string;
  tag: string;
  impactLevel: 'high' | 'medium' | 'low';
}
