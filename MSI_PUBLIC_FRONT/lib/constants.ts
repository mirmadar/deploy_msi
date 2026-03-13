export const ROUTES = {
  HOME: (city: string) => `/${city}`,

  CATALOG: (city: string) => `/${city}/catalog`,
  PRODUCT: (city: string, slug?: string) =>
    slug ? `/${city}/product/${slug}` : `/${city}/product`,

  ARTICLES: (city: string) => `/${city}/articles`,
  ARTICLE: (city: string, slug?: string) =>
    slug ? `/${city}/articles/${slug}` : `/${city}/articles`,

  CHECKOUT: (city: string) => `/${city}/checkout`,
  ABOUT: (city: string) => `/${city}/about`,
  CONTACTS: (city: string) => `/${city}/contacts`,
  SERVICES: (city: string) => `/${city}/services`,
  DELIVERY: (city: string) => `/${city}/delivery`,
  SEARCH: (city: string) => `/${city}/search`,
  PRIVACY: (city: string) => `/${city}/privacy`,
  SHIPMENTS: (city: string) => `/${city}/shipments`,
} as const;
