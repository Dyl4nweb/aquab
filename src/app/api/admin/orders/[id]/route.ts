import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, riderId, cancellationReason, paymentStatus, notes } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { assignments: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    // Handle rider assignment
    if (riderId) {
      // Create new DeliveryAssignment or update existing
      await prisma.deliveryAssignment.create({
        data: {
          orderId: order.id,
          riderId: riderId,
          status: status || 'ASSIGNED',
        },
      });
      updateData.status = status || 'ASSIGNED';
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
      include: {
        items: true,
        assignments: {
          include: { rider: true },
        },
      },
    });

    // Record Status History
    if (status || notes) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: status || order.status,
          notes: notes || `Updated to ${status || order.status} by ${session.user.name}`,
          changedById: (session.user as any).id,
          changedByName: session.user.name,
        },
      });
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'ORDER_UPDATE',
        entityType: 'Order',
        entityId: order.id,
        details: `Order ${order.orderNumber} updated. Status: ${status || order.status}, Rider: ${riderId || 'N/A'}`,
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

