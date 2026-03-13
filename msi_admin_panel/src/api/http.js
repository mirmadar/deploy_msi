// src/api/http.js
import axios from "axios";
import { getToken, removeToken, isTokenExpired } from "../utils/token";

export const http = axios.create({
  baseURL: "http://localhost:3000",
});

// Request interceptor - добавляем токен к каждому запросу
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Проверяем, не истек ли токен
    if (token && isTokenExpired(token)) {
      removeToken();
      // Редирект будет обработан в response interceptor
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обрабатываем ошибки авторизации
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // 401 - неавторизован, очищаем токен
      if (status === 401) {
        removeToken();
        // Редирект на страницу входа будет обработан в компонентах
        window.location.href = "/login";
      }
      
      // 403 - нет прав, можно показать сообщение
      // Обработка будет в компонентах
    }
    
    return Promise.reject(error);
  }
);
