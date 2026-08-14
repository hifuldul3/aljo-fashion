'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function FullCartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    if (!res.success) setCouponError(res.message);
    else setCouponCode('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-3xl font-serif font-extrabold text-gold-gradient">YOUR SHOPPING BAG</h1>
        <p className="text-xs text-neutral-400 mt-1">Review your selected couture garments before proceeding to checkout</p>
      </div>

      {cart.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-3xl p-8 space-y-4 max-w-md mx-auto border border-neutral-800">
          <ShoppingBag className="w-16 h-16 text-neutral-600 mx-auto" />
          <h2 className="text-xl font-bold text-neutral-200">Your bag is currently empty</h2>
          <p className="text-xs text-neutral-400">
            Explore our curated collections of tuxedos, silk gowns, and handcrafted leather accessories.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 rounded-full bg-gold-gradient text-neutral-950 font-bold text-xs"
          >
            Start Shopping <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl glass-card border border-neutral-800 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 gap-4"
                >
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-xl bg-neutral-800 flex-shrink-0"
                    />
                    <div>
                      <Link href={`/product/${item.slug}`} className="text-sm font-semibold text-neutral-100 hover:text-amber-300">
                        {item.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-neutral-400 mt-1">
                          Size: <strong className="text-neutral-200">{item.variant.size}</strong> • Color:{' '}
                          <strong className="text-neutral-200">{item.variant.color}</strong>
                        </p>
                      )}
                      <div className="text-sm font-bold text-amber-300 mt-2">
                        ₹{item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Stepper & Subtotal */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
                    <div className="flex items-center space-x-2 border border-neutral-700/60 rounded-xl px-3 py-1 bg-neutral-950">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-neutral-400 hover:text-white p-1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-neutral-200 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-neutral-400 hover:text-white p-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block">Subtotal</span>
                      <span className="text-sm font-bold text-neutral-100">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-500 hover:text-red-400 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl glass-card border border-amber-500/20 space-y-6">
              <h3 className="text-lg font-serif font-bold text-neutral-100 border-b border-neutral-800 pb-3">
                Order Summary
              </h3>

              {/* Coupon Box */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                    <div className="flex items-center space-x-2 text-amber-300">
                      <Tag className="w-4 h-4" />
                      <span>Code <strong>{appliedCoupon.code}</strong> Applied</span>
                    </div>
                    <button onClick={removeCoupon} className="text-neutral-400 hover:text-red-400 font-bold">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-neutral-800 border border-neutral-700 text-amber-300 font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-xs text-red-400">{couponError}</p>}
              </div>

              {/* Cost Rows */}
              <div className="space-y-3 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-neutral-100">₹{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Promo Discount</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between items-center text-base font-bold text-neutral-100 pt-3 border-t border-neutral-800">
                  <span>Total Amount</span>
                  <span className="text-2xl text-gold-gradient font-serif">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center py-4 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-xl"
              >
                PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
