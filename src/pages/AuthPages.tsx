import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export const AuthPages: React.FC<{ initialMode?: 'login' | 'register' | 'forgot' }> = ({
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { login, register, googleLogin, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleFirebaseError = (err: any) => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Invalid credentials. Please check your email and password.';
      case 'auth/user-not-found':
        return 'No registered account found with this email.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Google authentication popup was closed.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return err?.message || 'An authentication error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setIsSubmitting(true);
      try {
        await resetPassword(email);
        setSuccessMsg('Password reset email dispatched! Check your inbox for instructions.');
      } catch (err: any) {
        setErrorMsg(handleFirebaseError(err));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your password.');
        return;
      }

      setIsSubmitting(true);
      try {
        await register(name || 'Alex Mercer', email, password);
        navigate('/dashboard');
      } catch (err: any) {
        setErrorMsg(handleFirebaseError(err));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        await login(email, password, rememberMe);
        navigate('/dashboard');
      } catch (err: any) {
        setErrorMsg(handleFirebaseError(err));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsGoogleSubmitting(true);
    try {
      await googleLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(handleFirebaseError(err));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 glass-panel rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Animated Brand Illustration */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950/60 border-r border-slate-800 relative overflow-hidden">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="PocketPilot AI" className="h-10 object-contain" />
          </NavLink>

          <div className="my-auto py-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-48 h-48 mx-auto relative flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-brand-600/20 blur-xl animate-pulse" />
              <div className="w-40 h-40 rounded-3xl glass-card border border-brand-500/40 p-5 flex flex-col justify-between shadow-2xl">
                <div className="flex justify-between items-center">
                  <Sparkles className="w-6 h-6 text-brand-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Firebase Auth</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Monthly Savings</span>
                  <p className="text-2xl font-extrabold text-white mt-0.5">₹80,200</p>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full w-[78%]" />
                </div>
              </div>
            </motion.div>

            <h3 className="text-xl font-bold text-white text-center mt-6">
              Empowering Smart Financial Decisions
            </h3>
            <p className="text-xs text-slate-400 text-center mt-2 leading-relaxed max-w-xs mx-auto">
              Real-time cash flow analytics, AI overspending alerts, and bank statement privacy protection.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secured with Firebase Authentication
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="p-6 sm:p-10 flex flex-col justify-center bg-slate-900/60">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create PocketPilot Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login' && 'Enter your credentials to access your financial cockpit'}
              {mode === 'register' && 'Join thousands managing wealth smarter with AI'}
              {mode === 'forgot' && 'Enter your registered email to receive reset instructions'}
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input
                label="Full Name"
                icon={User}
                required
                placeholder="e.g. Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              required
              placeholder="alex@pocketpilot.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {mode !== 'forgot' && (
              <Input
                label="Password"
                type="password"
                icon={Lock}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            {mode === 'register' && (
              <Input
                label="Confirm Password"
                type="password"
                icon={Lock}
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg(null);
                  }}
                  className="text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              icon={ArrowRight}
              isLoading={isSubmitting}
            >
              {mode === 'login' && 'Sign In to Cockpit'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Instructions'}
            </Button>
          </form>

          {/* Social Auth Divider */}
          {mode !== 'forgot' && (
            <>
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative px-3 bg-slate-900 text-[11px] font-semibold text-slate-500 uppercase">
                  Or continue with
                </span>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleSubmitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl glass-card border border-slate-700/80 hover:bg-slate-800/80 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
              >
                {isGoogleSubmitting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                )}
                <span>Google Account</span>
              </button>
            </>
          )}

          {/* Mode Switcher */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-brand-400 hover:text-brand-300 ml-1 cursor-pointer"
                >
                  Create One
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-brand-400 hover:text-brand-300 ml-1 cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
