'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, X } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminCouponsPage() {
  const { addToast } = useStore();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('1000');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    fetch('/api/coupons')
      .then((res) => res.json())
      .then((data) => {
        setCoupons(data.coupons || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderValue: parseFloat(minOrderValue || '0'),
        }),
      });

      if (res.ok) {
        addToast('Coupon Created', `Created promo code ${code.toUpperCase()}`, 'success');
        setCode('');
        setDiscountValue('');
        setIsModalOpen(false);
        fetchCoupons();
      }
    } catch {
      addToast('Error', 'Failed to create coupon.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">PROMOTIONS &amp; DISCOUNTS</span>
          <h1 className="text-3xl font-serif font-extrabold text-neutral-100">Coupon Codes Manager</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gold-gradient text-neutral-950 font-bold text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-neutral-400">Loading coupons...</p>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-neutral-800">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900/80 text-amber-400 uppercase tracking-widest text-[10px] font-bold border-b border-neutral-800">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Min Purchase</th>
                <th className="p-4">Times Used</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-900/40">
                  <td className="p-4 font-mono font-bold text-amber-300">{c.code}</td>
                  <td className="p-4">{c.discountType}</td>
                  <td className="p-4 font-bold text-neutral-100">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </td>
                  <td className="p-4">₹{c.minOrderValue.toLocaleString()}</td>
                  <td className="p-4">{c.timesUsed} redemptions</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4 max-w-md w-full">
            <h3 className="text-lg font-serif font-bold text-gold-gradient">Create New Promo Code</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Coupon Code (e.g. GOLD2026)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                >
                  <option value="PERCENTAGE">Percentage (% Off)</option>
                  <option value="FIXED">Fixed Currency Amount (₹ Off)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Discount Value *</label>
                <input
                  type="number"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="e.g. 15 for 15% or 500 for ₹500"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-gradient text-neutral-950 font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
