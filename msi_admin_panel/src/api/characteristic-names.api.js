// src/api/characteristic-names.api.js
import { http } from "./http";

export const CharacteristicNamesApi = {
  // Получить все названия характеристик (с пагинацией и поиском)
  // params: { page, limit, search? }
  list: (params) => http.get("/admin/characteristic-names", { params }),
  
  // Получить все названия характеристик (без пагинации, для обратной совместимости)
  getAll: () => http.get("/admin/characteristic-names"),
  
  // Получить полный список всех названий характеристик (новый эндпоинт)
  // params: { sortOrder?: 'asc' | 'desc' }
  getAllList: (params) => http.get("/admin/characteristic-names/all", { params }),

  // Получить по ID
  get: (id) => http.get(`/admin/characteristic-names/${id}`),

  // Создать новое название
  create: (data) => http.post("/admin/characteristic-names", data),

  // Обновить название
  update: (id, data) => http.patch(`/admin/characteristic-names/${id}`, data),

  // Удалить название
  remove: (id) => http.delete(`/admin/characteristic-names/${id}`),
};
