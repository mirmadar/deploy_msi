/**
 * Утилиты для работы с JWT токеном
 */

const TOKEN_KEY = "authToken";

/**
 * Сохранить токен в localStorage
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Получить токен из localStorage
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Удалить токен из localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Декодировать JWT токен (без проверки подписи)
 * @param {string} token - JWT токен
 * @returns {object|null} - Декодированные данные или null
 */
export const decodeToken = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};

/**
 * Проверить, истек ли токен
 * @param {string} token - JWT токен
 * @returns {boolean} - true если токен истек или невалиден
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Получить данные пользователя из токена
 * @param {string} token - JWT токен
 * @returns {object|null} - Данные пользователя или null
 */
export const getUserFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    userId: decoded.userId,
    email: decoded.email,
    username: decoded.username,
    roles: decoded.roles || [],
  };
};


