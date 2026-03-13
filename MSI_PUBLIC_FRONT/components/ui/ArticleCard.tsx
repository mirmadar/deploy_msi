'use client';

import { Article } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useState } from 'react';
import { useCitySlug } from '../cities/CityProvider';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const articleSlug = article.slug;
    const citySlug = useCitySlug();

    if (!articleSlug) return null;

    const imageUrl = article.imageUrl || undefined;
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <Link href={ROUTES.ARTICLES(citySlug) + `/${article.slug}`} className="group block h-full">
            <div className="article-card">
                <div 
                    style={{
                        height: '206px',
                        width: '344px',
                        position: 'relative', // 🔴 ОБЯЗАТЕЛЬНО
                        overflow: 'hidden',
                        borderRadius: '12px',
                        flexShrink: 0,
                    }}
                >
                    <Image
                        src={imageUrl || '/placeholder-image.png'}
                        alt={article.slug || 'Article Image'}
                        fill
                        style={{ objectFit: 'cover' }}
                        onLoad={() => setIsImageLoaded(true)}
                    />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
            </div>
        </Link>
    );
}