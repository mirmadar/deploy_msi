// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Container, Box } from "@mui/material";
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
  const drawerWidth = 220;

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
                    <AppNavigation />
                    <Box
                      component="main"
                      sx={{
                        flexGrow: 1,
                        width: `calc(100% - ${drawerWidth}px)`,
                        bgcolor: "background.default",
                      }}
                    >
                      <Container
                        maxWidth={false}
                        sx={{ mt: 2, mb: 2, px: { xs: 1, sm: 2, md: 3 } }}
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
