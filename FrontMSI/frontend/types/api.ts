// API Types

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
  children?: Category[];
}

export interface Product {
  productId: number;
  id?: number; // для обратной совместимости
  name: string;
  slug?: string;
  description?: string;
  price: number;
  priceUnit?: string;
  imageUrl?: string | null;
  image?: string; // для обратной совместимости
  images?: string[];
  categoryId?: number;
  category?: {
    id: number;
    name: string;
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
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  name: string;
  phone: string;
  document?: File;
  items: OrderItem[];
}

export interface Order {
  id: number;
  name: string;
  phone: string;
  items: OrderItem[];
  status: string;
  createdAt: string;
}

export interface SearchResult {
  products: Product[];
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize?: number;
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
    imageUrl: string | null;
    price: number; // В рублях
    status: 'IN_STOCK' | 'OUT_OF_STOCK';
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

