import React from "react";
import { useRoles } from "../../hooks/useRoles";
import { Box, Typography } from "@mui/material";

/**
 * Компонент для условного рендеринга в зависимости от ролей
 * @param {React.ReactNode} children - Контент для отображения
 * @param {string|string[]} roles - Роль или массив ролей, которые требуются
 * @param {React.ReactNode} fallback - Контент для отображения, если роли нет
 */
export const RoleGuard = ({ children, roles, fallback = null }) => {
  const { hasRole } = useRoles();

  // Если roles - строка, преобразуем в массив
  const rolesArray = Array.isArray(roles) ? roles : [roles];

  // Проверяем, есть ли хотя бы одна из требуемых ролей
  const hasAccess = rolesArray.some((role) => hasRole(role));

  if (!hasAccess) {
    return fallback;
  }

  return children;
};


