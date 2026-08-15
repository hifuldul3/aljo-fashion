import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAdmin } from '@/lib/auth';

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

// Admin status & courier tracking updater
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

    // If cancelled by admin, restore stock counts
    if (status === 'CANCELLED') {
      for (const item of updatedOrder.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          }).catch(() => {});
        }
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        }).catch(() => {});
      }
    }

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

// Customer / User Order Cancellation Endpoint
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const orderId = params.id;
    const { cancellationReason } = await request.json();

    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    if (existingOrder.status === 'SHIPPED' || existingOrder.status === 'DELIVERED' || existingOrder.status === 'CANCELLED') {
      return NextResponse.json({
        error: `Order cannot be cancelled because it is already ${existingOrder.status}.`,
      }, { status: 400 });
    }

    // Update order status to CANCELLED
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        notes: cancellationReason ? `Cancelled by customer. Reason: ${cancellationReason}` : 'Cancelled by customer',
      },
      include: { items: true },
    });

    // Restore product and variant stock in database
    for (const item of existingOrder.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        }).catch(() => {});
      }
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      }).catch(() => {});
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Order #${existingOrder.orderNumber} Cancelled`,
        message: `Your order #${existingOrder.orderNumber} has been successfully cancelled and stock restored.`,
        type: 'ORDER',
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        ...cancelledOrder,
        shippingAddress: typeof cancelledOrder.shippingAddress === 'string' ? JSON.parse(cancelledOrder.shippingAddress) : cancelledOrder.shippingAddress,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing order cancellation' }, { status: 500 });
  }
}
