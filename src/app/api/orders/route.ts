import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let orders;
    if (user.role === 'ADMIN') {
      orders = await prisma.order.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    const processedOrders = orders.map((o) => ({
      ...o,
      shippingAddress: typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress,
    }));

    return NextResponse.json({ orders: processedOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, couponCode, subtotal, discountAmount, shippingFee, totalAmount, notes } = body;

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: 'Order items and shipping address are required' }, { status: 400 });
    }

    let user = await getCurrentUser();

    // If guest checkout, create or find customer user account by email
    if (!user) {
      const email = shippingAddress.email || `customer-${Date.now()}@guest.com`;
      let existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            name: shippingAddress.fullName || 'Guest Customer',
            email,
            passwordHash: 'GUEST_ACCOUNT_HASH',
            phone: shippingAddress.phone || null,
            role: 'CUSTOMER',
          },
        });
      }
      user = existingUser;
    }

    // Generate unique order number (e.g., ALJO-48291)
    const orderNumber = `ALJO-${Math.floor(10000 + Math.random() * 90000)}`;
    const mockPaymentId = paymentMethod === 'COD' ? null : `pay_razor_${Math.random().toString(36).substring(2, 10)}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'CONFIRMED',
        subtotal: parseFloat(subtotal),
        discountAmount: parseFloat(discountAmount || 0),
        shippingFee: parseFloat(shippingFee || 0),
        totalAmount: parseFloat(totalAmount),
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        paymentMethod: paymentMethod || 'RAZORPAY',
        paymentId: mockPaymentId,
        couponCode: couponCode || null,
        shippingAddress: JSON.stringify(shippingAddress),
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variant?.id || null,
            productName: item.name,
            productImage: item.image,
            size: item.variant?.size || 'Default',
            color: item.variant?.color || 'Default',
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
          })),
        },
      },
      include: { items: true },
    });

    // Update variant and product stock counts
    for (const item of items) {
      if (item.variant?.id) {
        await prisma.productVariant.update({
          where: { id: item.variant.id },
          data: { stock: { decrement: item.quantity } },
        }).catch(() => {});
      }
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      }).catch(() => {});
    }

    // Increment coupon usage count if applied
    if (couponCode) {
      await prisma.coupon.update({
        where: { code: couponCode.toUpperCase() },
        data: { timesUsed: { increment: 1 } },
      }).catch(() => {});
    }

    // Send in-app notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Order Placed Successfully!`,
        message: `Your order #${orderNumber} for ₹${totalAmount.toLocaleString()} has been confirmed.`,
        type: 'ORDER',
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      order: {
        ...newOrder,
        shippingAddress: JSON.parse(newOrder.shippingAddress),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}
