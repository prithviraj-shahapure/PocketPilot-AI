import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  BarChart3, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Lock, 
  CreditCard, 
  RefreshCw 
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      icon: Sparkles,
      title: 'AI Financial Intelligence',
      description: 'Automated expense predictions, budget risk meters, and overspending warnings before you exceed limits.',
      color: 'text-brand-400',
    },
    {
      icon: RefreshCw,
      title: 'Smart Sync Technology',
      description: 'Privacy-first SMS parser, notification reader, and PDF bank statement processing right in your browser.',
      color: 'text-emerald-400',
    },
    {
      icon: Smartphone,
      title: 'Native Progressive Web App',
      description: 'Install directly on iOS, Android, or Desktop. Works seamlessly offline with zero app store downloads.',
      color: 'text-cyan-400',
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics Suite',
      description: 'Interactive cash flow streams, category heatmaps, and savings trend forecasting powered by Recharts.',
      color: 'text-purple-400',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Cloud Data Selling',
      description: 'Your financial privacy is guaranteed. All transaction processing occurs locally on your device.',
      color: 'text-amber-400',
    },
    {
      icon: CreditCard,
      title: 'Active Subscription Manager',
      description: 'Never get hit by forgotten trial renewals. Automated payment alerts for Netflix, Spotify, ChatGPT & more.',
      color: 'text-pink-400',
    },
  ];

  const faqs = [
    {
      q: 'How does PocketPilot AI protect my financial privacy?',
      a: 'PocketPilot AI runs 100% client-side in your web browser. No financial login credentials, passwords, or transaction data leave your device. All data parsing occurs locally.',
    },
    {
      q: 'Can I install PocketPilot AI on my mobile phone?',
      a: 'Yes! PocketPilot AI is built as a commercial-grade PWA. Simply open the web app on Safari (iOS) or Chrome (Android) and select "Add to Home Screen" to install it like a native app.',
    },
    {
      q: 'How does the AI Coach work without backend calls?',
      a: 'PocketPilot AI includes an embedded client-side predictive algorithm that evaluates your spending rate against monthly historical baselines to generate real-time risk alerts.',
    },
    {
      q: 'Is there a free tier available?',
      a: 'Yes, our Starter tier is 100% free forever with complete manual tracking, basic charts, and PWA installation.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans selection:bg-brand-600">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#070A0F]/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="PocketPilot AI" className="h-10 object-contain" />
          </NavLink>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Live Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <NavLink to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </NavLink>
            <NavLink to="/dashboard">
              <Button variant="primary" size="sm" icon={ArrowRight}>Launch App</Button>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-brand-500/30 mb-8 text-xs font-bold text-brand-300">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Next-Gen Autonomous AI Personal Finance Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Track Smarter. Spend Better. <span className="text-gradient">Save Faster.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              PocketPilot AI is your proactive personal finance operating system. Automatic expense tracking, budget risk forecasting, subscription alerts, and AI financial coaching.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <NavLink to="/dashboard">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Get Started Free
                </Button>
              </NavLink>
              <a href="#features">
                <Button variant="glass" size="lg">
                  Explore Features
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-brand-400 uppercase tracking-widest">Core Capabilities</span>
            <h2 className="text-3xl font-extrabold text-white">Engineered for Complete Financial Clarity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl glass-card border border-slate-800 hover:border-brand-500/40 transition-all space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <IconComp className={`w-6 h-6 ${feat.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">Everything you need to know about PocketPilot AI</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="p-5 rounded-2xl glass-card border border-slate-800 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-brand-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
                {openFaq === idx && (
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed border-t border-slate-800 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-10 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PocketPilot AI" className="h-8 object-contain" />
            <span>© 2026 PocketPilot Technologies Inc. All rights reserved.</span>
          </div>

          <div className="flex gap-6 text-slate-400 font-semibold">
            <NavLink to="/dashboard" className="hover:text-white">App Shell</NavLink>
            <NavLink to="/smart-sync" className="hover:text-white">Privacy</NavLink>
            <NavLink to="/settings" className="hover:text-white">PWA Config</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
};
