import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Save as SaveIcon, Close as CloseIcon, Info as InfoIcon } from "@mui/icons-material";
import { CitiesApi } from "../../api/cities.api";
import { styles } from "./styles/CityForm.styles";

export const CityForm = ({ id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [workHours, setWorkHours] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await CitiesApi.get(id);
        const data = res?.data || res;
        setName(data.name || "");
        setSlug(data.slug || "");
        setPhone(data.phone || "");
        setWorkHours(data.workHours || "");
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Название города обязательно");
      return;
    }
    if (!slug.trim()) {
      setError("Slug обязателен");
      return;
    }
    if (!phone.trim()) {
      setError("Телефон обязателен");
      return;
    }

    // Валидация slug: только строчные латинские буквы, цифры и дефисы
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
      setError("Slug может содержать только строчные латинские буквы, цифры и дефисы");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const data = {
        name: name.trim(),
        slug: slug.trim(),
        phone: phone.trim(),
        workHours: workHours.trim() || null,
      };

      if (!id) {
        await CitiesApi.create(data);
      } else {
        await CitiesApi.update(id, data);
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

  if (loading) {
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
          {id ? "Редактирование" : "Создание"} города
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
          label="Название города"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={styles.textField}
          placeholder="Например: Москва"
        />

        <TextField
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          fullWidth
          required
          sx={styles.textField}
          placeholder="Например: moscow"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip
                  title="Slug - это уникальный идентификатор города в URL. Может содержать только строчные латинские буквы, цифры и дефисы. Например: moscow, saint-petersburg"
                  arrow
                >
                  <IconButton size="small" edge="end">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          helperText="Только строчные латинские буквы, цифры и дефисы"
        />

        <TextField
          label="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          required
          sx={styles.textField}
          placeholder="Например: +7 (495) 123-45-67"
        />

        <TextField
          label="Часы работы"
          value={workHours}
          onChange={(e) => setWorkHours(e.target.value)}
          fullWidth
          sx={styles.textField}
          placeholder="Например: Пн-Пт: 9:00-18:00"
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
          disabled={saving || !name.trim() || !slug.trim() || !phone.trim()}
        >
          Сохранить
        </Button>
      </Box>
    </form>
  );
};







