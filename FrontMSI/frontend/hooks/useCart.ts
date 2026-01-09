'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { Cart, CartResponse, CartItem } from '@/types/api';
import { isCartExists, isEmptyCart } from '@/types/api';

interface UseCartReturn {
  cart: CartResponse | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  totalAmount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  isInCart: (productId: number) => boolean;
  clearError: () => void;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await apiClient.getCart();
      setCart(cartData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить корзину';
      setError(errorMessage);
      console.error('Ошибка загрузки корзины:', err);
      // Устанавливаем пустую корзину при ошибке
      setCart({ totalAmount: 0, items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (productId: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await apiClient.addToCart(productId);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось добавить товар в корзину';
      setError(errorMessage);
      console.error('Ошибка добавления товара:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (quantity < 1) {
      setError('Количество должно быть больше 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await apiClient.updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось обновить количество';
      setError(errorMessage);
      console.error('Ошибка обновления количества:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await apiClient.removeCartItem(itemId);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось удалить товар';
      setError(errorMessage);
      console.error('Ошибка удаления товара:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isInCart = useCallback(
    (productId: number): boolean => {
      if (!cart || !isCartExists(cart)) {
        return false;
      }
      return cart.items.some((item) => item.productId === productId);
    },
    [cart]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Вычисляемые значения
  const itemCount = isCartExists(cart) ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const totalAmount = isCartExists(cart) ? cart.totalAmount : 0;

  return {
    cart,
    loading,
    error,
    itemCount,
    totalAmount,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    isInCart,
    clearError,
  };
}

