'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Truck, CheckCircle2, Clock, Edit2, Save, Eye } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminOrdersPage() {
  const { addToast } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Order for Editing / Details
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>('CONFIRMED');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [carrier, setCarrier] = useState<string>('Blue Dart Express');

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderModal = (ord: any) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setTrackingNumber(ord.trackingNumber || '');
    setCarrier(ord.carrier || 'Blue Dart Express');
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber,
          carrier,
        }),
      });

      if (res.ok) {
        addToast('Order Status Updated', `Order #${selectedOrder.orderNumber} status set to ${newStatus}`, 'success');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        addToast('Error', 'Failed to update order status.', 'error');
      }
    } catch {
      addToast('Error', 'Network error updating order.', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">ORDER LOGISTICS</span>
          <h1 className="text-3xl font-serif font-extrabold text-neutral-100">Customer Orders Fulfillment</h1>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search order #, customer name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <p className="text-xs text-neutral-400">Loading orders...</p>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/80 text-amber-400 uppercase tracking-widest text-[10px] font-bold border-b border-neutral-800">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-900/40">
                    <td className="p-4 font-mono font-bold text-amber-300">#{ord.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-neutral-100">{ord.user?.name || ord.shippingAddress?.fullName}</p>
                      <p className="text-[10px] text-neutral-500">{ord.user?.email || ord.shippingAddress?.email}</p>
                    </td>
                    <td className="p-4 font-semibold">{ord.items?.length || 1} items</td>
                    <td className="p-4 font-bold text-neutral-100">₹{ord.totalAmount?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-neutral-900 border border-neutral-800 text-neutral-300 rounded">
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openOrderModal(ord)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-300 hover:border-amber-400 font-bold text-xs"
                      >
                        Update &amp; Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center">
          <div className="relative w-full max-w-xl bg-neutral-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-serif font-bold text-gold-gradient">
                Update Order #{selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Update Order Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-neutral-100 font-bold"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING (QUALITY CHECK)</option>
                  <option value="PACKED">PACKED (GIFT BOX)</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Logistics Carrier</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. Blue Dart Express"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Tracking Number (AWB)</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. AWB-BLR-984210"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-neutral-100 font-mono"
                />
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-400">Customer Address &amp; Items</span>
                <p className="font-semibold text-neutral-200">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-neutral-400">{selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}</p>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-neutral-950 font-bold text-xs"
                >
                  Save Status Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
