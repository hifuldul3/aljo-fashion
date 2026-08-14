'use client';

import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, Check, RefreshCw, Save } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminInventoryPage() {
  const { addToast } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockUpdates, setStockUpdates] = useState<{ [key: string]: number }>({});

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (productId: string, newStock: number) => {
    setStockUpdates((prev) => ({
      ...prev,
      [productId]: Math.max(0, newStock),
    }));
  };

  const saveStock = async (product: any) => {
    const updatedStock = stockUpdates[product.id] ?? product.stock;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          stock: updatedStock,
        }),
      });

      if (res.ok) {
        addToast('Stock Saved', `Updated inventory for ${product.name}`, 'success');
        fetchInventory();
      }
    } catch {
      addToast('Error', 'Failed to update stock.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">INVENTORY CONTROL</span>
          <h1 className="text-3xl font-serif font-extrabold text-neutral-100">Stock &amp; Variant Levels</h1>
        </div>
        <button onClick={fetchInventory} className="p-2 rounded-xl bg-neutral-900 text-amber-400 border border-neutral-800">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-neutral-400">Loading stock inventory...</p>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/80 text-amber-400 uppercase tracking-widest text-[10px] font-bold border-b border-neutral-800">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Variants Count</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Status Indicator</th>
                  <th className="p-4 text-right">Quick Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {products.map((p) => {
                  const currentStock = stockUpdates[p.id] ?? p.stock;
                  return (
                    <tr key={p.id} className="hover:bg-neutral-900/40">
                      <td className="p-4 font-semibold text-neutral-100">{p.name}</td>
                      <td className="p-4 font-mono text-amber-300">{p.SKU}</td>
                      <td className="p-4">{p.variants?.length || 0} Size/Color Variants</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={currentStock}
                            onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                            className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-100 font-bold"
                          />
                          <span className="text-[10px] text-neutral-500">units</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {currentStock === 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-500/30 uppercase">
                            OUT OF STOCK
                          </span>
                        ) : currentStock <= 5 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                            LOW STOCK ({currentStock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase">
                            HEALTHY STOCK
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => saveStock(p)}
                          className="px-3 py-1.5 rounded-lg bg-gold-gradient text-neutral-950 font-bold text-xs flex items-center gap-1.5 ml-auto"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
