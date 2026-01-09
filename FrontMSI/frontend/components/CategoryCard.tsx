'use client';

import { Category } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  category: Category;
}
export default function CategoryCard({ category }: CategoryCardProps) {
  const categoryId = category.categoryId || category.id;

  return (
    <Link href={`/catalog/${categoryId}`} className="h-full block">
      <div className="bg-white border border-slate-200 rounded-lg h-full flex flex-col items-center justify-center p-6 text-center group hover:shadow-md hover:border-primary/30 transition-all">
        <div className="mb-4 h-20 w-20 flex-center rounded-xl bg-slate-50 group-hover:bg-primary/5 transition-colors duration-300">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              width={64}
              height={64}
              className="object-contain group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <span className="text-3xl opacity-60 group-hover:opacity-100 transition-opacity">📦</span>
          )}
        </div>

        <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors leading-snug text-sm">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}


