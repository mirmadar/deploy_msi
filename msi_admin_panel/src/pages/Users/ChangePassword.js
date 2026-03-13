import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { UsersApi } from "../../api/users.api";
import { styles } from "./styles/ChangePassword.styles";

export const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 8 || pwd.length > 16) {
      return "Пароль должен быть от 8 до 16 символов";
    }
    // Проверка: минимум 1 буква и 1 цифра
    const hasLetter = /[a-zA-Zа-яА-Я]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    if (!hasLetter || !hasDigit) {
      return "Пароль должен содержать минимум 1 букву и 1 цифру";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Валидация
    if (!oldPassword) {
      setError("Введите текущий пароль");
      return;
    }

    if (!newPassword) {
      setError("Введите новый пароль");
      return;
    }

    if (oldPassword === newPassword) {
      setError("Новый пароль должен отличаться от старого");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      setSaving(true);
      await UsersApi.changePassword({
        oldPassword,
        newPassword,
      });

      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || "Ошибка при смене пароля";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Typography variant="h5" sx={styles.title}>
        Смена пароля
      </Typography>

      {success && (
        <Alert severity="success" sx={styles.alert}>
          Пароль успешно обновлен
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={styles.alert}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
        <TextField
          label="Текущий пароль"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          fullWidth
          required
          disabled={saving}
          sx={styles.textField}
          autoComplete="current-password"
        />

        <TextField
          label="Новый пароль"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          required
          disabled={saving}
          sx={styles.textField}
          helperText="8-16 символов, минимум 1 буква и 1 цифра"
          autoComplete="new-password"
        />

        <TextField
          label="Подтвердите новый пароль"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
          disabled={saving}
          sx={styles.textField}
          autoComplete="new-password"
        />

        <Box sx={styles.actions}>
          <Button
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving || !oldPassword || !newPassword || !confirmPassword}
          >
            {saving ? "Сохранение..." : "Изменить пароль"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

