'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, addToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
        setUser(data.user);
        addToast('Welcome Back!', `Logged in as ${data.user.name}`, 'success');
        if (data.user.role?.toUpperCase() === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/account');
        }
      } else {
        setError(data.error || 'Invalid login credentials.');
      }
    } catch {
      setLoading(false);
      setError('Network error during login.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    executeLogin(email, password);
  };

  // 1-Click Instant Demo Login Helper
  const fillAndLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    executeLogin(demoEmail, demoPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">AL-JO FASHION PASS</span>
        <h1 className="text-3xl font-serif font-extrabold text-neutral-100">Sign In to Your Account</h1>
        <p className="text-xs text-neutral-400">Access order tracking, saved addresses, and patron privileges</p>
      </div>

      {/* Quick Demo Login Preset Buttons */}
      <div className="glass-card rounded-2xl p-4 border border-amber-500/30 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Login:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillAndLogin('admin@aljo.com', 'admin123')}
            className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs text-left cursor-pointer transition-colors"
          >
            <div className="font-bold flex items-center justify-between">
              <span>👑 Store Owner</span>
            </div>
            <span className="text-[10px] text-neutral-400 block truncate">admin@aljo.com</span>
          </button>

          <button
            type="button"
            onClick={() => fillAndLogin('user@aljo.com', 'user123')}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:border-amber-400 text-xs text-left cursor-pointer transition-colors"
          >
            <div className="font-bold flex items-center justify-between">
              <span>👤 Customer</span>
            </div>
            <span className="text-[10px] text-neutral-400 block truncate">user@aljo.com</span>
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-neutral-800">
        {error && <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs">{error}</div>}

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aljo.com"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <div className="text-center pt-2 text-xs text-neutral-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-amber-300 font-bold hover:underline">
            Register Account
          </Link>
        </div>
      </form>
    </div>
  );
}
