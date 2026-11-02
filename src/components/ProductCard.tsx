'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Check, 
  RefreshCw, 
  Package, 
  AlertCircle,
  Droplet
} from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isExchange, setIsExchange] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;

  // Pricing calculation
  const currentPrice = product.supportsExchange
    ? isExchange
      ? product.price
      : product.price + product.newContainerFee
    : product.price;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, isExchange, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Top Badges & Image */}
        <div className="relative bg-sky-50/50 p-6 flex items-center justify-center border-b border-sky-50">
          {/* Stock Badge */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {isOutOfStock ? (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Only {product.stock} left
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                In Stock ({product.stock})
              </span>
            )}
          </div>

          {/* Water Type Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-white/90 backdrop-blur text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-200 shadow-sm flex items-center space-x-1">
              <Droplet className="w-3 h-3 text-sky-500 fill-sky-500" />
              <span>{product.waterType}</span>
            </span>
          </div>

          {/* Product Image */}
          <div className="relative w-48 h-48 my-2 transition-transform duration-300 group-hover:scale-105">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain drop-shadow-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5">
          <div className="mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-sky-600">
              {product.containerType}
            </span>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-3 leading-relaxed">
            {product.description || 'Clean, crystal-pure drinking water for your daily hydration.'}
          </p>

          <div className="flex items-center space-x-2 text-xs text-slate-600 mb-4 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">Capacity:</span>
            <span>{product.capacity}</span>
          </div>

          {/* Gallon Exchange Toggle (For Exchange-eligible products) */}
          {product.supportsExchange && (
            <div className="mb-4 bg-sky-50/70 p-2.5 rounded-2xl border border-sky-100">
              <label className="text-[11px] font-bold text-sky-900 uppercase tracking-wider block mb-1.5">
                Container Option:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsExchange(true)}
                  className={`text-xs py-2 px-2 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
                    isExchange
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                      : 'bg-white text-slate-600 hover:bg-sky-100/50 border border-slate-200'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <RefreshCw className={`w-3 h-3 ${isExchange ? 'text-white' : 'text-sky-500'}`} />
                    <span>Refill Only</span>
                  </span>
                  <span className={`text-[10px] mt-0.5 ${isExchange ? 'text-sky-100' : 'text-slate-400'}`}>
                    Return empty gallon
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExchange(false)}
                  className={`text-xs py-2 px-2 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
                    !isExchange
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                      : 'bg-white text-slate-600 hover:bg-sky-100/50 border border-slate-200'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <Package className={`w-3 h-3 ${!isExchange ? 'text-white' : 'text-sky-500'}`} />
                    <span>New Gallon</span>
                  </span>
                  <span className={`text-[10px] mt-0.5 ${!isExchange ? 'text-sky-100' : 'text-slate-400'}`}>
                    +₱{product.newContainerFee.toFixed(0)} deposit
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="p-5 pt-0">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price per unit:</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-900">
                ₱{currentPrice.toFixed(2)}
              </span>
              {product.supportsExchange && !isExchange && (
                <span className="text-xs text-slate-500 line-through">
                  ₱{product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
                disabled={quantity >= product.stock}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : addedAnimation
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/25 active:scale-[0.98]'
          }`}
        >
          {isOutOfStock ? (
            <span>Sold Out</span>
          ) : addedAnimation ? (
            <>
              <Check className="w-4 h-4 animate-bounce" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>
                Add {quantity > 1 ? `${quantity} items` : ''} to Cart
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

