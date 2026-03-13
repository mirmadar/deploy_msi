import { http } from "./http";

/**
 * Получить фильтры (категории и ценовой диапазон) из ElasticSearch
 * @returns {Promise<{categories: CategoryTreeNode[], price: {min: number, max: number}}>}
 */
export const getFilters = () => http.get("/admin/search/filters");

/**
 * Получить подсказки для автодополнения поиска
 * @param {string} query - Поисковый запрос
 * @param {number} [size=10] - Количество подсказок
 * @returns {Promise<{suggestions: string[]}>}
 */
export const getSuggestions = (query, size = 10) => {
  return http.get("/admin/search/suggest", {
    params: { q: query, size },
  });
};
