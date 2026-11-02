import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductsClient } from './ProductsClient';

export const revalidate = 0;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; type?: string };
}) {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ isFeatured: 'desc' }, { stock: 'desc' }],
    }),
    prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-sky-100">
            Water Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Pangapisan Water & Refills
          </h1>
          <p className="text-xs sm:text-sm text-sky-100">
            Piliin kung Refill (may dalang sariling basyo) o New Container para sa bagong galon.
          </p>
        </div>
      </div>

      <ProductsClient 
        initialProducts={products as any} 
        categories={categories as any} 
        initialCategory={searchParams.category}
      />
    </div>
  );
}

