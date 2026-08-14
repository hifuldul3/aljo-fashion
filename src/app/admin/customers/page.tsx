'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([
    {
      id: 'usr-1',
      name: 'Aarav Sharma',
      email: 'user@aljo.com',
      phone: '+91 91234 56789',
      role: 'CUSTOMER',
      orderCount: 2,
      totalSpend: 26449,
      createdAt: '2026-08-01',
    },
    {
      id: 'usr-2',
      name: 'Vikramaditya Roy',
      email: 'vikram@aljo.com',
      phone: '+91 98765 12345',
      role: 'CUSTOMER',
      orderCount: 4,
      totalSpend: 62000,
      createdAt: '2026-07-15',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">PATRON DATABASE</span>
        <h1 className="text-3xl font-serif font-extrabold text-neutral-100">Registered Customer Roster</h1>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-neutral-800">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-neutral-900/80 text-amber-400 uppercase tracking-widest text-[10px] font-bold border-b border-neutral-800">
            <tr>
              <th className="p-4">Customer Name</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Role</th>
              <th className="p-4">Orders Placed</th>
              <th className="p-4">Lifetime Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-900/40">
                <td className="p-4 font-bold text-neutral-100">{c.name}</td>
                <td className="p-4">
                  <p>{c.email}</p>
                  <p className="text-neutral-500">{c.phone}</p>
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded">
                    {c.role}
                  </span>
                </td>
                <td className="p-4 font-semibold">{c.orderCount} orders</td>
                <td className="p-4 font-bold text-amber-300">₹{c.totalSpend.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
