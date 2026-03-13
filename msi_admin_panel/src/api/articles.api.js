// src/api/articles.api.js
import { http } from "./http";

export const ArticlesApi = {
  // Получить все статьи (с пагинацией)
  // params: { page, pageSize }
  list: (params) => http.get("/admin/articles", { params }),

  // Получить статью по ID
  get: (id) => http.get(`/admin/articles/${id}`),

  // Создать статью
  create: (data) => http.post("/admin/articles", data),

  // Обновить статью
  update: (id, data) => http.patch(`/admin/articles/${id}`, data),

  // Удалить статью
  remove: (id) => http.delete(`/admin/articles/${id}`),

  // Изменить порядок: тело { direction: "up" | "down" }
  move: (id, data) => http.patch(`/admin/articles/${id}/move`, data),

  // Опубликовать статью
  publish: (id) => http.patch(`/admin/articles/${id}/publish`),

  // Снять статью с публикации
  unpublish: (id) => http.patch(`/admin/articles/${id}`, { publishedAt: null }),

  // Массовое удаление статей
  bulkDelete: (data) => http.post("/admin/articles/bulk-delete", data),

  // Массовая публикация статей
  bulkPublish: (data) => http.patch("/admin/articles/bulk-publish", data),

  // Массовое снятие с публикации
  bulkUnpublish: (data) => http.patch("/admin/articles/bulk-unpublish", data),
};

