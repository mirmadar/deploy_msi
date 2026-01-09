'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import CartButton from './CartButton';
import CartDrawer from './CartDrawer';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        borderRadius: '0 0 12px 12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        {/* Logo MCV with gradient */}
        <Link
          href={ROUTES.HOME}
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
              background: 'linear-gradient(90deg, #e2e8f0 0%, #14b8a6 50%, #e2e8f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-2px',
            }}
          >
            MCV
          </div>
        </Link>

        {/* Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flex: '1',
            justifyContent: 'center',
          }}
        >
          <Link
            href={ROUTES.PLUMBING}
            style={{
              textDecoration: 'none',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            Сантехника
          </Link>
          <Link
            href={ROUTES.DELIVERY}
            style={{
              textDecoration: 'none',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            Доставка
          </Link>
          <Link
            href={ROUTES.ARTICLES}
            style={{
              textDecoration: 'none',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            Статьи
          </Link>
          <Link
            href={ROUTES.ABOUT}
            style={{
              textDecoration: 'none',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            О компании
          </Link>
          <Link
            href={ROUTES.CONTACTS}
            style={{
              textDecoration: 'none',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            Контакты
          </Link>
        </nav>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: '1',
            maxWidth: '400px',
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск"
            style={{
              flex: '1',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              fontSize: '14px',
              outline: 'none',
              color: '#475569',
            }}
          />
          <button
            type="submit"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: '#14b8a6',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
            }}
          >
            <svg
              style={{ width: '20px', height: '20px', color: '#ffffff' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Catalog Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span>Каталог</span>
            </button>

            {isCatalogOpen && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10,
                  }}
                  onClick={() => setIsCatalogOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '8px',
                    width: '224px',
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 20,
                  }}
                >
                  <Link
                    href={ROUTES.CATALOG}
                    style={{
                      textDecoration: 'none',
                      color: '#0f172a',
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: '14px',
                    }}
                    onClick={() => setIsCatalogOpen(false)}
                  >
                    Все категории
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Call Button */}
          <button
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: '#bfdbfe',
              color: '#1e40af',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            Заказать звонок
          </button>

          {/* Cart Button */}
          <CartButton onClick={() => setIsCartOpen(true)} />
        </div>
      </div>

      {/* Phone in top right corner */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <svg
          style={{ width: '16px', height: '16px', color: '#0f172a' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        <a
          href="tel:+79101422687"
          style={{
            textDecoration: 'none',
            color: '#0f172a',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          +7 (910) 142-26-87
        </a>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
