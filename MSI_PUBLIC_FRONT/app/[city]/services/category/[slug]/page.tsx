'use client';

import '@/styles/globals.css';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { apiClient, getErrorMessage } from '@/lib/api';
import type { PublicServicesByCategoryResponse, Service } from '@/types/api';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useCitySlug } from '@/components/cities/CityProvider';
import ServicesCategoryCard from '@/components/ui/ServicesCategoryCard';

export default function ServiceCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const citySlug = useCitySlug(); 

  const [data, setData] = useState<PublicServicesByCategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadCategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getServicesByCategory(citySlug, slug);
      setData(response);
    } catch (err) {
      console.error('Error loading service category:', err);
      setError(getErrorMessage(err, 'Не удалось загрузить услуги категории'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
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

  if (error && !data) {
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
                onClick={loadCategory}
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

  if (!data) {
    return null;
  }

  const { category, services } = data;

  return (
    <div>
      <section className='standart'>
          <PageHeader
            title={category.name}
            breadcrumbs={[
              { label: 'Главная', href: ROUTES.HOME(citySlug) },
              { label: 'Услуги', href: ROUTES.SERVICES(citySlug) },
              { label: category.name },
            ]}
          />
          {services.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'left',
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: '16px', color: '#64748b' }}>Услуги в этой категории не найдены</p>
            </div>
          ) : (
            <div className="grid gap-2 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {services.map((service: Service) => (
                <Link
                  key={service.serviceId}
                  href={`/${citySlug}/services/${service.slug}`}
                  className="service-category-card"
                  >
                    <p className="text-[var(--color-dark)]" title={`Услуга категории ${category.name}`}>
                      <b>{service.name}</b>
                    </p>

                    <p className='p-small text-[var(--color-gray)]' title="Перейти на страницу услуги">
                      Подробнее -&gt;
                    </p>
                </Link>
              ))}
            </div>
          )}

          {category.description && (
            <div>
              <h3>Описание</h3>
              <p
                style={{
                  color: '#64748b',
                  marginTop: '8px',
                  whiteSpace: 'pre-line',
                }}
              > 
                {category.description}
              </p>
            </div>
          )}
      </section>
    </div>
  );
}

