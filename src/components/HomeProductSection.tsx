'use client';

import React from 'react';
import Link from 'next/link';
import { ProductItem } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, Flame } from 'lucide-react';

interface HomeProductSectionProps {
  products: ProductItem[];
}

export function HomeProductSection({ products }: HomeProductSectionProps) {
  return (
    <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-sky-600 flex items-center space-x-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Top Choices</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Popular Products
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Piliin kung Refill (may dalang basyo) o New Container para sa bagong galon.
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1 group"
        >
          <span>Tingnan ang Catalog</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Product Grid (Direct 3-Column Display) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
