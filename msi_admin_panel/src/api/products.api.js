// src/api/products.api.js
import { http } from "./http";

export const ProductsApi = {
  /**
   * Получить список товаров с поиском и фильтрами
   * @param {Object} params - Параметры запроса
   * @param {number} params.page - Номер страницы
   * @param {number} params.pageSize - Размер страницы
   * @param {string} [params.search] - Поисковый запрос
   * @param {string[]} [params.categories] - Массив категорий для фильтрации
   * @param {number} [params.minPrice] - Минимальная цена
   * @param {number} [params.maxPrice] - Максимальная цена
   * @param {boolean} [params.isNew] - Фильтр по новинке
   * @param {string} [params.status] - Фильтр по статусу (IN_STOCK/OUT_OF_STOCK)
   * @param {string} [params.sortBy] - Поле для сортировки (price/productId)
   * @param {string} [params.sortOrder] - Порядок сортировки (asc/desc)
   */
  list(params) {
    return http.get("/admin/products", { params });
  },

  get(id) {
    return http.get(`/admin/products/${id}`);
  },

  create(data) {
    // data: { name, price, isNew?, imageUrl?, characteristics? }
    return http.post("/admin/products", data);
  },

  update(id, data) {
    // data: { name?, price?, isNew?, imageUrl?, characteristics? }
    return http.patch(`/admin/products/${id}`, data);
  },

  remove(id) {
    return http.delete(`/admin/products/${id}`);
  },

  /**
   * Массовое обновление товаров
   * @param {Object} data - Данные для обновления
   * @param {number[]} data.productIds - Массив ID товаров
   * @param {string} [data.status] - Статус (IN_STOCK/OUT_OF_STOCK)
   * @param {boolean} [data.isNew] - Новинка
   * @param {string} [data.imageUrl] - URL изображения
   * @param {number} [data.categoryId] - ID категории
   */
  bulkUpdate(data) {
    return http.patch("/admin/products/bulk-update", data);
  },

  /**
   * Массовое удаление товаров
   * @param {Object} data - Данные для удаления
   * @param {number[]} data.productIds - Массив ID товаров
   * @returns {Promise} - Ответ с количеством удаленных товаров
   */
  bulkDelete(data) {
    return http.post("/admin/products/bulk-delete", data);
  },

  /**
   * Подсчет товаров по фильтрам
   * @param {Object} params - Параметры фильтров
   * @returns {Promise} - Ответ с количеством товаров { count: number }
   */
  countByFilters(params) {
    return http.get("/admin/products/count-by-filters", { params });
  },

  /**
   * Массовое обновление товаров по фильтрам
   * @param {Object} data - Данные для обновления
   * @param {Object} data.filters - Фильтры для поиска товаров
   * @param {string} [data.status] - Статус (IN_STOCK/OUT_OF_STOCK)
   * @param {boolean} [data.isNew] - Новинка
   * @param {string} [data.imageUrl] - URL изображения
   * @param {number} [data.categoryId] - ID категории
   * @param {string} [data.unit] - Единица измерения
   * @param {number} [data.confirmCount] - Количество товаров для подтверждения
   * @returns {Promise} - Ответ с количеством обновленных товаров
   */
  bulkUpdateByFilters(data) {
    return http.patch("/admin/products/bulk-update-by-filters", data);
  },

  /**
   * Массовое удаление товаров по фильтрам
   * @param {Object} data - Данные для удаления
   * @param {Object} data.filters - Фильтры для поиска товаров
   * @param {number} [data.confirmCount] - Количество товаров для подтверждения
   * @returns {Promise} - Ответ с количеством удаленных товаров
   */
  bulkDeleteByFilters(data) {
    return http.post("/admin/products/bulk-delete-by-filters", data);
  },
};
