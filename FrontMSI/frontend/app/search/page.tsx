'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Product, PaginatedResponse } from '@/types/api';
import ProductCard from '@/components/ProductCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(query);
  const itemsPerPage = 20;

  useEffect(() => {
    if (query) {
      setSearchInput(query);
      setCurrentPage(1);
      performSearch(query, 1);
    }
  }, [query]);

  const performSearch = async (searchQuery: string, page: number) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.searchProducts(searchQuery, page, itemsPerPage);
      setResults(data);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить поиск');
      console.error('Search error:', err);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handlePageChange = (page: number) => {
    if (query) {
      setCurrentPage(page);
      performSearch(query, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = results ? Math.ceil(results.total / itemsPerPage) : 0;

  return (
    <div className="bg-white min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Поиск товаров</h1>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2 md:gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Введите название товара..."
                className="input flex-1"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 md:px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Поиск...' : 'Найти'}
              </button>
            </div>
          </form>
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
          <div className="mb-4 text-gray-600">
            Найдено товаров: <span className="font-semibold">{results.total}</span>
            {query && (
              <> по запросу &quot;<span className="font-semibold">{query}</span>&quot;</>
            )}
          </div>

          {results.data && results.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
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
              </div>

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

