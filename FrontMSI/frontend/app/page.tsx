'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { HomepageData } from '@/types/api';
import RequestForm from '@/components/RequestForm';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomepageData();
  }, []);

  const loadHomepageData = async () => {
    try {
      setLoading(true);
      const homepageData = await apiClient.getHomepage();
      setData(homepageData);
    } catch (err) {
      console.error('Не удалось загрузить данные:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  const categories = [
    { name: 'Трубный прокат', icon: '🔧', href: ROUTES.CATALOG },
    { name: 'Трубопроводная арматура', icon: '🔩', href: ROUTES.CATALOG },
    { name: 'Черный прокат', icon: '⚙️', href: ROUTES.CATALOG },
    { name: 'Цветной металлопрокат', icon: '🔨', href: ROUTES.CATALOG },
    { name: 'Смотреть все', icon: '→', href: ROUTES.CATALOG },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          minHeight: '500px',
          background: 'linear-gradient(90deg, #5eead4 0%, #0e7490 100%)',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Blurred background image effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'400\' height=\'400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 50 L150 50 L150 150 L50 150 Z\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'2\' fill=\'none\'/%3E%3Cpath d=\'M200 100 L300 100 L300 200 L200 200 Z\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E")',
            backgroundSize: 'cover',
            opacity: 0.3,
            filter: 'blur(40px)',
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Title */}
          <h1
            style={{
              color: '#ffffff',
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '40px',
              lineHeight: '1.2',
              maxWidth: '600px',
            }}
          >
            МеталлСтройИнвест - крупнейшая металлобаза
            <br />
            по металлопрокату
          </h1>

          {/* Form */}
          <div style={{ maxWidth: '800px' }}>
            <RequestForm onSubmit={handleFormSubmit} />
          </div>
        </div>
      </section>

      {/* Categories Section */}
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
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '24px',
            }}
          >
            {categories.map((category, idx) => (
              <Link
                key={idx}
                href={category.href}
                style={{
                  textDecoration: 'none',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    color: '#0f172a',
                    fontWeight: 'bold',
                  }}
                >
                  {category.icon === '→' ? (
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        border: '2px solid #0f172a',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                      }}
                    >
                      →
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                              {idx === 0 && (
                          <>
                            {/* Pipe fitting icon */}
                            <path d="M15 20 L30 20 L30 25 L35 25 L35 35 L30 35 L30 40 L15 40 Z" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M35 25 L45 30 L35 35" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          </>
                        )}
                        {idx === 1 && (
                          <>
                            {/* Wrench icon */}
                            <path d="M20 25 L25 20 L35 30 L30 35 Z" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M25 30 L30 35" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="42" cy="18" r="6" stroke="#0f172a" strokeWidth="2.5" fill="none" />
                          </>
                        )}
                        {idx === 2 && (
                          <>
                            {/* Pipe icon */}
                            <rect x="20" y="25" width="20" height="10" stroke="#0f172a" strokeWidth="2.5" fill="none" rx="2" />
                            <path d="M25 20 L25 25" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M35 20 L35 25" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M25 35 L25 40" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M35 35 L35 40" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                          </>
                        )}
                        {idx === 3 && (
                          <>
                            {/* Different metal icon */}
                            <path d="M15 20 L25 15 L35 20 L35 30 L25 35 L15 30 Z" stroke="#0f172a" strokeWidth="2.5" fill="none" />
                            <path d="M20 22.5 L30 22.5" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                            <path d="M20 27.5 L30 27.5" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                          </>
                        )}
                      </svg>
                    </div>
                  )}
                </div>
                <h3
                  style={{
                    color: '#0f172a',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: 0,
                    lineHeight: '1.4',
                  }}
                >
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Supplier Banner Section */}
      <section
        style={{
          position: 'relative',
          background: 'linear-gradient(90deg, #0d9488 0%, #0284c7 100%)',
          padding: '60px 40px',
          marginTop: '40px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Left side - Text and buttons */}
          <div style={{ flex: '1', maxWidth: '600px' }}>
            <h2
              style={{
                color: '#ffffff',
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '16px',
                lineHeight: '1.2',
              }}
            >
              Ваш надежный поставщик
            </h2>
            <p
              style={{
                color: '#ffffff',
                fontSize: '18px',
                marginBottom: '32px',
                opacity: 0.95,
              }}
            >
              Покупайте как физическое или юридическое лицо
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <button
                style={{
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#0d9488',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  maxWidth: '400px',
                }}
              >
                Доставка по всей России
              </button>
              <button
                style={{
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#0d9488',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  maxWidth: '400px',
                }}
              >
                Высококачественное оборудование
              </button>
              <button
                style={{
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#0d9488',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  maxWidth: '400px',
                }}
              >
                Выгодные условия
              </button>
            </div>
          </div>

          {/* Right side - Truck image */}
          <div
            style={{
              flex: '1',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '500px',
                height: '300px',
                position: 'relative',
              }}
            >
              <svg
                width="500"
                height="300"
                viewBox="0 0 500 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Truck body */}
                <rect x="50" y="150" width="200" height="100" fill="#ffffff" rx="8" />
                <rect x="250" y="180" width="150" height="70" fill="#ffffff" rx="8" />
                
                {/* Truck cabin */}
                <rect x="50" y="100" width="120" height="80" fill="#ffffff" rx="8" />
                <rect x="60" y="110" width="100" height="50" fill="#0d9488" rx="4" />
                
                {/* Wheels */}
                <circle cx="120" cy="250" r="30" fill="#0f172a" />
                <circle cx="120" cy="250" r="20" fill="#475569" />
                <circle cx="320" cy="250" r="30" fill="#0f172a" />
                <circle cx="320" cy="250" r="20" fill="#475569" />
                
                {/* Details */}
                <rect x="260" y="190" width="130" height="50" fill="#f1f5f9" rx="4" />
                <line x1="270" y1="215" x2="380" y2="215" stroke="#94a3b8" strokeWidth="2" />
                <line x1="270" y1="230" x2="380" y2="230" stroke="#94a3b8" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      {data?.newProducts && data.newProducts.length > 0 && (
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
            {/* Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
              }}
            >
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  margin: 0,
                }}
              >
                Новинки
              </h2>
              <Link
                href={ROUTES.CATALOG}
                style={{
                  color: '#14b8a6',
                  fontSize: '16px',
                  textDecoration: 'none',
                  fontWeight: '500',
                }}
              >
                Перейти в каталог
              </Link>
            </div>

            {/* Products Grid */}
            <div
              style={{
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '24px',
                  overflow: 'hidden',
                }}
              >
                {data.newProducts.slice(0, 4).map((product) => {
                  const productId = product.productId || product.id;
                  const priceUnit = product.priceUnit || 'пг.м.';
                  
                  return (
                    <div
                      key={productId}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 15 L20 15 L20 18 L23 18 L23 25 L20 25 L20 28 L10 28 Z"
                            stroke="#0f172a"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                          />
                          <path
                            d="M23 18 L30 22 L23 25"
                            stroke="#0f172a"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      {/* Product Name */}
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#0f172a',
                          marginBottom: '16px',
                          lineHeight: '1.4',
                          minHeight: '56px',
                        }}
                      >
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#0f172a',
                          marginBottom: '20px',
                        }}
                      >
                        от {product.price.toLocaleString('ru-RU')} руб./{priceUnit}
                      </div>

                      {/* Quantity selector and Add to cart */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginTop: 'auto',
                        }}
                      >
                        {/* Quantity selector */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#bfdbfe',
                            borderRadius: '8px',
                            padding: '4px',
                            flex: '1',
                          }}
                        >
                          <button
                            style={{
                              width: '32px',
                              height: '32px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              color: '#1e40af',
                              fontWeight: 'bold',
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            defaultValue="1"
                            min="1"
                            style={{
                              width: '40px',
                              textAlign: 'center',
                              border: 'none',
                              backgroundColor: 'transparent',
                              fontSize: '16px',
                              fontWeight: '500',
                              color: '#1e40af',
                              outline: 'none',
                            }}
                          />
                          <button
                            style={{
                              width: '32px',
                              height: '32px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              color: '#1e40af',
                              fontWeight: 'bold',
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* Add to cart button */}
                        <button
                          style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#1e40af',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          В корзину
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation arrow */}
              {data.newProducts.length > 4 && (
                <button
                  style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#14b8a6',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 10,
                  }}
                >
                  <svg
                    style={{ width: '24px', height: '24px', color: '#ffffff' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
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
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '40px',
            }}
          >
            Услуги
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            {/* Service 01 */}
            <div
              style={{
                backgroundColor: '#bfdbfe',
                borderRadius: '12px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Number */}
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  left: '24px',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'rgba(30, 64, 175, 0.2)',
                  zIndex: 1,
                }}
              >
                01
              </div>

              {/* Arrow icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  cursor: 'pointer',
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Image */}
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '8px',
                  backgroundColor: '#e0e7ff',
                  marginBottom: '20px',
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="200" fill="#c7d2fe" />
                  <rect x="30" y="60" width="140" height="80" fill="#818cf8" rx="4" />
                  <rect x="50" y="80" width="100" height="40" fill="#6366f1" />
                  <circle cx="70" cy="140" r="15" fill="#4f46e5" />
                  <circle cx="130" cy="140" r="15" fill="#4f46e5" />
                  <rect x="60" y="20" width="80" height="50" fill="#818cf8" rx="4" />
                  <rect x="70" y="30" width="60" height="30" fill="#6366f1" />
                </svg>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Изготовление изделий металлопроката
              </h3>

              {/* Description list */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <li
                  style={{
                    fontSize: '14px',
                    color: '#334155',
                    marginBottom: '12px',
                    paddingLeft: '20px',
                    position: 'relative',
                    lineHeight: '1.5',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#1e40af',
                    }}
                  />
                  Изготовление по индивидуальным чертежам с учётом технических требований
                </li>
                <li
                  style={{
                    fontSize: '14px',
                    color: '#334155',
                    paddingLeft: '20px',
                    position: 'relative',
                    lineHeight: '1.5',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#1e40af',
                    }}
                  />
                  Резка, гибка и обработка металлопроката любой сложности
                </li>
              </ul>
            </div>

            {/* Service 02 */}
            <div
              style={{
                backgroundColor: '#bfdbfe',
                borderRadius: '12px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Number */}
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  left: '24px',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'rgba(30, 64, 175, 0.2)',
                  zIndex: 1,
                }}
              >
                02
              </div>

              {/* Arrow icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  cursor: 'pointer',
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Image */}
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '8px',
                  backgroundColor: '#e0e7ff',
                  marginBottom: '20px',
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="200" fill="#c7d2fe" />
                  <rect x="40" y="40" width="120" height="120" fill="#818cf8" rx="8" />
                  <rect x="50" y="50" width="100" height="80" fill="#6366f1" rx="4" />
                  <circle cx="80" cy="90" r="15" fill="#e0e7ff" />
                  <circle cx="120" cy="90" r="15" fill="#e0e7ff" />
                  <rect x="60" y="120" width="80" height="30" fill="#a5b4fc" rx="4" />
                  <rect x="70" y="10" width="60" height="20" fill="#818cf8" rx="4" />
                </svg>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Дизайн-проект
              </h3>

              {/* Description list */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <li
                  style={{
                    fontSize: '14px',
                    color: '#334155',
                    marginBottom: '12px',
                    paddingLeft: '20px',
                    position: 'relative',
                    lineHeight: '1.5',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#1e40af',
                    }}
                  />
                  Дизайн-проект с нуля для тех, у кого есть свои идеи или хочется чего-то уникального
                </li>
                <li
                  style={{
                    fontSize: '14px',
                    color: '#334155',
                    paddingLeft: '20px',
                    position: 'relative',
                    lineHeight: '1.5',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#1e40af',
                    }}
                  />
                  Помощь с подбором товаров и расчетами материалов для обустройства ванной комнаты
                </li>
              </ul>
            </div>

            {/* Service 03 */}
            <div
              style={{
                backgroundColor: '#bfdbfe',
                borderRadius: '12px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Number */}
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  left: '24px',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'rgba(30, 64, 175, 0.2)',
                  zIndex: 1,
                }}
              >
                03
              </div>

              {/* Arrow icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  cursor: 'pointer',
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Image */}
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '8px',
                  backgroundColor: '#e0e7ff',
                  marginBottom: '20px',
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="200" fill="#c7d2fe" />
                  <rect x="20" y="40" width="50" height="120" fill="#818cf8" rx="4" />
                  <rect x="30" y="50" width="30" height="100" fill="#6366f1" />
                  <circle cx="45" cy="180" r="12" fill="#4f46e5" />
                  <rect x="80" y="60" width="50" height="100" fill="#818cf8" rx="4" />
                  <rect x="90" y="70" width="30" height="80" fill="#6366f1" />
                  <circle cx="105" cy="180" r="12" fill="#4f46e5" />
                  <rect x="140" y="80" width="50" height="80" fill="#818cf8" rx="4" />
                  <rect x="150" y="90" width="30" height="60" fill="#6366f1" />
                  <circle cx="165" cy="180" r="12" fill="#4f46e5" />
                  <rect x="10" y="20" width="180" height="15" fill="#a5b4fc" rx="2" />
                </svg>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Поставки оборудования и инжиниринг
              </h3>

              {/* Description list */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <li
                  style={{
                    fontSize: '14px',
                    color: '#334155',
                    marginBottom: '12px',
                    paddingLeft: '20px',
                    position: 'relative',
                    lineHeight: '1.5',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#1e40af',
                    }}
                  />
                  Подбор и поставка промышленного оборудования под требования проекта
                </li>
                <li
                  style={{
                    fontSize: '14px',
                    color: '#334155',
                    paddingLeft: '20px',
                    position: 'relative',
                    lineHeight: '1.5',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#1e40af',
                    }}
                  />
                  Разработка инженерных решений и техническое сопровождение
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
