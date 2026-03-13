import { useAuth } from "./useAuth";

/**
 * Хук для проверки ролей пользователя
 */
export const useRoles = () => {
  const { hasRole, isSuperAdmin, user } = useAuth();

  return {
    hasRole,
    isSuperAdmin: isSuperAdmin(),
    userRoles: user?.roles || [],
  };
};


