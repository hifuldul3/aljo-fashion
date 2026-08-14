'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

export interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : ['/placeholder.jpg'];

  const primaryImage = images[0];
  const secondaryImage = images[1] || images[0];

  const price = product.price;
  const discountPrice = product.discountPrice;
  const discountPercent = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const inWishlist = isInWishlist(product.id);

  return (
    <div
      className="group relative flex flex-col glass-card rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-[#ede2d5]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#faf2ea]">
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col space-y-1.5 z-10">
          {discountPercent > 0 && (
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-[#d4a373] to-[#c89d7c] text-white uppercase tracking-wider shadow-md">
              {discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 border border-[#c89d7c]/40 text-[#8a5538] uppercase tracking-wider backdrop-blur-md shadow-sm">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#fbf0e4] border border-[#e3cebe] text-[#824f33] uppercase tracking-wider backdrop-blur-md shadow-sm">
              BESTSELLER
            </span>
          )}
          {product.stock <= 0 && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#a84444] text-white uppercase tracking-wider">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3.5 right-3.5 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-10 shadow-md ${
            inWishlist
              ? 'bg-[#c89d7c] text-white scale-110'
              : 'bg-white/80 text-[#332720] hover:bg-white hover:text-[#c89d7c]'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View & Add to Bag Shortcuts */}
        <div className="absolute inset-x-3.5 bottom-3.5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={() => setQuickViewProduct(product)}
            className="flex-1 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[#e3d5c5] text-[#332720] hover:bg-white hover:text-[#c89d7c] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
          <button
            disabled={product.stock <= 0}
            onClick={() => addToCart(product)}
            className="p-3 rounded-2xl bg-gold-gradient text-white hover:opacity-90 disabled:opacity-50 text-xs font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            title="Quick Add to Bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details Container */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between text-xs text-[#7a6b61] mb-1.5">
            <span className="uppercase tracking-widest text-[10px] font-bold text-[#a67c5b]">
              {product.category?.name || product.gender || 'Haute Couture'}
            </span>
            <div className="flex items-center space-x-1 text-[#c89d7c]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold text-[#332720]">{product.rating || 5.0}</span>
            </div>
          </div>

          <Link href={`/product/${product.slug}`} className="hover:text-[#c89d7c] transition-colors">
            <h3 className="text-base font-serif font-bold text-[#332720] line-clamp-1 leading-snug">{product.name}</h3>
          </Link>
        </div>

        {/* Pricing */}
        <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-[#f4ece1]">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-[#2d231d]">
              ₹{(discountPrice || price).toLocaleString()}
            </span>
            {discountPrice && (
              <span className="text-xs text-[#9c8c80] line-through">
                ₹{price.toLocaleString()}
              </span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-[10px] font-bold text-[#b85c37] animate-pulse">
              Only {product.stock} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
