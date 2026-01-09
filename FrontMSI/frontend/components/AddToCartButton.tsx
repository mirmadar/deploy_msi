'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'small';
}

export default function AddToCartButton({
  productId,
  disabled = false,
  className = '',
  variant = 'default',
}: AddToCartButtonProps) {
  const { addItem, isInCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (disabled || loading) return;

    setLoading(true);
    setError(null);

    try {
      await addItem(productId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось добавить товар в корзину';
      setError(errorMessage);
      console.error('Ошибка добавления в корзину:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdded = isInCart(productId);

  const baseStyles: React.CSSProperties = {
    padding: variant === 'small' ? '8px 16px' : '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontSize: variant === 'small' ? '14px' : '16px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    opacity: disabled || loading ? 0.6 : 1,
  };

  const defaultStyles: React.CSSProperties = {
    ...baseStyles,
    backgroundColor: isAdded ? '#10b981' : '#14b8a6',
    color: '#ffffff',
  };

  const smallStyles: React.CSSProperties = {
    ...baseStyles,
    backgroundColor: isAdded ? '#10b981' : '#bfdbfe',
    color: isAdded ? '#ffffff' : '#1e40af',
  };

  const buttonStyles = variant === 'small' ? smallStyles : defaultStyles;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        style={buttonStyles}
        className={className}
        aria-label={isAdded ? 'Товар в корзине' : 'Добавить в корзину'}
      >
        {loading ? (
          <>
            <svg
              style={{
                width: '16px',
                height: '16px',
                animation: 'spin 1s linear infinite',
              }}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="32"
                strokeDashoffset="32"
              >
                <animate
                  attributeName="stroke-dasharray"
                  dur="2s"
                  values="0 32;16 16;0 32;0 32"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-dashoffset"
                  dur="2s"
                  values="0;-16;-32;-32"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <span>Добавление...</span>
          </>
        ) : isAdded ? (
          <>
            <svg
              style={{ width: '16px', height: '16px' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>В корзине</span>
          </>
        ) : (
          <>
            <svg
              style={{ width: '16px', height: '16px' }}
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
            <span>В корзину</span>
          </>
        )}
      </button>

      {error && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            padding: '8px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            color: '#991b1b',
            fontSize: '12px',
            zIndex: 10,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

