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

/** Ссылка на PDF: Согласие на обработку персональных данных */
export const CONSENT_PERSONAL_DATA_PDF_URL =
  'https://s3.twcstorage.ru/1e1e9443-2dab-4047-a4f1-a15263d8349f/documents/%D0%A1%D0%BE%D0%B3%D0%BB%D0%B0%D1%81%D0%B8%D0%B5_%D0%BD%D0%B0_%D0%BE%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D1%83_%D0%BF%D0%B5%D1%80%D1%81%D0%BE%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D1%85_%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85_%D0%9C%D0%A1%D0%98.pdf';
