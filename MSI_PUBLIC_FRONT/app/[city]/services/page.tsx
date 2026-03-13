'use client';

import '@/styles/globals.css';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { apiClient, getErrorMessage } from '@/lib/api';
import type { PublicServiceCategoryWithServices, Service } from '@/types/api';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useCitySlug } from '@/components/cities/CityProvider';
import ServicesCategoryCard from '@/components/ui/ServicesCategoryCard';

export default function ServicesPage() {
  const [categories, setCategories] = useState<PublicServiceCategoryWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const citySlug = useCitySlug(); 

  useEffect(() => {
    loadServicesOverview();
  }, []);

  const loadServicesOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getServicesOverview(citySlug, 3);
      setCategories(data);
    } catch (err) {
      console.error('Error loading services overview:', err);
      setError(getErrorMessage(err, 'Не удалось загрузить услуги'));
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
                onClick={loadServicesOverview}
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
    <div>
      <section className="standart">
          {/* ===== Навигация и Заголовок ===== */}
          <PageHeader
            title="Услуги"
            breadcrumbs={[
              { label: 'Главная', href: ROUTES.HOME(citySlug) },
              { label: 'Услуги' },
            ]}
          />

          {/* Краткое описание блока услуг */}
          <p>
            Мы выполняем полный цикл работ — от подготовки проекта и подбора материалов до
            производства, поставки и инженерного сопровождения. Ниже собраны основные направления
            наших услуг, каждая ведёт на детальную страницу с описанием и примерами.
          </p>

          {categories.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'left',
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: '16px', color: '#64748b' }}>Услуги не найдены</p>
            </div>
          ) : (
            <div className="grid gap-2 lg:gap-8 grid-cols-2 lg:grid-cols-5">
              {categories.map((category) => (
                <ServicesCategoryCard key={category.serviceCategoryId} category={category}></ServicesCategoryCard>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}