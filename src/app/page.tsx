import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import InteractiveDressingRoom from '@/components/InteractiveDressingRoom';
import { ArrowRight, Sparkles, ShieldCheck, Award, Star, Truck, ChevronRight, CheckCircle } from 'lucide-react';

export const revalidate = 0;

async function getHomePageData() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });

    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });

    const newArrivals = await prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: 4,
      include: { category: true, variants: true, reviews: { select: { rating: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const bestSellers = await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: 4,
      include: { category: true, variants: true, reviews: { select: { rating: true } } },
    });

    const featuredProducts = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      include: { category: true, variants: true, reviews: { select: { rating: true } } },
    });

    return {
      banners: banners.length > 0 ? banners : [
        {
          id: 'b1',
          title: "The Royal Elegance Collection '26",
          subtitle: "Bespoke Couture for Modern Connoisseurs",
          image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1920&q=80",
          linkUrl: "/shop",
          ctaText: "Shop Collection",
        }
      ],
      categories,
      newArrivals: newArrivals.map(p => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        rating: p.reviews.length > 0 ? Math.round((p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length) * 10) / 10 : 5.0,
      })),
      bestSellers: bestSellers.map(p => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        rating: p.reviews.length > 0 ? Math.round((p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length) * 10) / 10 : 5.0,
      })),
      featuredProducts: featuredProducts.map(p => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        rating: p.reviews.length > 0 ? Math.round((p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length) * 10) / 10 : 5.0,
      })),
    };
  } catch (e) {
    return { banners: [], categories: [], newArrivals: [], bestSellers: [], featuredProducts: [] };
  }
}

