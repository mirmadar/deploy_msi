// src/api/categories.api.js
import { http } from "./http";

export const CategoriesApi = {
  // Получить все категории (плоский список, с пагинацией)
  list: (params) => {
    // Axios пропускает null в query параметрах, поэтому передаем как строку "null"
    // Бэкенд должен преобразовать строку "null" в null
    const processedParams = { ...params };
    if (
      processedParams.parentId === null ||
      processedParams.parentId === undefined
    ) {
      processedParams.parentId = "null";
    }
    return http.get("/admin/categories", { params: processedParams });
  },

  // Получить все категории (без пагинации, для обратной совместимости)
  getAll: () => http.get("/admin/categories"),

  // Получить дерево категорий (все сразу, для обратной совместимости)
  getTree: () => http.get("/admin/categories/tree"),

  // Получить дочерние категории для конкретной категории
  getChildren: (parentId, params) =>
    http.get("/admin/categories", {
      params: { parentId, ...params },
    }),

  // Получить категорию по ID
  get: (id) => http.get(`/admin/categories/${id}`),

  // Создать категорию
  create: (data) => http.post("/admin/categories", data),

  // Обновить категорию
  update: (id, data) => http.patch(`/admin/categories/${id}`, data),

  // Удалить категорию
  remove: (id) => http.delete(`/admin/categories/${id}`),

  // Изменить порядок среди соседей: тело { direction: "up" | "down" }
  move: (id, data) => http.patch(`/admin/categories/${id}/move`, data),

  // Массовое обновление URL изображений для категорий
  bulkUpdateImageUrl: (data) => {
    // data: { categoryIds: number[], imageUrl: string | null }
    return http.patch("/admin/categories/bulk/image-url", data);
  },

  // Массовое перемещение категорий (назначение нового родителя)
  bulkMove: (data) => {
    // data: { categoryIds: number[], newParentId: number | null }
    return http.patch("/admin/categories/bulk/move", data);
  },
};
