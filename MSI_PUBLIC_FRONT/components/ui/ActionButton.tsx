'use client';

import React from 'react';

interface ActionButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  background?: string;
  color?: string;
  icon?: React.ReactNode;
}

export function ActionButton({
  text,
  onClick,
  type = 'button',
  disabled = false,
  background = 'var(--gradient-primary)',
  color = 'var(--color-white)',
  icon,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        borderRadius: '12px',
        minHeight: '48px',
        background,
        color,
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        whiteSpace: 'nowrap',
      }}
    >
      {icon && (
        <div
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      )}

      <span>{text}</span>
    </button>
  );
}
