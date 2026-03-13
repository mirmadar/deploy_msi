// src/api/orders.api.js
import { http } from "./http";

export const OrdersApi = {
  // Получить список заказов (с пагинацией и фильтрами)
  // params: { page, pageSize, search, orderNumber, clientName, clientEmail, clientPhone, companyEmailSent, clientEmailSent, bitrixSent, dateFrom, dateTo }
  list: (params) => http.get("/admin/orders", { params }),

  // Получить заказ по номеру
  get: (orderNumber) => http.get(`/admin/orders/${orderNumber}`),

  // Повторная отправка email клиенту
  resendClientEmail: (orderNumber) =>
    http.post(`/admin/orders/${orderNumber}/resend-client-email`),

  // Повторная отправка email компании
  resendCompanyEmail: (orderNumber) =>
    http.post(`/admin/orders/${orderNumber}/resend-company-email`),

  // Повторная отправка в Bitrix24
  resendBitrix: (orderNumber) =>
    http.post(`/admin/orders/${orderNumber}/resend-bitrix`),
};








