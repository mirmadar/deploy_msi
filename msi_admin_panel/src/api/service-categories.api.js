// src/api/service-categories.api.js
import { http } from "./http";

const basePath = "/admin/service-categories";

export const ServiceCategoriesApi = {
  // Список с пагинацией (?page=1&limit=25&parentId=..., для корня parentId=null)
  list: (params) => {
    const processedParams = { ...params };
    if (
      processedParams.parentId === null ||
      processedParams.parentId === undefined
    ) {
      processedParams.parentId = "null";
    }
    return http.get(basePath, { params: processedParams });
  },

  // Дерево для выбора категории
  getTree: () => http.get(`${basePath}/tree`),

  // Дочерние категории для конкретной категории
  getChildren: (parentId, params) =>
    http.get(basePath, {
      params: { parentId, ...params },
    }),

  // Одна категория с полем path (хлебные крошки)
  get: (id) => http.get(`${basePath}/${id}`),

  // Создание (body: name, parentId?, description?); порядок назначается автоматически
  create: (data) => http.post(basePath, data),

  // Обновление (sortOrder в теле не принимается)
  update: (id, data) => http.patch(`${basePath}/${id}`, data),

  // Сдвиг по порядку: body { direction: "up" | "down" }
  move: (id, data) => http.patch(`${basePath}/${id}/move`, data),

  // Удаление (ошибка, если есть подкатегории или услуги)
  remove: (id) => http.delete(`${basePath}/${id}`),

  // Массовый перенос: { serviceCategoryIds: number[], newParentId: number | null }
  bulkMove: (data) =>
    http.patch(`${basePath}/bulk/move`, data),

  // Массовое удаление: только категории без подкатегорий. Тело: { serviceCategoryIds: number[] }
  bulkRemove: (data) =>
    http.delete(`${basePath}/bulk`, { data }),
};
