import { http } from "./http";

export const UsersApi = {
  /**
   * Получить текущего пользователя
   * @returns {Promise} - Данные текущего пользователя
   */
  getCurrentUser() {
    return http.get("/admin/users/me");
  },

  /**
   * Получить список всех пользователей (только SUPER_ADMIN)
   * @returns {Promise} - Список пользователей
   */
  list() {
    return http.get("/admin/users");
  },

  /**
   * Получить пользователя по ID (только SUPER_ADMIN)
   * @param {number} id - ID пользователя
   * @returns {Promise} - Данные пользователя
   */
  get(id) {
    return http.get(`/admin/users/${id}`);
  },

  /**
   * Создать нового пользователя (только SUPER_ADMIN)
   * @param {Object} data - Данные пользователя
   * @param {string} data.email - Email
   * @param {string} data.username - Имя пользователя
   * @param {string} data.password - Пароль
   * @param {string} data.role - Роль
   * @returns {Promise} - Созданный пользователь
   */
  create(data) {
    return http.post("/admin/users", data);
  },

  /**
   * Обновить пользователя (только SUPER_ADMIN)
   * @param {number} id - ID пользователя
   * @param {Object} data - Данные для обновления
   * @param {string} [data.email] - Новый email
   * @param {string} [data.username] - Новое имя пользователя
   * @param {string} [data.role] - Новая роль
   * @returns {Promise} - Обновленный пользователь
   */
  update(id, data) {
    return http.patch(`/admin/users/${id}`, data);
  },

  /**
   * Удалить пользователя (только SUPER_ADMIN)
   * @param {number} id - ID пользователя
   * @returns {Promise} - Сообщение об успешном удалении
   */
  remove(id) {
    return http.delete(`/admin/users/${id}`);
  },

  /**
   * Изменить пароль текущего пользователя
   * @param {Object} data - Данные для смены пароля
   * @param {string} data.oldPassword - Старый пароль
   * @param {string} data.newPassword - Новый пароль
   * @returns {Promise} - Сообщение об успешной смене пароля
   */
  changePassword(data) {
    return http.patch("/admin/users/me/password", data);
  },
};


