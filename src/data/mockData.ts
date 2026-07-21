import { 
  Transaction, 
  Budget, 
  Goal, 
  Subscription, 
  TimelineExpense, 
  SmartSyncSource, 
  NotificationItem, 
  UserProfile, 
  AIInsightCard 
} from '../types';

export const initialProfile: UserProfile = {
  name: 'Pilot User',
  email: 'user@pocketpilot.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  currency: '₹',
  currencyCode: 'INR',
  country: 'India',
  monthlyIncome: 0,
  occupation: 'Account Owner',
  theme: 'dark',
  notificationPreferences: {
    budgetAlerts: true,
    overspending: true,
    weeklyDigest: true,
    goalMilestones: true,
  },
};

export const initialTransactions: Transaction[] = [];
export const initialBudgets: Budget[] = [];
export const initialGoals: Goal[] = [];
export const initialSubscriptions: Subscription[] = [];
export const initialTimeline: TimelineExpense[] = [];

export const initialSmartSyncSources: SmartSyncSource[] = [
  {
    id: 'sync-1',
    name: 'SMS Transaction Ingestion',
    type: 'SMS',
    description: 'Automatically reads bank debit/credit SMS alerts to extract instant ledger transactions.',
    permissionStatus: 'Connected',
    lastSync: 'Active',
    icon: 'MessageSquare',
  },
  {
    id: 'sync-2',
    name: 'UPI Notification Tracking',
    type: 'Notification',
    description: 'Intercepts GPay, PhonePe, and Paytm transaction push notifications.',
    permissionStatus: 'Connected',
    lastSync: 'Active',
    icon: 'Bell',
  },
  {
    id: 'sync-3',
    name: 'Gmail E-Receipt Extraction',
    type: 'Gmail',
    description: 'Scans inbox for Uber, Swiggy, Amazon, and SaaS digital invoices.',
    permissionStatus: 'Disconnected',
    lastSync: 'Never',
    icon: 'Mail',
  },
  {
    id: 'sync-4',
    name: 'PDF / CSV Bank Statement Auto-Import',
    type: 'Bank Statement',
    description: 'Upload HDFC, ICICI, SBI, Axis PDF statements or custom CSV files for automatic ledger parsing.',
    permissionStatus: 'Connected',
    lastSync: 'Ready',
    icon: 'FileText',
  },
];

export const initialNotifications: NotificationItem[] = [];
export const initialAIInsights: AIInsightCard[] = [];
