import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to submit a review' }, { status: 401 });
    }

    const { productId, rating, comment } = await request.json();
    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Product ID, rating, and comment are required' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        userName: user.name,
        rating: parseInt(rating),
        comment,
        isApproved: true,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error submitting review' }, { status: 500 });
  }
}
