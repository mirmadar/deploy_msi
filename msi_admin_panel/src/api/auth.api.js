import { http } from "./http";

export const AuthApi = {
  /**
   * Авторизация пользователя
   * @param {Object} credentials - Данные для входа
   * @param {string} credentials.email - Email пользователя
   * @param {string} credentials.password - Пароль
   * @returns {Promise} - Ответ с токеном
   */
  login(credentials) {
    return http.post("/admin/auth", credentials);
  },
};


