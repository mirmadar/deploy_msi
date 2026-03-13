import { http } from "./http";

export const RolesApi = {
  /**
   * Получить список всех ролей (только SUPER_ADMIN)
   * @returns {Promise} - Список ролей
   */
  list() {
    return http.get("/admin/roles");
  },

  /**
   * Получить роль по значению (только SUPER_ADMIN)
   * @param {string} value - Значение роли (например, "SUPER_ADMIN")
   * @returns {Promise} - Данные роли
   */
  get(value) {
    return http.get(`/admin/roles/${value}`);
  },

  /**
   * Создать новую роль (только SUPER_ADMIN)
   * @param {Object} data - Данные роли
   * @param {string} data.value - Значение роли
   * @param {string} data.description - Описание роли
   * @returns {Promise} - Созданная роль
   */
  create(data) {
    return http.post("/admin/roles", data);
  },
};


