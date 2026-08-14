'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Sparkles,
  PackageCheck,
  LayoutDashboard,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const { user, totalCartCount, wishlist, setIsCartOpen, setIsSearchOpen, setUser, addToast } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsUserMenuOpen(false);
    addToast('Logged Out', 'You have been signed out of AL-JO Fashion.', 'info');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop All', href: '/shop' },
    { name: 'Men', href: '/shop?gender=men' },
    { name: 'Women', href: '/shop?gender=women' },
    { name: 'Kids', href: '/shop?category=kids' },
    { name: 'New Arrivals', href: '/shop?newArrival=true' },
    { name: 'Offers', href: '/shop?bestSeller=true' },
  ];

  return (
    <>
      {/* 1. Subtle Champagne Announcement Ticker */}
      <div className="bg-gradient-to-r from-[#f7ede2] via-[#faf2ea] to-[#f7ede2] text-[#5e493c] text-xs py-2.5 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-2 border-b border-[#ebdccf] shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#c89d7c] animate-pulse" />
        <span>ROYAL ELEGANCE COLLECTION '26 — COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER ₹2,999</span>
        <span className="hidden md:inline-block text-[#c89d7c]/60">|</span>
        <span className="hidden md:inline-block underline cursor-pointer hover:text-[#c89d7c]" onClick={() => setIsSearchOpen(true)}>
          USE CODE: <strong className="text-[#a66e4e]">WELCOME20</strong> FOR 20% OFF
        </span>
      </div>

      {/* 2. Main Glassmorphism Navbar */}
      <header className="sticky top-0 z-40 glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-[#332720] hover:text-[#c89d7c] focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="group flex flex-col items-center">
                <span className="text-3xl font-extrabold tracking-widest text-gold-gradient font-serif group-hover:scale-105 transition-transform duration-300">
                  AL-JO
                </span>
                <span className="text-[9px] tracking-[0.4em] text-[#a67c5b] uppercase font-semibold">
                  FASHION COUTURE
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-9">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-semibold tracking-wide transition-colors duration-200 relative py-1 ${
                      isActive ? 'text-[#c89d7c] font-bold' : 'text-[#54463d] hover:text-[#c89d7c]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gold-gradient rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-[#332720] hover:text-[#c89d7c] transition-colors rounded-full hover:bg-[#f4ece1]"
                title="Search Store"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/account?tab=wishlist"
                className="p-2.5 text-[#332720] hover:text-[#c89d7c] transition-colors relative rounded-full hover:bg-[#f4ece1]"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c89d7c] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 text-[#332720] hover:text-[#c89d7c] transition-colors relative rounded-full hover:bg-[#f4ece1]"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-gradient text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* User Profile / Admin Menu */}
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-full border border-[#e3d5c5] bg-white text-[#332720] text-xs shadow-sm hover:border-[#c89d7c]"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#f4ece1] text-[#a66e4e] font-extrabold flex items-center justify-center uppercase border border-[#e8c9b0]">
                        {user.name ? user.name[0] : 'U'}
                      </div>
                      <span className="hidden sm:inline font-semibold max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#7a6b61]" />
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white border border-[#ede2d5] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
                        <div className="px-4 py-2.5 border-b border-[#f4ece1]">
                          <p className="text-sm font-semibold text-[#332720]">{user.name}</p>
                          <p className="text-xs text-[#7a6b61] truncate">{user.email}</p>
                          {user.role === 'ADMIN' && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold bg-[#f4ece1] text-[#a66e4e] rounded-full border border-[#e8c9b0]">
                              STORE OWNER / ADMIN
                            </span>
                          )}
                        </div>

                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-[#a66e4e] hover:bg-[#faf2ea] font-semibold"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-3 text-[#c89d7c]" />
                            Owner Dashboard
                          </Link>
                        )}

                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-[#332720] hover:bg-[#faf2ea]"
                        >
                          <UserIcon className="w-4 h-4 mr-3 text-[#7a6b61]" />
                          My Profile
                        </Link>

                        <Link
                          href="/account?tab=orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-[#332720] hover:bg-[#faf2ea]"
                        >
                          <PackageCheck className="w-4 h-4 mr-3 text-[#7a6b61]" />
                          My Orders
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2.5 text-sm text-[#a84444] hover:bg-red-50 border-t border-[#f4ece1]"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center px-5 py-2 border border-[#c89d7c] text-xs font-bold rounded-full text-[#a66e4e] hover:bg-[#c89d7c] hover:text-white transition-colors shadow-sm"
                  >
                    <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#ede2d5] bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 text-base font-semibold text-[#332720] hover:text-[#c89d7c] border-b border-[#f4ece1]"
              >
                {link.name}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 text-base font-bold text-[#a66e4e] bg-[#f4ece1] rounded-xl px-3 mt-2"
              >
                👑 Owner / Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
