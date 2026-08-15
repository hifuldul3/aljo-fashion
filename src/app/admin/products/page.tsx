'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Copy, Eye, Star, Check, X, Sparkles, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminProductsPage() {
  const { addToast } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [gender, setGender] = useState('UNISEX');
  const [SKU, setSKU] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  
  // Feedable Image Gallery State
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');

  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchProducts = () => {
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
    fetchProducts();
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        if (data.categories?.length > 0) setCategoryId(data.categories[0].id);
      })
      .catch(() => {});
  }, []);

  const openAddModal = () => {
    setEditingProductId(null);
    setName('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setGender('UNISEX');
    setSKU(`ALJO-PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsFeatured(false);
    setIsNewArrival(true);
    setIsBestSeller(false);
    setImageUrls([
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
    ]);
    setInputUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProductId(p.id);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price.toString());
    setDiscountPrice(p.discountPrice ? p.discountPrice.toString() : '');
    setCategoryId(p.categoryId);
    setGender(p.gender);
    setSKU(p.SKU);
    setIsFeatured(p.isFeatured);
    setIsNewArrival(p.isNewArrival);
    setIsBestSeller(p.isBestSeller);
    
    let parsedImages: string[] = [];
    try {
      parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
    } catch {
      parsedImages = Array.isArray(p.images) ? p.images : [p.images];
    }
    setImageUrls(parsedImages || []);
    setInputUrl('');
    setIsModalOpen(true);
  };

  // Image Upload / Add Helpers
  const handleAddImageUrl = () => {
    if (!inputUrl.trim()) return;
    setImageUrls([...imageUrls, inputUrl.trim()]);
    setInputUrl('');
    addToast('Image Added', 'Image URL added to product gallery preview.', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrls((prev) => [...prev, event.target!.result as string]);
          addToast('Image Feeded', `File "${file.name}" uploaded to gallery preview.`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId || !SKU) {
      addToast('Error', 'Name, price, category and SKU are required.', 'error');
      return;
    }

    if (imageUrls.length === 0) {
      addToast('Error', 'Please add at least one product photo.', 'error');
      return;
    }

    setFormSubmitting(true);

    const payload = {
      name,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      categoryId,
      gender,
      SKU,
      isFeatured,
      isNewArrival,
      isBestSeller,
      images: imageUrls,
    };

    try {
      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setFormSubmitting(false);

      if (res.ok) {
        addToast('Success', editingProductId ? 'Product updated successfully.' : 'New product created.', 'success');
        setIsModalOpen(false);
        fetchProducts();
      } else {
        addToast('Error', data.error || 'Failed to save product.', 'error');
      }
    } catch {
      setFormSubmitting(false);
      addToast('Error', 'Network error saving product.', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Deleted', 'Product deleted from store catalog.', 'info');
        fetchProducts();
      }
    } catch {}
  };

  const handleDuplicateProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'POST' });
      if (res.ok) {
        addToast('Duplicated', 'Product duplicated with default copy SKU.', 'success');
        fetchProducts();
      }
    } catch {}
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.SKU.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">PRODUCT MANAGEMENT</span>
          <h1 className="text-3xl font-serif font-extrabold text-neutral-100">All Apparel &amp; Accessories</h1>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-xl bg-gold-gradient text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Product Data Table */}
      {loading ? (
        <p className="text-xs text-neutral-400">Loading catalog...</p>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/80 text-amber-400 uppercase tracking-widest text-[10px] font-bold border-b border-neutral-800">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Flags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {filteredProducts.map((p) => {
                  let img = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
                  try {
                    const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                    if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
                  } catch {}

                  return (
                    <tr key={p.id} className="hover:bg-neutral-900/40">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-12 h-14 object-cover rounded-lg bg-neutral-800 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-neutral-100 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-neutral-500">{p.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-amber-300">{p.SKU}</td>
                      <td className="p-4">{p.category?.name || 'Unassigned'}</td>
                      <td className="p-4 font-bold text-neutral-100">
                        ₹{p.price.toLocaleString()}
                        {p.discountPrice && (
                          <span className="text-[10px] text-amber-400 block font-normal">
                            Disc: ₹{p.discountPrice.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold">
                        <span className={p.stock <= 5 ? 'text-red-400 font-extrabold' : 'text-emerald-400'}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {p.isFeatured && <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 rounded font-bold">FEATURED</span>}
                          {p.isNewArrival && <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/20 text-blue-300 rounded font-bold">NEW</span>}
                          {p.isBestSeller && <span className="px-1.5 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 rounded font-bold">BESTSELLER</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(p.id)}
                          className="p-1.5 text-neutral-400 hover:text-blue-400 rounded-lg hover:bg-neutral-800"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-gold-gradient">
              {editingProductId ? 'Edit Couture Product' : 'Add New Couture Product'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    <option value="MEN">MEN</option>
                    <option value="WOMEN">WOMEN</option>
                    <option value="KIDS">KIDS</option>
                    <option value="UNISEX">UNISEX</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">SKU Number *</label>
                  <input
                    type="text"
                    required
                    value={SKU}
                    onChange={(e) => setSKU(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-neutral-100"
                />
              </div>

              {/* Feedable Product Images Section */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Feedable Product Photos ({imageUrls.length})
                  </label>
                  <span className="text-[10px] text-neutral-400">Upload files or enter image URLs</span>
                </div>

                {/* Live Image Thumbnail Gallery Preview */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
                        <img src={url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 text-white opacity-90 group-hover:opacity-100 hover:scale-110 transition-all"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/70 text-amber-300 text-[9px] font-mono px-1 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Local Image File Box */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <label className="w-full sm:w-auto flex-1 cursor-pointer flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-neutral-950 border border-dashed border-amber-400/50 hover:border-amber-400 text-amber-300 font-semibold text-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image File from Phone/PC</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Add Image URL Box */}
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="Paste Image URL (https://...)"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
                  >
                    + Add URL
                  </button>
                </div>
              </div>

              {/* Flags */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center space-x-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-amber-400"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center space-x-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="accent-amber-400"
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center space-x-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="accent-amber-400"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-neutral-950 font-bold text-xs"
                >
                  {formSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
