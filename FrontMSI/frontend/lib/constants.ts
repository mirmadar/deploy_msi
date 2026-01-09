export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  PRODUCT: (id: string | number) => `/product/${id}`,
  CHECKOUT: '/checkout',
  PLUMBING: '/plumbing',
  DELIVERY: '/delivery',
  ARTICLES: '/articles',
  ABOUT: '/about',
  CONTACTS: '/contacts',
  SEARCH: '/search',
} as const;
