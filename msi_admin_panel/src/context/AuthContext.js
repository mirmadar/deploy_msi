import React, { createContext, useState, useEffect, useCallback } from "react";
import { AuthApi } from "../api/auth.api";
import { UsersApi } from "../api/users.api";
import {
  getToken,
  setToken,
  removeToken,
  getUserFromToken,
  isTokenExpired,
} from "../utils/token";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация - проверяем токен при загрузке
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Проверяем, не истек ли токен
      if (isTokenExpired(storedToken)) {
        removeToken();
        setIsLoading(false);
        return;
      }

      // Получаем данные пользователя из токена
      const userData = getUserFromToken(storedToken);
      if (userData) {
        setUser(userData);
        setTokenState(storedToken);
      }

      // Опционально: запрашиваем актуальные данные с сервера
      try {
        const response = await UsersApi.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        // Если запрос не удался, используем данные из токена
        console.error("Ошибка получения данных пользователя:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Авторизация пользователя
   */
  const login = useCallback(async (email, password) => {
    try {
      const response = await AuthApi.login({ email, password });
      const { token: newToken } = response.data;

      // Сохраняем токен
      setToken(newToken);
      setTokenState(newToken);

      // Получаем данные пользователя из токена
      const userData = getUserFromToken(newToken);
      if (userData) {
        setUser(userData);
      }

      // Опционально: запрашиваем актуальные данные с сервера
      try {
        const userResponse = await UsersApi.getCurrentUser();
        setUser(userResponse.data);
      } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
      }

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Ошибка авторизации";
      return { success: false, error: message };
    }
  }, []);

  /**
   * Выход из системы
   */
  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  /**
   * Обновить данные пользователя
   */
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  /**
   * Проверить, имеет ли пользователь указанную роль
   */
  const hasRole = useCallback(
    (role) => {
      if (!user || !user.roles) return false;
      return user.roles.some((r) => r.value === role);
    },
    [user]
  );

  /**
   * Проверить, является ли пользователь SUPER_ADMIN
   */
  const isSuperAdmin = useCallback(() => {
    return hasRole("SUPER_ADMIN");
  }, [hasRole]);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
    hasRole,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

