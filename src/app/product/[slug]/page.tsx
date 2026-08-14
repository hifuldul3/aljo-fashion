'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Check, ArrowRight, MessageSquare, ChevronDown, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { addToCart, toggleWishlist, isInWishlist, addToast, user } = useStore();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Review submission state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);

          // Pre-select first size and color
          const variants = data.product.variants || [];
          if (variants.length > 0) {
            setSelectedSize(variants[0].size);
            setSelectedColor(variants[0].color);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading couture details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-neutral-100">Product Not Found</h2>
        <p className="text-xs text-neutral-400">The couture piece you requested could not be located.</p>
        <Link href="/shop" className="inline-block px-6 py-2.5 rounded-full bg-gold-gradient text-neutral-950 text-xs font-bold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : ['/placeholder.jpg'];

  const variants = product.variants || [];
  const availableSizes = Array.from(new Set(variants.map((v: any) => v.size)));
  const availableColors = Array.from(new Set(variants.map((v: any) => v.color)));

  const currentSize = String(selectedSize || availableSizes[0] || 'M');
  const currentColor = String(selectedColor || availableColors[0] || 'Onyx Black');

  const activeVariant = variants.find((v: any) => v.size === currentSize && v.color === currentColor) || variants[0];
  const stockAvailable = activeVariant ? activeVariant.stock : product.stock;
  const isOutOfStock = stockAvailable <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      addToast('Out of Stock', 'Selected size/color variant is currently out of stock.', 'error');
      return;
    }
    addToCart(
      product,
      {
        id: activeVariant?.id,
        size: currentSize,
        color: currentColor,
        priceAdjustment: activeVariant?.priceAdjustment || 0,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      addToast('Error', 'Please write a brief review comment.', 'error');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment,
        }),
      });
      const data = await res.json();
      setReviewSubmitting(false);

      if (res.ok) {
        addToast('Review Submitted', 'Thank you for your valuable feedback!', 'success');
        setNewComment('');
        // Append review to list locally
        setProduct((prev: any) => ({
          ...prev,
          reviews: [data.review, ...(prev.reviews || [])],
        }));
      } else {
        addToast('Error', data.error || 'Failed to submit review.', 'error');
      }
    } catch {
      setReviewSubmitting(false);
      addToast('Error', 'Network error submitting review.', 'error');
    }
  };

  const specs = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-amber-400">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-amber-400">Shop</Link>
        <span>/</span>
        <span className="text-amber-300 font-semibold line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Image Gallery with Hover Zoom */}
        <div className="space-y-4">
          <div
            className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <img
              src={images[selectedImage] || images[0]}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
            />
            {product.discountPrice && (
              <span className="absolute top-4 left-4 bg-amber-500 text-neutral-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === idx ? 'border-amber-400 scale-105 shadow-lg' : 'border-neutral-800 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Buying Controls */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="uppercase tracking-widest font-bold text-amber-400">
                {product.category?.name} • {product.gender}
              </span>
              <span className="font-mono text-[10px] text-neutral-500">SKU: {product.SKU}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-neutral-100">{product.name}</h1>

            {/* Rating Stars */}
            <div className="flex items-center space-x-3 text-amber-400 text-sm">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-neutral-700'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-neutral-200">{product.rating || 5.0}</span>
              <span className="text-neutral-500">• {product.reviewCount || product.reviews?.length || 2} Customer Reviews</span>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline space-x-4 pt-2">
              <span className="text-3xl font-extrabold text-gold-gradient font-serif">
                ₹{(product.discountPrice || product.price).toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-base text-neutral-500 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
              <span className="text-xs text-emerald-400 font-semibold">(Inclusive of all luxury taxes)</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/80 pt-4">
            {product.description}
          </p>

          {/* Size Picker */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-neutral-300">Select Size</span>
                <span className="text-amber-400 underline cursor-pointer">Size Guide</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableSizes.map((size: any) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentSize === size
                        ? 'bg-amber-400 text-neutral-950 shadow-lg scale-105'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Picker */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Select Color</span>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((color: any) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      currentColor === color
                        ? 'bg-neutral-900 border-2 border-amber-400 text-amber-300 shadow-lg'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center space-x-2 text-xs font-semibold">
            {isOutOfStock ? (
              <span className="inline-flex items-center text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
                Out of Stock in selected variant
              </span>
            ) : (
              <span className="inline-flex items-center text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                <Check className="w-3.5 h-3.5 mr-1" /> Ready to Dispatch ({stockAvailable} left in stock)
              </span>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex gap-4">
              {/* Quantity Picker */}
              <div className="flex items-center space-x-3 border border-neutral-800 rounded-xl px-4 bg-neutral-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-neutral-400 hover:text-white text-lg font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold text-neutral-200 min-w-[20px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                  className="text-neutral-400 hover:text-white text-lg font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 py-4 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-xl"
              >
                <ShoppingBag className="w-4 h-4" /> ADD TO BAG
              </button>

              {/* Wishlist Toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-xl border transition-colors ${
                  isInWishlist(product.id)
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-amber-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="w-full py-4 rounded-xl bg-neutral-900 border border-amber-500/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider hover:bg-amber-500/10 transition-colors disabled:opacity-50"
            >
              BUY NOW WITH 1-CLICK CHECKOUT
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[10px] text-neutral-400 border-t border-neutral-900">
            <div className="p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
              <Truck className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <span>Complimentary Express Delivery</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
              <RotateCcw className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <span>14-Day Seamless Exchanges</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <span>100% Certified Italian Origin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Policy Accordion Tabs */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-serif font-bold text-gold-gradient">Couture Specifications &amp; Care</h3>
        {Object.keys(specs).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(specs).map(([key, val]: [string, any]) => (
              <div key={key} className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">{key}</span>
                <p className="text-xs font-semibold text-neutral-200 mt-1">{String(val)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400">100% Handcrafted premium fashion garment.</p>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h3 className="text-2xl font-serif font-bold text-neutral-100">Patron Reviews</h3>
            <p className="text-xs text-neutral-400 mt-1">Verified purchases &amp; ratings</p>
          </div>
          <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl">
            <Star className="w-5 h-5 text-amber-400 fill-current" />
            <span className="text-lg font-bold text-amber-300">{product.rating || 5.0} / 5.0</span>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev: any) => (
              <div key={rev.id || Math.random()} className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-neutral-200">{rev.userName}</span>
                  <div className="flex text-amber-400 space-x-1">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">"{rev.comment}"</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-500 italic">No reviews yet. Be the first patron to leave feedback!</p>
          )}
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-neutral-800 space-y-4">
          <h4 className="text-sm font-semibold text-amber-300">Write a Review</h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-400">Rating:</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={`p-1 ${star <= newRating ? 'text-amber-400' : 'text-neutral-700'}`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={3}
            placeholder="Share your experience regarding fit, fabric quality, and appearance..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={reviewSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gold-gradient text-neutral-950 font-bold text-xs hover:opacity-90 disabled:opacity-50"
          >
            {reviewSubmitting ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-neutral-100">Complementary Couture</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