export default async function HomePage() {
  const data = await getHomePageData();
  const heroBanner = data.banners[0];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBanner.image}
            alt="AL-JO Fashion Banner"
            className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[0.95] scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fffdfa] via-[#fffdfa]/50 to-transparent" />
          <div className="absolute inset-0 bg-[#fffdfa]/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-16">
          <div className="inline-flex items-center space-x-2.5 px-5 py-2 rounded-full bg-white/95 border border-[#c89d7c]/40 text-[#a66e4e] text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-md animate-float">
            <Sparkles className="w-4 h-4 text-[#c89d7c]" />
            <span>AL-JO HAUTE COUTURE 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold tracking-tight text-[#332720] leading-[1.1]">
            <span className="block text-gold-bright">{heroBanner.title}</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#5e493c] font-medium leading-relaxed">
            {heroBanner.subtitle}. Impeccably tailored suits, Italian silk gowns, and handcrafted 24K hardware leather bags crafted for modern connoisseurs.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-gold-gradient text-white font-extrabold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2"
            >
              Explore Collection <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/shop?newArrival=true"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-white/90 border border-[#e3d5c5] text-[#332720] font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors backdrop-blur-md flex items-center justify-center shadow-md"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Interactive Animated Virtual Dressing Studio */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveDressingRoom />
      </section>

      {/* 3. Value Proposition Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: "Free Express Shipping", desc: "Complimentary delivery on orders over ₹2,999" },
            { icon: Award, title: "Italian Silk & Velvet", desc: "Sourced directly from certified Como mills" },
            { icon: ShieldCheck, title: "24K Gold Hardware", desc: "Hand-finished brass closures built to last" },
            { icon: CheckCircle, title: "30-Day Royal Guarantee", desc: "Hassle-free size exchange & complimentary returns" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl glass-card border border-[#ede2d5] flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-[#f7eee6] border border-[#ebdccf] text-[#c89d7c] flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#332720]">{item.title}</h4>
                  <p className="text-xs text-[#7a6b61] mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#a67c5b]">CURATED SELECTION</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#332720] mt-1">Featured Categories</h2>
          </div>
          <Link
            href="/shop"
            className="mt-3 md:mt-0 text-sm font-bold text-[#a66e4e] hover:text-[#c89d7c] inline-flex items-center group"
          >
            View All Categories <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-96 rounded-3xl overflow-hidden glass-card border border-[#ede2d5] hover:border-[#c89d7c] transition-all duration-500 shadow-md"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#332720]/85 via-[#332720]/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white bg-white/20 border border-white/30 px-2.5 py-1 rounded-full backdrop-blur-md">
                  {cat._count.products} Designs
                </span>
                <h3 className="text-2xl font-serif font-bold text-white group-hover:text-amber-100 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-neutral-200 line-clamp-2">{cat.description}</p>
                <div className="pt-2 text-xs font-bold text-white flex items-center group-hover:translate-x-1 transition-transform">
                  Explore Collection <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#a67c5b]">FRESH OFF THE ATELIER</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#332720] mt-1">New Arrivals</h2>
          </div>
          <Link
            href="/shop?newArrival=true"
            className="mt-3 md:mt-0 text-sm font-bold text-[#a66e4e] hover:text-[#c89d7c] inline-flex items-center group"
          >
            See New Arrivals <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Special Privilege Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#fbf4ec] via-[#f7eee6] to-[#fbf4ec] border border-[#ebdccf] p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#c89d7c] text-white uppercase tracking-widest shadow-md">
              EXCLUSIVE PRIVILEGE
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#332720] leading-tight">
              Enjoy 20% Off Your First Order
            </h2>
            <p className="text-sm text-[#5e493c] leading-relaxed">
              Apply promo code <strong className="text-[#a66e4e] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-[#e3d5c5]">WELCOME20</strong> at checkout to receive complimentary box packaging and instant savings across all collections.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                href="/shop"
                className="px-8 py-3.5 rounded-full bg-gold-gradient text-white font-extrabold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
              >
                Claim Privilege
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0 relative">
            <img
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
              alt="Special Offer Couture"
              className="w-64 sm:w-72 h-80 object-cover rounded-3xl border-2 border-[#e3d5c5] shadow-xl rotate-1 hover:rotate-0 transition-transform"
            />
          </div>
        </div>
      </section>

      {/* 7. Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#a67c5b]">MOST COVETED PIECES</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#332720] mt-1">Best Sellers</h2>
          </div>
          <Link
            href="/shop?bestSeller=true"
            className="mt-3 md:mt-0 text-sm font-bold text-[#a66e4e] hover:text-[#c89d7c] inline-flex items-center group"
          >
            Shop Best Sellers <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. Client Acclaim Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#a67c5b]">CLIENT ACCLAIM</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#332720]">What Our Patrons Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "The Velvet Suit was the highlight of the gala. The fit felt as though it was tailored in Milan.",
              name: "Vikramaditya Roy",
              role: "Gala Guest, Mumbai",
              rating: 5,
            },
            {
              quote: "AL-JO's silk gowns drape so beautifully. The gold hardware accents on the tote bag look 100% authentic luxury.",
              name: "Ananya Deshmukh",
              role: "Fashion Curator, Delhi",
              rating: 5,
            },
            {
              quote: "Delivery was swift, packaging was royal, and the double-breasted linen blazer is my go-to summer statement.",
              name: "Rohan Kapoor",
              role: "Executive, Bengaluru",
              rating: 5,
            },
          ].map((review, idx) => (
            <div key={idx} className="p-8 rounded-3xl glass-card border border-[#ede2d5] space-y-4">
              <div className="flex text-[#c89d7c] space-x-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[#5e493c] italic leading-relaxed">"{review.quote}"</p>
              <div className="pt-4 border-t border-[#f4ece1]">
                <h4 className="text-sm font-serif font-bold text-[#332720]">{review.name}</h4>
                <p className="text-xs text-[#7a6b61]">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Brand Story */}
      <section className="bg-[#f7eee6] border-y border-[#ebdccf] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a67c5b]">HERITAGE &amp; VISION</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#332720] leading-tight">
              Crafting Excellence Since 2020
            </h2>
            <p className="text-sm text-[#5e493c] leading-relaxed font-light">
              AL-JO Fashion was founded with a singular commitment: to restore timeless elegance and bespoke tailoring to modern fashion. Each garment is designed with carefully sourced fabrics—from Giza Egyptian cottons to French flax linens and Tuscan calfskin leather.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div>
                <h4 className="text-2xl font-serif font-bold text-[#a66e4e]">100%</h4>
                <p className="text-xs text-[#7a6b61]">Authentic Premium Fabrics</p>
              </div>
              <div>
                <h4 className="text-2xl font-serif font-bold text-[#a66e4e]">15,000+</h4>
                <p className="text-xs text-[#7a6b61]">Dispatched Orders Worldwide</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#e3d5c5] shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1000&q=80"
              alt="Brand Story Atelier"
              className="w-full h-full object-cover filter brightness-95"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
