'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient, getErrorMessage } from '@/lib/api';
import { Product, PaginatedResponse, SearchCategoryItem } from '@/types/api';
import ProductCard from '@/components/ProductCard';
import { useCity } from '@/components/cities/CityProvider';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { city } = useCity();
  const citySlug = city?.slug;
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const minPriceFromUrl = searchParams.get('minPrice');
  const maxPriceFromUrl = searchParams.get('maxPrice');
  const appliedMinPrice =
    minPriceFromUrl !== null && minPriceFromUrl !== '' && !isNaN(Number(minPriceFromUrl))
      ? Number(minPriceFromUrl)
      : undefined;
  const appliedMaxPrice =
    maxPriceFromUrl !== null && maxPriceFromUrl !== '' && !isNaN(Number(maxPriceFromUrl))
      ? Number(maxPriceFromUrl)
      : undefined;

  const [inputMinPrice, setInputMinPrice] = useState<string>(
    minPriceFromUrl ?? ''
  );
  const [inputMaxPrice, setInputMaxPrice] = useState<string>(
    maxPriceFromUrl ?? ''
  );

  useEffect(() => {
    setInputMinPrice(minPriceFromUrl ?? '');
    setInputMaxPrice(maxPriceFromUrl ?? '');
  }, [minPriceFromUrl, maxPriceFromUrl]);

  useEffect(() => {
    if (!citySlug) return;
    if (query) {
      setCurrentPage(1);
      performSearch(query, 1, appliedMinPrice, appliedMaxPrice);
    } else {
      setResults(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, citySlug, minPriceFromUrl, maxPriceFromUrl]);

  const performSearch = async (
    searchQuery: string,
    page: number,
    minPrice?: number,
    maxPrice?: number
  ) => {
    if (!searchQuery.trim() || !citySlug) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.searchProducts(
        citySlug,
        searchQuery,
        page,
        itemsPerPage,
        minPrice,
        maxPrice
      );
      setResults(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось выполнить поиск'));
      console.error('Search error:', err);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPriceFilter = () => {
    const min = inputMinPrice.trim() === '' ? undefined : Number(inputMinPrice);
    const max = inputMaxPrice.trim() === '' ? undefined : Number(inputMaxPrice);
    const params = new URLSearchParams(searchParams.toString());
    if (min !== undefined && !isNaN(min)) {
      params.set('minPrice', String(min));
    } else {
      params.delete('minPrice');
    }
    if (max !== undefined && !isNaN(max)) {
      params.set('maxPrice', String(max));
    } else {
      params.delete('maxPrice');
    }
    params.set('page', '1');
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
    performSearch(query, 1, min && !isNaN(min) ? min : undefined, max && !isNaN(max) ? max : undefined);
  };

  const handleUseSuggestion = (suggested: string) => {
    if (!suggested.trim() || !citySlug) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', suggested);
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
    performSearch(suggested, 1);
  };

  const handlePageChange = (page: number) => {
    if (query) {
      setCurrentPage(page);
      performSearch(query, page, appliedMinPrice, appliedMaxPrice);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = results ? Math.ceil(results.total / itemsPerPage) : 0;

  return (
    <div className="bg-white min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Заголовок */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Поиск товаров
          </h1>
        </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Поиск...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {!loading && !error && query && results && (
        <>
          {/* Информация по запросу */}
          <div className="mb-4 text-slate-700 text-sm md:text-base">
            {results.usedSuggestedQuery && results.suggestedQuery ? (
              <>
                По запросу &quot;
                <span className="font-semibold text-slate-900">{query}</span>
                &quot; ничего не найдено. Показаны результаты по запросу &quot;
                <span className="font-semibold text-slate-900">{results.suggestedQuery}</span>
                &quot;: <span className="font-semibold">{results.total}</span> товаров
              </>
            ) : results.isFuzzy ? (
              <>
                По запросу &quot;
                <span className="font-semibold text-slate-900">{query}</span>
                &quot; точных совпадений не найдено. Показаны похожие товары:{' '}
                <span className="font-semibold">{results.total}</span> шт.
              </>
            ) : (
              <>
                По запросу &quot;
                <span className="font-semibold text-slate-900">{query}</span>
                &quot; найдено: <span className="font-semibold">{results.total}</span> товаров
              </>
            )}
          </div>

          {/* Категории всех найденных товаров (из агрегации по всей выдаче) */}
          {(results.categories && results.categories.length > 0) && (
            <section className="mb-6 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
                Категории найденных товаров
              </h2>
              <div className="flex flex-col gap-1">
                {results.categories.map((c: SearchCategoryItem) =>
                  c.slug ? (
                    <a
                      key={c.id}
                      href={`/${citySlug}/catalog/${c.slug}`}
                      className="text-sm md:text-base text-[var(--color-blue)] hover:font-semibold transition-colors"
                    >
                      {c.name}
                    </a>
                  ) : (
                    <span
                      key={c.id}
                      className="text-sm md:text-base text-[var(--color-blue)]"
                    >
                      {c.name}
                    </span>
                  )
                )}
              </div>
            </section>
          )}

          {/* Подсказка и фильтр по цене */}
          <div className="mb-2 text-slate-600 text-sm md:text-base">
            Вы можете отфильтровать найденные товары по цене:
          </div>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-start md:gap-4">
            <div className="flex flex-col gap-2 max-w-xs">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="От"
                  value={inputMinPrice}
                  onChange={(e) => setInputMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm md:text-base bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="До"
                  value={inputMaxPrice}
                  onChange={(e) => setInputMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm md:text-base bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyPriceFilter}
              className="px-4 py-2 rounded-lg bg-[var(--color-blue)] text-white text-sm md:text-base font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              Применить
            </button>
          </div>

          {results.data && results.data.length > 0 ? (
            <>
              <section
                className="grid gap-6 md:gap-8 mb-8"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                }}
              >
                {results.data.map((product) => (
                  <ProductCard 
                    key={product.productId || product.id || `product-${product.name}`} 
                    product={{
                      ...product,
                      id: product.productId || product.id,
                      image: product.imageUrl || product.image,
                      priceUnit: product.priceUnit || 'шт',
                    }}
                  />
                ))}
              </section>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Назад
                  </button>

                  <div className="flex gap-1">
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

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Вперед
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl p-8 md:p-12 text-center border border-slate-200">
              <p className="text-gray-600 text-lg">
                По запросу &quot;<span className="font-semibold">{query}</span>&quot; ничего не найдено
              </p>
              {results.suggestedQuery && !results.usedSuggestedQuery && (
                <button
                  type="button"
                  onClick={() => handleUseSuggestion(results.suggestedQuery!)}
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg border border-slate-300 text-sm md:text-base text-[var(--color-blue)] hover:bg-slate-50 transition-colors"
                >
                  Искать по &quot;{results.suggestedQuery}&quot;
                </button>
              )}
              <p className="text-gray-500 mt-2">Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </>
      )}

      {!loading && !error && !query && (
        <div className="bg-white rounded-xl p-8 md:p-12 text-center border border-slate-200">
          <p className="text-slate-600 text-lg">Введите запрос для поиска товаров</p>
        </div>
      )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

