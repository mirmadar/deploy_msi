// src/api/shipments.api.js
import { http } from "./http";

export const ShipmentsApi = {
  // Получить все посты отгрузок (с пагинацией)
  // params: { page, pageSize, categoryId? }
  list: (params) => http.get("/admin/shipments", { params }),

  // Получить пост отгрузки по ID
  get: (id) => http.get(`/admin/shipments/${id}`),

  // Создать пост отгрузки
  create: (data) => http.post("/admin/shipments", data),

  // Обновить пост отгрузки
  update: (id, data) => http.patch(`/admin/shipments/${id}`, data),

  // Удалить пост отгрузки
  remove: (id) => http.delete(`/admin/shipments/${id}`),

  // Изменить порядок: тело { direction: "up" | "down" }
  move: (id, data) => http.patch(`/admin/shipments/${id}/move`, data),

  // Массовое удаление постов отгрузок
  bulkDelete: (data) => http.post("/admin/shipments/bulk-delete", data),

  // Опубликовать пост отгрузки
  publish: (id) => http.patch(`/admin/shipments/${id}/publish`),

  // Снять пост с публикации
  unpublish: (id) => http.patch(`/admin/shipments/${id}`, { publishedAt: null }),

  // Массовая публикация
  bulkPublish: (data) => http.patch("/admin/shipments/bulk-publish", data),

  // Массовое снятие с публикации
  bulkUnpublish: (data) => http.patch("/admin/shipments/bulk-unpublish", data),

  // Получить категории с постами отгрузок
  getCategories: () => http.get("/admin/shipments/categories"),
};







