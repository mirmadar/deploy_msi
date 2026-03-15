'use client';

import '@/styles/globals.css';
import { useEffect, useState } from 'react';
import { apiClient, getErrorMessage } from '@/lib/api';
import { Category } from '@/types/api';
import CategoryCard from '@/components/CategoryCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCitySlug } from '@/components/cities/CityProvider';

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const citySlug = useCitySlug(); 

  useEffect(() => {
    loadCategories();
  }, [citySlug]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.getCategories(citySlug, null);
      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить категории'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="standart" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Загрузка...
      </div>
    );
  }

  if (error) {
    return (
      <div className="standart">
        <p>{error}</p>
        <button onClick={loadCategories}>Повторить</button>
      </div>
    );
  }

  return (
    <div>
      <section className="standart">
          <PageHeader
            title="Каталог"
            breadcrumbs={[
              { label: 'Главная', href: `/${citySlug}` },
              { label: 'Каталог' },
            ]}
          />

          {categories.length > 0 ? (
            <div className="catalog-categories-grid">
              {categories.map(category => (
                <CategoryCard
                  key={category.categoryId || category.id}
                  category={{
                    ...category,
                    id: category.categoryId || category.id,
                    image: category.imageUrl || category.image,
                  }}
                />
              ))}
            </div>
          ) : (
            <p>Категории не найдены</p>
          )}
      </section>
    </div>
  );
}
