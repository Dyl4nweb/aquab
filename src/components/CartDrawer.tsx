'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, getCartKey } from '@/context/CartContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight, 
  RefreshCw, 
  Package, 
  AlertCircle,
  ShieldCheck 
} from 'lucide-react';

export function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeItem, 
    totalItems, 
    subtotal,
    totalEmptyGallonsToExchange 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Water Cart</h2>
                <p className="text-xs text-slate-500">{totalItems} item{totalItems === 1 ? '' : 's'} selected</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body: Cart Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-sky-500">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                    Browse our clean water refills and gallon containers to start ordering.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-sky-600 text-white font-bold text-xs py-2.5 px-5 rounded-full hover:bg-sky-700 shadow-sm"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                {/* Empty Gallon Exchange Notice */}
                {totalEmptyGallonsToExchange > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start space-x-2.5">
                    <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <span className="font-bold block">Gallon Exchange Reminder:</span>
                      You selected refill for {totalEmptyGallonsToExchange} container{totalEmptyGallonsToExchange > 1 ? 's' : ''}. Please have {totalEmptyGallonsToExchange} clean empty gallon{totalEmptyGallonsToExchange > 1 ? 's' : ''} ready upon delivery!
                    </div>
                  </div>
                )}

                <div className="divide-y divide-slate-100 space-y-4">
                  {items.map((item) => {
                    const cartKey = getCartKey(item.productId, item.isExchange);
                    const itemUnitPrice = item.unitPrice + item.containerFee;
                    const itemTotal = itemUnitPrice * item.quantity;

                    return (
                      <div key={cartKey} className="pt-4 first:pt-0 flex space-x-3">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl bg-sky-50 shrink-0 border border-sky-100 overflow-hidden flex items-center justify-center">
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-contain p-1"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-bold text-slate-900 truncate pr-2">
                              {item.productName}
                            </h4>
                            <button
                              onClick={() => removeItem(cartKey)}
                              className="text-slate-400 hover:text-rose-500 p-0.5"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Gallon Exchange Tag */}
                          {item.supportsExchange ? (
                            <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                              item.isExchange 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}>
                              {item.isExchange ? (
                                <>
                                  <RefreshCw className="w-2.5 h-2.5" />
                                  <span>Refill (Empty Returned)</span>
                                </>
                              ) : (
                                <>
                                  <Package className="w-2.5 h-2.5" />
                                  <span>New Gallon (+₱{item.containerFee.toFixed(0)})</span>
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {item.capacity}
                            </span>
                          )}

                          {/* Price & Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button
                                onClick={() => updateQuantity(cartKey, -1)}
                                className="w-6 h-6 rounded bg-white text-slate-600 flex items-center justify-center hover:bg-slate-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(cartKey, 1)}
                                className="w-6 h-6 rounded bg-white text-slate-600 flex items-center justify-center hover:bg-slate-200"
                                disabled={item.quantity >= item.availableStock}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black text-slate-900 block">
                                ₱{itemTotal.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ₱{itemUnitPrice.toFixed(2)} each
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer: Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Delivery Fee</span>
                  <span className="text-sky-600 font-semibold">Calculated at checkout (₱15–₱35)</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-sky-700 text-base">₱{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs text-center hover:bg-slate-100 transition-colors"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs text-center flex items-center justify-center space-x-1.5 shadow-md shadow-sky-600/30 transition-all"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-[10px] text-center text-slate-400 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>No account or login required to checkout</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

