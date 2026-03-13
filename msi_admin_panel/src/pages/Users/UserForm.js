import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import { UsersApi } from "../../api/users.api";
import { RolesApi } from "../../api/roles.api";
import { getFromCache, setToCache } from "../../utils/cache";
import { styles } from "./styles/UserForm.styles";

export const UserForm = ({ id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const ROLES_CACHE_KEY = "rolesList";
  const ROLES_TTL_MS = 120_000; // 2 минуты

  // Загружаем список ролей
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const cached = getFromCache(ROLES_CACHE_KEY);
        if (cached) {
          setRoles(cached);
          return;
        }

        const response = await RolesApi.list();
        const data = response.data || [];
        setRoles(data);
        setToCache(ROLES_CACHE_KEY, data, ROLES_TTL_MS);
      } catch (err) {
        console.error("Ошибка загрузки ролей:", err);
        setError("Не удалось загрузить список ролей");
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  // Загружаем данные пользователя при редактировании
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await UsersApi.get(id);
        const data = response.data;
        setEmail(data.email || "");
        setUsername(data.username || "");
        // При редактировании пароль не загружаем
        // Роль берем из первого элемента массива roles (по описанию бэкенда, при обновлении роли заменяются)
        if (data.roles && data.roles.length > 0) {
          setRole(data.roles[0].value || "");
        }
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные пользователя");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

    // Валидация
    if (!email.trim()) {
      setError("Email обязателен");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Введите корректный email");
      return;
    }

    if (!username.trim()) {
      setError("Имя пользователя обязательно");
      return;
    }

    // При создании пароль обязателен
    if (!id && !password) {
      setError("Пароль обязателен при создании");
      return;
    }

    // Валидация пароля при создании или изменении
    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    if (!role) {
      setError("Выберите роль");
      return;
    }

    try {
      setSaving(true);
      const data = {
        email: email.trim(),
        username: username.trim(),
        role: role,
      };

      // При создании добавляем пароль
      if (!id) {
        data.password = password;
      }

      if (id) {
        await UsersApi.update(id, data);
      } else {
        await UsersApi.create(data);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || "Ошибка при сохранении";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingRoles) {
    return (
      <Box sx={styles.loadingBox}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={styles.header}>
        <Typography variant="h5" fontWeight={600}>
          {id ? "Редактирование" : "Создание"} пользователя
        </Typography>
        <Button onClick={onClose} size="small">
          <CloseIcon />
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <Box sx={styles.form}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          disabled={saving}
          sx={styles.textField}
        />

        <TextField
          label="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
          disabled={saving}
          sx={styles.textField}
        />

        <FormControl fullWidth sx={styles.textField} required>
          <InputLabel>Роль</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            label="Роль"
            disabled={saving}
          >
            {roles.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.value} {r.description ? `- ${r.description}` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label={id ? "Новый пароль" : "Пароль"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required={!id}
          disabled={saving}
          sx={styles.textField}
          helperText={
            !id
              ? "8-16 символов, минимум 1 буква и 1 цифра"
              : "Оставьте пустым, чтобы не менять пароль"
          }
        />
      </Box>

      <Box sx={styles.actions}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={saving || !email.trim() || !username.trim() || !role}
        >
          Сохранить
        </Button>
      </Box>
    </form>
  );
};

