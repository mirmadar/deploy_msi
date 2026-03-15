'use client';

import { Product } from '@/types/api';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { formatUnit } from '@/lib/units';
import AddToCartButton from './AddToCartButton';
import { QuantityControl } from './ui/QuantityControl';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCitySlug } from './cities/CityProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const productId = product.productId || product.id;
  const slug = product.slug;
  const citySlug = useCitySlug();
  if (!productId) return null;
  if (!slug) return null;

  const imageUrl = product.imageUrl || product.image;
  const priceUnit = formatUnit(product.unit ?? product.priceUnit);
  const isOutOfStock = product.status === 'OUT_OF_STOCK';

  const { cart, updateQuantity } = useCart();

  const cartItem = cart?.items.find(
    (item) => item.productId === productId
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(1);

  const handleQuantityChange = async (newQty: number) => {
    if (!cartItem) return;

    setIsUpdating(true);
    try {
      await updateQuantity(cartItem.id, newQty);
    } finally {
      setIsUpdating(false);
    }
  };

  const displayQuantity = cartItem ? cartItem.quantity : localQuantity;
  const handleDisplayQuantityChange = (newQty: number) => {
    const safeQty = Math.max(1, Math.floor(newQty));
    if (cartItem) {
      handleQuantityChange(safeQty);
    } else {
      setLocalQuantity(safeQty);
    }
  };

  const stopLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link href={ROUTES.PRODUCT(citySlug, slug)} className="group block h-full">
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Image + name */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <img
              src={imageUrl || '/placeholder-image.png'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <p style={{ color: 'var(--color-blue)', marginTop: '8px', flex: 1 }}>
            {product.name}
          </p>
        </div>

        {/* Price */}
        <div style={{ marginTop: '16px', marginBottom: '12px' }}>
          <p className='h3-bold'>
            {product.price.toLocaleString('ru-RU')} ₽ / {priceUnit}
          </p>
        </div>

        {/* Actions */}
        <div
          onClick={stopLink}
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: '12px',
          }}
        >
          <QuantityControl
            quantity={displayQuantity}
            disabled={isUpdating}
            onChange={handleDisplayQuantityChange}
          />
          <AddToCartButton
            productId={productId}
            quantity={cartItem ? undefined : localQuantity}
            disabled={isOutOfStock}
          />
        </div>
      </div>
    </Link>
  );
}
