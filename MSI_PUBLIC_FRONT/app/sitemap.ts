import { MetadataRoute } from 'next';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://example.com');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  let cities: { slug: string }[] = [];

  try {
    const res = await fetch(`${apiUrl}/public/cities`, { next: { revalidate: 3600 } });
    const data = await res.json();
    cities = Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    // без API отдаём хотя бы дефолтный город
    cities = [{ slug: 'msk' }];
  }

  const now = new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
  ];

  for (const city of cities) {
    const slug = city.slug ?? city;
    const citySlug = typeof slug === 'string' ? slug : 'msk';
    entries.push({
      url: `${BASE_URL}/${citySlug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    });
    entries.push({
      url: `${BASE_URL}/${citySlug}/catalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    });
    entries.push({
      url: `${BASE_URL}/${citySlug}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    });
  }

  return entries;
}
