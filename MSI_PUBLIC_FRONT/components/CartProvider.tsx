'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiClient, getErrorMessage } from '@/lib/api';
import type { CartResponse } from '@/types/api';
import { isCartExists } from '@/types/api';

interface CartContextValue {
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

const CartContext = createContext<CartContextValue | null>(null);

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default function CartProvider({ children }: { children: ReactNode }) {
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
      setError(getErrorMessage(err, 'Не удалось загрузить корзину'));
      console.error('Ошибка загрузки корзины:', err);
      setCart({ totalAmount: 0, items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (productId: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await apiClient.addToCart(productId);
      setCart(updatedCart);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось добавить товар в корзину'));
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
    // Оптимистично обновляем UI сразу, без setLoading
    setCart((prev) => {
      if (!prev || !isCartExists(prev)) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      };
    });
    try {
      setError(null);
      const updatedCart = await apiClient.updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      // При ошибке откатываем до актуального состояния
      fetchCart();
      setError(getErrorMessage(err, 'Не удалось обновить количество'));
      console.error('Ошибка обновления количества:', err);
      throw err;
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId: number) => {
    // Оптимистично убираем товар из списка сразу
    setCart((prev) => {
      if (!prev || !isCartExists(prev)) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      };
    });
    try {
      setError(null);
      const updatedCart = await apiClient.removeCartItem(itemId);
      setCart(updatedCart);
    } catch (err) {
      // При ошибке откатываем
      fetchCart();
      setError(getErrorMessage(err, 'Не удалось удалить товар'));
      console.error('Ошибка удаления товара:', err);
      throw err;
    }
  }, [fetchCart]);

  const isInCart = useCallback(
    (productId: number): boolean => {
      if (!cart || !isCartExists(cart)) return false;
      return cart.items.some((item) => item.productId === productId);
    },
    [cart]
  );

  const clearError = useCallback(() => setError(null), []);

  const itemCount = isCartExists(cart) ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const totalAmount = isCartExists(cart) ? cart.totalAmount : 0;

  const value: CartContextValue = {
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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
