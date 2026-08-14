'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingBag, Shirt, Check, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function InteractiveDressingRoom() {
  const { addToCart, addToast } = useStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  useEffect(() => {
    setMounted(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const prods = data.products || [];
        // Format images
        const formatted = prods.map((p: any) => ({
          ...p,
          images: Array.isArray(p.images)
            ? p.images
            : typeof p.images === 'string'
            ? JSON.parse(p.images)
            : ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'],
        }));
        setProducts(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!mounted) {
    return (
      <div className="relative rounded-3xl overflow-hidden glass-card border border-[#ede2d5] p-10 h-96 skeleton-shimmer" />
    );
  }

  if (loading) {
    return (
      <div className="relative rounded-3xl overflow-hidden glass-card border border-[#ede2d5] p-10 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#c89d7c] animate-spin mx-auto" />
        <p className="text-xs text-[#7a6b61]">Loading Admin Catalog Products for Virtual Atelier Fitting...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const selectedProduct = products[selectedIndex] || products[0];
  const activeImages = selectedProduct.images || [];
  const currentImage = activeImages[selectedImageIndex] || activeImages[0];

  const handleSelectProduct = (index: number) => {
    setSelectedIndex(index);
    setSelectedImageIndex(0);
  };

  const handleAddOutfitToBag = () => {
    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.discountPrice || selectedProduct.price,
      slug: selectedProduct.slug,
      images: activeImages,
      stock: selectedProduct.stock || 10,
    }, {
      size: selectedSize,
      color: selectedProduct.variants?.[0]?.color || 'Default',
    });
    addToast('Product Added', `Added ${selectedProduct.name} to your bag!`, 'success');
  };

  return (
    <div className="relative rounded-3xl overflow-hidden glass-card border border-[#ede2d5] p-6 sm:p-10 shadow-xl bg-gradient-to-br from-[#fffdfa] via-[#fbf5ee] to-[#f7eedc]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-[#ede2d5]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#f4ece1] border border-[#e3d5c5] text-[#a66e4e] text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#c89d7c]" />
            <span>LIVE ADMIN CATALOG ATELIER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#332720]">
            Admin Product Fitting Showcase
          </h2>
          <p className="text-xs sm:text-sm text-[#7a6b61] mt-1">
            Every product added or updated by store admins in the Owner Dashboard appears live here for instant try-on.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-xs font-semibold text-[#8a5538] bg-white/80 px-4 py-2 rounded-full border border-[#ede2d5]">
          <Shirt className="w-4 h-4 text-[#c89d7c]" />
          <span>Real-Time Admin Catalog Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Admin Products Selector List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#a67c5b]">
            1. Select Admin Uploaded Product ({products.length} Items)
          </h3>
          <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {products.map((prod, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={prod.id}
                  onClick={() => handleSelectProduct(idx)}
                  className={`p-3.5 rounded-2xl text-left transition-all duration-300 flex items-center justify-between border ${
                    isSelected
                      ? 'bg-white border-[#c89d7c] shadow-lg ring-2 ring-[#c89d7c]/20'
                      : 'bg-white/60 border-[#ede2d5] hover:bg-white hover:border-[#c89d7c]/50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-14 h-16 object-cover rounded-xl border border-[#ede2d5] bg-[#faf2ea]"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#a66e4e]">
                        {prod.category?.name || prod.gender}
                      </span>
                      <h4 className="text-sm font-serif font-bold text-[#332720] line-clamp-1">{prod.name}</h4>
                      <p className="text-xs font-bold text-[#2d231d] mt-0.5">₹{(prod.discountPrice || prod.price).toLocaleString()}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="p-1.5 rounded-full bg-[#c89d7c] text-white">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Product Image Variant Swatches */}
          {activeImages.length > 1 && (
            <div className="pt-3 space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#a67c5b]">
                2. Select Product Angle / Image Shot
              </h3>
              <div className="flex items-center space-x-3">
                {activeImages.map((imgUrl: string, imgIdx: number) => {
                  const isImgSelected = selectedImageIndex === imgIdx;
                  return (
                    <button
                      key={imgIdx}
                      onClick={() => setSelectedImageIndex(imgIdx)}
                      className={`relative w-12 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        isImgSelected
                          ? 'border-[#332720] shadow-md scale-105'
                          : 'border-[#ede2d5] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="Shot" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Animated Product Stage */}
        <div className="lg:col-span-7 relative">
          <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-white border border-[#ede2d5] shadow-2xl flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedProduct.id}-${selectedImageIndex}`}
                initial={{ opacity: 0.3, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.3, scale: 1.05 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full h-full"
              >
                <img
                  src={currentImage}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover object-center"
                />

                {/* Light Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#332720]/80 via-transparent to-black/10" />

                {/* Dynamic Admin Badge Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/95 text-[#332720] uppercase tracking-wider backdrop-blur-md shadow-md border border-[#ede2d5]">
                    SKU: {selectedProduct.SKU}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#c89d7c] text-white shadow-md">
                    {selectedProduct.category?.name || 'Admin Product'}
                  </span>
                </div>

                {/* Floating Product Details Card */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#ede2d5] shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#a66e4e]">
                        {selectedProduct.gender} • In Stock ({selectedProduct.stock} units)
                      </span>
                      <h4 className="text-lg font-serif font-bold text-[#332720]">{selectedProduct.name}</h4>
                    </div>
                    <span className="text-xl font-extrabold text-[#2d231d]">₹{(selectedProduct.discountPrice || selectedProduct.price).toLocaleString()}</span>
                  </div>

                  <p className="text-xs text-[#7a6b61] line-clamp-2">{selectedProduct.description}</p>

                  {/* Size Selector & Add to Bag CTA */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-1.5">
                      {['S', 'M', 'L', 'XL'].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            selectedSize === sz
                              ? 'bg-[#c89d7c] text-white shadow-md'
                              : 'bg-[#f4ece1] text-[#332720] hover:bg-[#e3d5c5]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleAddOutfitToBag}
                      className="px-6 py-2.5 rounded-xl bg-gold-gradient text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add Product To Bag
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
