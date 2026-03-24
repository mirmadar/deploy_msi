// src/App.js
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LoginPage } from "./pages/Auth/LoginPage";
import { ProductsList } from "./pages/Products/ProductsList";
import { CharacteristicNamesList } from "./pages/CharacteristicNames/CharacteristicNamesList";
import { CategoriesList } from "./pages/Categories/CategoriesList";
import { ServiceCategoriesList } from "./pages/ServiceCategories/ServiceCategoriesList";
import { ServicesList } from "./pages/Services/ServicesList";
import { ServiceEdit } from "./pages/Services/ServiceEdit";
import { ArticlesList } from "./pages/Articles/ArticlesList";
import { OrdersList } from "./pages/Orders/OrdersList";
import { UsersList } from "./pages/Users/UsersList";
import { ChangePassword } from "./pages/Users/ChangePassword";
import { CitiesList } from "./pages/Cities/CitiesList";
import { ShipmentsList } from "./pages/Shipments/ShipmentsList";
import { AppNavigation } from "./components/AppNavigation";
import { theme } from "./styles/mui-theme";

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const drawerWidth = AppNavigation.DRAWER_WIDTH || 220;

  const handleOpenMobileNav = () => setMobileNavOpen(true);
  const handleCloseMobileNav = () => setMobileNavOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Публичный роут - страница входа */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Защищенные роуты */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: "flex", minHeight: "100vh" }}>
                    {isDesktop ? (
                      <AppNavigation />
                    ) : (
                      <AppNavigation
                        variant="temporary"
                        open={mobileNavOpen}
                        onClose={handleCloseMobileNav}
                      />
                    )}
                    <Box
                      component="main"
                      sx={{
                        flexGrow: 1,
                        width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
                        bgcolor: "background.default",
                      }}
                    >
                      {!isDesktop && (
                        <AppBar
                          position="sticky"
                          color="inherit"
                          elevation={0}
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            top: 0,
                            zIndex: (muiTheme) => muiTheme.zIndex.drawer - 1,
                          }}
                        >
                          <Toolbar sx={{ minHeight: 56, px: 1.5 }}>
                            <IconButton
                              edge="start"
                              color="inherit"
                              aria-label="Открыть меню"
                              onClick={handleOpenMobileNav}
                              sx={{ mr: 1 }}
                            >
                              <MenuIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                              MSI Admin
                            </Typography>
                          </Toolbar>
                        </AppBar>
                      )}
                      <Container
                        maxWidth={false}
                        sx={{
                          mt: { xs: 1.5, md: 2 },
                          mb: 2,
                          px: { xs: 1, sm: 2, md: 3 },
                        }}
                      >
                        <Routes>
                          <Route
                            path="/"
                            element={<Navigate to="/products" replace />}
                          />
                          <Route path="/products" element={<ProductsList />} />
                          <Route
                            path="/characteristics"
                            element={<CharacteristicNamesList />}
                          />
                          <Route
                            path="/categories"
                            element={<CategoriesList />}
                          />
                          <Route
                            path="/service-categories"
                            element={<ServiceCategoriesList />}
                          />
                          <Route
                            path="/services"
                            element={<ServicesList />}
                          />
                          <Route
                            path="/services/:id/edit"
                            element={<ServiceEdit />}
                          />
                          <Route
                            path="/articles"
                            element={<ArticlesList />}
                          />
                          <Route
                            path="/orders"
                            element={<OrdersList />}
                          />
                          <Route
                            path="/cities"
                            element={<CitiesList />}
                          />
                          <Route
                            path="/shipments"
                            element={<ShipmentsList />}
                          />
                          <Route
                            path="/users"
                            element={
                              <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                                <UsersList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/change-password"
                            element={<ChangePassword />}
                          />
                          <Route
                            path="*"
                            element={<Navigate to="/products" replace />}
                          />
                        </Routes>
                      </Container>
                    </Box>
                  </Box>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
