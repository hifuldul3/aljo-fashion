'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/products?search=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.products || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-4 sm:p-6 md:p-10 animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2 text-amber-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest">AL-JO Fashion Search</span>
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-500" />
          <input
            type="text"
            placeholder="Search suits, gowns, blazers, silk, leather, or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-neutral-900 border border-amber-500/30 text-neutral-100 placeholder-neutral-500 text-lg sm:text-xl rounded-2xl pl-14 pr-12 py-4 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Instant Suggestions or Search Results */}
        {loading ? (
          <div className="py-12 text-center text-neutral-500">Searching store catalog...</div>
        ) : query.trim() && results.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 bg-neutral-900/50 rounded-2xl border border-neutral-800">
            <p className="text-base font-semibold">No couture pieces found for "{query}"</p>
            <p className="text-xs text-neutral-500 mt-1">Try searching for "Velvet", "Silk", "Blazer", "Tuxedo", or "Suit".</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-300 mb-2">
              Matching Products ({results.length})
            </p>
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center space-x-4 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 hover:bg-neutral-800/80 transition-all"
              >
                <img
                  src={Array.isArray(product.images) ? product.images[0] : JSON.parse(product.images)[0]}
                  alt={product.name}
                  className="w-14 h-16 object-cover rounded-lg bg-neutral-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-100 truncate">{product.name}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-1">{product.category?.name} • {product.gender}</p>
                  <div className="text-xs font-bold text-amber-300 mt-1">
                    ₹{(product.discountPrice || product.price).toLocaleString()}
                    {product.discountPrice && (
                      <span className="line-through text-neutral-500 text-[10px] ml-2">
                        ₹{product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Popular Searches</h4>
            <div className="flex flex-wrap gap-2">
              {['Royal Tuxedo', 'Silk Evening Gown', 'Linen Blazer', 'Leather Tote', 'Egyptian Cotton Shirt', 'Kids Velvet Set'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
