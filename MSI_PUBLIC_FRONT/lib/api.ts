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
  ArticlesResponse,
  ArticleWithRelated,
  City,
  ShipmentCategory, 
  ShipmentPost,
  ServiceCategory,
  PublicServiceCategoriesResponse,
  PublicServiceCategoryResponse,
  PublicServicesOverviewResponse,
  PublicServicesByCategoryResponse,
  PublicServiceDetailResponse,
  CreateServiceOrderDto,
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

/** Возвращает короткое сообщение об ошибке для показа пользователю (без технических деталей). */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.length < 100 && !msg.includes('http') && !msg.includes('localhost') && !msg.includes('status:')) {
      return msg;
    }
  }
  return fallback;
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
        
        // Специальная обработка 404 — пользователю короткое сообщение
        if (response.status === 404) {
          if (process.env.NODE_ENV === 'development') {
            console.error(
              '[API 404]',
              url,
              '\nЭндпоинт не найден. Проверьте путь, глобальный префикс и роутинг на бэкенде.'
            );
          }
          throw new ApiError('Страница или раздел не найдены', response.status, errorData);
        }

        // 500 и другие серверные ошибки — короткое сообщение для пользователя
        if (response.status >= 500) {
          if (process.env.NODE_ENV === 'development' && errorData) {
            console.error('[API error]', response.status, errorData);
          }
          throw new ApiError(
            'Временная ошибка сервера. Попробуйте позже.',
            response.status,
            errorData
          );
        }

        // 4xx (кроме 404) — показываем message с бэка только если он короткий и без технических деталей
        const backendMsg =
          typeof errorData?.message === 'string' ? errorData.message : '';
        const isUserFriendly =
          backendMsg.length > 0 &&
          backendMsg.length < 120 &&
          !backendMsg.includes('http') &&
          !backendMsg.includes('status:');
        const message = isUserFriendly
          ? backendMsg
          : 'Не удалось выполнить запрос. Попробуйте ещё раз.';

        throw new ApiError(message, response.status, errorData);
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
      
      // Сетевые ошибки — пользователю короткое сообщение, детали только в dev
      let errorMessage = 'Не удалось подключиться. Проверьте интернет и попробуйте снова.';
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (process.env.NODE_ENV === 'development') {
          const currentPort = typeof window !== 'undefined' ? window.location.port : 'unknown';
          console.error(
            '[API] Не удалось подключиться к',
            url,
            '\nПроверьте: бэкенд запущен, CORS для порта',
            currentPort || '3002',
            ', NEXT_PUBLIC_API_URL:',
            this.baseUrl
          );
        }
      } else if (error instanceof Error) {
        // Показываем сообщение только если оно короткое и не техническое
        const msg = error.message;
        if (msg.length < 100 && !msg.includes('http') && !msg.includes('localhost')) {
          errorMessage = msg;
        }
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
        credentials: 'include', // нужно для передачи cartToken через cookie
      });

      if (!response.ok) {
        let errorData: { message?: string };
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        if (response.status === 404) {
          throw new ApiError('Страница или раздел не найдены', response.status, errorData);
        }
        if (response.status >= 500) {
          throw new ApiError(
            'Временная ошибка сервера. Попробуйте позже.',
            response.status,
            errorData
          );
        }
        const backendMsg = typeof errorData?.message === 'string' ? errorData.message : '';
        const isUserFriendly =
          backendMsg.length > 0 &&
          backendMsg.length < 120 &&
          !backendMsg.includes('http') &&
          !backendMsg.includes('status:');
        const message = isUserFriendly
          ? backendMsg
          : 'Не удалось выполнить запрос. Попробуйте ещё раз.';
        throw new ApiError(message, response.status, errorData);
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
      const msg = error instanceof Error ? error.message : '';
      const userMsg =
        msg.length < 100 && !msg.includes('http') && !msg.includes('localhost')
          ? msg
          : 'Не удалось подключиться. Проверьте интернет и попробуйте снова.';
      throw new ApiError(userMsg, 0, error);
    }
  }

  // Cities
  async getCities(): Promise<City[]> {
    return this.request<City[]>('/public/cities');
  }

  // Homepage
  async getHomepage(citySlug: string): Promise<HomepageData> {
    return this.request<HomepageData>(`/public/${citySlug}/homepage`);
  }

  // Categories
  async getCategories(citySlug: string, parentSlug?: string | null): Promise<Category[]> {
    const searchParams = new URLSearchParams();
    // Если передан parentSlug, сначала получаем категорию по slug, чтобы получить parentId
    if (parentSlug !== undefined && parentSlug !== null) {
      try {
        const parentCategory = await this.getCategoryBySlug(citySlug, parentSlug);
        searchParams.append('parentId', parentCategory.categoryId.toString());
      } catch (error) {
        // Если категория не найдена, возвращаем пустой массив
        console.error('Error loading parent category:', error);
        return [];
      }
    } else if (parentSlug === null) {
      searchParams.append('parentId', 'null');
    }
    
    const query = searchParams.toString();
    const url = `/public/${citySlug}/categories${query ? `?${query}` : ''}`;
    const response = await this.request<any>(url);
    
    // Если ответ - массив, возвращаем как есть
    if (Array.isArray(response)) {
      return response;
    }
    
    // Если ответ - объект с индексами (0, 1, 2...) и полем city, преобразуем в массив
    if (typeof response === 'object' && response !== null) {
      const categories: Category[] = [];
      // Сортируем ключи по числовому значению, чтобы сохранить порядок
      const keys = Object.keys(response)
        .filter(key => key !== 'city')
        .map(key => Number(key))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);
      
      for (const key of keys) {
        categories.push(response[key.toString()] as Category);
      }
      
      return categories;
    }
    
    return [];
  }

  async getCategoryBySlug(citySlug: string, slug: string): Promise<Category> {
    return this.request<Category>(`/public/${citySlug}/categories/${slug}`);
  }

  async getCategoryFilters(citySlug: string, slug: string): Promise<CategoryFilter[]> {
    return this.request<CategoryFilter[]>(`/public/${citySlug}/categories/${slug}/filters`);
  }

  async getFilterValues(citySlug: string, slug: string, characteristicNameId: number): Promise<string[]> {
    const response = await this.request<{ characteristicNameId: number; values: string[] }>(
      `/public/${citySlug}/categories/${slug}/filters/${characteristicNameId}/values`
    );
    // API возвращает объект с полями characteristicNameId и values, извлекаем values
    return response.values || [];
  }

  // Catalog (products by category)
  async getCatalogProducts(
    citySlug: string,
    slug: string,
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
    const url = `/public/${citySlug}/catalog/${slug}/products${query ? `?${query}` : ''}`;
    
    const response = await this.request<PaginatedResponse<Product>>(url);
    // Вычисляем totalPages если его нет
    if (response.totalPages === undefined && response.pageSize) {
      response.totalPages = Math.ceil(response.total / response.pageSize);
    }
    return response;
  }

  // Products
  async getProduct(citySlug: string, slug: string): Promise<Product> {
    return this.request<Product>(`/public/${citySlug}/products/${slug}`);
  }

  async getProductVariants(slug: string): Promise<ProductVariant[]> {
    return this.request<ProductVariant[]>(`/public/products/${slug}/variants`);
  }

  // Search
  async searchProducts(
    citySlug: string,
    query: string,
    page = 1,
    pageSize = 20,
    minPrice?: number,
    maxPrice?: number
  ): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (typeof minPrice === 'number') {
      searchParams.append('minPrice', String(minPrice));
    }
    if (typeof maxPrice === 'number') {
      searchParams.append('maxPrice', String(maxPrice));
    }
    
    const response = await this.request<PaginatedResponse<Product>>(
      `/public/${citySlug}/search?${searchParams.toString()}`
    );
    // Вычисляем totalPages если его нет
    if (response.totalPages === undefined && response.pageSize) {
      response.totalPages = Math.ceil(response.total / response.pageSize);
    }
    return response;
  }

  // Orders
  async createOrder(orderData: CreateOrderDto, file?: File): Promise<Order> {
    const formData = new FormData();
    formData.append('clientName', orderData.clientName);
    formData.append('clientPhone', orderData.clientPhone);
    formData.append('clientEmail', orderData.clientEmail);

    if (file) {
      formData.append('file', file, file.name);
    }

    const response = await this.requestWithFile<{ success: boolean; order: Order }>(
      '/public/orders',
      formData
    );
    return response.order || response as unknown as Order;
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

  // Callback Request
  async sendCallbackRequest(
    name: string,
    phone: string,
    file?: File
  ): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    
    if (file) {
      // Явно указываем имя файла для правильной кодировки UTF-8
      formData.append('file', file, file.name);
      
      // Отладочное логирование (только в development)
      if (process.env.NODE_ENV === 'development') {
        console.log('Отправка файла:', {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    }

    return this.requestWithFile<{ message: string }>('/public/callback-request', formData);
  }

  // Articles
  async getArticles(citySlug: string, page = 1, pageSize = 10): Promise<ArticlesResponse> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    return this.request<ArticlesResponse>(`/public/${citySlug}/articles?${searchParams.toString()}`);
  }

  async getArticleBySlug(citySlug: string, slug: string): Promise<ArticleWithRelated> {
    return this.request<ArticleWithRelated>(`/public/${citySlug}/articles/${slug}`);
  }

  // City
  async getCityBySlug(slug: string): Promise<City> {
    return this.request<City>(`/public/cities/${slug}`);
  }

  async getActiveCities(refresh = false): Promise<City[]> {
    const query = refresh ? '?refresh=true' : '';
    return this.request<City[]>(`/public/cities${query}`);
  }

  // Shipments
  async getShipmentCategories(citySlug: string): Promise<ShipmentCategory[]> {
    const res = await this.request<{ data: ShipmentCategory[] }>(
      `/public/${citySlug}/shipments/categories`,
    );

    return res.data;
  }

  private normalizeShipmentPagination<T>(res: any): PaginatedResponse<T> {
    return {
      data: res.data,
      page: res.pagination.page,
      pageSize: res.pagination.pageSize,
      total: res.pagination.total,
      totalPages: res.pagination.totalPages,
    };
  }

  async getShipmentPosts(
    citySlug: string,
    params?: {
      page?: number;
      pageSize?: number;
      categorySlug?: string;
    },
  ): Promise<PaginatedResponse<ShipmentPost>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize)
      searchParams.append('pageSize', params.pageSize.toString());
    if (params?.categorySlug)
      searchParams.append('categorySlug', params.categorySlug);

    const query = searchParams.toString();

    const res = await this.request<any>(
      `/public/${citySlug}/shipments${query ? `?${query}` : ''}`,
    );

    return this.normalizeShipmentPagination<ShipmentPost>(res);
  }

  // Service categories (публичные категории услуг)
  async getServiceCategories(citySlug: string): Promise<PublicServiceCategoriesResponse> {
    return this.request<PublicServiceCategoriesResponse>(`/public/${citySlug}/service-categories`);
  }

  async getServiceCategoryBySlug(
    citySlug: string,
    slug: string
  ): Promise<PublicServiceCategoryResponse> {
    return this.request<PublicServiceCategoryResponse>(
      `/public/${citySlug}/service-categories/${slug}`
    );
  }

  // Services (публичные услуги)
  async getServicesOverview(
    citySlug: string,
    limitPerCategory = 3
  ): Promise<PublicServicesOverviewResponse> {
    const searchParams = new URLSearchParams({
      limitPerCategory: limitPerCategory.toString(),
    });

    return this.request<PublicServicesOverviewResponse>(
      `/public/${citySlug}/services?${searchParams.toString()}`
    );
  }

  async getServicesByCategory(
    citySlug: string,
    slug: string
  ): Promise<PublicServicesByCategoryResponse> {
    return this.request<PublicServicesByCategoryResponse>(
      `/public/${citySlug}/services/by-category/${slug}`
    );
  }

  async getServiceBySlug(
    citySlug: string,
    slug: string
  ): Promise<PublicServiceDetailResponse> {
    return this.request<PublicServiceDetailResponse>(`/public/${citySlug}/services/${slug}`);
  }

  async createServiceOrder(
    citySlug: string,
    slug: string,
    dto: CreateServiceOrderDto
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/public/${citySlug}/services/${slug}/order`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

}

export const apiClient = new ApiClient(API_URL);
export { ApiError };

