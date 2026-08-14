'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
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

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-amber-500/20 text-neutral-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-gold-gradient">YOUR SHOPPING BAG</h2>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-100 rounded-full hover:bg-neutral-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600">
                  <ShoppingBag className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-base font-semibold text-neutral-300">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Discover our latest Royal Elegance collection and add luxury pieces to your wardrobe.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center px-6 py-2.5 rounded-full bg-gold-gradient text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Explore Collection <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/30 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg flex-shrink-0 bg-neutral-800"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-neutral-200 line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.variant && (
                        <div className="flex items-center space-x-2 text-xs text-neutral-400 mt-1">
                          <span>Size: <strong className="text-neutral-200">{item.variant.size}</strong></span>
                          <span>•</span>
                          <span>Color: <strong className="text-neutral-200">{item.variant.color}</strong></span>
                        </div>
                      )}
                      <div className="mt-2 text-sm font-bold text-amber-300">
                        ₹{item.price.toLocaleString()}
                        {item.discountPrice && (
                          <span className="text-xs text-neutral-500 line-through ml-2">
                            ₹{item.discountPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/60">
                      <div className="flex items-center space-x-2 border border-neutral-700/60 rounded-lg px-2 py-1 bg-neutral-950">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-neutral-400 hover:text-white p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-neutral-200 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-neutral-400 hover:text-white p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-neutral-400">
                        Subtotal: <strong className="text-neutral-200">₹{(item.price * item.quantity).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-900 bg-neutral-950/90 space-y-4">
              {/* Coupon Form */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                    <div className="flex items-center space-x-2 text-amber-300">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code <strong>{appliedCoupon.code}</strong> Applied</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-neutral-400 hover:text-red-400 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Coupon Code (e.g. WELCOME20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-neutral-800 border border-neutral-700 hover:border-amber-400 text-amber-300 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-neutral-400 pt-2 border-t border-neutral-900">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-200">₹{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-400 uppercase">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-neutral-100 pt-2 border-t border-neutral-800">
                  <span>Estimated Total</span>
                  <span className="text-lg text-gold-gradient font-serif">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center py-3 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/10"
                >
                  PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full block text-center py-2 text-xs text-neutral-400 hover:text-amber-300 transition-colors"
                >
                  View Full Cart &amp; Details
                </Link>
              </div>

              <div className="flex items-center justify-center text-[10px] text-neutral-500 space-x-2 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Encrypted 256-Bit SSL Checkout Security</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
