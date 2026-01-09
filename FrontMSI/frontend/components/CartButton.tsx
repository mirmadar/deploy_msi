'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { itemCount, fetchCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCart();
  }, [fetchCart]);

  // Показываем 0 до монтирования, чтобы избежать hydration mismatch
  const displayCount = mounted ? itemCount : 0;

  return (
    <button
      onClick={onClick}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '8px',
        backgroundColor: '#bfdbfe',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      aria-label="Корзина"
    >
      <svg
        style={{ width: '20px', height: '20px', color: '#1e40af' }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {displayCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            minWidth: '20px',
          }}
        >
          {displayCount > 99 ? '99+' : displayCount}
        </span>
      )}
    </button>
  );
}

