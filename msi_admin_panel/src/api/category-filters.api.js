// src/api/category-filters.api.js
import { http } from "./http";

export const CategoryFiltersApi = {
  /**
   * Получить все фильтры категории
   * @param {number} categoryId - ID категории
   * @returns {Promise} - Список фильтров категории
   */
  getCategoryFilters(categoryId) {
    return http.get(`/admin/category-filters/${categoryId}`);
  },

  /**
   * Создать новый фильтр для категории
   * @param {Object} data - Данные фильтра
   * @param {number} data.categoryId - ID категории
   * @param {number} data.characteristicNameId - ID характеристики
   * @param {number} [data.displayOrder] - Порядок отображения (необязательно)
   * @returns {Promise} - Созданный фильтр
   */
  createCategoryFilter(data) {
    return http.post("/admin/category-filters", data);
  },

  /**
   * Обновить порядок фильтра
   * @param {number} id - ID фильтра (categoryFilterId)
   * @param {Object} data - Данные для обновления
   * @param {number} data.displayOrder - Новый порядок отображения
   * @returns {Promise} - Обновленный фильтр
   */
  updateCategoryFilter(id, data) {
    return http.patch(`/admin/category-filters/${id}`, data);
  },

  /**
   * Удалить фильтр
   * @param {number} id - ID фильтра (categoryFilterId)
   * @returns {Promise} - Сообщение об успешном удалении
   */
  deleteCategoryFilter(id) {
    return http.delete(`/admin/category-filters/${id}`);
  },

  /**
   * Массовое обновление фильтров категории
   * @param {Object} data - Данные для массового обновления
   * @param {number} data.categoryId - ID категории
   * @param {Array} [data.create] - Массив фильтров для создания: [{ characteristicNameId, displayOrder? }]
   * @param {number[]} [data.delete] - Массив ID фильтров для удаления
   * @param {Array} [data.update] - Массив фильтров для обновления: [{ filterId, displayOrder }]
   * @returns {Promise} - Ответ с результатами обновления
   */
  bulkUpdateFilters(data) {
    return http.patch("/admin/category-filters/bulk", data);
  },
};

