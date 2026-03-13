'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  // блокируем скролл
  useEffect(() => {
    if (!isOpen) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      {/* Контент */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--gradient-primary)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '720px',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Крестик */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            color: 'var(--color-light-gray)',
            cursor: 'pointer',
          }}
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
