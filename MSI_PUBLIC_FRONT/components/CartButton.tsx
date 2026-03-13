'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { itemCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayCount = mounted ? itemCount : 0;

  return (
    <button
      onClick={onClick}
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: 'var(--color-light-blue)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      aria-label="Корзина"
    >
      <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 21.3333C6.53333 21.3333 5.34667 22.5333 5.34667 24C5.34667 25.4667 6.53333 26.6667 8 26.6667C9.46667 26.6667 10.6667 25.4667 10.6667 24C10.6667 22.5333 9.46667 21.3333 8 21.3333ZM0 1.33333C0 2.06667 0.6 2.66667 1.33333 2.66667H2.66667L7.46667 12.7867L5.66667 16.04C4.69333 17.8267 5.97333 20 8 20H22.6667C23.4 20 24 19.4 24 18.6667C24 17.9333 23.4 17.3333 22.6667 17.3333H8L9.46667 14.6667H19.4C20.4 14.6667 21.28 14.12 21.7333 13.2933L26.5067 4.64C27 3.76 26.36 2.66667 25.3467 2.66667H5.61333L4.72 0.76C4.50667 0.293333 4.02667 0 3.52 0H1.33333C0.6 0 0 0.6 0 1.33333ZM21.3333 21.3333C19.8667 21.3333 18.68 22.5333 18.68 24C18.68 25.4667 19.8667 26.6667 21.3333 26.6667C22.8 26.6667 24 25.4667 24 24C24 22.5333 22.8 21.3333 21.3333 21.3333Z" fill="#1D497A"/>
        </svg>
      </div>

      {displayCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: 'var(--color-green)',
            color: '#ffffff',
            borderRadius: '50%',
            minWidth: '20px',
            height: '20px',
            padding: '0 5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            boxSizing: 'border-box',
            zIndex: 1,
          }}
          aria-label={`В корзине товаров: ${displayCount}`}
        >
          {displayCount > 99 ? '99+' : displayCount}
        </span>
      )}
    </button>
  );
}

