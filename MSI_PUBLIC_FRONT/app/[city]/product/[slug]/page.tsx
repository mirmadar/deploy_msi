'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, getErrorMessage } from '@/lib/api';
import { Product } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { formatUnit } from '@/lib/units';
import AddToCartButton from '@/components/AddToCartButton';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCitySlug } from '@/components/cities/CityProvider';
import { useProductUnits } from '@/hooks/useProductUnits';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productSlug = params.slug as string;
  const citySlug = useCitySlug();
  const { unitLabels } = useProductUnits(citySlug);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productSlug) {
      setError('Неверный slug товара');
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await apiClient.getProduct(citySlug, productSlug);
        setProduct(productData);
      } catch (err) {
        setError(getErrorMessage(err, 'Не удалось загрузить товар'));
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productSlug]);

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}>
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
            <div style={{ fontSize: '16px', color: '#64748b' }}>Загрузка товара...</div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}>
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
              <p style={{ marginBottom: '16px', fontSize: '14px' }}>
                {error || 'Товар не найден'}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => router.back()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Назад
                </button>
                <Link
                  href={ROUTES.CATALOG(citySlug)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#14b8a6',
                    color: '#ffffff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'inline-block',
                  }}
                >
                  В каталог
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const imageUrl = product.imageUrl || product.image;
  const priceUnit = formatUnit(product.unit ?? product.priceUnit, unitLabels);
  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const isNew = product.isNew;

  // Преобразуем характеристики в массив, если они в виде объекта
  const characteristics = Array.isArray(product.characteristics)
    ? product.characteristics
    : product.characteristics
    ? Object.entries(product.characteristics).map(([name, value]) => ({
        name,
        value: String(value),
      }))
    : [];

  return (
    <div style={{ minHeight: '60vh' }}>
      <section className='standart'>
          <PageHeader
            title={product.name}
            breadcrumbs={[
              { label: 'Главная', href: `${ROUTES.HOME(citySlug)}` },
              { label: 'Каталог', href: `${ROUTES.CATALOG(citySlug)}` },
              { label: `${product.name}` },
            ]}/>

          {/* Product Content */}
          <div className="product-layout">
            <div className="product-image">

              {/* Product Image */}
              <div className="product-image">
                <Image
                  src={imageUrl || '/placeholder-image.png'}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain', padding: '16px' }}
                />
              </div>
            </div>

            {/* Characteristics */}
            <div className="product-specs">
              {characteristics.length > 0 && (
                <div>
                  <h2 style={{ marginBottom: '24px'}}>
                    Характеристики
                  </h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    {characteristics.map((char, index) => (
                      <div
                        key={index}
                        style={{
                          paddingBottom: '8px',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#64748b',
                            marginBottom: '8px',
                            fontWeight: '500',
                          }}
                        >
                          {char.name}
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--p-small)',
                            color: '#0f172a',
                            fontWeight: '500',
                          }}
                        >
                          {char.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div>
                {/* Price */}
                <div
                  style={{
                    marginBottom: '24px',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <p className='h1-bold'>
                    {formatPrice(product.price)} ₽ 
                  </p>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#64748b',
                    }}
                  >
                    / {priceUnit}
                  </div>
                </div>

                

                {/* Add to Cart Button */}
                <div style={{ marginBottom: '24px' }}>
                  <AddToCartButton
                    productId={product.productId || product.id!}
                    disabled={isOutOfStock}
                  />
                </div>

                {/* Status Info */}
                {isOutOfStock && (
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#991b1b',
                      fontSize: '14px',
                    }}
                  >
                    Товар временно отсутствует в наличии
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Description */}
          {product.description && <div
              style={{
                marginTop: 'var(--classic-margin)',
              }}
            >
              <h2>
                Описание
              </h2>
              <p
                style={{
                  marginTop: '16px',
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {product.description}
              </p>
            </div>
          }
      </section>
    </div>
  );
}

