import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { title, subtitle, image, linkUrl, ctaText, position } = await request.json();
    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image URL required' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        linkUrl: linkUrl || '/shop',
        ctaText: ctaText || 'Shop Now',
        position: position ? parseInt(position) : 0,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating banner' }, { status: 500 });
  }
}
