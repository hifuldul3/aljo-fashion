'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { addToast } = useStore();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }
    addToast('Welcome to AL-JO VIP Circle', 'You have been subscribed to exclusive haute couture previews.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-amber-500/20 pt-16 pb-8">
      {/* Value Proposition Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 pb-12 border-b border-neutral-900 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">Express Delivery</h4>
            <p className="text-xs text-neutral-500">Free shipping on orders &gt; ₹2,999</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">Italian Craftsmanship</h4>
            <p className="text-xs text-neutral-500">100% Authentic haute couture</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">Easy Returns</h4>
            <p className="text-xs text-neutral-500">14-day seamless exchange policy</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">Secure Payments</h4>
            <p className="text-xs text-neutral-500">Razorpay, UPI &amp; Cards protected</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-extrabold tracking-widest text-gold-gradient font-serif">AL-JO</span>
            <span className="block text-[9px] tracking-[0.35em] text-neutral-400 uppercase">FASHION COUTURE</span>
          </Link>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
            AL-JO Fashion embodies understated luxury, bespoke tailoring, and timeless elegance. Tailored for modern
            connoisseurs who appreciate Italian fabrics and flawless craftsmanship.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="#" className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:border-amber-400 hover:text-amber-400 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:border-amber-400 hover:text-amber-400 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:border-amber-400 hover:text-amber-400 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">Collections</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/shop?gender=men" className="hover:text-amber-400 transition-colors">Men’s Apparel</Link></li>
            <li><Link href="/shop?gender=women" className="hover:text-amber-400 transition-colors">Women’s Couture</Link></li>
            <li><Link href="/shop?category=kids" className="hover:text-amber-400 transition-colors">Junior Royalty</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-amber-400 transition-colors">Leather &amp; Accessories</Link></li>
            <li><Link href="/shop?newArrival=true" className="hover:text-amber-400 transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">Customer Care</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/account?tab=orders" className="hover:text-amber-400 transition-colors">Order Tracking</Link></li>
            <li><Link href="/account?tab=addresses" className="hover:text-amber-400 transition-colors">Shipping &amp; Delivery</Link></li>
            <li><Link href="/about" className="hover:text-amber-400 transition-colors">About AL-JO</Link></li>
            <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Concierge</Link></li>
            <li><Link href="/admin" className="text-amber-400 hover:underline">Owner / Admin Login</Link></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">The VIP Circle</h3>
          <p className="text-xs text-neutral-400 mb-3">
            Subscribe for private trunk show invitations, new arrival drops, and exclusive discounts.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="w-full bg-gold-gradient text-neutral-950 font-bold text-xs py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Subscribe Concierge
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <p>© 2026 AL-JO Fashion Ltd. All rights reserved. Built with Next.js &amp; Tailwind CSS.</p>
        <div className="flex items-center space-x-3 text-neutral-400 font-mono text-[10px]">
          <span className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800">RAZORPAY READY</span>
          <span className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800">UPI / CARDS</span>
          <span className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800">COD AVAILABLE</span>
        </div>
      </div>
    </footer>
  );
}
