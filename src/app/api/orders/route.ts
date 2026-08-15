import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
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
    const { items, shippingAddress, paymentMethod, couponCode, notes } = body;

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: 'Order items and shipping address are required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Patron Account Required. Please log in or register an account before placing an order.' },
        { status: 401 }
      );
    }

    // -------------------------------------------------------------
    // ANTI-HACKING SERVER-SIDE PRICE VALIDATION
    // Recalculate true total directly from database product prices
    // -------------------------------------------------------------
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!dbProduct) {
        return NextResponse.json({ error: `Product "${item.name}" is no longer available.` }, { status: 400 });
      }

      // Use true server price (discountPrice if active, else regular price)
      const trueUnitPrice = dbProduct.discountPrice !== null && dbProduct.discountPrice !== undefined
        ? Number(dbProduct.discountPrice)
        : Number(dbProduct.price);

      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      calculatedSubtotal += trueUnitPrice * qty;

      validatedItems.push({
        productId: dbProduct.id,
        variantId: item.variant?.id || null,
        productName: dbProduct.name,
        productImage: item.image || (typeof dbProduct.images === 'string' ? JSON.parse(dbProduct.images)[0] : dbProduct.images?.[0]),
        size: item.variant?.size || 'Default',
        color: item.variant?.color || 'Default',
        price: trueUnitPrice,
        quantity: qty,
      });
    }

    // Calculate coupon discount
    let calculatedDiscount = 0;
    if (couponCode) {
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (dbCoupon && dbCoupon.isActive && calculatedSubtotal >= Number(dbCoupon.minOrderValue || 0)) {
        if (dbCoupon.discountType === 'PERCENTAGE') {
          calculatedDiscount = (calculatedSubtotal * Number(dbCoupon.discountValue)) / 100;
          if (dbCoupon.maxDiscount && calculatedDiscount > Number(dbCoupon.maxDiscount)) {
            calculatedDiscount = Number(dbCoupon.maxDiscount);
          }
        } else {
          calculatedDiscount = Number(dbCoupon.discountValue);
        }
      }
    }

    const calculatedShipping = calculatedSubtotal >= 2999 ? 0 : 150;
    const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedShipping);

    // Generate unique order number (e.g., ALJO-48291)
    const orderNumber = `ALJO-${Math.floor(10000 + Math.random() * 90000)}`;
    const mockPaymentId = paymentMethod === 'COD' ? null : `pay_razor_${Math.random().toString(36).substring(2, 10)}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'CONFIRMED',
        subtotal: calculatedSubtotal,
        discountAmount: calculatedDiscount,
        shippingFee: calculatedShipping,
        totalAmount: calculatedTotal,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        paymentMethod: paymentMethod || 'RAZORPAY',
        paymentId: mockPaymentId,
        couponCode: couponCode || null,
        shippingAddress: JSON.stringify(shippingAddress),
        notes: notes || null,
        items: {
          create: validatedItems,
        },
      },
      include: { items: true },
    });

    // Update variant and product stock counts
    for (const item of validatedItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
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
        message: `Your order #${orderNumber} for ₹${calculatedTotal.toLocaleString()} has been confirmed.`,
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
