import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { PWAProvider } from './context/PWAContext';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { MobileFAB } from './components/layout/MobileFAB';
import { PWAInstallBanner } from './components/layout/PWAInstallBanner';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AICopilotPanel } from './components/copilot/AICopilotPanel';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Lazy-Loaded Pages for Route Code-Splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const AuthPages = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.AuthPages })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage })));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage').then((m) => ({ default: m.BudgetsPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then((m) => ({ default: m.GoalsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const AICoachPage = lazy(() => import('./pages/AICoachPage').then((m) => ({ default: m.AICoachPage })));
const TimelinePage = lazy(() => import('./pages/TimelinePage').then((m) => ({ default: m.TimelinePage })));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage })));
const SmartSyncPage = lazy(() => import('./pages/SmartSyncPage').then((m) => ({ default: m.SmartSyncPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NetWorthPage = lazy(() => import('./pages/NetWorthPage').then((m) => ({ default: m.NetWorthPage })));
const InvestmentsPage = lazy(() => import('./pages/InvestmentsPage').then((m) => ({ default: m.InvestmentsPage })));
const LoansPage = lazy(() => import('./pages/LoansPage').then((m) => ({ default: m.LoansPage })));
const DocumentVaultPage = lazy(() => import('./pages/DocumentVaultPage').then((m) => ({ default: m.DocumentVaultPage })));
const SecurityCenterPage = lazy(() => import('./pages/SecurityCenterPage').then((m) => ({ default: m.SecurityCenterPage })));

// Full Screen Loading Indicator using PocketPilot AI official logo
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <div className="absolute w-96 h-96 bg-brand-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
    <div className="relative mb-6">
      <img
        src="/logo-icon.png"
        alt="PocketPilot AI"
        className="w-20 h-20 object-contain rounded-2xl shadow-2xl shadow-brand-500/40 animate-pulse transition-transform duration-700 hover:scale-105"
      />
    </div>
    <h3 className="text-xl font-extrabold text-white tracking-tight">PocketPilot AI</h3>
    <p className="text-xs text-slate-400 mt-1">Authenticating session token & syncing Firestore...</p>
  </div>
);

// Route Fallback Loading Indicator
const RouteFallback: React.FC = () => (
  <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
    <img src="/logo-icon.png" alt="PocketPilot AI" className="w-10 h-10 object-contain animate-pulse" />
    <span className="text-xs text-slate-400 font-semibold">Loading Module...</span>
  </div>
);

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Public Route Guard (redirect logged-in users to /dashboard)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Main Router App Shell
const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const location = useLocation();

  const publicPaths = ['/', '/login', '/register', '/forgot-password'];
  const isPublicPage = publicPaths.includes(location.pathname);

  if (isPublicPage) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><AuthPages initialMode="login" /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><AuthPages initialMode="register" /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><AuthPages initialMode="forgot" /></PublicRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans selection:bg-brand-600">
        <OfflineBanner />
        <PWAInstallBanner />

        <div className="flex flex-1 relative">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
            <Header
              setMobileOpen={setMobileOpen}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard onOpenAddExpense={() => setIsAddExpenseOpen(true)} />} />
                  <Route path="/transactions" element={<TransactionsPage onOpenAddExpense={() => setIsAddExpenseOpen(true)} />} />
                  <Route path="/budgets" element={<BudgetsPage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/net-worth" element={<NetWorthPage />} />
                  <Route path="/investments" element={<InvestmentsPage />} />
                  <Route path="/loans" element={<LoansPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/ai-coach" element={<AICoachPage />} />
                  <Route path="/timeline" element={<TimelinePage />} />
                  <Route path="/subscriptions" element={<SubscriptionsPage />} />
                  <Route path="/documents" element={<DocumentVaultPage />} />
                  <Route path="/smart-sync" element={<SmartSyncPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/security" element={<SecurityCenterPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>

        <BottomNav />
        <MobileFAB onOpen={() => setIsAddExpenseOpen(true)} />
        <AICopilotPanel />

        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FinanceProvider>
          <PWAProvider>
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </PWAProvider>
        </FinanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
