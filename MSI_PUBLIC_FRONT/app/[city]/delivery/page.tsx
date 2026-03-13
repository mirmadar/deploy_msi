'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { apiClient, getErrorMessage } from '@/lib/api';
import { useCitySlug } from '@/components/cities/CityProvider';
import { FormEvent, useState } from 'react';
export default function DeliveryPage() {
    const citySlug = useCitySlug();

    const [orderName, setOrderName] = useState('');
    const [orderPhone, setOrderPhone] = useState('');
    const [orderSubmitting, setOrderSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

  const handleOrderSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setOrderError(null);
      if (!orderName.trim() || !orderPhone.trim()) {
        setOrderError('Укажите имя и телефон');
        return;
      }
      try {
        setOrderSubmitting(true);
        await apiClient.sendCallbackRequest(orderName.trim(), orderPhone.trim());
        setOrderSuccess(true);
        setOrderName('');
        setOrderPhone('');
      } catch (err) {
        setOrderError(getErrorMessage(err, 'Не удалось отправить заявку'));
      } finally {
        setOrderSubmitting(false);
      }
    };

  return (
    <section className="standart">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        
        {/* Контент */}
        <div className="flex flex-col gap-4">
          <PageHeader
            title="Доставка"
            breadcrumbs={[
              { label: 'Главная', href: `/${citySlug}` },
              { label: 'Доставка' },
            ]}
          />

          <div
            style={{
            border: '1px solid transparent',
            borderRadius: '16px',
            padding: '24px',
            backgroundColor: 'var(--color-light-gray)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
        }}>
          <p className="h3-bold">
            Доставка металлопродукции по всей России
          </p>

          <ul className="list-disc list-inside marker:text-[var(--color-green)] space-y-2">
            <li>Самовывоз со склада организации</li>
            <li>Доставка собственным автопарком</li>
            <li>Доставка из более 150 партнерских транспортных компаний</li>
            <li>Доставка железнодорожным транспортом</li>
            <li>Доставка авиатранспортом</li>
            <li>Индивидуальные решения для труднодоступных регионов</li>
          </ul>

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
  );
}
