import React from 'react';
import { prisma } from '@/lib/prisma';
import { ClientsClient } from './ClientsClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const revalidate = 0;

export default async function AdminClientsPage() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const [orders, customersRaw, barangays] = await Promise.all([
    prisma.order.findMany({
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
    }),
    prisma.$queryRawUnsafe<any[]>(
      'SELECT * FROM "Customer" WHERE "isActive" = true ORDER BY "createdAt" DESC'
    ),
    prisma.barangay.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, deliveryFee: true },
    }),
  ]);

  // Client map seeded with registered Customer accounts
  const clientMap: Record<string, any> = {};

  for (const c of customersRaw || []) {
    clientMap[c.phone] = {
      id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address || '',
      barangayId: c.barangayId || null,
      barangayName: c.barangayName || 'N/A',
      notes: c.notes || '',
      isSuki: Boolean(c.isSuki),
      creditLimit: Number(c.creditLimit) || 1000,
      totalOrdersCount: 0,
      totalSpent: 0,
      totalPaid: 0,
      unpaidBalance: 0,
      unpaidOrdersCount: 0,
      lastOrderDate: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
      orders: [],
    };
  }

  // Merge historical orders
  for (const order of orders) {
    const phone = order.customerPhone || 'Walang Phone';

    if (!clientMap[phone]) {
      clientMap[phone] = {
        id: null,
        name: order.customerName,
        phone,
        address: order.deliveryAddress,
        barangayId: order.barangayId || null,
        barangayName: order.barangayName || order.barangay?.name || 'N/A',
        notes: '',
        isSuki: false,
        creditLimit: 1000,
        totalOrdersCount: 0,
        totalSpent: 0,
        totalPaid: 0,
        unpaidBalance: 0,
        unpaidOrdersCount: 0,
        lastOrderDate: order.createdAt.toISOString(),
        orders: [],
      };
    }

    const client = clientMap[phone];
    client.totalOrdersCount += 1;
    client.totalSpent += order.totalAmount;

    if (order.status !== 'CANCELLED') {
      if (order.paymentStatus === 'PAID') {
        client.totalPaid += order.totalAmount;
      } else {
        client.unpaidBalance += order.totalAmount;
        client.unpaidOrdersCount += 1;
      }
    }

    client.orders.push({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      deliveryAddress: order.deliveryAddress,
      barangayName: order.barangayName || order.barangay?.name,
      landmarkOrNotes: order.landmarkOrNotes,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        waterType: item.waterType,
        containerType: item.containerType,
        isExchange: item.isExchange,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      riderName: order.assignments[0]?.rider?.name || null,
      deliveryNotes: order.assignments[0]?.deliveryNotes || null,
    });
  }

  const clients = Object.values(clientMap).sort((a: any, b: any) => {
    // Show clients with unpaid balance first
    if (b.unpaidBalance !== a.unpaidBalance) {
      return b.unpaidBalance - a.unpaidBalance;
    }
    return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
  });

  return (
    <ClientsClient 
      initialClients={clients} 
      barangays={barangays}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
