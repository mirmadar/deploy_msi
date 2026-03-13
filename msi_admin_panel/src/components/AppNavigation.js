import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  Box,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { RoleGuard } from "./auth/RoleGuard";
import { styles } from "./styles/AppNavigation.styles";

export const AppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: "/products",
      label: "Товары",
    },
    {
      path: "/characteristics",
      label: "Характеристики",
    },
    {
      path: "/categories",
      label: "Категории товаров",
    },
    {
      path: "/service-categories",
      label: "Категории услуг",
    },
    {
      path: "/services",
      label: "Услуги",
    },
    {
      path: "/articles",
      label: "Статьи",
    },
    {
      path: "/orders",
      label: "Журнал заказов",
    },
    {
      path: "/cities",
      label: "Города",
    },
    {
      path: "/shipments",
      label: "Отгрузки",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Drawer
      variant="permanent"
      sx={styles.drawer}
      PaperProps={{
        sx: styles.drawerPaper,
      }}
    >
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Typography variant="h6" sx={styles.title}>
            MSI Admin
          </Typography>
        </Box>

        <Box sx={styles.menu}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <Typography
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={styles.menuItem(isSelected)}
              >
                {item.label}
              </Typography>
            );
          })}

          <RoleGuard roles="SUPER_ADMIN">
            <Typography
              onClick={() => navigate("/users")}
              sx={styles.menuItem(location.pathname === "/users")}
            >
              Пользователи
            </Typography>
          </RoleGuard>
        </Box>

        <Box sx={styles.footer}>
          {user && (
            <Box sx={styles.userInfo}>
              <Box sx={styles.userDetails}>
                <Typography variant="body2" sx={styles.userName}>
                  {user.username}
                </Typography>
                <Typography variant="caption" sx={styles.userEmail}>
                  {user.email}
                </Typography>
                {user.roles && user.roles.length > 0 && (
                  <Box sx={styles.rolesContainer}>
                    {user.roles.map((role, index) => (
                      <Chip
                        key={index}
                        label={role.value}
                        size="small"
                        sx={styles.roleChip}
                      />
                    ))}
                  </Box>
                )}
              </Box>
              <Box sx={styles.userActions}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<LockIcon />}
                  onClick={() => navigate("/change-password")}
                  sx={styles.changePasswordButton}
                >
                  Сменить пароль
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={styles.logoutButton}
                >
                  Выход
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
