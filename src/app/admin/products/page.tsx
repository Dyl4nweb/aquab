import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductsAdminClient } from './ProductsAdminClient';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      include: { category: true },
    }),
    prisma.productCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Product & Category Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure water products, gallon exchange settings, new container fees, and categories
        </p>
      </div>

      <ProductsAdminClient
        initialProducts={products as any}
        categories={categories as any}
      />
    </div>
  );
}

