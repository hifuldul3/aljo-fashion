'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Package, MapPin, Truck, ArrowRight, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f3e5ab', '#ffffff'],
      });
    } catch {}

    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data.order || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-neutral-400">
        Generating order invoice &amp; confirmation...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Confirmation Header */}
      <div className="text-center space-y-4 glass-card rounded-3xl p-8 sm:p-12 border border-amber-500/30">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">ORDER CONFIRMED</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-neutral-100">
          Thank You For Your Order!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
          Your order <strong className="text-amber-300">#{order?.orderNumber || 'ALJO-XXXXX'}</strong> has been received and is currently being packed at our atelier.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <Link
            href={`/track-order/${order?.orderNumber || orderId}`}
            className="px-6 py-3 rounded-full bg-gold-gradient text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <Truck className="w-4 h-4" /> Track Order Timeline
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:border-neutral-700"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>
      </div>

      {/* Order Details Breakdown */}
      {order && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-neutral-800">
          <h3 className="text-lg font-serif font-bold text-neutral-100 border-b border-neutral-800 pb-3">
            Summary Invoice
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-300">
            <div>
              <span className="font-bold text-amber-400 uppercase tracking-widest text-[10px] block mb-1">Delivery Address</span>
              <p className="font-bold text-neutral-100">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
              <p className="mt-1 text-neutral-500">Phone: {order.shippingAddress?.phone}</p>
            </div>

            <div>
              <span className="font-bold text-amber-400 uppercase tracking-widest text-[10px] block mb-1">Payment &amp; Logistics</span>
              <p>Payment Status: <strong className="text-emerald-400">{order.paymentStatus}</strong></p>
              <p>Method: <strong className="text-neutral-200">{order.paymentMethod}</strong></p>
              <p>Carrier: <strong className="text-neutral-200">{order.carrier || 'Express Logistics'}</strong></p>
              <p>Estimated Delivery: <strong className="text-amber-300">Within 3-5 Business Days</strong></p>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Purchased Items</h4>
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 text-xs">
                <div className="flex items-center space-x-3">
                  <img src={item.productImage} alt={item.productName} className="w-12 h-14 object-cover rounded-lg bg-neutral-800" />
                  <div>
                    <h5 className="font-semibold text-neutral-200">{item.productName}</h5>
                    <p className="text-neutral-500">Qty: {item.quantity} • Size: {item.size} • {item.color}</p>
                  </div>
                </div>
                <span className="font-bold text-amber-300">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="text-xs text-neutral-300 space-y-1.5 pt-4 border-t border-neutral-800 text-right">
            <p>Subtotal: <strong className="text-neutral-100">₹{order.subtotal?.toLocaleString()}</strong></p>
            {order.discountAmount > 0 && <p className="text-amber-400">Discount: -₹{order.discountAmount?.toLocaleString()}</p>}
            <p>Shipping: <strong className="text-neutral-100">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</strong></p>
            <p className="text-base font-bold text-neutral-100 pt-2 border-t border-neutral-800">
              Total Amount: <span className="text-xl text-gold-gradient font-serif ml-2">₹{order.totalAmount?.toLocaleString()}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
