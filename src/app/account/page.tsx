'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Package, MapPin, Heart, LogOut, ExternalLink, Plus, Trash2, Check, X, Edit3 } from 'lucide-react';
import { useStore } from '@/lib/store';

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, setUser, wishlist, addToast } = useStore();

  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address Manager State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address Form Fields
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('400050');
  const [isDefault, setIsDefault] = useState(true);

  // Load persisted addresses from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aljo_saved_addresses');
      if (saved) {
        setAddresses(JSON.parse(saved));
      } else {
        const initial = [
          {
            id: 'addr-1',
            label: 'Home',
            fullName: user?.name || 'Aarav Sharma',
            phone: user?.phone || '+91 91234 56789',
            addressLine1: 'Flat 402, Royal Residency, Bandra West',
            addressLine2: 'Near Promenade',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            isDefault: true,
          },
        ];
        setAddresses(initial);
        localStorage.setItem('aljo_saved_addresses', JSON.stringify(initial));
      }
    } catch {}
  }, [user]);

  // Save addresses to localStorage on change
  const saveAddresses = (newAddrs: any[]) => {
    setAddresses(newAddrs);
    try {
      localStorage.setItem('aljo_saved_addresses', JSON.stringify(newAddrs));
    } catch {}
  };

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, []);

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setLabel('Home');
    setFullName(user?.name || '');
    setPhone(user?.phone || '');
    setAddressLine1('');
    setAddressLine2('');
    setCity('Mumbai');
    setState('Maharashtra');
    setPostalCode('400050');
    setIsDefault(addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: any) => {
    setEditingAddressId(addr.id);
    setLabel(addr.label);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setIsDefault(addr.isDefault);
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine1 || !city || !postalCode) {
      addToast('Error', 'Please fill out all required address fields.', 'error');
      return;
    }

    if (editingAddressId) {
      const updated = addresses.map((a) => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            label,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            isDefault,
          };
        }
        return isDefault ? { ...a, isDefault: false } : a;
      });
      saveAddresses(updated);
      addToast('Address Updated', 'Shipping address updated.', 'success');
    } else {
      const newId = `addr-${Date.now()}`;
      const newAddr = {
        id: newId,
        label,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        isDefault,
      };

      const updated = isDefault
        ? addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
        : [...addresses, newAddr];

      saveAddresses(updated);
      addToast('Address Added', 'New delivery address added to your address book.', 'success');
    }

    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (addresses.length === 1) {
      addToast('Action Prohibited', 'You must have at least one delivery address.', 'info');
      return;
    }
    const updated = addresses.filter((a) => a.id !== id);
    if (!updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
    addToast('Address Removed', 'Address removed from your address book.', 'info');
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    saveAddresses(updated);
    addToast('Default Address Set', 'Updated default shipping address.', 'success');
  };

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
          { id: 'addresses', label: `Delivery Address Book (${addresses.length})`, icon: MapPin },
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

      {/* Tab 3: Saved Addresses (Fully Interactive Address Manager) */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-neutral-100">Delivery Address Book</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Manage your shipping destinations for fast multi-address checkout.</p>
            </div>
            <button
              onClick={openAddAddressModal}
              className="px-4 py-2.5 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-6 rounded-3xl glass-card border transition-all space-y-3 text-xs relative ${
                  addr.isDefault
                    ? 'border-amber-400 shadow-lg ring-1 ring-amber-400/30'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold uppercase tracking-widest text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditAddressModal(addr)}
                      className="p-1.5 text-neutral-400 hover:text-amber-300 rounded-lg hover:bg-neutral-800"
                      title="Edit Address"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="font-bold text-neutral-100 text-sm">{addr.fullName}</p>
                  <p className="text-neutral-300">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="text-neutral-400">{addr.addressLine2}</p>}
                  <p className="text-neutral-300 font-semibold">{addr.city}, {addr.state} - <span className="font-mono text-amber-300">{addr.postalCode}</span></p>
                  <p className="text-neutral-400 pt-1">Phone: <strong className="text-neutral-200 font-mono">{addr.phone}</strong></p>
                </div>

                {!addr.isDefault && (
                  <div className="pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Set as Default Address
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add / Edit Address Modal */}
          {isAddressModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center">
              <div className="relative w-full max-w-lg bg-neutral-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-serif font-bold text-gold-gradient">
                  {editingAddressId ? 'Edit Delivery Address' : 'Add New Shipping Address'}
                </h3>

                <form onSubmit={handleAddressSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-neutral-300 font-semibold block mb-1">Address Label *</label>
                      <select
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work / Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-neutral-300 font-semibold block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-300 font-semibold block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-300 font-semibold block mb-1">Flat / Building / Street Address *</label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="e.g. Flat 402, Royal Residency, Bandra West"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-300 font-semibold block mb-1">Landmark / Suite (Optional)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="e.g. Near Promenade"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-neutral-300 font-semibold block mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 font-semibold block mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 font-semibold block mb-1">Postal Code *</label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center space-x-2 text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="accent-amber-400"
                      />
                      <span>Make this my default shipping address</span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-gold-gradient text-neutral-950 font-bold text-xs"
                    >
                      {editingAddressId ? 'Save Changes' : 'Add Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
