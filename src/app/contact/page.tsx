'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function ContactPage() {
  const { addToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    addToast('Concierge Notified', 'Thank you. Our luxury concierge will contact you shortly.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">PATRON CONCIERGE</span>
        <h1 className="text-4xl font-serif font-extrabold text-neutral-100">Get In Touch</h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
          Have a inquiry regarding bespoke suit fittings, custom bridal sizing, or order tracking? Contact us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="p-8 rounded-3xl glass-card border border-neutral-800 space-y-6">
          <h3 className="text-xl font-serif font-bold text-gold-gradient">AL-JO Flagship Atelier</h3>
          <div className="space-y-4 text-xs text-neutral-300">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>402 Royal Residency, Promenade Road, Bandra West, Mumbai, Maharashtra 400050</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>+91 (022) 2640 9821 / +91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>concierge@aljofashion.com</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl glass-card border border-amber-500/20 space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Your Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Message / Inquiry *</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Send Inquiry <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
