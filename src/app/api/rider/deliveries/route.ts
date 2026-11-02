import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/rider/deliveries - Rider claims/accepts an approved delivery order
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        barangay: true,
        assignments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if already assigned to this rider
    let assignment = order.assignments.find((a) => a.riderId === userId);

    const now = new Date();

    if (assignment) {
      // Update existing assignment to OUT_FOR_DELIVERY
      assignment = await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: {
          status: 'OUT_FOR_DELIVERY',
          acceptedAt: assignment.acceptedAt || now,
        },
      });
    } else {
      // Create new DeliveryAssignment for this rider
      assignment = await prisma.deliveryAssignment.create({
        data: {
          orderId: order.id,
          riderId: userId,
          status: 'OUT_FOR_DELIVERY',
          assignedAt: now,
          acceptedAt: now,
        },
      });
    }

    // Update order status to OUT_FOR_DELIVERY
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'OUT_FOR_DELIVERY',
      },
      include: {
        items: true,
        barangay: true,
      },
    });

    // Record Status History
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'OUT_FOR_DELIVERY',
        notes: `Tinanggap at sinimulan na ang pag-deliver ni Rider ${session.user.name}.`,
        changedById: userId,
        changedByName: session.user.name,
      },
    });

    return NextResponse.json({
      success: true,
      assignment: {
        ...assignment,
        order: updatedOrder,
      },
    });
  } catch (err: any) {
    console.error('Error claiming delivery:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to claim delivery order' },
      { status: 500 }
    );
  }
}
