import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">THE ATELIER STORY</span>
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-neutral-100">Bespoke Elegance Redefined</h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
          AL-JO Fashion was conceived as a tribute to fine tailoring, European velvet weaves, and hand-stitched leather luxury.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl glass-card border border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-neutral-100">Italian Velvet &amp; Silk</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Every fabric in our collection is handpicked from centuries-old mills in Como and Biella, ensuring flawless texture.
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-card border border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-neutral-100">Zero Mass-Production</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            We produce limited runs of 50-100 pieces per design, guaranteeing exclusivity for our discerning patrons.
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-card border border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-neutral-100">24K Gold Hardware</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Our leather totes and bags feature custom 24K gold plated brass locks, crafted to withstand decades of use.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link href="/shop" className="inline-flex items-center px-8 py-4 rounded-full bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider">
          Explore Haute Collection <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
