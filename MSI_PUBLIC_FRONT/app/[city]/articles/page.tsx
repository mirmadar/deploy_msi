'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import ArticleCard from '@/components/ui/ArticleCard';
import { apiClient } from '@/lib/api';
import type { ArticlesResponse } from '@/types/api';
import { useCity } from '@/components/cities/CityProvider';
import { ROUTES } from '@/lib/constants';

export default function ArticlesPage() {
  const { city } = useCity();
  const citySlug = city?.slug;

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!citySlug) return; // ждём загрузки города

    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getArticles(citySlug, 1, 20);
        setArticles(response.data || []);
      } catch (err) {
        setError('Ошибка загрузки статей');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [citySlug]);

  if (!citySlug) return <div>Загрузка города...</div>;
  if (loading) return <div>Загрузка статей...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className='standart'>
      <PageHeader
        title="Статьи"
        breadcrumbs={[
          { label: 'Главная', href: ROUTES.HOME(citySlug) },
          { label: 'Статьи' },
        ]}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, 376px)', gap: '24px' }}>
        {articles.length > 0 ? (
          articles.map((article) => (
            <ArticleCard key={article.articleId} article={article} />
          ))
        ) : (
          <p>Статей пока нет</p>
        )}
      </div>
    </section>
  );
}