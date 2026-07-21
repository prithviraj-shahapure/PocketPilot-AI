import React, { useState } from 'react';
import { User, Mail, DollarSign, Briefcase, Globe, Bell, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState<'₹' | '$' | '€' | '£'>(user.currency);
  const [country, setCountry] = useState(user.country);
  const [monthlyIncome, setMonthlyIncome] = useState(user.monthlyIncome.toString());
  const [occupation, setOccupation] = useState(user.occupation);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      currency,
      currencyCode: currency === '₹' ? 'INR' : currency === '$' ? 'USD' : currency === '€' ? 'EUR' : 'GBP',
      country,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
      occupation,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User Account Cockpit</h1>
          <p className="text-xs text-slate-400 mt-1">Manage personal metrics, income baseline, and currency units.</p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> Profile details saved successfully.
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500 shadow-xl"
            />
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.occupation} • {user.country}</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold border border-brand-500/30 mt-1">
                Verified Pro Pilot User
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Monthly Income Baseline"
              type="number"
              icon={DollarSign}
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
            <Input
              label="Occupation / Designation"
              icon={Briefcase}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Currency Unit
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
              >
                <option value="₹">₹ INR - Indian Rupee</option>
                <option value="$">$ USD - US Dollar</option>
                <option value="€">€ EUR - Euro</option>
                <option value="£">£ GBP - British Pound</option>
              </select>
            </div>

            <Input
              label="Country"
              icon={Globe}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button type="submit" variant="primary" icon={Check}>
              Save Profile Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
