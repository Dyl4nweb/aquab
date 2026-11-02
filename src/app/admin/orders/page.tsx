import React from 'react';
import { prisma } from '@/lib/prisma';
import { OrdersClient } from './OrdersClient';

export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { ref?: string; status?: string };
}) {
  const [orders, riders] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        barangay: true,
        assignments: {
          include: {
            rider: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: 'RIDER', isActive: true },
      select: { id: true, name: true, phone: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Order Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process incoming orders, assign riders, update fulfillment steps, and verify payments
          </p>
        </div>
      </div>

      <OrdersClient
        initialOrders={orders as any}
        riders={riders as any}
        initialRef={searchParams.ref}
        initialStatus={searchParams.status}
      />
    </div>
  );
}

