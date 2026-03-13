import React from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

/**
 * Компонент для защиты роутов - требует авторизации
 */
export const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // Показываем загрузку во время проверки авторизации
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Если не авторизован - редирект на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если требуются определенные роли - проверяем их
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => hasRole(role));
    if (!hasRequiredRole) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <h2>Доступ запрещен</h2>
          <p>У вас нет прав для доступа к этому ресурсу</p>
        </Box>
      );
    }
  }

  return children;
};


