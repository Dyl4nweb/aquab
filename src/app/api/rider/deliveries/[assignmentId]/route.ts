import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { status, cashCollected, deliveryNotes, failureReason, isUtang } = await req.json();

    // Verify assignment belongs to this rider
    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id: params.assignmentId },
      include: { order: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.riderId !== userId && (session.user as any).role === 'RIDER') {
      return NextResponse.json(
        { error: 'You are only allowed to update deliveries assigned to you' },
        { status: 403 }
      );
    }

    const now = new Date();
    const updateAssignmentData: any = { status };

    if (status === 'ACCEPTED') {
      updateAssignmentData.acceptedAt = now;
    } else if (status === 'DELIVERED') {
      updateAssignmentData.deliveredAt = now;
      if (cashCollected !== undefined) updateAssignmentData.cashCollected = parseFloat(cashCollected);
      if (deliveryNotes) updateAssignmentData.deliveryNotes = deliveryNotes;
    } else if (status === 'FAILED') {
      updateAssignmentData.failedAt = now;
      if (failureReason) updateAssignmentData.failureReason = failureReason;
    }

    // Update assignment and order in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedAssignment = await tx.deliveryAssignment.update({
        where: { id: params.assignmentId },
        data: updateAssignmentData,
      });

      // Update Order Status
      const orderStatus = status === 'FAILED' ? 'FAILED_DELIVERY' : status;
      const orderUpdateData: any = { status: orderStatus };

      if (status === 'DELIVERED') {
        if (isUtang) {
          orderUpdateData.paymentStatus = 'PENDING';
          updateAssignmentData.cashCollected = 0;
          updateAssignmentData.deliveryNotes = deliveryNotes 
            ? `[UTANG / PA-LISTA] ${deliveryNotes}`
            : '[UTANG / PA-LISTA] Pinayagan na sa susunod na lang magbayad.';
        } else {
          orderUpdateData.paymentStatus = 'PAID';

          // Record Payment if cash collected
          if (cashCollected && parseFloat(cashCollected) > 0) {
            await tx.payment.create({
              data: {
                orderId: assignment.orderId,
                amount: parseFloat(cashCollected),
                method: 'CASH_ON_DELIVERY',
                status: 'PAID',
                notes: deliveryNotes || 'Cash collected upon delivery by rider',
                collectedById: userId,
              },
            });
          }
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: assignment.orderId },
        data: orderUpdateData,
      });

      // Record Order Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: assignment.orderId,
          status: orderStatus,
          notes:
            status === 'DELIVERED'
              ? isUtang
                ? `Naihatid bilang UTANG / PA-LISTA (₱${assignment.order.totalAmount.toFixed(2)}). Tala: ${deliveryNotes || 'Walang barya / sa susunod magbabayad'}`
                : `Delivered by rider. Collected: ₱${cashCollected || 0}. Notes: ${deliveryNotes || 'None'}`
              : status === 'FAILED'
              ? `Delivery failed: ${failureReason || 'Customer unavailable'}`
              : `Rider updated status to ${status}`,
          changedById: userId,
          changedByName: (session.user as any)?.name || 'Rider',
        },
      });

      return { assignment: updatedAssignment, order: updatedOrder };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Rider update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update delivery' },
      { status: 500 }
    );
  }
}

