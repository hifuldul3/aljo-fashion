import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const idOrSlug = params.id;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
        variants: true,
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 5.0;

    // Fetch related products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: { category: true, variants: true },
    });

    const processedRelated = relatedProducts.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    }));

    return NextResponse.json({
      product: {
        ...product,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
        specifications:
          typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      },
      relatedProducts: processedRelated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const productId = params.id;
    const body = await request.json();

    const {
      name,
      description,
      price,
      discountPrice,
      categoryId,
      subcategory,
      gender,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isActive,
      images,
      specifications,
      variants,
    } = body;

    // Update product base fields
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(discountPrice !== undefined && { discountPrice: discountPrice ? parseFloat(discountPrice) : null }),
        ...(categoryId && { categoryId }),
        ...(subcategory !== undefined && { subcategory }),
        ...(gender && { gender }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(isNewArrival !== undefined && { isNewArrival: Boolean(isNewArrival) }),
        ...(isBestSeller !== undefined && { isBestSeller: Boolean(isBestSeller) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(images && { images: typeof images === 'string' ? images : JSON.stringify(images) }),
        ...(specifications && { specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications) }),
      },
    });

    // If variants updated
    if (Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId } });
      await prisma.productVariant.createMany({
        data: variants.map((v: any, idx: number) => ({
          productId,
          size: v.size || 'M',
          color: v.color || 'Onyx Black',
          colorHex: v.colorHex || '#000000',
          stock: parseInt(v.stock || 0),
          SKU: v.SKU || `${updated.SKU}-${v.size}-${v.color}-${idx}`,
          priceAdjustment: parseFloat(v.priceAdjustment || 0),
        })),
      });

      // Update total stock count
      const totalStock = variants.reduce((sum: number, v: any) => sum + parseInt(v.stock || 0), 0);
      await prisma.product.update({
        where: { id: productId },
        data: { stock: totalStock },
      });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const productId = params.id;
    await prisma.productVariant.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting product' }, { status: 500 });
  }
}

// Duplicate product endpoint handler
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const original = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    });

    if (!original) {
      return NextResponse.json({ error: 'Original product not found' }, { status: 404 });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newName = `${original.name} (Copy)`;
    const newSlug = `${original.slug}-copy-${randomSuffix}`;
    const newSKU = `${original.SKU}-COPY-${randomSuffix}`;

    const duplicated = await prisma.product.create({
      data: {
        name: newName,
        slug: newSlug,
        description: original.description,
        price: original.price,
        discountPrice: original.discountPrice,
        stock: original.stock,
        categoryId: original.categoryId,
        subcategory: original.subcategory,
        gender: original.gender,
        isFeatured: original.isFeatured,
        isNewArrival: true,
        isBestSeller: false,
        isActive: true,
        SKU: newSKU,
        images: original.images,
        specifications: original.specifications,
        variants: {
          create: original.variants.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
            SKU: `${newSKU}-${v.size}-${v.color}`,
            priceAdjustment: v.priceAdjustment,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json({ success: true, product: duplicated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error duplicating product' }, { status: 500 });
  }
}
