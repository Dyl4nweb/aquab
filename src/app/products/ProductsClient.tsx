'use client';

import React, { useState, useMemo } from 'react';
import { ProductItem } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Search, Filter, RefreshCw, X, Droplets } from 'lucide-react';

interface ProductsClientProps {
  initialProducts: ProductItem[];
  categories: { id: string; name: string; slug: string }[];
  initialCategory?: string;
}

export function ProductsClient({
  initialProducts,
  categories,
  initialCategory,
}: ProductsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedWaterType, setSelectedWaterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exchangeOnly, setExchangeOnly] = useState<boolean>(false);

  // Extract unique water types from products
  const waterTypes = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.waterType && p.waterType !== 'N/A') set.add(p.waterType);
    });
    return Array.from(set);
  }, [initialProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category match
      if (selectedCategory !== 'all' && product.category?.slug !== selectedCategory) {
        return false;
      }
      // Water Type match
      if (selectedWaterType !== 'all' && product.waterType !== selectedWaterType) {
        return false;
      }
      // Gallon exchange match
      if (exchangeOnly && !product.supportsExchange) {
        return false;
      }
      // Search query match
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description?.toLowerCase().includes(q);
        const matchType = product.waterType.toLowerCase().includes(q);
        const matchContainer = product.containerType.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchType && !matchContainer) {
          return false;
        }
      }
      return true;
    });
  }, [initialProducts, selectedCategory, selectedWaterType, searchQuery, exchangeOnly]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name, container, or water type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Toggle: Refill-eligible only */}
          <button
            type="button"
            onClick={() => setExchangeOnly(!exchangeOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
              exchangeOnly
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-300'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Gallon Refills Only</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({initialProducts.length})
          </button>
          {categories.map((cat) => {
            const count = initialProducts.filter((p) => p.category?.slug === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Water Type Filter */}
        {waterTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
              Water Type:
            </span>
            <button
              onClick={() => setSelectedWaterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                selectedWaterType === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Types
            </button>
            {waterTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedWaterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  selectedWaterType === type
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count & Product Grid */}
      <div>
        <div className="flex justify-between items-center mb-4 text-xs text-slate-500 font-medium">
          <span>Showing {filteredProducts.length} water products</span>
          {(selectedCategory !== 'all' || selectedWaterType !== 'all' || searchQuery || exchangeOnly) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedWaterType('all');
                setSearchQuery('');
                setExchangeOnly(false);
              }}
              className="text-sky-600 hover:underline font-bold"
            >
              Clear all filters
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-sky-100 shadow-sm max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No products match your filters</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or clearing your category selection.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedWaterType('all');
                setSearchQuery('');
                setExchangeOnly(false);
              }}
              className="mt-2 bg-sky-600 text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-sky-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

