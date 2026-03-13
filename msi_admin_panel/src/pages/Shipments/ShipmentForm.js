import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
  Avatar,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Save as SaveIcon, Close as CloseIcon, Image as ImageIcon, CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { ShipmentsApi } from "../../api/shipments.api";
import { CategoriesApi } from "../../api/categories.api";
import { http } from "../../api/http";
import { getFromCache, setToCache } from "../../utils/cache";
import { styles } from "./styles/ShipmentForm.styles";

// Функция для преобразования дерева в плоский список для Autocomplete
const flattenCategoryTree = (tree, parentPath = "") => {
  const result = [];
  tree.forEach((node) => {
    const path = parentPath ? `${parentPath} / ${node.name}` : node.name;
    result.push({
      ...node,
      displayPath: path,
      fullPath: node.pathItems.map((p) => p.name).join(" / "),
    });
    if (node.children && node.children.length > 0) {
      result.push(...flattenCategoryTree(node.children, path));
    }
  });
  return result;
};

export const ShipmentForm = ({ id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const TREE_CACHE_KEY = "categoriesTree";
  const TREE_TTL_MS = 60_000; // 1 минута

  // Загружаем дерево категорий для выбора (с кэшем)
  useEffect(() => {
    const fetchTree = async () => {
      try {
        setCategoriesLoading(true);
        const cached = getFromCache(TREE_CACHE_KEY);
        if (cached) {
          setCategoryTree(cached);
          const flatCached = flattenCategoryTree(cached);
          setFlatCategories(flatCached);
          return;
        }

        const res = await CategoriesApi.getTree();
        const tree = res?.data || res || [];
        setCategoryTree(tree);
        const flat = flattenCategoryTree(tree);
        setFlatCategories(flat);
        setToCache(TREE_CACHE_KEY, tree, TREE_TTL_MS);
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить категории");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchTree();
  }, []);

  // Загружаем данные поста отгрузки для редактирования
  useEffect(() => {
    if (!id || flatCategories.length === 0) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await ShipmentsApi.get(id);
        const data = res?.data || res;
        setTitle(data.title || "");
        setDescription(data.description || "");
        setImageUrl(data.imageUrl || "");

        // Находим выбранную категорию в плоском списке
        if (data.categoryId) {
          const category = flatCategories.find(
            (cat) => cat.categoryId === data.categoryId
          );
          if (category) {
            setSelectedCategory(category);
          } else {
            setSelectedCategory(null);
          }
        } else {
          setSelectedCategory(null);
        }
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, flatCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Название обязательно");
      return;
    }
    if (!description.trim()) {
      setError("Описание обязательно");
      return;
    }
    if (!selectedCategory) {
      setError("Категория обязательна");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const data = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || null,
        categoryId: selectedCategory.categoryId,
      };

      if (!id) {
        await ShipmentsApi.create(data);
      } else {
        await ShipmentsApi.update(id, data);
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
          {id ? "Редактирование" : "Создание"} поста отгрузки
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
          placeholder="Например: Отгрузка товаров"
        />

        <TextField
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          required
          multiline
          rows={10}
          sx={styles.textFieldMultiline}
          placeholder="Краткое описание отгрузки"
        />

        <TextField
          label="URL изображения"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          fullWidth
          sx={styles.textField}
          placeholder="Вставьте ссылку или загрузите изображение с компьютера"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Загрузить изображение с компьютера">
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
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("image", file);
                        try {
                          const res = await http.post("/admin/upload/image", formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                          });
                          const urlFromResponse = res?.data?.imageUrl;
                          if (urlFromResponse) setImageUrl(urlFromResponse);
                        } catch (err) {
                          console.error("Ошибка при загрузке изображения", err);
                        } finally {
                          e.target.value = "";
                        }
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        <Autocomplete
          options={flatCategories}
          getOptionLabel={(option) => option?.displayPath || option?.name || ""}
          value={selectedCategory}
          onChange={(_, newValue) => {
            setSelectedCategory(newValue);
            setError(null);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Категория"
              required
              sx={styles.textField}
              disabled={categoriesLoading}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box sx={styles.optionContent}>
                {option.imageUrl && (
                  <Avatar
                    src={option.imageUrl}
                    sx={styles.optionAvatar}
                    variant="rounded"
                  >
                    <ImageIcon />
                  </Avatar>
                )}
                <Typography>{option.displayPath || option.name}</Typography>
              </Box>
            </Box>
          )}
          fullWidth
          noOptionsText="Категории не найдены"
          isOptionEqualToValue={(option, value) =>
            option?.categoryId === value?.categoryId
          }
          disabled={categoriesLoading}
        />

        <Alert severity="info" sx={styles.infoAlert}>
          Пост будет сохранён как черновик. Опубликовать его можно из списка отгрузок.
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
          disabled={saving || !title.trim() || !description.trim() || !selectedCategory}
        >
          Сохранить
        </Button>
      </Box>
    </form>
  );
};

