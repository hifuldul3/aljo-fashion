'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Star, ShoppingBag, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : ['/placeholder.jpg'];

  const variants = product.variants || [
    { size: 'S', color: 'Onyx Black', stock: 5 },
    { size: 'M', color: 'Onyx Black', stock: 10 },
    { size: 'L', color: 'Onyx Black', stock: 8 },
  ];

  const availableSizes = Array.from(new Set(variants.map((v: any) => v.size)));
  const availableColors = Array.from(new Set(variants.map((v: any) => v.color)));

  const currentSize = String(selectedSize || availableSizes[0] || 'M');
  const currentColor = String(selectedColor || availableColors[0] || 'Onyx Black');

  const activeVariant = variants.find((v: any) => v.size === currentSize && v.color === currentColor) || variants[0];
  const stockAvailable = activeVariant ? activeVariant.stock : product.stock;
  const isOutOfStock = stockAvailable <= 0;

  const handleAddToCart = () => {
    addToCart(product, {
      id: activeVariant?.id,
      size: currentSize,
      color: currentColor,
    });
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 md:p-10 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900/80 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="relative bg-neutral-900 p-6 flex flex-col justify-between">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex space-x-2 mt-4 overflow-x-auto pb-1">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-amber-400 scale-105' : 'border-neutral-800 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info */}
        <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="uppercase tracking-widest font-semibold text-amber-400">
                {product.category?.name || 'AL-JO Fashion'}
              </span>
              <div className="flex items-center space-x-1 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-sm">{product.rating || 5.0}</span>
                <span className="text-neutral-500">({product.reviewCount || 2} reviews)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-100">{product.name}</h2>

            <div className="flex items-baseline space-x-3">
              <span className="text-2xl font-bold text-gold-gradient">
                ₹{(product.discountPrice || product.price).toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-neutral-500 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size: any) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        currentSize === size
                          ? 'bg-amber-400 text-neutral-950 shadow-md font-bold'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Select Color</label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color: any) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        currentColor === color
                          ? 'bg-neutral-800 border-2 border-amber-400 text-amber-300'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Badge */}
            <div className="text-xs font-semibold">
              {isOutOfStock ? (
                <span className="text-red-400">Out of Stock in selected variant</span>
              ) : (
                <span className="text-emerald-400">In Stock ({stockAvailable} units ready to ship)</span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-neutral-900">
            <div className="flex gap-3">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 py-3.5 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO SHOPPING BAG'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-colors ${
                  isInWishlist(product.id)
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-amber-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <Link
              href={`/product/${product.slug}`}
              onClick={() => setQuickViewProduct(null)}
              className="block text-center text-xs text-neutral-400 hover:text-amber-300 transition-colors py-1"
            >
              View Full Product Specifications &amp; Reviews <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
