'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';
import CategoryCard from '@/components/CategoryCard';
import Link from 'next/link';

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getCategories(null);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить категории');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#ffffff' }}>
        <section
          style={{
            padding: '60px 40px',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
            }}
          >
            <div style={{ fontSize: '16px', color: '#64748b' }}>Загрузка...</div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#ffffff' }}>
        <section
          style={{
            padding: '60px 40px',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '24px',
                borderRadius: '12px',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '8px',
                }}
              >
                Ошибка
              </h2>
              <p style={{ marginBottom: '16px', fontSize: '14px' }}>{error}</p>
              <button
                onClick={loadCategories}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      <section
        style={{
          padding: '60px 40px',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div style={{ marginBottom: '40px' }}>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '16px',
              }}
            >
              Каталог
            </h1>
            <nav style={{ fontSize: '14px', color: '#64748b' }}>
              <Link href="/" style={{ color: '#14b8a6', textDecoration: 'none' }}>Главная</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span>Каталог</span>
            </nav>
          </div>

          {categories.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '24px',
              }}
            >
              {categories.map((category) => (
                <CategoryCard 
                  key={category.categoryId || category.id} 
                  category={{
                    ...category,
                    id: category.categoryId || category.id,
                    image: category.imageUrl || category.image,
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: '16px', color: '#64748b' }}>Категории не найдены</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

