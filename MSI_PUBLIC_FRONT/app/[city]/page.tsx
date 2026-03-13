'use client';

import '@/styles/globals.css';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Category, HomepageData } from '@/types/api';
import CategoryCard from '@/components/CategoryCard';
import RequestForm from '@/components/RequestForm';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import Image from 'next/image';
import { ServiceCard } from '@/components/ui/ServiceCard';
import ArticleCard from '@/components/ui/ArticleCard';
import ProductCard from '@/components/ProductCard';
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

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const newProductsSliderRef = useRef<HTMLDivElement>(null);
  const [canNewScrollLeft, setCanNewScrollLeft] = useState(false);
  const [canNewScrollRight, setCanNewScrollRight] = useState(true);
  const citySlug = useCitySlug();
  const isDesktop = useMediaQuery('(min-width: 768px)'); 
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (!citySlug) return;

    loadHomepageData();
  }, [citySlug]);


  const loadHomepageData = async () => {
    try {
      setLoading(true);
      const homepageData = await apiClient.getHomepage(citySlug);
      setData(homepageData);
    } catch (err) {
      console.error('Не удалось загрузить данные:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: { name: string; phone: string; document?: File }) => {
    await apiClient.sendCallbackRequest(data.name, data.phone, data.document);
  };

  const updateButtons = () => {
    const el = sliderRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);

    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    );
  };

  const scrollByAmount = (amount: number) => {
    sliderRef.current?.scrollBy({
      left: amount,
      behavior: 'smooth',
    });
  };

  const updateNewButtons = () => {
    const el = newProductsSliderRef.current;
    if (!el) return;
    setCanNewScrollLeft(el.scrollLeft > 0);
    setCanNewScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollNewByAmount = (amount: number) => {
    newProductsSliderRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleResize = () => updateNewButtons();
    window.addEventListener('resize', handleResize);
    // Задержка для корректного расчёта после рендера карточек
    setTimeout(updateNewButtons, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, [data?.newProducts]);


  const homepageCategories = data?.categories ?? [];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* ==== Hero Section ==== */}
      <section className='standart'>
      <div
        style={{
          width: '100%',
          // на мобильных высота автоматическая, на десктопе фиксированная 400px
          height: isMobile ? 'auto' : '400px',
          minHeight: isMobile ? '300px' : '400px',
          backgroundImage: 'url("/backgrounds/hero-section-background.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            zIndex: 2,
            // отступы адаптируются под ширину экрана
            margin: isMobile ? '40px 16px' : '80px 32px 40px',
            width: '100%',
          }}
        >
          <h1
            style={{
              color: 'var(--color-white)',
              fontSize: isMobile ? '24px' : '38px',
              fontWeight: '400',
              lineHeight: '102%',
              marginBottom: isMobile ? '24px' : '40px',
            }}
          >
            <b>МеталлСтройИнвест</b> - крупнейшая металлобаза
            <br />
            по металлопрокату
          </h1>

          {/* Контейнер для формы – на мобильных занимает всю ширину */}
          <div style={{ maxWidth: isMobile ? '100%' : '800px' }}>
            <RequestForm onSubmit={handleFormSubmit} />
          </div>
        </div>
      </div>
    </section>

      {/* ====== Categories Section ====== */}
      <section className='standart'>
        <div
          style={{
            width: '100%',
          }}
        >

          {/* ======= Categories ======== */}
            {homepageCategories.length > 0 ? (
                        <div
                          className='grid
                          md:grid-cols-5
                          max-md:hidden
                          gap-5'
                        >
                          {homepageCategories.map((category) => (
                            <CategoryCard 
                              key={category.categoryId || category.id} 
                              category={{
                                ...category,
                                id: category.categoryId || category.id,
                                image: category.imageUrl || category.image,
                              }}
                            />
                          ))}
                          <Link
                              href={{
                                pathname: `${ROUTES.CATALOG(citySlug)}`
                              }}
                              className="category-card"
                            >
                              {/* ИКОНКА / КАРТИНКА */}
                              <div className="w-[60px] h-[60px] flex items-center justify-start">
                                <Image src={'/ArrowBackRounded.svg'} 
                                    alt={"Все категории"}
                                    width={60} 
                                    height={60}
                                  />
                              </div>

                              {/* ТЕКСТ */}
                              <p className="h5-regular">
                                Смотреть все
                              </p>
                            </Link>
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            padding: '48px 24px',
                            textAlign: 'left',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <p style={{ fontSize: '16px', color: '#64748b' }}>Категории не найдены</p>
                        </div>
                      )}
          </div>
      </section>

      {/* ====== Информация Section ====== */}
      <section className='pl-[20px] pr-[20px] lg:pl-[80px] lg:pr-[80px] lg:pt-[80px]'>
        <div
          style={{
          width: '100%',
          height: 'auto',
          background: 'var(--gradient-primary)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}>

          {/* Left side - Text and buttons */}
          <div className='lg:p-[32px] pl-[16px] pr-[16px] pt-[24px] pb-[24px]' style={{ flex: '1', width: '100%'}}>
            <h2 className='h2-bold'
              style={{
                color: '#ffffff',
                marginBottom: '8px',
              }}
            >
              Ваш надежный поставщик
            </h2>
            <p className='p'
              style={{
                color: '#ffffff',
                marginBottom: '24px',
              }}
            >
              Покупайте как юридическое лицо
            </p>
            <div className='flex gap-4 flex-col lg:flex-row'>
              <div className='p'
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-green)',
                  fontWeight: '700',
                  width: 'fit-content',
                }}
              >
                Доставка по всей России
              </div>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-green)',
                  fontSize: '16px',
                  fontWeight: '700',
                  width: 'fit-content',
                }}
              >
                Высококачественное оборудование
              </div>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-green)',
                  fontSize: '16px',
                  fontWeight: '700',
                  width: 'fit-content',
                }}
              >
                Выгодные условия
              </div>
            </div>
          </div>

          {/* Right side - Truck image */}
          {isDesktop && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[400px] z-20 pointer-events-none">
              <Image
                src="/backgrounds/box_truck.png"
                alt="Truck Image"
                width={400}
                height={276}
                className="w-full h-auto"
              />
            </div>
          )}

        </div>
      </section>

      {/* ====== Новинки Section ====== */}
      {data?.newProducts && data.newProducts.length > 0 && (
        <section className='standart mt-[20px]'>
          <div className='standard-section'>
            {/* Заголовок и ссылка */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                className='h2-bold'
                style={{
                  color: 'var(--color-dark)',
                  margin: 0,
                }}
              >
                Новинки
              </h2>
              <Link
                href={ROUTES.CATALOG(citySlug)}
                style={{
                  color: 'var(--color-green)',
                  fontSize: '16px',
                  textDecoration: 'underline',
                  fontWeight: '500',
                }}
              >
                Перейти в каталог
              </Link>
            </div>

            {/* Слайдер */}
            <div style={{ position: 'relative', marginTop: '16px' }}>
              <div
                ref={newProductsSliderRef}
                onScroll={updateNewButtons}
                className="no-scrollbar"
                style={{
                  display: 'flex',
                  gap: '24px',
                  overflowX: 'auto',
                  overflowY: 'visible',
                  scrollBehavior: 'smooth',
                  padding: '8px 16px 16px 16px',
                }}
              >
                {data.newProducts.slice(0, 10).map((product) => {
                  const productId = product.productId || product.id;
                  return (
                    <div
                      key={product.slug}
                      style={{
                        flex: '0 0 auto',
                        width: isDesktop ? '344px' : '300px',
                      }}
                    >
                      <ProductCard
                        product={{
                          ...product,
                          id: productId,
                          slug: product.slug,
                          image: product.imageUrl || product.image,
                          priceUnit: product.priceUnit || 'шт',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Левая стрелка */}
              {canNewScrollLeft && (
                <button
                  onClick={() => scrollNewByAmount(-(isDesktop ? 368 : 324))} // ширина + gap
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-light-green)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8.39003 12.6167L3.2167 7.44333L8.39003 2.27C8.91003 1.75 8.91003 0.91 8.39003 0.39C7.87003 -0.13 7.03003 -0.13 6.51003 0.39L0.39003 6.51C-0.12997 7.03 -0.12997 7.87 0.39003 8.39L6.51003 14.51C7.03003 15.03 7.87003 15.03 8.39003 14.51C8.8967 13.99 8.91003 13.1367 8.39003 12.6167Z"
                      fill="#028497"
                    />
                  </svg>
                </button>
              )}

              {/* Правая стрелка */}
              {canNewScrollRight && (
                <button
                  onClick={() => scrollNewByAmount(isDesktop ? 368 : 324)}
                  style={{
                    position: 'absolute',
                    right: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-light-green)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0.39 12.6167L5.56333 7.44333L0.39 2.27C-0.13 1.75 -0.13 0.91 0.39 0.39C0.91 -0.13 1.75 -0.13 2.27 0.39L8.39 6.51C8.91 7.03 8.91 7.87 8.39 8.39L2.27 14.51C1.75 15.03 0.91 15.03 0.39 14.51C-0.116667 13.99 -0.13 13.1367 0.39 12.6167Z"
                      fill="#028497"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ====== Услуги Section ====== */}
      {/* <section style={{ padding: '80px 80px 0px' }}>
        <div className='standard-section'>
          <h2
            className='h2-bold'
            style={{
              color: 'var(--color-dark)',
            }}
          >
            Услуги
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <ServiceCard
              href={ROUTES.SERVICES(citySlug)}
              number="01"
              title="Изготовление изделий металлопроката"
              imageSrc="/services/services-1-image.jpg"
              imageAlt="Изготовление изделий металлопроката"
              items={[
                <>Изготовление <b>по индивидуальным чертежам</b> с учётом технических требований</>,
                <>Резка, гибка и обработка металлопроката <b>любой сложности</b></>,
              ]}
            />

            <ServiceCard
              href={ROUTES.SERVICES(citySlug)}
              number="02"
              title="Дизайн-проект"
              imageSrc="/services/services-2-image.jpg"
              imageAlt="Дизайн-проект"
              items={[
                <>Дизайн-проект <b>с нуля</b> для тех, у кого есть свои идеи или хочется чего-то уникального</>,
                <><b>Помощь с подбором</b> товаров и расчетами материалов для обустройства ванной комнаты</>,
              ]}
            />
            
            <ServiceCard
              href={ROUTES.SERVICES(citySlug)}
              number="03"
              title="Поставки оборудования  и инжиниринг"
              imageSrc="/services/services-3-image.png"
              imageAlt="Поставки оборудования  и инжиниринг"
              items={[
                <>Подбор и поставка промышленного оборудования под требования проекта</>,
                <>Разработка инженерных решений и техническое сопровождение</>,
              ]}
            />
          </div>
        </div>
      </section> */}

      {/* ====== Статьи Section ======*/}
      <section className='standart mt-[20px]'>
        <div className='standard-section'>

          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <h2
              className='h2-bold'
              style={{
                color: 'var(--color-dark)',
              }}
            >
              Статьи
            </h2>

            <p><a 
              href={ROUTES.ARTICLES(citySlug)}
              style={{
                color: 'var(--color-green)',
                textDecoration: 'underline',
              }}>
                Все статьи
            </a></p>
          </div>
          
          {/* ======  Articles Slider ===== */}
          <div
            style={{
              position: 'relative',
            }}
          >
            <div
              ref={sliderRef}
              onScroll={updateButtons}
              style={{
                display: 'flex',
                gap: '20px',
                scrollBehavior: 'smooth',
                paddingBottom: '8px',
                overflowX: 'hidden',
              }}
            >
              {data?.articles && data.articles.length > 0 ? (
                data?.articles.slice(0, 10).map((article) =>(
                  <ArticleCard
                    key={article.slug}
                    article={article}
                  />
                ))
              ) : (
                <p style={{ fontSize: '16px', color: 'var(--color-gray)' }}>
                  Статьи не найдены
                </p>
              )}
            </div>

            {/* ← Кнопка влево */}
            {canScrollLeft && (
              <button
                onClick={() => scrollByAmount(-380)}
                style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-light-green)',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 5,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.39003 12.6167L3.2167 7.44333L8.39003 2.27C8.91003 1.75 8.91003 0.91 8.39003 0.39C7.87003 -0.13 7.03003 -0.13 6.51003 0.39L0.39003 6.51C-0.12997 7.03 -0.12997 7.87 0.39003 8.39L6.51003 14.51C7.03003 15.03 7.87003 15.03 8.39003 14.51C8.8967 13.99 8.91003 13.1367 8.39003 12.6167Z" fill="#028497"/>
                </svg>
              </button>
            )}

            {/* → Кнопка вправо */}
            {canScrollRight && (
              <button
                onClick={() => scrollByAmount(380)}
                style={{
                  position: 'absolute',
                  right: '-24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-light-green)',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 5,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="9"
                  height="15"
                  viewBox="0 0 9 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.39 12.6167L5.56333 7.44333L0.39 2.27C-0.13 1.75 -0.13 0.91 0.39 0.39C0.91 -0.13 1.75 -0.13 2.27 0.39L8.39 6.51C8.91 7.03 8.91 7.87 8.39 8.39L2.27 14.51C1.75 15.03 0.91 15.03 0.39 14.51C-0.116667 13.99 -0.13 13.1367 0.39 12.6167Z"
                    fill="#028497"
                  />
                </svg>
              </button>

            )}
          </div>

        </div>
      </section>
    </div>
  );
}
