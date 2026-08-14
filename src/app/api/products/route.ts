import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('featured');
    const isNewArrival = searchParams.get('newArrival');
    const isBestSeller = searchParams.get('bestSeller');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';

    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }
    if (gender) {
      where.gender = gender.toUpperCase();
    }
    if (isFeatured === 'true') {
      where.isFeatured = true;
    }
    if (isNewArrival === 'true') {
      where.isNewArrival = true;
    }
    if (isBestSeller === 'true') {
      where.isBestSeller = true;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { SKU: { contains: search } },
        { subcategory: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { isBestSeller: 'desc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        variants: true,
        reviews: {
          select: { rating: true },
        },
      },
    });

    // Calculate average rating
    const processedProducts = products.map((p) => {
      const totalRating = p.reviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = p.reviews.length > 0 ? totalRating / p.reviews.length : 5.0;
      return {
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
      };
    });

    return NextResponse.json({ products: processedProducts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      discountPrice,
      categoryId,
      subcategory,
      gender,
      isFeatured,
      isNewArrival,
      isBestSeller,
      SKU,
      images,
      specifications,
      variants,
    } = body;

    if (!name || !price || !categoryId || !SKU) {
      return NextResponse.json({ error: 'Name, price, categoryId, and SKU are required' }, { status: 400 });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || '',
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        categoryId,
        subcategory,
        gender: gender || 'UNISEX',
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isBestSeller: Boolean(isBestSeller),
        SKU,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {}),
        stock: Array.isArray(variants) ? variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) : 10,
        variants: {
          create: Array.isArray(variants)
            ? variants.map((v: any) => ({
                size: v.size || 'M',
                color: v.color || 'Onyx Black',
                colorHex: v.colorHex || '#000000',
                stock: parseInt(v.stock || 10),
                SKU: v.SKU || `${SKU}-${v.size}-${v.color}`,
                priceAdjustment: parseFloat(v.priceAdjustment || 0),
              }))
            : [
                { size: 'S', color: 'Onyx Black', colorHex: '#000000', stock: 10, SKU: `${SKU}-S` },
                { size: 'M', color: 'Onyx Black', colorHex: '#000000', stock: 15, SKU: `${SKU}-M` },
                { size: 'L', color: 'Onyx Black', colorHex: '#000000', stock: 10, SKU: `${SKU}-L` },
              ],
        },
      },
      include: { variants: true, category: true },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating product' }, { status: 500 });
  }
}
