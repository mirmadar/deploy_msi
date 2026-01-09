'use client';

import { Product } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const productId = product.productId || product.id;
  const imageUrl = product.imageUrl || product.image;
  const priceUnit = product.priceUnit || 'шт';
  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const isNew = product.isNew;

  if (!productId) {
    return null;
  }

  return (
    <Link href={ROUTES.PRODUCT(productId)} className="group block h-full">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden h-full flex flex-col hover:shadow-md hover:border-primary/30 transition-all">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105 p-4"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 rounded-lg bg-slate-200" />
            </div>
          )}
          
          {/* Badges */}
          {(isOutOfStock || isNew) && (
            <div className="absolute left-2 top-2 flex gap-1.5 z-10">
              {isOutOfStock && (
                <span className="badge badge-error text-xs px-2 py-0.5">Нет в наличии</span>
              )}
              {isNew && !isOutOfStock && (
                <span className="badge badge-success text-xs px-2 py-0.5">Новинка</span>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-medium leading-tight text-slate-900 line-clamp-2 mb-2 text-sm group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="mt-auto pt-3 border-t border-slate-100">
            <div className="text-lg font-bold text-primary leading-tight mb-0.5">
              {product.price.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs text-slate-500 leading-none">
              за {priceUnit}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}