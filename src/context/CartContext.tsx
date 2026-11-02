'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, ProductItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductItem, isExchange?: boolean, quantity?: number) => void;
  updateQuantity: (cartKey: string, delta: number) => void;
  removeItem: (cartKey: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalEmptyGallonsToExchange: number;
  totalNewGallonsPurchased: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const getCartKey = (productId: string, isExchange: boolean) => {
  return `${productId}__${isExchange ? 'exchange' : 'new'}`;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aquab_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('aquab_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
      }
    }
  }, [items, isLoaded]);

  const addToCart = (product: ProductItem, isExchange = true, quantity = 1) => {
    // If product does not support exchange, isExchange is forced false
    const exchange = product.supportsExchange ? isExchange : false;
    const containerFee = exchange ? 0 : (product.supportsExchange ? product.newContainerFee : 0);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.productId === product.id && i.isExchange === exchange
      );

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = Math.min(currentQty + quantity, product.stock);
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          availableStock: product.stock,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          productName: product.name,
          waterType: product.waterType,
          containerType: product.containerType,
          capacity: product.capacity,
          unitPrice: product.price,
          supportsExchange: product.supportsExchange,
          isExchange: exchange,
          containerFee: containerFee,
          quantity: Math.min(quantity, product.stock),
          imageUrl: product.imageUrl,
          availableStock: product.stock,
        };
        return [...prevItems, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartKey: string, delta: number) => {
    const [productId, exchangeType] = cartKey.split('__');
    const isExchange = exchangeType === 'exchange';

    setItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.productId === productId && item.isExchange === isExchange) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: Math.min(nextQty, item.availableStock),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (cartKey: string) => {
    const [productId, exchangeType] = cartKey.split('__');
    const isExchange = exchangeType === 'exchange';

    setItems((prevItems) =>
      prevItems.filter((i) => !(i.productId === productId && i.isExchange === isExchange))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const subtotal = items.reduce((acc, curr) => {
    const itemTotal = (curr.unitPrice + curr.containerFee) * curr.quantity;
    return acc + itemTotal;
  }, 0);

  const totalEmptyGallonsToExchange = items.reduce((acc, curr) => {
    if (curr.supportsExchange && curr.isExchange) {
      return acc + curr.quantity;
    }
    return acc;
  }, 0);

  const totalNewGallonsPurchased = items.reduce((acc, curr) => {
    if (curr.supportsExchange && !curr.isExchange) {
      return acc + curr.quantity;
    }
    return acc;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
        totalEmptyGallonsToExchange,
        totalNewGallonsPurchased,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

