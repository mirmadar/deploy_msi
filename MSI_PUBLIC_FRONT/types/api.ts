// API Types

export interface City {
  cityId: number;
  name: string;
  slug: string;
  phone: string;
  workHours?: string | null;
}

export interface Category {
  categoryId: number;
  id?: number; // для обратной совместимости
  name: string;
  slug?: string;
  imageUrl?: string | null;
  image?: string; // для обратной совместимости
  description?: string;
  parentId?: number | null;
  level: number;
  hasChildren: boolean;
  hasProducts: boolean;
  path?: { id: number; name: string; slug?: string | null }[];
  children?: Category[];
}

export interface Product {
  productId: number;
  id?: number; // для обратной совместимости
  name: string;
  slug?: string;
  description?: string;
  price: number;
  unit?: string | null;
  priceUnit?: string; // для обратной совместимости, использовать unit
  imageUrl?: string | null;
  image?: string; // для обратной совместимости
  images?: string[];
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    slug?: string;
  } | null;
  status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  isNew?: boolean;
  characteristics?: ProductCharacteristic[] | Record<string, string>;
  [key: string]: unknown; // для дополнительных полей
}

export interface ProductCharacteristic {
  id: number;
  name: string;
  value: string;
  unit?: string;
}

export interface ProductVariant extends Product {
  variantName?: string;
}

export interface HomepageData {
  categories: Category[];
  newProducts: Product[];
  articles?: ArticleListItem[];
  city: {
    name: string;
    phone: string;
    workHours?: string | null;
  };
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

export interface Order {
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  createdAt: string;
}

export interface SearchResult {
  products: Product[];
  total: number;
}

export interface SearchCategoryItem {
  id: number;
  name: string;
  slug?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize?: number;
  isFuzzy?: boolean;
  suggestedQuery?: string;
  usedSuggestedQuery?: boolean;
  categories?: SearchCategoryItem[];
  limit?: number; // для обратной совместимости
  totalPages?: number; // вычисляемое поле
}

export interface CategoryFilter {
  characteristicNameId: number;
  name: string;
  valueType: 'number' | 'text';
  displayOrder: number;
  values?: string[]; // Опционально, загружается отдельно при необходимости
}

export interface CatalogFilters {
  minPrice?: number;
  maxPrice?: number;
  characteristics?: Record<string, string[]> | undefined;
}

// Cart Types
export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  price: number; // В рублях
  createdAt: string;
  product: {
    productId: number;
    name: string;
    slug?: string;
    imageUrl: string | null;
    price: number; // В рублях
    status: 'IN_STOCK' | 'OUT_OF_STOCK';
    unit?: string | null;
  };
}

export interface Cart {
  id: number;
  token: string;
  totalAmount: number; // В рублях
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

// Пустая корзина (когда корзина не существует)
export interface EmptyCart {
  totalAmount: 0;
  items: [];
}

// Union type для ответа GET /public/cart
export type CartResponse = Cart | EmptyCart;

// Type guards
export function isCartExists(cart: CartResponse | null): cart is Cart {
  return cart !== null && 'id' in cart && 'token' in cart;
}

export function isEmptyCart(cart: CartResponse | null): boolean {
  if (!cart) return true;
  return cart.totalAmount === 0 && (!cart.items || cart.items.length === 0);
}

// Article Types
export interface Article {
  articleId: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  imageUrl?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  author?: {
    userId: number;
    username: string;
  };
}

export interface ArticleListItem {
  articleId: number;
  title: string;
  slug: string;
  imageUrl?: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface ArticlesResponse {
  data: ArticleListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ArticleWithRelated extends Article {
  relatedArticles: ArticleListItem[];
}

export interface City {
  cityId: number;
  name: string;
  slug: string;
  phone: string;
  workHours?: string | null;
}

export interface ShipmentCategory {
  categoryId: number;
  slug: string;
  name: string;
  imageUrl?: string | null;
}

export interface ShipmentPost {
  shipmentPostId: number;
  title: string;
  imageUrl: string;
  description: string;
  category: {
    categoryId: number;
    slug: string;
    name: string;
  };
}

// Services (услуги)
export interface ServiceCategory {
  serviceCategoryId: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number | null;
  level: number;
  sortOrder: number;
}

export interface Service {
  serviceId: number;
  name: string;
  slug: string;
  serviceCategoryId: number;
  sortOrder?: number;
}

export type ServiceBlockType = 'HEADING' | 'TEXT' | 'LIST' | 'IMAGE' | 'DOCUMENTS';

export interface HeadingBlockPayload {
  text: string;
}

export interface TextBlockPayload {
  content: string;
}

export interface ListBlockPayload {
  items: string[];
  ordered?: boolean;
}

export interface ImageBlockPayload {
  imageUrl: string;
  caption?: string;
  width?: string;
}

export interface DocumentsBlockItem {
  title: string;
  fileUrl: string;
}

export interface DocumentsBlockPayload {
  items: DocumentsBlockItem[];
}

export interface ServiceBlock {
  serviceBlockId: number;
  type: ServiceBlockType;
  payload: HeadingBlockPayload | TextBlockPayload | ListBlockPayload | ImageBlockPayload | DocumentsBlockPayload;
  sortOrder: number;
}

// GET /public/:citySlug/service-categories
export type PublicServiceCategoriesResponse = ServiceCategory[];

// GET /public/:citySlug/service-categories/:slug
export type PublicServiceCategoryResponse = ServiceCategory;

// GET /public/:citySlug/services?limitPerCategory=3
export interface PublicServiceCategoryWithServices extends ServiceCategory {
  services: Service[];
}

export type PublicServicesOverviewResponse = PublicServiceCategoryWithServices[];

// GET /public/:citySlug/services/by-category/:slug
export interface PublicServicesByCategoryResponse {
  category: ServiceCategory;
  services: Service[];
}

// GET /public/:citySlug/services/:slug
export interface PublicServiceDetailResponse {
  serviceId: number;
  name: string;
  slug: string;
  serviceCategoryId: number;
  category: ServiceCategory;
  blocks: ServiceBlock[];
}

// POST /public/:citySlug/services/:slug/order — заявка на услугу
export interface CreateServiceOrderDto {
  name: string;
  phone: string;
}