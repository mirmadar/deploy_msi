'use client';

import '@/styles/globals.css';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { ArticleWithRelated } from '@/types/api';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/lib/constants';
import { sanitizeHtml } from '@/lib/sanitize';
import { useCitySlug } from '@/components/cities/CityProvider';
import ArticleCard from '@/components/ui/ArticleCard';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();

  const articleSlug = params.slug as string;
  const citySlug = useCitySlug();

  const [article, setArticle] = useState<ArticleWithRelated | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateButtons = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollBy = (amount: number) => {
    sliderRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!articleSlug || !citySlug) {
      setError('Неверный slug статьи');
      setLoading(false);
      return;
    }

    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const articleData = await apiClient.getArticleBySlug(
          citySlug,
          articleSlug
        );

        setArticle(articleData);
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Не удалось загрузить статью');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleSlug, citySlug]);

  if (loading) {
    return (
      <section style={{ padding: '60px 40px', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          Загрузка статьи...
        </div>
      </section>
    );
  }

  if (error || !article) {
    return (
      <section style={{ padding: '60px 40px', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#ef4444' }}>
          {error || 'Статья не найдена'}
        </div>
      </section>
    );
  }

  const imageUrl = article.imageUrl || undefined;
  const contentHtml = sanitizeHtml((article.content ?? '').replace(/\n/g, '<br/>'));

  return (
    <section className='standart'>
      {/* ===== Header ===== */}
        <PageHeader
          title=''
          breadcrumbs={[
            { label: 'Главная', href: `${ROUTES.HOME(citySlug)}` },
            { label: 'Статьи', href: `${ROUTES.ARTICLES(citySlug)}` },
            { label: article.title },
          ]}
        />

        {/* ===== Image ===== */}
        {imageUrl && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '400px',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        )}

        {/* ===== Content ===== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <p 
            style={{
              color: 'var(--color-gray)',
            }}
          >
            {article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString('ru-RU', {
                year: 'numeric',  // год
                month: 'numeric',    // месяц
                day: 'numeric',   // число
              })
            : ''}
          </p>
          <h1 style={{ fontSize: '32px', fontWeight: 700 }}>
            {article.title}
          </h1>
        </div>

        <div
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#334155',
          }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* ===== Может быть интересно ===== */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                className="h2-bold"
                style={{ color: 'var(--color-dark)', margin: 0 }}
              >
                Может быть интересно
              </h2>
              <a
                href={ROUTES.ARTICLES(citySlug)}
                style={{
                  color: 'var(--color-green)',
                  textDecoration: 'underline',
                  fontSize: '14px',
                }}
              >
                Все статьи
              </a>
            </div>

            <div style={{ position: 'relative' }}>
              <div
                ref={sliderRef}
                onScroll={updateButtons}
                className="no-scrollbar"
                style={{
                  display: 'flex',
                  gap: '20px',
                  overflowX: 'hidden',
                  scrollBehavior: 'smooth',
                  paddingBottom: '8px',
                }}
              >
                {article.relatedArticles.map((related) => (
                  <ArticleCard key={related.slug} article={related} />
                ))}
              </div>

              {canScrollLeft && (
                <button
                  onClick={() => scrollBy(-380)}
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-light-green)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
                    <path d="M8.39003 12.6167L3.2167 7.44333L8.39003 2.27C8.91003 1.75 8.91003 0.91 8.39003 0.39C7.87003 -0.13 7.03003 -0.13 6.51003 0.39L0.39003 6.51C-0.12997 7.03 -0.12997 7.87 0.39003 8.39L6.51003 14.51C7.03003 15.03 7.87003 15.03 8.39003 14.51C8.8967 13.99 8.91003 13.1367 8.39003 12.6167Z" fill="#028497"/>
                  </svg>
                </button>
              )}

              {canScrollRight && (
                <button
                  onClick={() => scrollBy(380)}
                  style={{
                    position: 'absolute',
                    right: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-light-green)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
                    <path d="M0.39 12.6167L5.56333 7.44333L0.39 2.27C-0.13 1.75 -0.13 0.91 0.39 0.39C0.91 -0.13 1.75 -0.13 2.27 0.39L8.39 6.51C8.91 7.03 8.91 7.87 8.39 8.39L2.27 14.51C1.75 15.03 0.91 15.03 0.39 14.51C-0.116667 13.99 -0.13 13.1367 0.39 12.6167Z" fill="#028497"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
    </section>
  );
}
