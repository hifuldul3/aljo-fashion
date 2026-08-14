'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Check, CreditCard, Smartphone, Banknote, Building2, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, discountAmount, shippingFee, totalAmount, appliedCoupon, user, clearCart, addToast } = useStore();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Address form
  const [fullName, setFullName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('Mumbai');
  const [state, setState] = useState<string>('Maharashtra');
  const [postalCode, setPostalCode] = useState<string>('400050');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'UPI' | 'CARD' | 'COD'>('RAZORPAY');
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/shop');
    }
  }, [cart, router]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !addressLine1 || !city || !postalCode) {
      addToast('Missing Details', 'Please fill out all required delivery fields.', 'error');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const shippingAddress = {
      fullName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: 'India',
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingAddress,
          paymentMethod,
          couponCode: appliedCoupon?.code || null,
          subtotal,
          discountAmount,
          shippingFee,
          totalAmount,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.order) {
        clearCart();
        addToast('Order Placed Successfully!', `Order #${data.order.orderNumber} confirmed.`, 'success');
        router.push(`/order-success/${data.order.id}`);
      } else {
        addToast('Order Failed', data.error || 'Failed to process order.', 'error');
      }
    } catch {
      setLoading(false);
      addToast('Error', 'Network error placing order.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Header */}
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-extrabold text-gold-gradient">HAUTE CHECKOUT</h1>
          <p className="text-xs text-neutral-400 mt-1">Step {step} of 2: Shipping &amp; Payment Details</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-neutral-400">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>256-Bit Encrypted Payment Security</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Checkout Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Delivery Address Form */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card border border-neutral-800 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-lg font-serif font-bold text-neutral-100 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center">1</span>
                Delivery Address
              </h2>
              {step === 2 && (
                <button onClick={() => setStep(1)} className="text-xs text-amber-400 underline">
                  Edit Address
                </button>
              )}
            </div>

            {step === 1 ? (
              <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-neutral-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-neutral-300">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat / Building Name, Street"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300">PIN / Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-90"
                  >
                    Continue to Payment Method <ArrowRight className="w-4 h-4 inline ml-2" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-xs text-neutral-300 space-y-1">
                <p className="font-bold text-neutral-100">{fullName} ({phone})</p>
                <p>{addressLine1}, {addressLine2}</p>
                <p>{city}, {state} - {postalCode}</p>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method Selection */}
          {step === 2 && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-amber-500/20 space-y-6">
              <h2 className="text-lg font-serif font-bold text-neutral-100 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center">2</span>
                Payment Options (Razorpay Secured)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Razorpay Gateway */}
                <div
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'RAZORPAY'
                      ? 'bg-amber-500/10 border-amber-400 shadow-lg'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300">RAZORPAY GATEWAY</span>
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-neutral-400">Cards, NetBanking, Google Pay, PhonePe, Paytm</p>
                </div>

                {/* UPI Direct */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-amber-500/10 border-amber-400 shadow-lg'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300">BHIM / INSTANT UPI</span>
                    <Smartphone className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-neutral-400">Scan QR or enter UPI ID for instant approval</p>
                </div>

                {/* Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-amber-500/10 border-amber-400 shadow-lg'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300">CREDIT / DEBIT CARD</span>
                    <CreditCard className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-neutral-400">Visa, Mastercard, RuPay, Amex supported</p>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'bg-amber-500/10 border-amber-400 shadow-lg'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300">CASH ON DELIVERY</span>
                    <Banknote className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-neutral-400">Pay cash upon parcel arrival</p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <button
                  disabled={loading}
                  onClick={handlePlaceOrder}
                  className="w-full py-4 rounded-2xl bg-gold-gradient text-neutral-950 font-extrabold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-xl"
                >
                  {loading ? 'Processing Order...' : `AUTHORIZE & PLACE ORDER (₹${totalAmount.toLocaleString()})`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Items Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-neutral-800 space-y-4">
            <h3 className="text-base font-serif font-bold text-neutral-100 border-b border-neutral-800 pb-3">
              Items in Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex space-x-3 text-xs">
                  <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg bg-neutral-900 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-200 truncate">{item.name}</h4>
                    <p className="text-[11px] text-neutral-500">Qty: {item.quantity} • {item.variant?.size}</p>
                    <p className="font-bold text-amber-300 mt-0.5">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-neutral-400 pt-4 border-t border-neutral-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-neutral-100 pt-2 border-t border-neutral-800">
                <span>Final Amount</span>
                <span className="text-xl text-gold-gradient font-serif">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
