'use client';

import { Product } from '@/types/api';
import ProductCard from '@/components/ProductCard';

interface ProductSliderProps {
  products: Product[];
  title?: string;
}

// Показываем новинки теми же мини‑карточками и сеткой,
// как товары в каталоге (без горизонтального слайдера).
export default function ProductSlider({ products, title = 'Новинки' }: ProductSliderProps) {
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

      <div
        className="
          grid
          gap-5
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.productId || product.id || `product-${index}`}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}

