'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, getCartKey } from '@/context/CartContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw, 
  Package, 
  ShieldCheck, 
  Info 
} from 'lucide-react';

export default function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    totalItems, 
    subtotal, 
    totalEmptyGallonsToExchange,
    totalNewGallonsPurchased
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Your Shopping Cart is Empty</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            You haven't added any drinking water or refills to your cart yet.
          </p>
        </div>
        <div>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Products & Refills</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Your Water Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected water products, refills, and container quantities before checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear all items</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items Table/Cards */}
        <div className="lg:col-span-8 space-y-4">
          {/* Gallon Exchange Summary Callout */}
          {totalEmptyGallonsToExchange > 0 && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start space-x-3 text-sky-900 text-xs">
              <RefreshCw className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm mb-0.5">
                  Gallon Exchange Active ({totalEmptyGallonsToExchange} Refill{totalEmptyGallonsToExchange > 1 ? 's' : ''})
                </span>
                <p className="text-sky-800 leading-relaxed">
                  For your refill items, please make sure to have <strong>{totalEmptyGallonsToExchange} clean empty container(s)</strong> available for our delivery rider upon handover.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {items.map((item) => {
              const cartKey = getCartKey(item.productId, item.isExchange);
              const itemUnitPrice = item.unitPrice + item.containerFee;
              const itemTotal = itemUnitPrice * item.quantity;

              return (
                <div key={cartKey} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Image & Info */}
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 rounded-2xl bg-sky-50 shrink-0 border border-sky-100 overflow-hidden flex items-center justify-center">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-contain p-1.5"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.productName}</h3>
                      <div className="flex flex-wrap gap-2 items-center mt-1 text-xs text-slate-500">
                        <span>{item.waterType}</span>
                        <span>•</span>
                        <span>{item.capacity}</span>
                      </div>

                      {/* Gallon Exchange Tag */}
                      {item.supportsExchange ? (
                        <div className="mt-2">
                          {item.isExchange ? (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                              <RefreshCw className="w-3 h-3" />
                              <span>Refill (Empty Returned)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-lg border border-sky-200">
                              <Package className="w-3 h-3" />
                              <span>Brand-New Gallon (+₱{item.containerFee.toFixed(0)})</span>
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Right: Quantity Controls, Price & Remove */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => updateQuantity(cartKey, -1)}
                        className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(cartKey, 1)}
                        className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
                        disabled={item.quantity >= item.availableStock}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="text-right min-w-[90px]">
                      <span className="text-base font-black text-slate-900 block">
                        ₱{itemTotal.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ₱{itemUnitPrice.toFixed(2)} each
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeItem(cartKey)}
                      className="text-slate-400 hover:text-rose-500 p-2 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              href="/products"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-sm space-y-5 sticky top-28">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Items</span>
                <span className="font-bold text-slate-800">{totalItems} container{totalItems === 1 ? '' : 's'}</span>
              </div>

              {totalEmptyGallonsToExchange > 0 && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium">
                  <span>Empty Gallons to Return</span>
                  <span className="font-bold">{totalEmptyGallonsToExchange}</span>
                </div>
              )}

              {totalNewGallonsPurchased > 0 && (
                <div className="flex justify-between text-sky-700 bg-sky-50 p-2 rounded-lg font-medium">
                  <span>New Containers Purchased</span>
                  <span className="font-bold">{totalNewGallonsPurchased}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 text-sm">₱{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee</span>
                <span className="text-sky-600 font-semibold">Calculated on next step</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                <span>Estimated Total</span>
                <span className="text-sky-700 text-xl">₱{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Aqua B Quality Assurance</span>
              </div>
              <p>All containers sanitized and sealed before rider dispatch.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

