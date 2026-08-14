'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, Calendar, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Store Owner Analytics...
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalSales: 264990,
    todaySales: 15499,
    monthlySales: 98400,
    totalOrders: 14,
    pendingOrders: 2,
    completedOrders: 10,
    cancelledOrders: 0,
    totalCustomers: 24,
    totalProducts: 8,
    lowStockCount: 2,
    outOfStockCount: 1,
  };

  const monthlyChart = data?.monthlyChart || [
    { month: 'Mar', sales: 45000 },
    { month: 'Apr', sales: 78000 },
    { month: 'May', sales: 110000 },
    { month: 'Jun', sales: 145000 },
    { month: 'Jul', sales: 198000 },
    { month: 'Aug', sales: 264990 },
  ];

  const categoryRevenue = data?.categoryRevenue || [
    { name: 'Men', revenue: 145000 },
    { name: 'Women', revenue: 98000 },
    { name: 'Accessories', revenue: 38000 },
    { name: 'Kids', revenue: 18000 },
  ];

  const maxChartSales = Math.max(...monthlyChart.map((c: any) => c.sales), 1);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">AL-JO FASHION ATELIER</span>
          <h1 className="text-3xl font-serif font-extrabold text-neutral-100">Executive Store Dashboard</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl bg-gold-gradient text-neutral-950 font-bold text-xs shadow-lg"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="p-6 rounded-2xl glass-card border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Total Sales</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-gold-gradient">
            ₹{metrics.totalSales.toLocaleString()}
          </p>
          <div className="text-[11px] text-emerald-400 flex items-center font-semibold">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18.4% growth this month
          </div>
        </div>

        {/* Today's Sales */}
        <div className="p-6 rounded-2xl glass-card border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-neutral-800 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-neutral-100">
            ₹{metrics.todaySales.toLocaleString()}
          </p>
          <span className="text-[11px] text-neutral-500">Live order processing</span>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-2xl glass-card border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Total Orders</span>
            <div className="p-2 rounded-xl bg-neutral-800 text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-neutral-100">{metrics.totalOrders}</p>
          <div className="text-[11px] text-neutral-400">
            <strong className="text-amber-400">{metrics.pendingOrders} Pending</strong> • {metrics.completedOrders} Delivered
          </div>
        </div>

        {/* Inventory Stock Alerts */}
        <div className="p-6 rounded-2xl glass-card border border-red-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-red-400">{metrics.lowStockCount + metrics.outOfStockCount}</p>
          <Link href="/admin/inventory" className="text-[11px] text-amber-400 hover:underline inline-flex items-center">
            Review stock levels <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend SVG Line Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-neutral-800 space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-base font-serif font-bold text-gold-gradient">Revenue Growth Trend ('26)</h3>
            <span className="text-xs text-neutral-400">Monthly Aggregates</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8">
            {monthlyChart.map((c: any) => {
              const heightPercent = Math.round((c.sales / maxChartSales) * 100);
              return (
                <div key={c.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{Math.round(c.sales / 1000)}k
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPercent, 12)}%` }}
                    className="w-full rounded-t-xl bg-gold-gradient hover:brightness-125 transition-all shadow-lg"
                  />
                  <span className="text-xs text-neutral-400 font-semibold">{c.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Revenue Breakdown */}
        <div className="p-6 rounded-3xl glass-card border border-neutral-800 space-y-6">
          <h3 className="text-base font-serif font-bold text-gold-gradient border-b border-neutral-800 pb-3">
            Revenue by Category
          </h3>
          <div className="space-y-4">
            {categoryRevenue.map((cat: any) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-200">{cat.name}</span>
                  <span className="text-amber-300">₹{cat.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, (cat.revenue / (metrics.totalSales || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Warning Box */}
      {(data?.lowStockProducts?.length > 0 || data?.outOfStockProducts?.length > 0) && (
        <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/30 space-y-4">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Attention: Inventory Stock Replenishment Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.lowStockProducts?.map((item: any) => (
              <div key={item.id} className="p-3 rounded-xl bg-neutral-950/80 border border-red-500/20 text-xs space-y-1">
                <p className="font-semibold text-neutral-200 truncate">{item.name}</p>
                <p className="text-amber-400 font-mono">SKU: {item.SKU}</p>
                <p className="text-red-400 font-bold">Only {item.stock} units remaining</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
