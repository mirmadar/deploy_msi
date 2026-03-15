'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import CartButton from './CartButton';
import CartDrawer from './CartDrawer';
import Image from 'next/image';
import { ActionButton } from './ui/ActionButton';
import Modal from '@/components/Modal';
import RequestForm from '@/components/RequestForm';
import { apiClient } from '@/lib/api';

interface HeaderProps {
  cityName: string;
  citySlug: string;
  phone: string;
  onCityClick: () => void;
}

export default function Header({ phone, cityName, citySlug, onCityClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Синхронизируем поле поиска с URL — после обновления страницы или перехода по ссылке запрос не теряется
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname && pathname.endsWith('/search') && citySlug) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      setSearchQuery(q ? decodeURIComponent(q) : '');
    }
  }, [pathname, citySlug]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && citySlug) {
      router.push(`/${citySlug}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      // Не очищаем поле — на странице поиска значение подтянется из URL
    }
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
  }, [isMobileMenuOpen]);
  

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        backgroundColor: 'var(--color-white)',
        borderRadius: '0 0 24px 24px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* ===== Desktop ===== */}
      <div className='desktop-only'>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '80px',
          justifyContent: 'space-between',
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '16px 80px',
        }}
      >
        {/* ===== Logo MSI ===== */}
        <Link
          href={ROUTES.HOME(citySlug)}
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Image 
            src={'/logo_transparent.png'}
            alt={'logo-msi'}
            width={112}
            height={56}
          />
        </Link>
        
        {/* ===== Navigation, Phone, Search and Action Buttons ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            {/* Navigation Links */}
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flex: '1',
                justifyContent: 'flex-start',
              }}
            >
              {/* ====== О компании ====== */}
              <Link
                href={ROUTES.ABOUT(citySlug)}
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-dark)',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                О компании
              </Link>

              {/* ====== Услуги ====== */}
              <Link
                href={ROUTES.SERVICES(citySlug)}
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-dark)',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                Услуги
              </Link>

              {/* ====== Доставка ====== */}
              <Link
                href={ROUTES.DELIVERY(citySlug)}
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-dark)',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                Доставка
              </Link>

              {/* ====== Контакты ====== */}          
              <Link
                href={ROUTES.CONTACTS(citySlug)}
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-dark)',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                Контакты
              </Link>

              {/* ====== Отгрузки ====== */}
              <Link
                href={ROUTES.SHIPMENTS(citySlug)}
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-dark)',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                Отгрузки
              </Link>

              {/* ====== Статьи ====== */}
              <Link
                href={ROUTES.ARTICLES(citySlug)}
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-dark)',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                Статьи
              </Link>          
            </nav>

            {/* ===== Email =====*/}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="14" viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6667 1.66667C16.6667 0.75 15.9167 0 15 0H1.66667C0.75 0 0 0.75 0 1.66667V11.6667C0 12.5833 0.75 13.3333 1.66667 13.3333H15C15.9167 13.3333 16.6667 12.5833 16.6667 11.6667V1.66667ZM15 1.66667L8.33333 5.83333L1.66667 1.66667H15ZM15 11.6667H1.66667V3.33333L8.33333 7.5L15 3.33333V11.6667Z" fill="#071421"/>
                </svg>
              </div>

              <a
                href="mailto:INFO.PO-MSR@mail.ru"
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-dark)',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                INFO.PO-MSR@mail.ru
              </a>
            </div>

            {/* ===== Phone =====*/}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5031 10.2083L11.3864 9.96667C10.8781 9.90833 10.3781 10.0833 10.0197 10.4417L8.4864 11.975C6.12806 10.775 4.19473 8.85 2.99473 6.48333L4.53639 4.94167C4.89473 4.58333 5.06973 4.08333 5.01139 3.575L4.76973 1.475C4.66973 0.633334 3.9614 0 3.11139 0H1.66973C0.728062 0 -0.0552721 0.783333 0.00306123 1.725C0.444728 8.84167 6.1364 14.525 13.2447 14.9667C14.1864 15.025 14.9697 14.2417 14.9697 13.3V11.8583C14.9781 11.0167 14.3447 10.3083 13.5031 10.2083V10.2083Z" fill="#071421"/>
                </svg>
              </div>

              <a
                href={`tel:${phone}` || 'tel:+7(910)142-26-87'}
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-dark)',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                {phone || '+7 (910) 142-26-87'}
              </a>
            </div>

            <button type="button" onClick={onCityClick} className="flex items-center gap-2 px-2 py-1 border rounded-lg border-transparent bg-[var(--color-light-gray)] hover:bg-[var(--color-light-blue)] transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.99992 1.33334C5.41992 1.33334 3.33325 3.42001 3.33325 6.00001C3.33325 9.50001 7.99992 14.6667 7.99992 14.6667C7.99992 14.6667 12.6666 9.50001 12.6666 6.00001C12.6666 3.42001 10.5799 1.33334 7.99992 1.33334ZM4.66659 6.00001C4.66659 4.16001 6.15992 2.66668 7.99992 2.66668C9.83992 2.66668 11.3333 4.16001 11.3333 6.00001C11.3333 7.92001 9.41325 10.7933 7.99992 12.5867C6.61325 10.8067 4.66659 7.90001 4.66659 6.00001Z" fill="#1E1E1E"/>
              <path d="M7.99992 7.66668C8.92039 7.66668 9.66658 6.92048 9.66658 6.00001C9.66658 5.07954 8.92039 4.33334 7.99992 4.33334C7.07944 4.33334 6.33325 5.07954 6.33325 6.00001C6.33325 6.92048 7.07944 7.66668 7.99992 7.66668Z" fill="#1E1E1E"/>
              </svg>

              <p className='p-small'>{cityName ?? 'Выбрать город'}</p>
            </button>
          </div>

          {/* ===== Search and Action Buttons ===== */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* ===== Search Bar ===== */}
              <form
                onSubmit={handleSearch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: '1',
                  maxWidth: '600px',
                }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск"
                  style={{
                    flex: '1',
                    padding: '14px 14px',
                    border: 'none',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-light-gray)',
                    fontSize: '16px',
                    outline: 'none',
                    color: 'var(--color-gray)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-green)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0',
                  }}
                >
                  <svg
                    style={{ width: '24px', height: '24px', color: 'var(--color-white)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>

            {/* ===== Action Buttons ===== */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              {/* Catalog Button */}
              <div style={{ position: 'relative' }}>
                <Link
                  href={ROUTES.CATALOG(citySlug)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: 'var(--gradient-primary)',
                    color: 'var(--color-white)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.66667 10.6667H8C9.46667 10.6667 10.6667 9.46667 10.6667 8V2.66667C10.6667 1.2 9.46667 0 8 0H2.66667C1.2 0 0 1.2 0 2.66667V8C0 9.46667 1.2 10.6667 2.66667 10.6667Z" fill="white"/>
                    <path d="M2.66667 24H8C9.46667 24 10.6667 22.8 10.6667 21.3333V16C10.6667 14.5333 9.46667 13.3333 8 13.3333H2.66667C1.2 13.3333 0 14.5333 0 16V21.3333C0 22.8 1.2 24 2.66667 24Z" fill="white"/>
                    <path d="M13.3333 2.66667V8C13.3333 9.46667 14.5333 10.6667 16 10.6667H21.3333C22.8 10.6667 24 9.46667 24 8V2.66667C24 1.2 22.8 0 21.3333 0H16C14.5333 0 13.3333 1.2 13.3333 2.66667Z" fill="white"/>
                    <path d="M16 24H21.3333C22.8 24 24 22.8 24 21.3333V16C24 14.5333 22.8 13.3333 21.3333 13.3333H16C14.5333 13.3333 13.3333 14.5333 13.3333 16V21.3333C13.3333 22.8 14.5333 24 16 24Z" fill="white"/>
                    </svg>
                  </div>

                  <span>Каталог</span>
                </Link>

                {/* {isCatalogOpen && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                      }}
                      onClick={() => setIsCatalogOpen(false)}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: '8px',
                        width: '224px',
                        padding: '8px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        zIndex: 20,
                      }}
                    >
                      <Link
                        href={ROUTES.CATALOG}
                        style={{
                          textDecoration: 'none',
                          color: '#0f172a',
                          display: 'block',
                          padding: '8px 12px',
                          fontSize: '14px',
                        }}
                        onClick={() => setIsCatalogOpen(false)}
                      >
                        Все категории
                      </Link>
                    </div>
                  </>
                )} */}
              </div>

              {/* Call Button */}
              <ActionButton
                background='var(--color-light-blue)'
                color='var(--color-blue)'
                text="Оставить заявку"
                onClick={() => setOpen(true)}
              />

              <Modal isOpen={open} onClose={() => setOpen(false)}>
                <h2
                  style={{
                    color: 'var(--color-white)',
                    marginBottom: '24px',
                    fontSize: '28px',
                  }}
                >
                  Оставьте заявку
                </h2>

                <RequestForm
                  onSubmit={async (data) => {
                    await apiClient.sendCallbackRequest(data.name, data.phone, data.document);
                    setOpen(false);
                  }}
                  buttonColor='var(--color-light-green)'
                  buttonText='var(--color-green)'
                />
              </Modal>

              {/* Cart Button */}
              <CartButton onClick={() => setIsCartOpen(true)} />
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* ===== Mobile ===== */}
      <div className='mobile-only'>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1600px',
            margin: '0 auto',
            padding: '16px 20px',
          }}
        >
          {/* ===== Burger (mobile only) ===== */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="mobile-only burger-button"
          >
            <span className={`line ${isMobileMenuOpen ? 'open' : ''}`} />
            <span className={`line ${isMobileMenuOpen ? 'open' : ''}`} />
            <span className={`line ${isMobileMenuOpen ? 'open' : ''}`} />
          </button>

          {/* ===== Logo ===== */}
          <Link href={ROUTES.HOME(citySlug)}>
            <Image
              src={'/logo_transparent.png'}
              alt={'logo-msi'}
              width={100}
              height={50}
            />
          </Link>

          {/* ===== Cart (mobile only) ===== */}
          <div className="mobile-only">
            <CartButton onClick={() => setIsCartOpen(true)} />
          </div>
        </div>

      </div>
      {isMobileMenuOpen && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'white',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    }}
  >
    {/* Закрыть */}
    <button
      onClick={() => setIsMobileMenuOpen(false)}
      style={{
        alignSelf: 'flex-end',
        fontSize: '24px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      ✕
    </button>

    {/* Поиск */}
    <form
      onSubmit={(e) => {
        handleSearch(e);
        setIsMobileMenuOpen(false); // при поиске тоже закрываем
      }}
      style={{
        marginTop: '16px',
        marginBottom: '32px',
      }}
    >
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Поиск"
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: 'var(--color-light-gray)',
        }}
      />
    </form>

    {/* Навигация */}
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontSize: '18px',
        fontWeight: '600',
      }}
    >
      <Link href={ROUTES.HOME(citySlug)} onClick={() => setIsMobileMenuOpen(false)}>Главная</Link>
      <Link href={ROUTES.CATALOG(citySlug)} onClick={() => setIsMobileMenuOpen(false)}>Каталог</Link>
      <Link href={ROUTES.ABOUT(citySlug)} onClick={() => setIsMobileMenuOpen(false)}>О компании</Link>
      <Link href={ROUTES.SERVICES(citySlug)} onClick={() => setIsMobileMenuOpen(false)}>Услуги</Link>
      <Link href={ROUTES.DELIVERY(citySlug)} onClick={() => setIsMobileMenuOpen(false)}>Доставка</Link>
      <Link href={ROUTES.CONTACTS(citySlug)} onClick={() => setIsMobileMenuOpen(false)}>Контакты</Link>
      <Link href={ROUTES.SHIPMENTS(citySlug)} onClick={() => setIsMobileMenuOpen(false)}>Отгрузки</Link>
      <Link href={ROUTES.ARTICLES(citySlug)} onClick={() => setIsMobileMenuOpen(false)}>Статьи</Link>
    </nav>

    {/* Нижний блок */}
    <div
      style={{
        marginTop: 'auto',
        textAlign: 'center',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#64748b',
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
      }}
    >
      {/* Кнопка города */}
      <button
        type="button"
        onClick={() => {
          onCityClick();
          setIsMobileMenuOpen(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          color: '#64748b',
          backgroundColor: 'var(--color-light-gray)',
          padding: '8px 12px',
          borderRadius: '12px',
          marginTop: '8px',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.0001 1.66666C6.77508 1.66666 4.16675 4.27499 4.16675 7.49999C4.16675 11.875 10.0001 18.3333 10.0001 18.3333C10.0001 18.3333 15.8334 11.875 15.8334 7.49999C15.8334 4.27499 13.2251 1.66666 10.0001 1.66666ZM5.83341 7.49999C5.83341 5.19999 7.70008 3.33332 10.0001 3.33332C12.3001 3.33332 14.1667 5.19999 14.1667 7.49999C14.1667 9.89999 11.7667 13.4917 10.0001 15.7333C8.26675 13.5083 5.83341 9.87499 5.83341 7.49999Z" fill="#1E1E1E"/>
          <path d="M10.0001 9.58332C11.1507 9.58332 12.0834 8.65058 12.0834 7.49999C12.0834 6.3494 11.1507 5.41666 10.0001 5.41666C8.84949 5.41666 7.91675 6.3494 7.91675 7.49999C7.91675 8.65058 8.84949 9.58332 10.0001 9.58332Z" fill="#1E1E1E"/>
        </svg>
        {cityName}
      </button>

      <div className='flex flex-col text-right'>
        <div>INFO.PO-MSR@mail.ru</div>
        <div>{phone}</div>
      </div>
    </div>
  </div>
)}


      {/* ===== Cart Drawer ===== */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
