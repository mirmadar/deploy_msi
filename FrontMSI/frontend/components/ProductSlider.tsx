'use client';

import { Product } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface ProductSliderProps {
  products: Product[];
  title?: string;
}

export default function ProductSlider({ products, title = 'Новинки' }: ProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4; // количество товаров на экране

  const next = () => {
    setCurrentIndex((prev) => 
      Math.min(prev + itemsPerView, products.length - itemsPerView)
    );
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerView, 0));
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="relative">
        <div className="flex gap-2 mb-6 justify-end">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-200"
            aria-label="Предыдущие"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            disabled={currentIndex >= products.length - itemsPerView}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-200"
            aria-label="Следующие"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {products.map((product, index) => {
              const productId = product.productId || product.id;
              const imageUrl = product.imageUrl || product.image;
              const priceUnit = product.priceUnit || 'пг.м.';
              const isOutOfStock = product.status === 'OUT_OF_STOCK';

              return (
                <div
                  key={productId || `product-${index}`}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className={`bg-white rounded-xl card-shadow overflow-hidden hover:card-shadow-hover transition-all h-full flex flex-col border ${isOutOfStock ? 'border-red-200 opacity-70' : 'border-slate-200 hover:border-primary'}`}>
                    <Link href={`/product/${productId}`} className="flex-grow">
                      <div className="relative h-48 bg-white border-b border-slate-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <span className="text-4xl">📦</span>
                          </div>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">Нет в наличии</span>
                          </div>
                        )}
                        {product.isNew && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Новинка
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                          {product.name}
                        </h3>
                        <div className="text-lg font-bold text-teal-600">
                          от {product.price.toLocaleString('ru-RU')} руб./{priceUnit}
                        </div>
                      </div>
                    </Link>
                    <div className="px-4 pb-4 space-y-3">
                      {/* Quantity selector */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // TODO: Уменьшить количество
                          }}
                          className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                          aria-label="Уменьшить"
                          disabled={isOutOfStock}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          className="w-12 h-8 text-center border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          disabled={isOutOfStock}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // TODO: Увеличить количество
                          }}
                          className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                          aria-label="Увеличить"
                          disabled={isOutOfStock}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      {/* Add to cart button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (isOutOfStock) return;
                          // TODO: Добавить в корзину
                          console.log('Add to cart', productId);
                        }}
                        disabled={isOutOfStock}
                        className="btn-primary w-full py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

