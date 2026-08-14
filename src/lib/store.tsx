'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartVariant {
  id?: string;
  size: string;
  color: string;
  colorHex?: string;
  priceAdjustment?: number;
}

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  variant?: CartVariant;
  quantity: number;
  stock: number;
}

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  category: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  calculatedDiscount: number;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  user: UserSession | null;
  toasts: ToastMessage[];
  appliedCoupon: AppliedCoupon | null;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: any | null;
  
  // Actions
  addToCart: (product: any, variant?: CartVariant, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  toggleWishlist: (product: any) => void;
  isInWishlist: (productId: string) => boolean;
  
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  
  setUser: (user: UserSession | null) => void;
  addToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  setIsCartOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: any | null) => void;
  
  // Computations
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  totalCartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [user, setUser] = useState<UserSession | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  // Load persisted Cart, Wishlist, and User from localStorage & API on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('aljo_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('aljo_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      
      const savedCoupon = localStorage.getItem('aljo_coupon');
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error('Error parsing stored session:', e);
    }

    // Check logged in user status
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Save Cart & Wishlist to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem('aljo_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('aljo_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('aljo_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('aljo_coupon');
      }
    } catch (e) {}
  }, [appliedCoupon]);

  const addToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: any, variant?: CartVariant, quantity: number = 1) => {
    const images = Array.isArray(product.images)
      ? product.images
      : typeof product.images === 'string'
      ? JSON.parse(product.images)
      : ['/placeholder.jpg'];

    const price = product.discountPrice ?? product.price;
    const finalPrice = price + (variant?.priceAdjustment || 0);
    const cartItemId = `${product.id}-${variant?.size || 'default'}-${variant?.color || 'default'}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === cartItemId);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        const maxStock = updated[existingIndex].stock;
        
        if (newQty > maxStock) {
          addToast('Stock Limit Reached', `Only ${maxStock} items available in stock.`, 'info');
          updated[existingIndex].quantity = maxStock;
        } else {
          updated[existingIndex].quantity = newQty;
          addToast('Cart Updated', `Updated quantity of ${product.name} to ${updated[existingIndex].quantity}`, 'success');
        }
        return updated;
      } else {
        addToast('Added to Cart', `${product.name} added to your bag.`, 'success');
        return [
          ...prevCart,
          {
            id: cartItemId,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: finalPrice,
            discountPrice: product.discountPrice,
            image: images[0],
            variant,
            quantity: Math.min(quantity, product.stock || 10),
            stock: product.stock || 10,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    addToast('Item Removed', 'Item removed from your cart.', 'info');
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const validQty = Math.min(quantity, item.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (product: any) => {
    const images = Array.isArray(product.images)
      ? product.images
      : typeof product.images === 'string'
      ? JSON.parse(product.images)
      : ['/placeholder.jpg'];

    const exists = wishlist.some((w) => w.productId === product.id);

    if (exists) {
      setWishlist((prev) => prev.filter((w) => w.productId !== product.id));
      addToast('Removed from Wishlist', `${product.name} removed.`, 'info');
    } else {
      setWishlist((prev) => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          discountPrice: product.discountPrice,
          image: images[0],
          category: product.category?.name || 'Fashion',
        },
      ]);
      addToast('Added to Wishlist', `${product.name} saved to your wishlist.`, 'success');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((w) => w.productId === productId);
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon && subtotal >= ((appliedCoupon as any).minOrderValue || 0)) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const shippingFee = subtotal > 2999 || cart.length === 0 ? 0 : 250;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok || !data.coupon) {
        return { success: false, message: data.error || 'Invalid or expired coupon code.' };
      }

      const coupon = data.coupon;

      if (subtotal < coupon.minOrderValue) {
        return {
          success: false,
          message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString()} required for code ${coupon.code}.`,
        };
      }

      let calcDiscount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        calcDiscount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && calcDiscount > coupon.maxDiscount) {
          calcDiscount = coupon.maxDiscount;
        }
      } else {
        calcDiscount = coupon.discountValue;
      }

      setAppliedCoupon({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: calcDiscount,
      });

      addToast('Coupon Applied!', `Applied code ${coupon.code} successfully.`, 'success');
      return { success: true, message: `Coupon ${coupon.code} applied!` };
    } catch (err) {
      return { success: false, message: 'Server error validating coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon Removed', 'Promo discount cleared.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        user,
        toasts,
        appliedCoupon,
        isCartOpen,
        isSearchOpen,
        quickViewProduct,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        setUser,
        addToast,
        removeToast,
        setIsCartOpen,
        setIsSearchOpen,
        setQuickViewProduct,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        totalCartCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
