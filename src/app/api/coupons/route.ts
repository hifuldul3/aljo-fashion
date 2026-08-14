import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
      }

      if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
        return NextResponse.json({ error: 'Coupon code has expired' }, { status: 400 });
      }

      if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
        return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
      }

      return NextResponse.json({ coupon });
    }

    // Admin listing
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing coupon' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, validUntil, usageLimit } = await request.json();

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Code and discount value required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating coupon' }, { status: 500 });
  }
}
