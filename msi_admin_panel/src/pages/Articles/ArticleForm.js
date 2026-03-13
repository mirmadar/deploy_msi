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
import { Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ArticlesApi } from "../../api/articles.api";
import { styles } from "./styles/ArticleForm.styles";
import { http } from "../../api/http";

export const ArticleForm = ({ id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Загружаем данные статьи для редактирования
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await ArticlesApi.get(id);
        const data = res?.data || res;
        setTitle(data.title || "");
        setContent(data.content || "");
        setImageUrl(data.imageUrl || "");
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
    if (!title.trim()) {
      setError("Название обязательно");
      return;
    }
    if (!content.trim()) {
      setError("Содержание обязательно");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // При создании отправляем только title, content, imageUrl
      // Автор определяется автоматически на бэкенде
      const data = {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      };

      if (!id) {
        await ArticlesApi.create(data);
      } else {
        await ArticlesApi.update(id, data);
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

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setSaving(true);
      const res = await http.post("/admin/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const urlFromResponse = res?.data?.imageUrl;
      if (urlFromResponse) {
        setImageUrl(urlFromResponse);
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Ошибка при загрузке изображения. Попробуйте другой файл.",
      );
    } finally {
      setSaving(false);
      event.target.value = "";
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
          {id ? "Редактирование" : "Создание"} статьи
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
          label="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          sx={styles.textField}
          placeholder="Например: Новости компании"
        />

        <TextField
          label="Содержание"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          required
          multiline
          rows={10}
          sx={styles.textField}
          placeholder="Введите текст статьи..."
        />

        <TextField
          label="Изображение"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          fullWidth
          sx={styles.textField}
          placeholder="Вставьте URL изображения или загрузите файл"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Можно вставить URL изображения или загрузить файл с компьютера">
                  <IconButton
                    component="label"
                    size="small"
                    edge="end"
                    aria-label="Загрузить изображение"
                  >
                    <CloudUploadIcon fontSize="small" />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          helperText="Вставьте ссылку на изображение или используйте загрузку справа"
        />

        <Alert severity="info" sx={styles.infoAlert}>
          Статья будет сохранена как черновик. Вы сможете опубликовать её позже из списка статей.
        </Alert>
      </Box>

      <Box sx={styles.actions}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={saving || !title.trim() || !content.trim()}
        >
          Сохранить
        </Button>
      </Box>
    </form>
  );
};

