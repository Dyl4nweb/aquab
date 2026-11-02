import React from 'react';
import { prisma } from '@/lib/prisma';
import { InventoryClient } from './InventoryClient';

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const [products, transactions, orders] = await Promise.all([
    prisma.product.findMany({
      orderBy: { stock: 'asc' },
      include: { category: true },
    }),
    prisma.inventoryTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
      include: {
        product: true,
        performedBy: {
          select: { name: true },
        },
      },
    }),
    prisma.order.findMany({
      where: {
        status: { in: ['DELIVERED', 'COMPLETED', 'OUT_FOR_DELIVERY'] },
      },
      select: {
        exchangeGallonsCount: true,
        newGallonsCount: true,
        items: true,
      },
    }),
  ]);

  // Calculate gallon exchange metrics
  const totalFilledReleased = orders.reduce((acc, o) => acc + o.exchangeGallonsCount + o.newGallonsCount, 0);
  const totalEmptyReturned = orders.reduce((acc, o) => acc + o.exchangeGallonsCount, 0);
  const totalNewContainersSold = orders.reduce((acc, o) => acc + o.newGallonsCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Inventory & Gallon Exchange</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time stock management, stock-in/out logs, and reusable gallon ledger
        </p>
      </div>

      <InventoryClient
        products={products as any}
        initialTransactions={transactions as any}
        exchangeStats={{
          totalFilledReleased,
          totalEmptyReturned,
          totalNewContainersSold,
        }}
      />
    </div>
  );
}

