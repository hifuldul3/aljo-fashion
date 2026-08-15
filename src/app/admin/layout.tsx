'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  LogOut,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, addToast } = useStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is logged in as ADMIN
    const checkAdminStatus = async () => {
      if (!user) {
        try {
          const res = await fetch('/api/auth/me');
          const data = await res.json();
          if (data.user && data.user.role === 'ADMIN') {
            setUser(data.user);
            setCheckingAuth(false);
          } else {
            addToast('Access Denied', 'Store Owner / Admin login required to access dashboard.', 'error');
            router.push('/login');
          }
        } catch {
          router.push('/login');
        }
      } else if (user.role !== 'ADMIN') {
        addToast('Access Denied', 'You do not have owner permissions to view this portal.', 'error');
        router.push('/login');
      } else {
        setCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, [user, router, setUser, addToast]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    addToast('Admin Logged Out', 'Signed out of AL-JO Owner Dashboard.', 'info');
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview & Analytics', href: '/admin', icon: LayoutDashboard },
    { name: 'Product Catalog', href: '/admin/products', icon: Package },
    { name: 'Inventory Manager', href: '/admin/inventory', icon: Layers },
    { name: 'Order Management', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customer Roster', href: '/admin/customers', icon: Users },
    { name: 'Coupons & Offers', href: '/admin/coupons', icon: Tag },
    { name: 'Content Banners', href: '/admin/banners', icon: ImageIcon },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest flex items-center gap-2">
          <Lock className="w-4 h-4" /> Verifying Store Owner Security Credentials...
        </p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-neutral-100">Store Owner Access Required</h2>
        <p className="text-xs text-neutral-400 max-w-sm">
          This portal is strictly restricted to authenticated Store Managers &amp; Admins.
        </p>
        <Link href="/login" className="px-6 py-2.5 rounded-full bg-gold-gradient text-neutral-950 text-xs font-bold">
          Log In as Store Owner
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-amber-500/20 p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Brand & Badge */}
          <div className="space-y-2 border-b border-neutral-800 pb-4">
            <Link href="/" className="inline-block">
              <span className="text-xl font-extrabold tracking-widest text-gold-gradient font-serif">AL-JO</span>
              <span className="block text-[8px] tracking-[0.35em] text-neutral-400 uppercase">OWNER DASHBOARD</span>
            </Link>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>STORE OWNER CONTROL</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pt-6 border-t border-neutral-800">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs text-amber-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Exit Admin Session
          </button>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
