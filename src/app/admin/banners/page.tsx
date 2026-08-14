'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminBannersPage() {
  const { addToast } = useStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [ctaText, setCtaText] = useState('Shop Collection');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    fetch('/api/banners')
      .then((res) => res.json())
      .then((data) => {
        setBanners(data.banners || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image) return;

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, image, ctaText }),
      });

      if (res.ok) {
        addToast('Banner Created', 'New homepage hero banner added.', 'success');
        setTitle('');
        setSubtitle('');
        setImage('');
        setIsModalOpen(false);
        fetchBanners();
      }
    } catch {
      addToast('Error', 'Failed to save banner.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">CONTENT MANAGEMENT</span>
          <h1 className="text-3xl font-serif font-extrabold text-neutral-100">Homepage Banners</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gold-gradient text-neutral-950 font-bold text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Hero Banner
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-neutral-400">Loading banners...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="glass-card rounded-3xl overflow-hidden border border-neutral-800 space-y-3">
              <div className="relative aspect-[16/9] w-full bg-neutral-900">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-base font-serif font-bold text-neutral-100">{b.title}</h3>
                <p className="text-xs text-neutral-400">{b.subtitle}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                  CTA: {b.ctaText}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4 max-w-md w-full">
            <h3 className="text-lg font-serif font-bold text-gold-gradient">Add New Hero Banner</h3>
            <form onSubmit={handleCreateBanner} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Italian Silk Collection '26"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Bespoke Couture for Modern Kings"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">High-Res Image URL *</label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Button CTA Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-gradient text-neutral-950 font-bold"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
