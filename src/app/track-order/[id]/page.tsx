'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Package, Truck, CheckCircle2, Clock, MapPin, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export default function TrackOrderDetailPage() {
  const params = useParams();
  const idOrNumber = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idOrNumber) {
      fetch(`/api/orders/${idOrNumber}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data.order || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [idOrNumber]);

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
    { key: 'CONFIRMED', label: 'Order Placed & Confirmed', desc: 'Payment verified and sent to atelier' },
    { key: 'PROCESSING', label: 'Quality Inspection', desc: 'Bespoke hand check & pressing' },
    { key: 'PACKED', label: 'Velvet Gift Packaged', desc: 'Sealed in signature AL-JO box' },
    { key: 'SHIPPED', label: 'Handed to Express Carrier', desc: `AWB: ${order.trackingNumber || 'AWB-BLR-984210'} (${order.carrier || 'Blue Dart'})` },
    { key: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', desc: 'Courier agent en route to destination' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Parcel safely handed over' },
  ];

  const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStatusIndex = statusOrder.indexOf(order.status) >= 0 ? statusOrder.indexOf(order.status) : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link href="/track-order" className="inline-flex items-center text-xs text-amber-400 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Search Different Order
      </Link>

      {/* Header Summary */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">REAL-TIME TRACKING</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-neutral-100 mt-1">
              Order #{order.orderNumber}
            </h1>
          </div>
          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-neutral-400">Current Status</span>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-neutral-950 uppercase tracking-wider mt-1">
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-300">
          <div>
            <span className="text-neutral-500 block">Carrier Logistics</span>
            <strong className="text-neutral-100">{order.carrier || 'Blue Dart Express'}</strong>
          </div>
          <div>
            <span className="text-neutral-500 block">Tracking AWB</span>
            <strong className="text-amber-300 font-mono">{order.trackingNumber || 'AWB-BLR-984210'}</strong>
          </div>
          <div>
            <span className="text-neutral-500 block">Estimated Arrival</span>
            <strong className="text-neutral-100">Within 2-4 Business Days</strong>
          </div>
        </div>
      </div>

      {/* Step-by-Step Interactive Timeline */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-8 border border-neutral-800">
        <h3 className="text-lg font-serif font-bold text-gold-gradient">Shipment Journey Timeline</h3>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
          {steps.map((step, idx) => {
            const stepIndex = statusOrder.indexOf(step.key);
            const isCompleted = stepIndex <= currentStatusIndex;
            const isCurrent = stepIndex === currentStatusIndex;

            return (
              <div key={step.key} className="relative flex items-start space-x-4">
                {/* Circle Marker */}
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

      {/* Items Summary in Shipment */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-neutral-800">
        <h3 className="text-base font-serif font-bold text-neutral-100 border-b border-neutral-800 pb-3">
          Package Contents ({order.items?.length || 0})
        </h3>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 text-xs">
              <div className="flex items-center space-x-3">
                <img src={item.productImage} alt={item.productName} className="w-12 h-14 object-cover rounded-lg bg-neutral-800" />
                <div>
                  <h5 className="font-semibold text-neutral-200">{item.productName}</h5>
                  <p className="text-neutral-500">Qty: {item.quantity} • Size: {item.size}</p>
                </div>
              </div>
              <span className="font-bold text-amber-300">₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
