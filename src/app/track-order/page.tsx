'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Search, ArrowRight, Package } from 'lucide-react';

export default function TrackOrderSearchPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    router.push(`/track-order/${orderNumber.trim()}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">EXPRESS LOGISTICS</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-neutral-100">Track Your Parcel</h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
          Enter your AL-JO Order ID (e.g. <strong className="text-amber-300">ALJO-89231</strong> or <strong className="text-amber-300">ALJO-94821</strong>) to view real-time status.
        </p>
      </div>

      <form onSubmit={handleTrack} className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-amber-500/20">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Enter Order ID (e.g. ALJO-89231)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 text-sm sm:text-base rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-amber-400 uppercase font-mono"
          />
        </div>
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 shadow-xl"
        >
          Locate Shipment <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="glass-card rounded-2xl p-6 border border-neutral-800 text-xs text-neutral-400 space-y-2">
        <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px]">Demo Track Numbers to Test Instant Tracking:</h4>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setOrderNumber('ALJO-89231')}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-300 hover:border-amber-400 font-mono"
          >
            ALJO-89231 (SHIPPED)
          </button>
          <button
            onClick={() => setOrderNumber('ALJO-94821')}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-300 hover:border-amber-400 font-mono"
          >
            ALJO-94821 (DELIVERED)
          </button>
        </div>
      </div>
    </div>
  );
}
