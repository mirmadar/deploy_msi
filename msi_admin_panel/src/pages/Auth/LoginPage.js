import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "./styles/LoginPage.styles";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Если уже авторизован - редирект на главную
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Валидация
    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Введите корректный email");
      return;
    }

    // Валидация пароля
    if (password.length < 8 || password.length > 16) {
      setError("Пароль должен быть от 8 до 16 символов");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(result.error || "Ошибка авторизации");
      }
    } catch (err) {
      setError("Произошла ошибка при авторизации");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Показываем загрузку, если проверяем авторизацию
  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.paper}>
        <Typography variant="h4" sx={styles.title}>
          MSI Admin Panel
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
          {error && (
            <Alert severity="error" sx={styles.alert}>
              {error}
            </Alert>
          )}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            disabled={isSubmitting}
            sx={styles.textField}
            autoComplete="email"
          />

          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            disabled={isSubmitting}
            sx={styles.textField}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={styles.submitButton}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Войти"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};


