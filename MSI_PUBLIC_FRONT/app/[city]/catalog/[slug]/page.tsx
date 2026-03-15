'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom'; // АДАПТИВ: для модалки
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { apiClient, getErrorMessage } from '@/lib/api';
import { Category, Product, CategoryFilter, CatalogFilters, PaginatedResponse } from '@/types/api';

function parseFiltersFromUrl(searchParams: URLSearchParams): { appliedFilters: CatalogFilters; page: number } {
  const pageParam = searchParams.get('page');
  const page = pageParam && !isNaN(Number(pageParam)) && Number(pageParam) >= 1 ? Number(pageParam) : 1;
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const minPrice = minPriceParam && !isNaN(Number(minPriceParam)) ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam && !isNaN(Number(maxPriceParam)) ? Number(maxPriceParam) : undefined;
  let characteristics: Record<string, string[]> | undefined;
  try {
    const charsParam = searchParams.get('chars');
    if (charsParam) {
      const parsed = JSON.parse(charsParam) as Record<string, string[]>;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        characteristics = parsed;
      }
    }
  } catch {
    // ignore invalid JSON
  }
  return {
    appliedFilters: {
      ...(minPrice !== undefined && { minPrice }),
      ...(maxPrice !== undefined && { maxPrice }),
      ...(characteristics && Object.keys(characteristics).length > 0 && { characteristics }),
    },
    page,
  };
}

function buildUrlFromFilters(appliedFilters: CatalogFilters, page: number): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (appliedFilters.minPrice !== undefined) params.set('minPrice', String(appliedFilters.minPrice));
  if (appliedFilters.maxPrice !== undefined) params.set('maxPrice', String(appliedFilters.maxPrice));
  if (appliedFilters.characteristics && Object.keys(appliedFilters.characteristics).length > 0) {
    params.set('chars', JSON.stringify(appliedFilters.characteristics));
  }
  const q = params.toString();
  return q ? `?${q}` : '';
}
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/lib/constants';
import { useCitySlug } from '@/components/cities/CityProvider';

