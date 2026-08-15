import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function safeJsonParse(value: any, fallback: any) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * GET /api/products
 * Fetch products with filters, sorting and search.
 */
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

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
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
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
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

    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    }
    if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    }
    if (sort === 'popular') {
      orderBy = { isBestSeller: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        variants: true,
        reviews: { select: { rating: true } },
      },
    });

    const processedProducts = products.map((p: any) => {
      const reviews = Array.isArray(p.reviews) ? p.reviews : [];
      const totalRating = reviews.reduce((acc: number, review: any) => acc + Number(review.rating || 0), 0);
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 5.0;

      return {
        ...p,
        images: safeJsonParse(p.images, []),
        specifications: safeJsonParse(p.specifications, {}),
        price: Number(p.price),
        discountPrice: p.discountPrice !== null && p.discountPrice !== undefined ? Number(p.discountPrice) : null,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      };
    });

    return NextResponse.json({ products: processedProducts });
  } catch (error: any) {
    console.error('PRODUCT API GET ERROR:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch products' }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Create a new product with guaranteed unique slug and SKU.
 * Admin access required.
 */
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

    if (!name || price === undefined || price === null || !categoryId || !SKU) {
      return NextResponse.json(
        { error: 'Name, price, categoryId, and SKU are required' },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // GUARANTEE UNIQUE SLUG & UNIQUE SKU
    // -----------------------------------------
    let baseSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      'product';

    let generatedSlug = baseSlug;
    let existingSlug = await prisma.product.findUnique({ where: { slug: generatedSlug } });
    if (existingSlug) {
      generatedSlug = `${baseSlug}-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
    }

    let finalSKU = SKU.trim();
    let existingSKU = await prisma.product.findUnique({ where: { SKU: finalSKU } });
    if (existingSKU) {
      finalSKU = `${SKU}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // -----------------------------------------
    // PROCESS VARIANTS
    // -----------------------------------------
    let variantData;
    if (Array.isArray(variants) && variants.length > 0) {
      variantData = variants.map((v: any, idx: number) => ({
        size: v.size || 'M',
        color: v.color || 'Onyx Black',
        colorHex: v.colorHex || '#000000',
        stock: parseInt(v.stock || '10', 10),
        SKU: v.SKU || `${finalSKU}-${v.size || 'M'}-${idx + 1}`,
        priceAdjustment: parseFloat(v.priceAdjustment || '0'),
      }));
    } else {
      variantData = [
        {
          size: 'S',
          color: 'Onyx Black',
          colorHex: '#000000',
          stock: 10,
          SKU: `${finalSKU}-S`,
          priceAdjustment: 0,
        },
        {
          size: 'M',
          color: 'Onyx Black',
          colorHex: '#000000',
          stock: 15,
          SKU: `${finalSKU}-M`,
          priceAdjustment: 0,
        },
        {
          size: 'L',
          color: 'Onyx Black',
          colorHex: '#000000',
          stock: 10,
          SKU: `${finalSKU}-L`,
          priceAdjustment: 0,
        },
      ];
    }

    const totalStock = variantData.reduce((sum: number, variant: any) => sum + Number(variant.stock || 0), 0);

    // -----------------------------------------
    // CREATE PRODUCT
    // -----------------------------------------
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        description: description || '',
        price: parseFloat(price),
        discountPrice:
          discountPrice !== undefined && discountPrice !== null && discountPrice !== ''
            ? parseFloat(discountPrice)
            : null,
        categoryId,
        subcategory: subcategory || null,
        gender: gender || 'UNISEX',
        isFeatured: isFeatured === true || isFeatured === 'true',
        isNewArrival: isNewArrival === true || isNewArrival === 'true',
        isBestSeller: isBestSeller === true || isBestSeller === 'true',
        SKU: finalSKU,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {}),
        stock: totalStock,
        variants: {
          create: variantData,
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('PRODUCT API POST ERROR:', error);
    return NextResponse.json({ error: error?.message || 'Error creating product' }, { status: 500 });
  }
}