'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Package, Truck, CheckCircle2, Clock, MapPin, ShieldCheck, AlertCircle, ArrowLeft, Building2, Smartphone, Ban, X, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function TrackOrderDetailPage() {
  const params = useParams();
  const idOrNumber = params.id as string;
  const { addToast } = useStore();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetails = () => {
    if (idOrNumber) {
      setLoading(true);
      fetch(`/api/orders/${idOrNumber}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data.order || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [idOrNumber]);

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason }),
      });

      const data = await res.json();
      setCancelling(false);

      if (res.ok && data.success) {
        addToast('Order Cancelled', `Order #${order.orderNumber} cancelled and item stock restored.`, 'info');
        setIsCancelModalOpen(false);
        fetchOrderDetails();
      } else {
        addToast('Cancellation Error', data.error || 'Failed to cancel order.', 'error');
      }
    } catch {
      setCancelling(false);
      addToast('Error', 'Network error cancelling order.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-neutral-400">
        Fetching shipment status &amp; logistics timeline...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-neutral-100">Order Not Found</h2>
        <p className="text-xs text-neutral-400">No order recorded with ID "{idOrNumber}".</p>
        <Link href="/track-order" className="inline-block px-6 py-2.5 rounded-full bg-gold-gradient text-neutral-950 text-xs font-bold">
          Try Another Order Number
        </Link>
      </div>
    );
  }

  // Timeline Steps Definition
  const steps = [
    { key: 'CONFIRMED', label: 'Order Placed & Confirmed', desc: 'Payment verified and order logged in atelier database' },
    { key: 'PROCESSING', label: 'Quality Inspection', desc: 'Bespoke hand check & silk pressing' },
    { key: 'PACKED', label: 'Velvet Gift Packaged', desc: 'Sealed in signature AL-JO luxury box' },
    { key: 'SHIPPED', label: 'Handed to Express Courier', desc: `AWB: ${order.trackingNumber || 'AWB-BLR-984210'} (${order.carrier || 'Blue Dart'})` },
    { key: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', desc: 'Courier agent en route to destination' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Parcel safely handed over' },
  ];

  const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStatusIndex = statusOrder.indexOf(order.status) >= 0 ? statusOrder.indexOf(order.status) : 1;
  const isCancellable = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link href="/track-order" className="inline-flex items-center text-xs text-amber-400 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Search Different Order
      </Link>

      {/* Header Summary */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">REAL-TIME ORDER DETAILS &amp; LOG</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-neutral-100 mt-1">
              Order #{order.orderNumber}
            </h1>
          </div>
          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-neutral-400">Current Status</span>
            <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mt-1 ${
              order.status === 'CANCELLED'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-amber-500 text-neutral-950 shadow-md'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-300">
          <div>
            <span className="text-neutral-500 block">Carrier Logistics</span>
            <strong className="text-neutral-100">{order.carrier || 'Express Logistics'}</strong>
          </div>
          <div>
            <span className="text-neutral-500 block">Tracking AWB</span>
            <strong className="text-amber-300 font-mono">{order.trackingNumber || 'AWB-BLR-984210'}</strong>
          </div>
          <div>
            <span className="text-neutral-500 block">Payment Method ({order.paymentStatus})</span>
            <strong className="text-neutral-100">{order.paymentMethod}</strong>
          </div>
        </div>

        {/* Cancel Order Action Button */}
        {isCancellable && (
          <div className="pt-3 border-t border-neutral-800 flex justify-end">
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs flex items-center gap-2 hover:bg-red-500/20 transition-colors"
            >
              <Ban className="w-4 h-4" /> Cancel Order &amp; Request Refund
            </button>
          </div>
        )}
      </div>

      {/* Official Bank Account & Direct UPI Details Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-amber-500/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-serif font-bold text-gold-gradient">Official Store Bank &amp; Direct UPI Details</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
            Verified Store Account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-300">
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">BANK TRANSFER</span>
            <p><span className="text-neutral-500">Bank Name:</span> <strong className="text-neutral-100">HDFC Bank Ltd</strong></p>
            <p><span className="text-neutral-500">Account Name:</span> <strong className="text-neutral-100">AL-JO Fashion Couture</strong></p>
            <p><span className="text-neutral-500">Account No:</span> <strong className="text-amber-300 font-mono">50200084920194</strong></p>
            <p><span className="text-neutral-500">IFSC Code:</span> <strong className="text-amber-300 font-mono">HDFC0001248</strong></p>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">INSTANT UPI TRANSFER</span>
            <p><span className="text-neutral-500">Primary VPA / UPI ID:</span> <strong className="text-amber-300 font-mono">aljofashion@okaxis</strong></p>
            <p><span className="text-neutral-500">Secondary UPI:</span> <strong className="text-amber-300 font-mono">aljo@upi</strong></p>
            <p><span className="text-neutral-500">Accepted Apps:</span> GPay, PhonePe, Paytm, BHIM</p>
            <p className="text-[10px] text-neutral-400 pt-1">Reference order <span className="text-amber-300 font-mono">#{order.orderNumber}</span> in payment remarks.</p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Interactive Timeline */}
      {order.status !== 'CANCELLED' ? (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-8 border border-neutral-800">
          <h3 className="text-lg font-serif font-bold text-gold-gradient">Shipment Journey Timeline</h3>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
            {steps.map((step) => {
              const stepIndex = statusOrder.indexOf(step.key);
              const isCompleted = stepIndex <= currentStatusIndex;
              const isCurrent = stepIndex === currentStatusIndex;

              return (
                <div key={step.key} className="relative flex items-start space-x-4">
                  <div
                    className={`absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-amber-400 border-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 fill-current" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold ${isCurrent ? 'text-amber-300' : isCompleted ? 'text-neutral-200' : 'text-neutral-500'}`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-neutral-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-3 border border-red-500/30 text-xs text-neutral-300">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
            <Ban className="w-5 h-5" />
            <span>Order Cancelled</span>
          </div>
          <p>{order.notes || 'Order was cancelled and items restored to stock.'}</p>
        </div>
      )}

      {/* Order Item Contents Summary */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-neutral-800">
        <h3 className="text-base font-serif font-bold text-neutral-100 border-b border-neutral-800 pb-3">
          Order Items Breakdown ({order.items?.length || 0})
        </h3>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/60 text-xs border border-neutral-800">
              <div className="flex items-center space-x-3">
                <img src={item.productImage} alt={item.productName} className="w-12 h-14 object-cover rounded-lg bg-neutral-800" />
                <div>
                  <h5 className="font-semibold text-neutral-200">{item.productName}</h5>
                  <p className="text-neutral-500">Qty: {item.quantity} • Size: {item.size || 'Default'} • Color: {item.color || 'Default'}</p>
                </div>
              </div>
              <span className="font-bold text-amber-300 text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="relative w-full max-w-md bg-neutral-950 border border-red-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <button onClick={() => setIsCancelModalOpen(false)} className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-red-400 flex items-center gap-2">
              <Ban className="w-5 h-5" /> Confirm Order Cancellation
            </h3>

            <p className="text-xs text-neutral-300">
              Are you sure you want to cancel order <strong className="text-amber-300 font-mono">#{order.orderNumber}</strong>? The items will be returned to store stock.
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 font-semibold block mb-1">Reason for Cancellation</label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Changed mind, ordered wrong size, wanted different color..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-neutral-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 font-bold"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
