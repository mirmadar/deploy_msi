'use client';

import React from 'react';

interface QuantityControlProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onChange,
  disabled = false,
}) => {
  const handleDecrease = () => {
    if (quantity > 1) onChange(quantity - 1);
  };

  const handleIncrease = () => {
    onChange(quantity + 1);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={handleDecrease}
        disabled={disabled || quantity <= 1}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          cursor: disabled || quantity <= 1 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled || quantity <= 1 ? 0.5 : 1,
        }}
        aria-label="Уменьшить количество"
      >
        <svg
          style={{ width: '16px', height: '16px', color: '#64748b' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <span
        style={{
          minWidth: '30px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500',
          color: '#0f172a',
        }}
      >
        {quantity}
      </span>

      <button
        onClick={handleIncrease}
        disabled={disabled}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
        aria-label="Увеличить количество"
      >
        <svg
          style={{ width: '16px', height: '16px', color: '#64748b' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};
