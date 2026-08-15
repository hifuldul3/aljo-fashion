import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const idOrNumber = params.id;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        ...order,
        shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching order' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const orderId = params.id;
    const { status, trackingNumber, carrier, paymentStatus } = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(carrier !== undefined && { carrier }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: { items: true, user: true },
    });

    // Notify customer on status update
    if (status && updatedOrder.user) {
      await prisma.notification.create({
        data: {
          userId: updatedOrder.userId,
          title: `Order Status Update: #${updatedOrder.orderNumber}`,
          message: `Your order status has been updated to "${status}". Tracking: ${trackingNumber || 'Processing'}`,
          type: 'ORDER',
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        shippingAddress: typeof updatedOrder.shippingAddress === 'string' ? JSON.parse(updatedOrder.shippingAddress) : updatedOrder.shippingAddress,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating order' }, { status: 500 });
  }
}
