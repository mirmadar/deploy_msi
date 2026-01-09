import type {
  Category,
  Product,
  HomepageData,
  CreateOrderDto,
  Order,
  PaginatedResponse,
  ProductVariant,
  CategoryFilter,
  Cart,
  CartResponse,
} from '@/types/api';

// Получаем URL API из переменных окружения
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Логируем URL для отладки (только в development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL:', API_URL);
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Важно для работы с cookies
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        // Специальная обработка 404 ошибок
        if (response.status === 404) {
          const errorMsg = `Эндпоинт не найден: ${url}

Возможные причины:
1. Путь неправильный - проверьте, существует ли эндпоинт ${endpoint} на бэкенде
2. Глобальный префикс - возможно на бэкенде установлен глобальный префикс (например /api)
   → Попробуйте изменить NEXT_PUBLIC_API_URL: http://localhost:3000/api
3. Контроллер не создан - убедитесь, что контроллер для ${endpoint} существует
4. Роутинг настроен неправильно - проверьте декораторы @Controller() на бэкенде

Проверьте в браузере: ${url}
Если видите 404, значит бэкенд работает, но путь неправильный`;
          
          throw new ApiError(errorMsg, response.status, errorData);
        }
        
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Улучшенная обработка сетевых ошибок
      let errorMessage = 'Не удалось подключиться к серверу';
      const currentPort = typeof window !== 'undefined' ? window.location.port : 'unknown';
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = `Не удалось подключиться к API по адресу ${url}

Проверьте:
1. Бэкенд запущен на ${this.baseUrl}?
   → Откройте в браузере: ${this.baseUrl}/public/homepage
   → Должен вернуться JSON, если бэкенд работает

2. CORS настроен для вашего порта?
   → Frontend работает на порту: ${currentPort || '3002'}
   → На бэкенде в main.ts добавьте в origin: 'http://localhost:${currentPort || '3002'}'

3. Переменная окружения NEXT_PUBLIC_API_URL?
   → Проверьте .env.local файл
   → Текущее значение: ${this.baseUrl}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new ApiError(
        errorMessage,
        0,
        error
      );
    }
  }

  private async requestWithFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        error
      );
    }
  }

  // Homepage
  async getHomepage(): Promise<HomepageData> {
    return this.request<HomepageData>('/public/homepage');
  }

  // Categories
  async getCategories(parentId?: number | null): Promise<Category[]> {
    const searchParams = new URLSearchParams();
    if (parentId !== undefined && parentId !== null) {
      searchParams.append('parentId', parentId.toString());
    } else if (parentId === null) {
      searchParams.append('parentId', 'null');
    }
    
    const query = searchParams.toString();
    const url = `/public/categories${query ? `?${query}` : ''}`;
    return this.request<Category[]>(url);
  }

  async getCategoryFilters(categoryId: number): Promise<CategoryFilter[]> {
    return this.request<CategoryFilter[]>(`/public/categories/${categoryId}/filters`);
  }

  async getFilterValues(categoryId: number, characteristicNameId: number): Promise<string[]> {
    const response = await this.request<{ characteristicNameId: number; values: string[] }>(
      `/public/categories/${categoryId}/filters/${characteristicNameId}/values`
    );
    // API возвращает объект с полями characteristicNameId и values, извлекаем values
    return response.values || [];
  }

  // Catalog (products by category)
  async getCatalogProducts(
    categoryId: number,
    params?: {
      page?: number;
      pageSize?: number;
      minPrice?: number;
      maxPrice?: number;
      characteristics?: Record<string, string[]>;
    }
  ): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.characteristics && Object.keys(params.characteristics).length > 0) {
      searchParams.append('characteristics', JSON.stringify(params.characteristics));
    }
    
    const query = searchParams.toString();
    const url = `/public/catalog/${categoryId}/products${query ? `?${query}` : ''}`;
    
    const response = await this.request<PaginatedResponse<Product>>(url);
    // Вычисляем totalPages если его нет
    if (response.totalPages === undefined && response.pageSize) {
      response.totalPages = Math.ceil(response.total / response.pageSize);
    }
    return response;
  }

  // Products
  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/public/products/${id}`);
  }

  async getProductVariants(id: number): Promise<ProductVariant[]> {
    return this.request<ProductVariant[]>(`/public/products/${id}/variants`);
  }

  // Search
  async searchProducts(query: string, page = 1, pageSize = 20): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    const response = await this.request<PaginatedResponse<Product>>(
      `/public/search?${searchParams.toString()}`
    );
    // Вычисляем totalPages если его нет
    if (response.totalPages === undefined && response.pageSize) {
      response.totalPages = Math.ceil(response.total / response.pageSize);
    }
    return response;
  }

  // Orders
  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const formData = new FormData();
    formData.append('name', orderData.name);
    formData.append('phone', orderData.phone);
    formData.append('items', JSON.stringify(orderData.items));
    
    if (orderData.document) {
      formData.append('document', orderData.document);
    }

    return this.requestWithFile<Order>('/public/orders', formData);
  }

  // Cart
  async getCart(): Promise<CartResponse> {
    return this.request<CartResponse>('/public/cart', {
      method: 'GET',
    });
  }

  async addToCart(productId: number): Promise<Cart> {
    return this.request<Cart>('/public/cart', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async updateCartItem(itemId: number, quantity: number): Promise<Cart> {
    return this.request<Cart>(`/public/cart/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: number): Promise<Cart> {
    return this.request<Cart>(`/public/cart/${itemId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_URL);
export { ApiError };

