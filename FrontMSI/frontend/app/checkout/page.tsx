'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { apiClient } from '@/lib/api';
import { isCartExists } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, fetchCart, updateQuantity, removeItem } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

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

    if (!cart || !isCartExists(cart) || cart.items.length === 0) {
      setError('Корзина пуста');
      return;
    }

    setIsSubmitting(true);
    try {
      // Преобразуем товары корзины в формат OrderItem
      const orderItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      await apiClient.createOrder({
        name: name.trim(),
        phone: phone.trim(),
        document: document || undefined,
        items: orderItems,
      });

      // Обновляем корзину (бэкенд автоматически очистит её)
      await fetchCart();
      setOrderSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при оформлении заказа';
      setError(errorMessage);
      console.error('Ошибка оформления заказа:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number): string => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  };

  // Если корзина пуста, перенаправляем в каталог
  if (!cartLoading && (!cart || !isCartExists(cart) || cart.items.length === 0)) {
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
              maxWidth: '800px',
              margin: '0 auto',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '16px',
              }}
            >
              Корзина пуста
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: '#64748b',
                marginBottom: '24px',
              }}
            >
              Добавьте товары в корзину перед оформлением заказа
            </p>
            <Link
              href={ROUTES.CATALOG}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#14b8a6',
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

  // Сообщение об успешном оформлении
  if (orderSuccess) {
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
              maxWidth: '800px',
              margin: '0 auto',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '48px 24px',
              }}
            >
              <svg
                style={{
                  width: '64px',
                  height: '64px',
                  color: '#10b981',
                  margin: '0 auto 24px',
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px',
                }}
              >
                Заказ успешно оформлен!
              </h1>
              <p
                style={{
                  fontSize: '16px',
                  color: '#475569',
                  marginBottom: '32px',
                }}
              >
                Мы свяжемся с вами в ближайшее время для подтверждения заказа.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link
                  href={ROUTES.CATALOG}
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#14b8a6',
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
                  href={ROUTES.HOME}
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#ffffff',
                    color: '#14b8a6',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    border: '2px solid #14b8a6',
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
              marginBottom: '32px',
            }}
          >
            <Link href={ROUTES.HOME} style={{ color: '#14b8a6', textDecoration: 'none' }}>
              Главная
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href={ROUTES.CATALOG} style={{ color: '#14b8a6', textDecoration: 'none' }}>
              Каталог
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#64748b' }}>Оформление заказа</span>
          </nav>

          <h1
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '32px',
            }}
          >
            Оформление заказа
          </h1>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 400px',
              gap: '32px',
            }}
          >
            {/* Main Content */}
            <div>
              {/* Cart Items */}
              {cartLoading ? (
                <div
                  style={{
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  Загрузка корзины...
                </div>
              ) : hasItems ? (
                <div
                  style={{
                    marginBottom: '32px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
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
                            gap: '16px',
                            padding: '16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            opacity: isUpdating ? 0.6 : 1,
                          }}
                        >
                          {/* Image */}
                          <div
                            style={{
                              width: '80px',
                              height: '80px',
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
                                  style={{ width: '32px', height: '32px' }}
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

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3
                              style={{
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#0f172a',
                                marginBottom: '8px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.product.name}
                            </h3>
                            <div
                              style={{
                                fontSize: '14px',
                                color: '#64748b',
                                marginBottom: '12px',
                              }}
                            >
                              {formatPrice(item.price)} за шт.
                            </div>

                            {/* Quantity Controls */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                }}
                              >
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
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M20 12H4"
                                    />
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
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 4v16m8-8H4"
                                    />
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

                          {/* Total */}
                          <div
                            style={{
                              textAlign: 'right',
                              minWidth: '100px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#0f172a',
                              }}
                            >
                              {formatPrice(itemTotal)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Order Form */}
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
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
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="checkout-name"
                        style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#0f172a',
                          marginBottom: '8px',
                        }}
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

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="checkout-phone"
                        style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#0f172a',
                          marginBottom: '8px',
                        }}
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

                    {/* Document */}
                    <div>
                      <label
                        htmlFor="checkout-document"
                        style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#0f172a',
                          marginBottom: '8px',
                        }}
                      >
                        Документ (опционально)
                      </label>
                      <label
                        htmlFor="checkout-document"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="file"
                          id="checkout-document"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          style={{
                            padding: '12px 20px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <svg
                            style={{ width: '20px', height: '20px' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          {document ? document.name : 'Загрузить документ'}
                        </button>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  position: 'sticky',
                  top: '20px',
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
                  Итого
                </h2>

                {cartExists && (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        fontSize: '16px',
                        color: '#64748b',
                      }}
                    >
                      <span>Товаров:</span>
                      <span>{cart.items.length}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '24px',
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#0f172a',
                        paddingTop: '16px',
                        borderTop: '1px solid #e2e8f0',
                      }}
                    >
                      <span>Сумма:</span>
                      <span>{formatPrice(cart.totalAmount)}</span>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !hasItems}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isSubmitting || !hasItems ? '#cbd5e1' : '#14b8a6',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isSubmitting || !hasItems ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting && hasItems) {
                          e.currentTarget.style.backgroundColor = '#0d9488';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting && hasItems) {
                          e.currentTarget.style.backgroundColor = '#14b8a6';
                        }
                      }}
                    >
                      {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                    </button>
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

