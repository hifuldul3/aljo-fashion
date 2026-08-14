'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Package, MapPin, Heart, LogOut, ExternalLink } from 'lucide-react';
import { useStore } from '@/lib/store';

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, setUser, wishlist, addToast } = useStore();

  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [addresses] = useState<any[]>([
    {
      id: 'addr-1',
      label: 'Home',
      fullName: user?.name || 'Aarav Sharma',
      phone: user?.phone || '+91 91234 56789',
      addressLine1: 'Flat 402, Royal Residency, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      isDefault: true,
    },
  ]);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    addToast('Logged Out', 'You have been signed out.', 'info');
    router.push('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl glass-card border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-2xl flex items-center justify-center uppercase">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">PATRON PORTAL</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-neutral-100">{user?.name || 'Aarav Sharma'}</h1>
            <p className="text-xs text-neutral-400">{user?.email || 'user@aljo.com'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider"
            >
              👑 Owner Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-red-400 font-bold text-xs hover:bg-red-500/10 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 space-x-6">
        {[
          { id: 'orders', label: 'Order History', icon: Package },
          { id: 'wishlist', label: `Saved Wishlist (${wishlist.length})`, icon: Heart },
          { id: 'addresses', label: 'Delivery Address Book', icon: MapPin },
          { id: 'profile', label: 'Profile Settings', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
                isActive
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Order History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-neutral-100">My Dispatched &amp; Past Orders</h2>
          {loadingOrders ? (
            <p className="text-xs text-neutral-400">Loading order records...</p>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-3xl space-y-3 border border-neutral-800">
              <Package className="w-12 h-12 text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-200">No orders placed yet</p>
              <Link href="/shop" className="inline-block px-6 py-2 rounded-full bg-gold-gradient text-neutral-950 text-xs font-bold">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="glass-card rounded-2xl p-6 border border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                    <div>
                      <span className="text-xs text-neutral-400">Order ID: <strong className="text-amber-300 font-mono">#{ord.orderNumber}</strong></span>
                      <span className="text-[11px] text-neutral-500 ml-3">Date: {new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                        {ord.status}
                      </span>
                      <Link
                        href={`/track-order/${ord.orderNumber}`}
                        className="text-xs font-bold text-amber-400 hover:underline flex items-center"
                      >
                        Track Status <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ord.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-900/60">
                        <div className="flex items-center space-x-3">
                          <img src={item.productImage} alt={item.productName} className="w-10 h-12 object-cover rounded bg-neutral-800" />
                          <div>
                            <p className="font-semibold text-neutral-200">{item.productName}</p>
                            <p className="text-neutral-500">Qty: {item.quantity} • Size: {item.size}</p>
                          </div>
                        </div>
                        <span className="font-bold text-amber-300">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-neutral-800">
                    <span className="text-neutral-400">Total Paid ({ord.paymentMethod}):</span>
                    <span className="text-sm text-gold-gradient font-serif">₹{ord.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-neutral-100">Saved Wishlist ({wishlist.length})</h2>
          {wishlist.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-3xl space-y-3 border border-neutral-800">
              <Heart className="w-12 h-12 text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-200">No items saved in wishlist</p>
              <Link href="/shop" className="inline-block px-6 py-2 rounded-full bg-gold-gradient text-neutral-950 text-xs font-bold">
                Explore Haute Couture
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div key={item.productId} className="glass-card rounded-2xl overflow-hidden p-3 space-y-3 border border-neutral-800">
                  <img src={item.image} alt={item.name} className="w-full aspect-[3/4] object-cover rounded-xl bg-neutral-900" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200 truncate">{item.name}</h4>
                    <p className="text-xs font-bold text-amber-300 mt-1">₹{item.price.toLocaleString()}</p>
                  </div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="w-full block text-center py-2 rounded-lg bg-gold-gradient text-neutral-950 font-bold text-xs"
                  >
                    View Product
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-serif font-bold text-neutral-100">Saved Shipping Addresses</h2>
            <button
              onClick={() => addToast('Address Manager', 'Default address saved.', 'info')}
              className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-300 text-xs font-bold"
            >
              + Add New Address
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-6 rounded-2xl glass-card border border-amber-500/30 space-y-2 text-xs text-neutral-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-neutral-100 uppercase tracking-widest text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                    {addr.label} {addr.isDefault && '(DEFAULT)'}
                  </span>
                </div>
                <p className="font-bold text-neutral-100 text-sm">{addr.fullName}</p>
                <p>{addr.addressLine1}</p>
                <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                <p className="text-neutral-500">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-xl p-8 rounded-3xl glass-card border border-neutral-800 space-y-4 text-xs">
          <h2 className="text-lg font-serif font-bold text-neutral-100">Profile Information</h2>
          <div>
            <label className="text-neutral-400 block mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || 'Aarav Sharma'}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200"
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={user?.email || 'user@aljo.com'}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200"
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1">Account Role</label>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
              {user?.role || 'CUSTOMER'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense fallback={<p className="p-8 text-xs text-neutral-400">Loading Account...</p>}>
      <AccountContent />
    </Suspense>
  );
}
