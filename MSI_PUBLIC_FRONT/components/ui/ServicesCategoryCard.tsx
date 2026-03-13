'use client';

import '@/styles/globals.css';
import { ServiceCategory } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';
import { useCitySlug } from '../cities/CityProvider';


interface ServicesCategoryCardProps {
  category: ServiceCategory;
}
export default function ServicesCategoryCard({ category }: ServicesCategoryCardProps) {
  const categoryId = category.serviceCategoryId;
  const categorySlug = category.slug;
  const citySlug = useCitySlug();

  const href = `/${citySlug}/services/category/${categorySlug}`;

  return (
    <Link
      href={href}
      key={categoryId}
      className="service-category-card"
    >
      {/* ТЕКСТ */}
      <p className="text-[var(--color-dark)]" title={`Услуга категории ${category.name}`}>
        <b>{category.name}</b>
      </p>

      <p className='p-small text-[var(--color-gray)]' title="Перейти на страницу категории услуг">
        Подробнее -&gt;
      </p>
    </Link>

  );
}


