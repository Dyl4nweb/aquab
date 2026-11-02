import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { orderNumber, customerPhone } = await req.json();

    if (!orderNumber || !customerPhone) {
      return NextResponse.json(
        { error: 'Please enter both your Order Reference Number and Mobile Number.' },
        { status: 400 }
      );
    }

    const cleanRef = orderNumber.trim();
    // Normalize phone by removing spaces, hyphens, and leading +63 or 0
    const cleanPhone = customerPhone.replace(/[\s\-\+]/g, '');

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: { equals: cleanRef, mode: 'insensitive' },
      },
      include: {
        items: true,
        barangay: true,
        assignments: {
          include: {
            rider: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your reference number.' },
        { status: 404 }
      );
    }

    // Compare phone number loosely (e.g. last 9 digits match)
    const dbPhoneClean = order.customerPhone.replace(/[\s\-\+]/g, '');
    const phoneMatches =
      dbPhoneClean.endsWith(cleanPhone.slice(-9)) || cleanPhone.endsWith(dbPhoneClean.slice(-9));

    if (!phoneMatches) {
      return NextResponse.json(
        { error: 'The mobile number does not match this order. Please try again.' },
        { status: 403 }
      );
    }

    // Sanitized order response
    const latestAssignment = order.assignments[0];

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        barangayName: order.barangayName,
        landmarkOrNotes: order.landmarkOrNotes,
        deliveryMethod: order.deliveryMethod,
        deliveryDate: order.deliveryDate,
        deliveryTimeSlot: order.deliveryTimeSlot,
        deliveryFee: order.deliveryFee,
        subtotal: order.subtotal,
        totalAmount: order.totalAmount,
        status: order.status,
        cancellationReason: order.cancellationReason,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        gcashReference: order.gcashReference,
        exchangeGallonsCount: order.exchangeGallonsCount,
        newGallonsCount: order.newGallonsCount,
        createdAt: order.createdAt,
        items: order.items,
        statusHistory: order.statusHistory,
        rider:
          latestAssignment && ['ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.status)
            ? {
                name: latestAssignment.rider.name,
                phone: latestAssignment.rider.phone,
                status: latestAssignment.status,
              }
            : null,
      },
    });
  } catch (error: any) {
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while searching for your order.' },
      { status: 500 }
    );
  }
}

