/**
 * Преобразует фильтры из формата фронтенда в формат бэкенда
 * @param {Object} filters - Фильтры в формате фронтенда
 * @returns {Object} - Фильтры в формате бэкенда (ProductFiltersDto)
 */
export const convertFiltersToBackendFormat = (filters) => {
  const backendFilters = {};

  // Категории
  if (filters.categories && filters.categories.length > 0) {
    backendFilters.categories = filters.categories;
  }

  // Цена
  if (filters.price && Array.isArray(filters.price) && filters.price.length === 2) {
    backendFilters.minPrice = filters.price[0];
    backendFilters.maxPrice = filters.price[1];
  }

  // isNew
  if (filters.isNew !== undefined) {
    backendFilters.isNew = filters.isNew;
  }

  // status
  if (filters.status) {
    backendFilters.status = filters.status;
  }

  // unit
  if (filters.unit) {
    backendFilters.unit = filters.unit;
  }

  return backendFilters;
};

