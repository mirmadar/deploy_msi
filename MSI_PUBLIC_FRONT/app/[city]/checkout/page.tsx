'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { apiClient, getErrorMessage } from '@/lib/api';
import { isCartExists } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCitySlug } from '@/components/cities/CityProvider';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, fetchCart, updateQuantity, removeItem } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const citySlug = useCitySlug();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const truncate = (text: string, max = 24) =>
    text.length > max ? text.slice(0, max) + '…' : text;

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      if (validTypes.includes(file.type)) {
        setDocument(file);
        setError(null);
      } else {
        setError('Пожалуйста, загрузите PDF или DOCX файл');
        setDocument(null);
      }
    }
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (err) {
      console.error('Ошибка обновления количества:', err);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemove = async (itemId: number) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error('Ошибка удаления товара:', err);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Имя обязательно для заполнения');
      return;
    }
    if (!phone.trim()) {
      setError('Телефон обязателен для заполнения');
      return;
    }
    if (!email.trim()) {
      setError('Email обязателен для заполнения');
      return;
    }
    if (!cart || !isCartExists(cart) || cart.items.length === 0) {
      setError('Корзина пуста');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createOrder(
        {
          clientName: name.trim(),
          clientPhone: phone.trim(),
          clientEmail: email.trim(),
        },
        document ?? undefined
      );
      await fetchCart();
      setOrderSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Произошла ошибка при оформлении заказа'));
      console.error('Ошибка оформления заказа:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number): string => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  };

  if (!cartLoading && (!cart || !isCartExists(cart) || cart.items.length === 0)) {
    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}>
        <section style={{ padding: '60px 40px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>
              Корзина пуста
            </h1>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px' }}>
              Добавьте товары в корзину перед оформлением заказа
            </p>
            <Link
              href={ROUTES.CATALOG(citySlug)}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'var(--color-blue)',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              Перейти в каталог
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}>
        <section className="standart">
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '48px 24px',
              }}
            >
              <svg
                style={{ width: '64px', height: '64px', color: '#10b981', margin: '0 auto 24px' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>
                Заказ успешно оформлен!
              </h1>
              <p style={{ fontSize: '16px', color: '#475569', marginBottom: '32px' }}>
                Мы свяжемся с вами в ближайшее время для подтверждения заказа.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link
                  href={ROUTES.CATALOG(citySlug)}
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: 'var(--color-blue)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                  }}
                >
                  Вернуться в каталог
                </Link>
                <Link
                  href={ROUTES.HOME(citySlug)}
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#ffffff',
                    color: 'var(--color-blue)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    border: '2px solid var(--color-blue)',
                  }}
                >
                  На главную
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const cartExists = cart && isCartExists(cart);
  const hasItems = cartExists && cart.items.length > 0;

  const cartItemsBlock = (
    <>
      {cartLoading ? (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#64748b',
            marginBottom: '24px',
          }}
        >
          Загрузка корзины...
        </div>
      ) : hasItems ? (
        <div
          style={{
            marginBottom: '24px',
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
            }}
          >
            Товары в заказе
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.items.map((item) => {
              const isUpdating = updatingItems.has(item.id);
              const itemTotal = item.price * item.quantity;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    opacity: isUpdating ? 0.6 : 1,
                  }}
                >
                  {/* Картинка + информация + сумма */}
                  <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        flexShrink: 0,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#f1f5f9',
                        position: 'relative',
                      }}
                    >
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          style={{ objectFit: 'cover' }}
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
                            style={{ width: '28px', height: '28px' }}
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
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: '15px',
                          fontWeight: '500',
                          color: '#0f172a',
                          marginBottom: '4px',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.product.name}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {formatPrice(item.price)} за шт.
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '80px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                        {formatPrice(itemTotal)}
                      </div>
                    </div>
                  </div>

                  {/* Контролы количества + Удалить */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          cursor: isUpdating || item.quantity <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: isUpdating || item.quantity <= 1 ? 0.5 : 1,
                        }}
                      >
                        <svg
                          style={{ width: '16px', height: '16px', color: '#64748b' }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span
                        style={{
                          minWidth: '40px',
                          textAlign: 'center',
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#0f172a',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isUpdating}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          cursor: isUpdating ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: isUpdating ? 0.5 : 1,
                        }}
                      >
                        <svg
                          style={{ width: '16px', height: '16px', color: '#64748b' }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isUpdating}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        color: '#ef4444',
                        fontSize: '14px',
                        opacity: isUpdating ? 0.5 : 1,
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}>
      <section className="standart">
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <PageHeader
            title="Оформление заказа"
            breadcrumbs={[
              { label: 'Главная', href: `/${citySlug}` },
              { label: 'Каталог', href: ROUTES.CATALOG(citySlug) },
              { label: 'Оформление заказа' },
            ]}
          />

          <div
            style={{
              display: 'grid',
              gap: '32px',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 440px',
              gridTemplateAreas: isMobile ? '"sidebar" "main"' : '"main sidebar"',
              marginTop: '40px',
            }}
          >
            {/* ===== Левая колонка: товары в заказе ===== */}
            <div style={{ gridArea: 'main' }}>
              {cartItemsBlock}
            </div>

            {/* ===== Правая колонка: контактные данные + кнопка оформить ===== */}
            <div style={{ gridArea: 'sidebar' }}>
              <div
                style={{
                  position: isMobile ? 'static' : 'sticky',
                  top: isMobile ? undefined : '20px',
                }}
              >
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    padding: '24px',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '24px',
                    }}
                  >
                    Контактные данные
                  </h2>

                  {error && (
                    <div
                      style={{
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#991b1b',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px',
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label
                        htmlFor="checkout-name"
                        style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '8px' }}
                      >
                        Имя *
                      </label>
                      <input
                        type="text"
                        id="checkout-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Введите ваше имя"
                        disabled={isSubmitting}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          fontSize: '16px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-phone"
                        style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '8px' }}
                      >
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        id="checkout-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+7 (___) ___-__-__"
                        disabled={isSubmitting}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          fontSize: '16px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-email"
                        style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '8px' }}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="checkout-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@domain.ru"
                        disabled={isSubmitting}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          fontSize: '16px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-document"
                        style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '8px' }}
                      >
                        Документ (опционально)
                      </label>
                      <label
                        htmlFor="document"
                        className="upload-label"
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          color: 'var(--color-green)',
                          background: 'var(--color-light-green)',
                          fontSize: '14px',
                          fontWeight: '400',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span>{document ? truncate(document.name, 14) : 'Загрузить документ'}</span>
                        <input
                          type="file"
                          id="document"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                          disabled={isSubmitting}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </form>

              {cartExists && (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !hasItems}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isSubmitting || !hasItems ? '#cbd5e1' : 'var(--color-blue)',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isSubmitting || !hasItems ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting && hasItems) {
                        e.currentTarget.style.backgroundColor = 'var(--color-light-blue)';
                        e.currentTarget.style.color = 'var(--color-blue)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting && hasItems) {
                        e.currentTarget.style.backgroundColor = 'var(--color-blue)';
                        e.currentTarget.style.color = 'var(--color-white)';
                      }
                    }}
                  >
                    {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                  </button>

                  <p
                    style={{
                      marginTop: '16px',
                      fontSize: '13px',
                      color: '#64748b',
                      lineHeight: 1.5,
                    }}
                  >
                    Итоговая стоимость заказа будет рассчитана менеджером после обработки заявки.
                    Оплата на сайте не производится — счёт и сумму вы получите после подтверждения заказа.
                  </p>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