// АДАПТИВ: хук для медиа-запросов
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

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = params.slug as string;
  const citySlug = useCitySlug();

  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
  const [filters, setFilters] = useState<CategoryFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategoryName, setCurrentCategoryName] = useState<string | null>(null);
  const [currentCategoryPath, setCurrentCategoryPath] = useState<
    { id: number; name: string; slug?: string | null }[]
  >([]);

  const parsedFromUrl = useMemo(() => parseFiltersFromUrl(searchParams), [searchParams]);
  const [currentPage, setCurrentPage] = useState(parsedFromUrl.page);
  const [pageSize] = useState(20);
  const [appliedFilters, setAppliedFilters] = useState<CatalogFilters>(parsedFromUrl.appliedFilters);

  // АДАПТИВ: состояние модалки фильтров на мобильном
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)'); // АДАПТИВ: определение мобильности

  // Флаг для предотвращения одновременных загрузок
  const isLoadingRef = useRef(false);
  // Храним предыдущие значения для сравнения
  const prevFiltersRef = useRef<string>('');
  const prevPageRef = useRef<number>(1);

  // Мемоизируем сериализацию фильтров для сравнения
  const filtersKey = useMemo(() => {
    return JSON.stringify({ ...appliedFilters, page: currentPage });
  }, [appliedFilters, currentPage]);

  const loadProducts = async (force = false) => {
    // Не загружаем товары, если есть подкатегории
    if (subCategories.length > 0) {
      return;
    }

    // Проверяем, не загружаются ли уже товары
    if (isLoadingRef.current && !force) {
      return;
    }

    // Проверяем, изменились ли фильтры или страница
    const currentFiltersKey = JSON.stringify({ ...appliedFilters, page: currentPage });
    if (!force && currentFiltersKey === prevFiltersRef.current) {
      return;
    }

    if (!citySlug) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const data = await apiClient.getCatalogProducts(citySlug, categorySlug, {
        page: currentPage,
        pageSize,
        ...appliedFilters,
      });
      setProducts(data);
      prevFiltersRef.current = currentFiltersKey;
      prevPageRef.current = currentPage;
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить товары'));
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      isLoadingRef.current = true;

      // Сброс предыдущих данных
      setSubCategories([]);
      setProducts(null);
      setFilters([]);
      setCurrentCategoryPath([]);
      prevFiltersRef.current = '';
      prevPageRef.current = 1;

      // Загружаем информацию о текущей категории для названия и полного пути в хлебных крошках
      try {
        const categoryInfo = await apiClient.getCategoryBySlug(citySlug, categorySlug);
        setCurrentCategoryName(categoryInfo.name);
        if (Array.isArray(categoryInfo.path)) {
          setCurrentCategoryPath(categoryInfo.path);
        } else {
          setCurrentCategoryPath([]);
        }
      } catch {
        setCurrentCategoryName(null);
        setCurrentCategoryPath([]);
      }

      // Загружаем подкатегории
      const subCats = await apiClient.getCategories(citySlug, categorySlug);
      setSubCategories(subCats);

      // Если есть подкатегории, не загружаем товары
      if (subCats.length > 0) {
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }

      // Если нет подкатегорий, загружаем фильтры
      try {
        const categoryFilters = await apiClient.getCategoryFilters(citySlug, categorySlug);
        setFilters(categoryFilters);
      } catch {
        // Фильтры могут отсутствовать, это нормально
        setFilters([]);
      }

      // Загружаем товары, если нет подкатегорий
      await loadProducts(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить данные'));
      console.error('Error loading category:', err);
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleFilterChange = (filterName: string, values: string[]) => {
    setAppliedFilters((prev) => {
      const newCharacteristics = { ...prev.characteristics };
      if (values.length > 0) {
        newCharacteristics[filterName] = values;
      } else {
        delete newCharacteristics[filterName];
      }
      return {
        ...prev,
        characteristics: Object.keys(newCharacteristics).length > 0 ? newCharacteristics : undefined,
      };
    });
    setCurrentPage(1);
  };

  const handlePriceFilter = (min?: number, max?: number) => {
    setAppliedFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setAppliedFilters({});
    setCurrentPage(1);
  };

  // При смене категории подставляем в state параметры из URL (при переходе в другую категорию или после F5)
  const prevCategorySlugRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevCategorySlugRef.current !== categorySlug) {
      prevCategorySlugRef.current = categorySlug;
      setAppliedFilters(parsedFromUrl.appliedFilters);
      setCurrentPage(parsedFromUrl.page);
    }
  }, [categorySlug, parsedFromUrl]);

  // Пишем фильтры и страницу в URL, чтобы при обновлении страницы они восстанавливались
  const prevFiltersKeyRef = useRef<string>('');
  useEffect(() => {
    const key = JSON.stringify({ ...appliedFilters, page: currentPage });
    if (prevFiltersKeyRef.current === key) return;
    prevFiltersKeyRef.current = key;
    const newQuery = buildUrlFromFilters(appliedFilters, currentPage);
    const currentQuery = searchParams.toString();
    const currentFull = currentQuery ? `?${currentQuery}` : '';
    if (newQuery !== currentFull) {
      router.replace(newQuery, { scroll: false });
    }
  }, [appliedFilters, currentPage, router, searchParams]);

  // Загружаем данные категории при изменении categorySlug
  useEffect(() => {
    if (categorySlug && citySlug) {
      loadCategoryData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, citySlug]);

  // Загружаем товары при изменении фильтров или страницы (только если нет подкатегорий)
  useEffect(() => {
    // Пропускаем, если:
    // 1. categorySlug не существует
    // 2. Есть подкатегории (показываем их вместо товаров)
    // 3. Уже идет загрузка
    // 4. Город не загружен
    if (!categorySlug || subCategories.length > 0 || isLoadingRef.current || !citySlug) {
      return;
    }

    // Проверяем, действительно ли изменились фильтры или страница
    const currentFiltersKey = JSON.stringify({ ...appliedFilters, page: currentPage });

    // Если фильтры или страница не изменились, ничего не делаем
    if (currentFiltersKey === prevFiltersRef.current) {
      return;
    }

    // Загружаем товары только если фильтры или страница действительно изменились
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, filtersKey, subCategories.length, citySlug]);

  if (loading && !products) {
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

  if (error && !products && subCategories.length === 0) {
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
                onClick={loadCategoryData}
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

  // Строим хлебные крошки на основе полного пути категории
  const effectiveTitle = currentCategoryName ?? 'Каталог';
  const breadcrumbsBase = [
    { label: 'Главная', href: `${ROUTES.HOME(citySlug)}` },
    { label: 'Каталог', href: `${ROUTES.CATALOG(citySlug)}` },
  ];
  const breadcrumbsPath =
    currentCategoryPath && currentCategoryPath.length > 0
      ? currentCategoryPath.map((item) => ({
          label: item.name,
          href: item.slug
            ? `${ROUTES.CATALOG(citySlug)}/${item.slug}`
            : undefined,
        }))
      : [];
  const breadcrumbs = [
    ...breadcrumbsBase,
    ...breadcrumbsPath,
    { label: effectiveTitle },
  ];

  // Показываем подкатегории если они есть и еще не загружены товары
  if (subCategories.length > 0 && !products) {
    return (
      <div style={{ backgroundColor: '#ffffff' }}>
        <section className='standart'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <PageHeader
              title={effectiveTitle}
              breadcrumbs={breadcrumbs}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              {subCategories.map((subCat) => (
                <CategoryCard
                  key={subCat.categoryId || subCat.id}
                  category={{
                    ...subCat,
                    id: subCat.categoryId || subCat.id,
                    image: subCat.imageUrl || subCat.image,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Показываем товары с фильтрами (если нет подкатегорий или они загружены)
  // Фильтры показываем всегда, так как есть хотя бы фильтр по цене
  const showFilters = true;
  const totalPages =
    products && products.pageSize
      ? Math.ceil(products.total / products.pageSize)
      : products
      ? Math.ceil(products.total / pageSize)
      : 0;

  // АДАПТИВ: количество выбранных фильтров для бейджа
  const selectedFiltersCount =
    Object.keys(appliedFilters).length +
    (appliedFilters.characteristics ? Object.keys(appliedFilters.characteristics).length : 0);

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      <section className='standart'>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <PageHeader
            title={effectiveTitle}
            breadcrumbs={breadcrumbs}
          />

          {/* АДАПТИВ: сетка адаптируется под мобильные */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', // на мобильном фильтр не занимает боковую колонку
              gap: '32px',
            }}
          >
            {/* Фильтры */}
            {showFilters && (
              <aside style={{ position: 'relative' }}>
                {!isMobile ? (
                  // Десктопная панель фильтров
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                      borderRadius: '12px',
                      padding: '24px',
                      position: 'sticky',
                      top: '20px',
                      alignSelf: 'flex-start',
                      maxHeight: 'calc(100vh - 40px)',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      willChange: 'transform',
                      contain: 'layout style paint',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '24px',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#0f172a',
                          margin: 0,
                        }}
                      >
                        Фильтры
                      </h2>
                      <button
                        onClick={clearFilters}
                        style={{
                          fontSize: '14px',
                          color: '#64748b',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          whiteSpace: 'nowrap',
                          fontWeight: '500',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#475569';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#64748b';
                        }}
                      >
                        Сбросить
                      </button>
                    </div>

                    {/* Фильтр по цене */}
                    <div
                      style={{
                        marginBottom: '24px',
                        paddingBottom: '24px',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#0f172a',
                          marginBottom: '16px',
                        }}
                      >
                        Цена
                      </h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="number"
                          placeholder="От"
                          value={appliedFilters.minPrice || ''}
                          onChange={(e) =>
                            handlePriceFilter(
                              e.target.value ? parseInt(e.target.value) : undefined,
                              appliedFilters.maxPrice
                            )
                          }
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                          }}
                        />
                        <input
                          type="number"
                          placeholder="До"
                          value={appliedFilters.maxPrice || ''}
                          onChange={(e) =>
                            handlePriceFilter(
                              appliedFilters.minPrice,
                              e.target.value ? parseInt(e.target.value) : undefined
                            )
                          }
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                          }}
                        />
                      </div>
                    </div>

                    {/* Фильтры по характеристикам */}
                    {filters.length > 0 && citySlug && (
                      <>
                        {filters.map((filter) => (
                          <FilterSection
                            key={filter.characteristicNameId}
                            categorySlug={categorySlug}
                            filter={filter}
                            value={appliedFilters.characteristics?.[filter.name] || []}
                            onChange={(values) => handleFilterChange(filter.name, values)}
                            citySlug={citySlug}
                          />
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  // АДАПТИВ: мобильная кнопка фильтра
                  <div style={{ marginBottom: '16px' }}>
                    <button
                      onClick={() => setIsMobileFilterOpen(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 4h18M3 12h18M3 20h18" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="19" cy="4" r="2" fill="currentColor" />
                        <circle cx="15" cy="12" r="2" fill="currentColor" />
                        <circle cx="9" cy="20" r="2" fill="currentColor" />
                      </svg>
                      Фильтры
                      {selectedFiltersCount > 0 && (
                        <span
                          style={{
                            marginLeft: '4px',
                            backgroundColor: 'var(--color-green)',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {selectedFiltersCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </aside>
            )}

            {/* Товары */}
            <div
              style={{
                contain: 'layout style',
              }}
            >
              {loading && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                  }}
                >
                  <div style={{ fontSize: '16px', color: '#64748b' }}>Загрузка товаров...</div>
                </div>
              )}

              {error && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                  }}
                >
                  {error}
                </div>
              )}

              {products && (
                <>
                  <div
                    style={{
                      marginBottom: '24px',
                      fontSize: '16px',
                      color: 'var(--color-gray)',
                    }}
                  >
                    Найдено товаров:{' '}
                    <span style={{ fontWeight: '600', color: 'var(--color-dark)' }}>{products.total}</span>
                  </div>

                  {products.data.length > 0 ? (
                    <>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                          gap: '24px',
                          marginBottom: '32px',
                        }}
                      >
                        {products.data.map((product) => (
                          <ProductCard
                            key={product.slug}
                            product={{
                              ...product,
                              slug: product.slug,
                              image: product.imageUrl || product.image,
                              priceUnit: product.priceUnit || 'шт',
                            }}
                          />
                        ))}
                      </div>

                      {/* Пагинация */}
                      {totalPages > 1 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{
                              padding: '8px 16px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                              color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                              opacity: currentPage === 1 ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (currentPage !== 1) {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== 1) {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                              }
                            }}
                          >
                            Назад
                          </button>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              const isActive = currentPage === pageNum;

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    backgroundColor: isActive ? 'var(--color-green)' : '#ffffff',
                                    color: isActive ? '#ffffff' : '#0f172a',
                                    border: isActive ? 'none' : '1px solid #cbd5e1',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isActive) {
                                      e.currentTarget.style.backgroundColor = '#f8fafc';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isActive) {
                                      e.currentTarget.style.backgroundColor = '#ffffff';
                                    }
                                  }}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                              padding: '8px 16px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                              color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                              opacity: currentPage === totalPages ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (currentPage !== totalPages) {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== totalPages) {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                              }
                            }}
                          >
                            Вперед
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '48px 24px',
                        textAlign: 'center',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '16px' }}>Товары не найдены</p>
                      {selectedFiltersCount > 0 && (
                        <button
                          onClick={clearFilters}
                          style={{
                            marginTop: '16px',
                            color: '#14b8a6',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#0d9488';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#14b8a6';
                          }}
                        >
                          Сбросить фильтры
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* АДАПТИВ: модалка с фильтрами для мобильных (через портал) */}
      {isMobile &&
        isMobileFilterOpen &&
        createPortal(
          <MobileFilters
            filters={filters}
            appliedFilters={appliedFilters}
            onFilterChange={handleFilterChange}
            onPriceFilter={handlePriceFilter}
            onClearFilters={clearFilters}
            onClose={() => setIsMobileFilterOpen(false)}
            citySlug={citySlug}
            categorySlug={categorySlug}
          />,
          document.body
        )}
    </div>
  );
}

// АДАПТИВ: компонент мобильной модалки фильтров
function MobileFilters({
  filters,
  appliedFilters,
  onFilterChange,
  onPriceFilter,
  onClearFilters,
  onClose,
  citySlug,
  categorySlug,
}: {
  filters: CategoryFilter[];
  appliedFilters: CatalogFilters;
  onFilterChange: (filterName: string, values: string[]) => void;
  onPriceFilter: (min?: number, max?: number) => void;
  onClearFilters: () => void;
  onClose: () => void;
  citySlug: string;
  categorySlug: string;
}) {
  // Запрещаем скролл body при открытой модалке
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxHeight: '90vh',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Фильтры</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Контент фильтров с прокруткой */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* Кнопка сброса всех фильтров */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '16px',
            }}
          >
            <button
              onClick={onClearFilters}
              style={{
                fontSize: '14px',
                color: '#64748b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Сбросить все
            </button>
          </div>

          {/* Фильтр по цене */}
          <div
            style={{
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '16px',
              }}
            >
              Цена
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="От"
                value={appliedFilters.minPrice || ''}
                onChange={(e) =>
                  onPriceFilter(e.target.value ? parseInt(e.target.value) : undefined, appliedFilters.maxPrice)
                }
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
              />
              <input
                type="number"
                placeholder="До"
                value={appliedFilters.maxPrice || ''}
                onChange={(e) =>
                  onPriceFilter(appliedFilters.minPrice, e.target.value ? parseInt(e.target.value) : undefined)
                }
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
              />
            </div>
          </div>

          {/* Фильтры по характеристикам */}
          {filters.length > 0 && citySlug && (
            <>
              {filters.map((filter) => (
                <FilterSection
                  key={filter.characteristicNameId}
                  categorySlug={categorySlug}
                  filter={filter}
                  value={appliedFilters.characteristics?.[filter.name] || []}
                  onChange={(values) => onFilterChange(filter.name, values)}
                  citySlug={citySlug}
                />
              ))}
            </>
          )}
        </div>

        {/* Кнопка "Готово" для закрытия модалки */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'var(--color-green)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}

// Компонент секции фильтра с ленивой загрузкой значений (без изменений)
function FilterSection({
  categorySlug,
  filter,
  value,
  onChange,
  citySlug,
}: {
  categorySlug: string;
  filter: CategoryFilter;
  value: string[];
  onChange: (values: string[]) => void;
  citySlug: string;
}) {
  // Фильтры свернуты по умолчанию
  const [isExpanded, setIsExpanded] = useState(false);
  const [values, setValues] = useState<string[]>(filter.values || []);
  const [isLoading, setIsLoading] = useState(false);
  // Используем ref для отслеживания последнего загруженного фильтра (комбинация categoryId и characteristicNameId)
  const loadedFilterKeyRef = useRef<string | null>(null);

  // Загружаем значения автоматически при монтировании, даже если фильтр свернут
  // Это позволяет быстро показывать значения при раскрытии
  useEffect(() => {
    // Создаем уникальный ключ для комбинации categoryId и characteristicNameId
    const filterKey = `${categorySlug}-${filter.characteristicNameId}`;

    // Если значения уже есть (из старого API для обратной совместимости), используем их
    if (filter.values && filter.values.length > 0) {
      setValues(filter.values);
      loadedFilterKeyRef.current = filterKey;
      return;
    }

    // Проверяем, нужно ли загружать значения
    // Загружаем, если еще не загружали для этого фильтра и категории
    const shouldLoad = loadedFilterKeyRef.current !== filterKey;

    if (!shouldLoad) {
      return;
    }

    // Загружаем значения для фильтра автоматически (даже если фильтр свернут)
    setIsLoading(true);
    loadedFilterKeyRef.current = filterKey;

    apiClient
      .getFilterValues(citySlug, categorySlug, filter.characteristicNameId)
      .then((loadedValues) => {
        setValues(loadedValues || []);
      })
      .catch((error) => {
        console.error('Error loading filter values:', error);
        setValues([]);
        // Сбрасываем ключ при ошибке, чтобы можно было повторить попытку
        loadedFilterKeyRef.current = null;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [citySlug, categorySlug, filter.characteristicNameId, filter.values]);

  const handleCheckboxChange = (filterValue: string, checked: boolean) => {
    if (checked) {
      // Добавляем значение, если его еще нет
      if (!value.includes(filterValue)) {
        onChange([...value, filterValue]);
      }
    } else {
      // Удаляем значение
      onChange(value.filter((v) => v !== filterValue));
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Используем значения из состояния, если они есть, иначе из filter (если пришли из старого API)
  const availableValues = values.length > 0 ? values : filter.values || [];

  return (
    <div
      style={{
        marginBottom: '24px',
        paddingBottom: '24px',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          cursor: 'pointer',
        }}
        onClick={handleToggle}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0f172a',
            margin: 0,
          }}
        >
          {filter.name}
        </h3>
        <svg
          style={{
            width: '20px',
            height: '20px',
            color: '#64748b',
            transition: 'transform 0.2s',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <>
          {isLoading ? (
            <div
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '16px 0',
                textAlign: 'center',
              }}
            >
              Загрузка значений...
            </div>
          ) : availableValues.length === 0 ? (
            <div
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '8px 0',
              }}
            >
              Нет доступных значений
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '192px',
                overflowY: 'auto',
              }}
            >
              {availableValues.map((filterValue) => {
                const isChecked = value.includes(filterValue);
                return (
                  <label
                    key={filterValue}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleCheckboxChange(filterValue, e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: 'var(--color-green)',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-dark)',
                      }}
                    >
                      {filterValue}
                      {filter.valueType === 'number' && filter.name.toLowerCase().includes('толщин') && ' мм'}
                      {filter.valueType === 'number' && filter.name.toLowerCase().includes('ширин') && ' мм'}
                      {filter.valueType === 'number' && filter.name.toLowerCase().includes('длин') && ' мм'}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}