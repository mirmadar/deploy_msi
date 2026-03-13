'use client';

import '@/styles/globals.css';
import { Category } from '@/types/api';
import Link from 'next/link';
import { useCitySlug } from './cities/CityProvider';


interface CategoryCardProps {
  category: Category;
}
export default function CategoryCard({ category }: CategoryCardProps) {
  const categoryId = category.categoryId || category.id;
  const categorySlug = category.slug;
  const citySlug = useCitySlug();

  const imageUrl = category.imageUrl || category.image;

  const href = `/${citySlug}/catalog/${categorySlug}`;

  return (
    <Link
      href={href}
      key={categoryId}
      className="category-card"
    >
      {/* ИКОНКА / КАРТИНКА */}
      <div className="w-[60px] h-[60px] flex items-center justify-start">
        <img
          src={imageUrl || '/icons/categories/specialnye-stali-i-splavi.svg'}
          alt={category.name}
          width={60}
          height={60}
        />
      </div>

      {/* ТЕКСТ */}
      <p className="h5-regular">
        {category.name}
      </p>
    </Link>

  );
}


