'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Product } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import AddToCartButton from '@/components/AddToCartButton';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId || isNaN(productId)) {
      setError('Неверный ID товара');
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await apiClient.getProduct(productId);
        setProduct(productData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить товар';
        setError(errorMessage);
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

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
                  href={ROUTES.CATALOG}
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
  const priceUnit = product.priceUnit || 'шт';
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
          {/* Breadcrumbs */}
          <nav
            style={{
              fontSize: '14px',
              color: '#64748b',
              marginBottom: '24px',
            }}
          >
            <Link
              href={ROUTES.HOME}
              style={{ color: '#14b8a6', textDecoration: 'none' }}
            >
              Главная
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link
              href={ROUTES.CATALOG}
              style={{ color: '#14b8a6', textDecoration: 'none' }}
            >
              Каталог
            </Link>
            {product.category && (
              <>
                <span style={{ margin: '0 8px' }}>/</span>
                <span style={{ color: '#64748b' }}>{product.category.name}</span>
              </>
            )}
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#64748b' }}>{product.name}</span>
          </nav>

          {/* Product Content */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '48px',
              marginBottom: '48px',
            }}
          >
            {/* Product Image */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '1',
              }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain', padding: '24px' }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#cbd5e1',
                  }}
                >
                  <svg
                    style={{ width: '64px', height: '64px' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Badges */}
              {(isOutOfStock || isNew) && (
                <div
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '16px',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10,
                  }}
                >
                  {isOutOfStock && (
                    <span
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 12px',
                        borderRadius: '6px',
                      }}
                    >
                      Нет в наличии
                    </span>
                  )}
                  {isNew && !isOutOfStock && (
                    <span
                      style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 12px',
                        borderRadius: '6px',
                      }}
                    >
                      Новинка
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px',
                  lineHeight: '1.2',
                }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div
                style={{
                  marginBottom: '24px',
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    marginBottom: '4px',
                  }}
                >
                  {formatPrice(product.price)} ₽
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#64748b',
                  }}
                >
                  за {priceUnit}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div
                  style={{
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '12px',
                    }}
                  >
                    Описание
                  </h2>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#475569',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              )}

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

          {/* Characteristics */}
          {characteristics.length > 0 && (
            <div
              style={{
                marginTop: '48px',
                padding: '24px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '24px',
                }}
              >
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
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginBottom: '4px',
                        fontWeight: '500',
                      }}
                    >
                      {char.name}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
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
      </section>
    </div>
  );
}

