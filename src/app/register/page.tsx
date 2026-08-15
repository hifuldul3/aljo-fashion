'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, ShieldCheck, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, addToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Show / Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPasswordMatching = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure Create Password and Confirm Password match.');
      addToast('Password Mismatch', 'Create Password and Confirm Password must match.', 'error');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
        setUser(data.user);
        addToast('Account Created Successfully!', `Welcome to AL-JO Fashion, ${data.user.name}`, 'success');
        router.push('/account');
      } else {
        setError(data.error || 'Failed to create account.');
      }
    } catch {
      setLoading(false);
      setError('Network error creating account.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">JOIN THE VIP CIRCLE</span>
        <h1 className="text-3xl font-serif font-extrabold text-neutral-100">Create Patron Account</h1>
        <p className="text-xs text-neutral-400">Unlock private trunk previews, saved addresses, and express checkout</p>
      </div>

      <form onSubmit={handleRegister} className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-neutral-800">
        {error && <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-medium">{error}</div>}

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Create Password */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">Create Password *</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-neutral-300 block">Confirm Password *</label>
            {isPasswordMatching && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords Match
              </span>
            )}
            {isPasswordMismatch && (
              <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Passwords Do Not Match
              </span>
            )}
          </div>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={`w-full bg-neutral-900 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-neutral-200 focus:outline-none transition-colors ${
                isPasswordMatching
                  ? 'border-emerald-500/60 focus:border-emerald-400'
                  : isPasswordMismatch
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-neutral-800 focus:border-amber-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || isPasswordMismatch}
          className="w-full py-3.5 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Patron Account'}
        </button>

        <div className="text-center pt-2 text-xs text-neutral-400">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-300 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </form>
    </div>
  );
}
