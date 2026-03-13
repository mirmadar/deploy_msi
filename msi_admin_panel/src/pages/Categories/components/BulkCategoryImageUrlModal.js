import React, { useState } from "react";
import {
  Dialog,
  Button,
  TextField,
  Box,
  Typography,
  FormHelperText,
  CircularProgress,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { CategoriesApi } from "../../../api/categories.api";
import { styles } from "./styles/BulkCategoryImageUrlModal.styles";
import { http } from "../../../api/http";

export const BulkCategoryImageUrlModal = ({
  open,
  onClose,
  selectedCategories,
  onSuccess,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    // Позволяем пустую строку для очистки URL
    const urlValue = imageUrl.trim() || null;

    try {
      setError("");
      setLoading(true);
      await CategoriesApi.bulkUpdateImageUrl({
        categoryIds: selectedCategories,
        imageUrl: urlValue,
      });
      onSuccess();
      onClose();
      setImageUrl("");
    } catch (err) {
      console.error("Ошибка при обновлении URL изображений:", err);
      setError(
        err?.response?.data?.message || "Ошибка при обновлении URL изображений"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImageUrl("");
    setError("");
    onClose();
  };


  const handleClearUrl = () => {
    setImageUrl("");
    setError("");
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      const res = await http.post("/admin/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const urlFromResponse = res?.data?.imageUrl;
      if (urlFromResponse) {
        setImageUrl(urlFromResponse);
        setError("");
      }
    } catch (err) {
      console.error("Ошибка при загрузке изображения:", err);
      setError(
        err?.response?.data?.message ||
          "Ошибка при загрузке изображения. Попробуйте другой файл."
      );
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: styles.dialogPaper,
      }}
    >
      <Box sx={styles.dialogContent}>
        <Typography sx={styles.title}>
          Назначить URL изображений
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={styles.subtitle}>
          Выбрано категорий товаров: <strong>{selectedCategories.length}</strong>
        </Typography>

        <Box sx={styles.formContainer}>
          <TextField
            label="Изображение"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setError("");
            }}
            placeholder="Вставьте URL изображения или загрузите файл"
            fullWidth
            sx={styles.field}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Можно вставить URL изображения из S3 или загрузить файл с компьютера">
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
            helperText={
              imageUrl.trim()
                ? "Укажите изображение для всех выбранных категорий (URL или загруженный файл)"
                : "Оставьте поле пустым, чтобы очистить изображение у выбранных категорий товаров"
            }
          />
        </Box>

        {error && (
          <FormHelperText error sx={styles.errorText}>
            {error}
          </FormHelperText>
        )}

        <Box sx={styles.buttonsContainer}>
          <Button onClick={handleClose} disabled={loading}>
            Отмена
          </Button>
          {imageUrl.trim() && (
            <Button
              onClick={handleClearUrl}
              variant="outlined"
              color="secondary"
              disabled={loading}
            >
              Очистить
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Сохранение..." : "Применить"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

