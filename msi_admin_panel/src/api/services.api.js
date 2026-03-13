// src/api/services.api.js
import { http } from "./http";

const basePath = "/admin/services";

export const ServicesApi = {
  // Список (?page=1&limit=25&serviceCategoryId=...)
  list: (params) => http.get(basePath, { params }),

  // Одна услуга с category и blocks (блоки по sortOrder)
  get: (id) => http.get(`${basePath}/${id}`),

  // Создание (body: name, serviceCategoryId); порядок назначается автоматически
  create: (data) => http.post(basePath, data),

  // Обновление (sortOrder в теле не принимается)
  update: (id, data) => http.patch(`${basePath}/${id}`, data),

  // Сдвиг по порядку: body { direction: "up" | "down" }
  move: (id, data) => http.patch(`${basePath}/${id}/move`, data),

  // Удаление
  remove: (id) => http.delete(`${basePath}/${id}`),

  // Массовый перенос: { serviceIds: number[], newServiceCategoryId: number }
  bulkMove: (data) => http.patch(`${basePath}/bulk/move`, data),

  // Массовое удаление: { serviceIds: number[] }
  bulkRemove: (data) => http.delete(`${basePath}/bulk`, { data }),

  // Блоки
  addBlock: (serviceId, data) =>
    http.post(`${basePath}/${serviceId}/blocks`, data),

  reorderBlocks: (serviceId, data) =>
    http.patch(`${basePath}/${serviceId}/blocks/reorder`, data),

  updateBlock: (serviceId, blockId, data) =>
    http.patch(`${basePath}/${serviceId}/blocks/${blockId}`, data),

  removeBlock: (serviceId, blockId) =>
    http.delete(`${basePath}/${serviceId}/blocks/${blockId}`),
};
