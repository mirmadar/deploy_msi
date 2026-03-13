'use client';

import '@/styles/globals.css';
import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { apiClient, getErrorMessage } from '@/lib/api';
import type {
  PublicServiceDetailResponse,
  ServiceBlock,
  HeadingBlockPayload,
  TextBlockPayload,
  ListBlockPayload,
  ImageBlockPayload,
  DocumentsBlockPayload,
} from '@/types/api';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { sanitizeHtml } from '@/lib/sanitize';
import { useCitySlug } from '@/components/cities/CityProvider';

function renderBlock(block: ServiceBlock) {
  const type = (block.type || '').toUpperCase();

  switch (type) {
    case 'HEADING': {
      const payload = block.payload as HeadingBlockPayload;
      return (
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#0f172a',
            margin: '12px 0 6px',
          }}
        >
          {payload.text}
        </h2>
      );
    }
    case 'TEXT': {
      const payload = block.payload as TextBlockPayload;
      const raw = (payload.content || '').replace(/\n/g, '<br/>');
      return (
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#1f2933',
            margin: '8px 0',
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(raw) }}
        />
      );
    }
    case 'LIST': {
      const payload = block.payload as ListBlockPayload;
      const items = Array.isArray(payload.items) ? payload.items : [];
      const ListTag = payload.ordered ? 'ol' : 'ul';
      return (
        <ListTag
          style={{
            paddingLeft: '1.5rem',
            margin: '8px 0 16px',
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#1f2933',
            listStyle: payload.ordered ? 'decimal' : 'disc',
          }}
        >
          {items.map((item, index) => {
            const raw = (item || '').replace(/\n/g, '<br/>');
            return (
              <li
                key={index}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(raw) }}
              />
            );
          })}
        </ListTag>
      );
    }
    case 'IMAGE': {
      const payload = block.payload as ImageBlockPayload;
      const width = payload.width || '100%';
      return (
        <figure
          style={{
            margin: '16px 0',
          }}
        >
          <img
            src={payload.imageUrl}
            alt={payload.caption || ''}
            style={{
              width,
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          />
          {payload.caption && (
            <figcaption
              style={{
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '4px',
              }}
            >
              {payload.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case 'DOCUMENTS': {
      const payload = block.payload as DocumentsBlockPayload;
      return (
        <div
          style={{
            margin: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {payload.items?.map((item, index) => (
            <a
              key={index}
              href={item.fileUrl}
              style={{
                color: '#2563eb',
                textDecoration: 'underline',
                fontSize: '14px',
                display: 'inline-block',
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title}
            </a>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const citySlug = useCitySlug(); 

  const [data, setData] = useState<PublicServiceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadService();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadService = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getServiceBySlug(citySlug, slug);
      setData(response);
    } catch (err) {
      console.error('Error loading service:', err);
      setError(getErrorMessage(err, 'Не удалось загрузить услугу'));
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    if (!orderName.trim() || !orderPhone.trim()) {
      setOrderError('Укажите имя и телефон');
      return;
    }
    try {
      setOrderSubmitting(true);
      await apiClient.createServiceOrder(citySlug, slug, {
        name: orderName.trim(),
        phone: orderPhone.trim(),
      });
      setOrderSuccess(true);
      setOrderName('');
      setOrderPhone('');
    } catch (err) {
      setOrderError(getErrorMessage(err, 'Не удалось отправить заявку'));
    } finally {
      setOrderSubmitting(false);
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
                onClick={loadService}
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

  const { name, category, blocks } = data;

  return (
    <div>
      <section className='standart'>
        <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10'>
          {/* Основной контент */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <PageHeader
              title={name}
              breadcrumbs={[
                { label: 'Главная', href: ROUTES.HOME(citySlug) },
                { label: 'Услуги', href: ROUTES.SERVICES(citySlug) },
                { label: category.name, href: `/${citySlug}/services/category/${category.slug}` },
                { label: name },
              ]}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {blocks.length === 0 ? (
                <div
                  style={{
                    borderRadius: '12px',
                    padding: '32px 24px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <p style={{ fontSize: '16px', color: '#64748b' }}>
                    Описание услуги будет добавлено позже.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '16px',
                    lineHeight: 1.6,
                    color: '#1f2933',
                  }}
                >
                  {blocks.map((block) => (
                    <div key={block.serviceBlockId}>{renderBlock(block)}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Липкая форма заявки справа */}
          <aside
            style={{
              position: 'sticky',
              top: '180px',
            }}
          >
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                backgroundColor: '#ffffff',
                marginTop: '16px',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0f172a',
                  margin: '0 0 6px',
                }}
              >
                Узнать цену и условия
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0 0 20px',
                  lineHeight: 1.5,
                }}
              >
                Оставьте контакты — перезвоним и обсудим заказ лично.
              </p>

              {orderSuccess ? (
                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--color-green, #0d9488)',
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  Заявка отправлена. Мы свяжемся с вами в ближайшее время.
                </p>
              ) : (
                <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>Имя</span>
                    <input
                      type="text"
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="Ваше имя"
                      required
                      style={{
                        padding: '12px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '15px',
                        outline: 'none',
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>Телефон</span>
                    <input
                      type="tel"
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      placeholder="+7 (___) ___-__-__"
                      required
                      style={{
                        padding: '12px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '15px',
                        outline: 'none',
                      }}
                    />
                  </label>
                  {orderError && (
                    <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{orderError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      background: 'var(--gradient-primary, linear-gradient(90deg, #0d9488, #14b8a6))',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: orderSubmitting ? 'not-allowed' : 'pointer',
                      opacity: orderSubmitting ? 0.7 : 1,
                    }}
                  >
                    {orderSubmitting ? 'Отправка...' : 'Оставить заявку'}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

