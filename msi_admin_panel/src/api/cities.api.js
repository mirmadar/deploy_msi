// src/api/cities.api.js
import { http } from "./http";

export const CitiesApi = {
  // Получить список городов (с пагинацией)
  // params: { page, pageSize }
  list: (params) => http.get("/admin/cities", { params }),

  // Получить город по ID
  get: (id) => http.get(`/admin/cities/${id}`),

  // Создать город
  create: (data) => http.post("/admin/cities", data),

  // Обновить город
  update: (id, data) => http.patch(`/admin/cities/${id}`, data),

  // Удалить город
  remove: (id) => http.delete(`/admin/cities/${id}`),

  // Изменить порядок: тело { direction: "up" | "down" }
  move: (id, data) => http.patch(`/admin/cities/${id}/move`, data),
};

