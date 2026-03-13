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
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { CategoriesApi } from "../../api/categories.api";
import { getFromCache, setToCache, clearCacheKey } from "../../utils/cache";
import { styles } from "./styles/CategoryForm.styles";
import { http } from "../../api/http";

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

export const CategoryForm = ({ id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [parentCategory, setParentCategory] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);

  const TREE_CACHE_KEY = "categoriesTree";
  const TREE_TTL_MS = 60_000; // 1 минута

  // Загружаем дерево категорий для выбора родителя (с кэшем)
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const cached = getFromCache(TREE_CACHE_KEY);
        if (cached) {
          setCategoryTree(cached);
          const flat = flattenCategoryTree(cached);
          const flatWithRoot = [
            {
              categoryId: null,
              name: "Корневой уровень",
              displayPath: "Корневой уровень",
              fullPath: "Корневой уровень",
              pathItems: [{ id: null, name: "Корневой уровень" }],
            },
            ...flat,
          ];
          setFlatCategories(flatWithRoot);
          return;
        }

        const res = await CategoriesApi.getTree();
        const tree = res?.data || res || [];
        setCategoryTree(tree);
        const flat = flattenCategoryTree(tree);
        // Добавляем опцию "Корневой уровень" в начало списка
        const flatWithRoot = [
          {
            categoryId: null,
            name: "Корневой уровень",
            displayPath: "Корневой уровень",
            fullPath: "Корневой уровень",
            pathItems: [{ id: null, name: "Корневой уровень" }],
          },
          ...flat,
        ];
        setFlatCategories(flatWithRoot);
        setToCache(TREE_CACHE_KEY, tree, TREE_TTL_MS);
      } catch (err) {
        console.error("Не удалось загрузить дерево категорий", err);
      }
    };
    fetchTree();
  }, []);

  // Загружаем данные категории для редактирования
  useEffect(() => {
    if (!id || flatCategories.length === 0) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await CategoriesApi.get(id);
        const data = res?.data || res;
        setName(data.name || "");
        setImageUrl(data.imageUrl || "");
        
        // Находим родительскую категорию в плоском списке
        if (data.parentId) {
          const parent = flatCategories.find(
            (cat) => cat.categoryId === data.parentId
          );
          if (parent) {
            setParentCategory(parent);
          } else {
            // Если не найдена (например, родитель был удален), устанавливаем null
            setParentCategory(null);
          }
        } else {
          // Если нет родителя, выбираем "Корневой уровень"
          const rootCategory = flatCategories.find(
            (cat) => cat.categoryId === null
          );
          setParentCategory(rootCategory || null);
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
    if (!name.trim()) {
      setError("Название обязательно");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const data = {
        name: name.trim(),
        imageUrl: imageUrl.trim() || null, // Отправляем null для очистки URL
        parentId: parentCategory?.categoryId || null,
      };

      if (id) {
        await CategoriesApi.update(id, data);
      } else {
        await CategoriesApi.create(data);
      }

      // После изменения категорий сбрасываем кэш дерева
      clearCacheKey(TREE_CACHE_KEY);

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
          {id ? "Редактирование" : "Создание"} категории товаров
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={styles.textField}
          placeholder="Например: Металлопрокат"
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
          helperText="Вставьте ссылку на изображение или используйте загрузку справа"
        />

        <Autocomplete
          options={flatCategories.filter((cat) => {
            // При редактировании исключаем текущую категорию
            if (!id) return true;
            // Разрешаем "Корневой уровень"
            if (cat.categoryId === null) return true;
            if (cat.categoryId === id) return false;
            // Исключаем все категории, у которых текущая категория в пути (дочерние)
            const pathIds = cat.pathItems?.map((p) => p.id) || [];
            return !pathIds.includes(id);
          })}
          getOptionLabel={(option) => option?.displayPath || option?.name || ""}
          value={parentCategory}
          onChange={(_, newValue) => {
            setParentCategory(newValue);
            setError(null);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Родительская категория товаров"
              sx={styles.textField}
              helperText="Выберите родительскую категорию товаров или 'Корневой уровень' для перемещения в корень"
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
          noOptionsText="Категории товаров не найдены"
          isOptionEqualToValue={(option, value) =>
            option?.categoryId === value?.categoryId
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
          disabled={saving || !name.trim()}
        >
          Сохранить
        </Button>
      </Box>
    </form>
  );
};

