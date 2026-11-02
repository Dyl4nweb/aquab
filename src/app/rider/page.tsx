import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RiderClient } from './RiderClient';

export const revalidate = 0;

export default async function RiderDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  // 1. Fetch this rider's existing assignments
  const assignments = await prisma.deliveryAssignment.findMany({
    where: {
      riderId: userId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        include: {
          items: true,
          barangay: true,
          assignments: {
            include: { rider: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  const myAssignedOrderIds = assignments.map((a) => a.orderId);

  // 2. Fetch all orders ready for delivery that are approved or COD and not yet assigned to this rider
  const availableOrders = await prisma.order.findMany({
    where: {
      id: { notIn: myAssignedOrderIds.length > 0 ? myAssignedOrderIds : ['00000000-0000-0000-0000-000000000000'] },
      deliveryMethod: 'DELIVERY',
      status: {
        in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'ASSIGNED'],
      },
      OR: [
        { paymentMethod: 'CASH_ON_DELIVERY' },
        { paymentMethod: 'GCASH', paymentStatus: 'PAID' },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      barangay: true,
      assignments: {
        include: { rider: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <RiderClient 
        initialAssignments={assignments as any} 
        initialAvailableOrders={availableOrders as any}
        rider={session.user} 
      />
    </div>
  );
}
