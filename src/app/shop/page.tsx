'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/SkeletonLoader';
import { Search, Filter, SlidersHorizontal, Grid, List, RotateCcw } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedGender, setSelectedGender] = useState<string>(searchParams.get('gender') || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(35000);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedGender) params.set('gender', selectedGender);
    if (searchQuery) params.set('search', searchQuery);
    if (maxPrice < 35000) params.set('maxPrice', maxPrice.toString());
    if (sortOption) params.set('sort', sortOption);

    if (searchParams.get('newArrival') === 'true') params.set('newArrival', 'true');
    if (searchParams.get('bestSeller') === 'true') params.set('bestSeller', 'true');

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        let prods = data.products || [];

        if (selectedSize) {
          prods = prods.filter((p: any) => p.variants?.some((v: any) => v.size === selectedSize));
        }
        if (selectedColor) {
          prods = prods.filter((p: any) => p.variants?.some((v: any) => v.color.toLowerCase().includes(selectedColor.toLowerCase())));
        }

        setProducts(prods);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedGender, selectedSize, selectedColor, maxPrice, sortOption, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedGender('');
    setSelectedSize('');
    setSelectedColor('');
    setMaxPrice(35000);
    setSearchQuery('');
    setSortOption('newest');
    router.push('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Shop Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-amber-500/20 p-8 sm:p-12">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">AL-JO FASHION COUTURE</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-neutral-100">
            {selectedCategory ? `${selectedCategory.toUpperCase()} COLLECTION` : 'THE HAUTE STORE'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300">
            Explore Italian velvet tuxedos, silk evening gowns, handcrafted leather totes, and tailored blazers.
          </p>
        </div>
      </div>

      {/* Toolbar: Search, Sort, View Switcher */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-400 hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Popularity &amp; Bestsellers</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center space-x-1 border border-neutral-800 rounded-xl p-1 bg-neutral-950">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-amber-500/20 text-amber-400' : 'text-neutral-500 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-amber-500/20 text-amber-400' : 'text-neutral-500 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block space-y-6 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <h3 className="text-sm font-serif font-bold text-gold-gradient flex items-center gap-2">
              <Filter className="w-4 h-4" /> FILTERS
            </h3>
            <button onClick={resetFilters} className="text-[11px] text-amber-400 hover:underline flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Gender</h4>
            <div className="flex flex-wrap gap-2">
              {['MEN', 'WOMEN', 'KIDS', 'UNISEX'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(selectedGender === g.toLowerCase() ? '' : g.toLowerCase())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    selectedGender === g.toLowerCase()
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-800/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Categories</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                  !selectedCategory ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                  className={`w-full flex justify-between items-center text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                    selectedCategory === cat.slug ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-neutral-600">({cat._count?.products || 0})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-neutral-800/60">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Max Price</h4>
              <span className="text-xs font-bold text-amber-300">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={3000}
              max={35000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-400 bg-neutral-950"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-800/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Size</h4>
            <div className="flex flex-wrap gap-2">
              {['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`px-3 py-1 rounded-lg text-xs ${
                    selectedSize === sz
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-800/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Color Palette</h4>
            <div className="flex flex-wrap gap-2">
              {['Black', 'Cream', 'Beige', 'Gold', 'Navy', 'Red', 'Grey'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(selectedColor === c ? '' : c)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] ${
                    selectedColor === c
                      ? 'bg-neutral-800 border-2 border-amber-400 text-amber-300'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Showing <strong className="text-neutral-200">{products.length}</strong> couture items</span>
            {(selectedCategory || selectedGender || selectedSize || selectedColor || searchQuery) && (
              <button onClick={resetFilters} className="text-amber-400 hover:underline">
                Clear all active filters
              </button>
            )}
          </div>

          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : products.length === 0 ? (
            <div className="py-20 text-center glass-card rounded-2xl p-8 space-y-4 border border-neutral-800">
              <h3 className="text-lg font-serif font-bold text-neutral-200">No Couture Items Matched</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                We couldn't find any products matching your specific filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-gold-gradient text-neutral-950 text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={6} />}>
      <ShopContent />
    </Suspense>
  );
}
