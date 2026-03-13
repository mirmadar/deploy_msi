import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import { ServiceCategoriesApi } from "../../api/service-categories.api";
import { getFromCache, setToCache, clearCacheKey } from "../../utils/cache";
import { styles } from "./styles/ServiceCategoryForm.styles";

const normalizeNode = (node) => ({
  ...node,
  id: node.id ?? node.serviceCategoryId,
});

const flattenTree = (tree, parentPath = "") => {
  const result = [];
  (tree || []).forEach((node) => {
    const n = normalizeNode(node);
    const path = parentPath ? `${parentPath} / ${n.name}` : n.name;
    result.push({
      ...n,
      displayPath: path,
      pathItems: node.pathItems ?? [],
    });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, path));
    }
  });
  return result;
};

export const ServiceCategoryForm = ({ id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentCategory, setParentCategory] = useState(null);
  const [flatCategories, setFlatCategories] = useState([]);

  const TREE_CACHE_KEY = "serviceCategoriesTree";
  const TREE_TTL_MS = 60_000; // 1 минута

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const cached = getFromCache(TREE_CACHE_KEY);
        if (cached) {
          const flatCached = flattenTree(cached);
          const withRootCached = [
            {
              id: null,
              name: "Корневой уровень",
              displayPath: "Корневой уровень",
              pathItems: [],
            },
            ...flatCached,
          ];
          setFlatCategories(withRootCached);
          return;
        }

        const res = await ServiceCategoriesApi.getTree();
        const tree = res?.data ?? res ?? [];
        const flat = flattenTree(tree);
        const withRoot = [
          {
            id: null,
            name: "Корневой уровень",
            displayPath: "Корневой уровень",
            pathItems: [],
          },
          ...flat,
        ];
        setFlatCategories(withRoot);
        setToCache(TREE_CACHE_KEY, tree, TREE_TTL_MS);
      } catch (err) {
        console.error("Не удалось загрузить дерево категорий услуг", err);
      }
    };
    fetchTree();
  }, []);

  useEffect(() => {
    if (!id || flatCategories.length === 0) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await ServiceCategoriesApi.get(id);
        const data = res?.data ?? res;
        setName(data.name ?? "");
        setDescription(data.description ?? "");

        if (data.parentId != null) {
          const parent = flatCategories.find(
            (c) => (c.id ?? c.serviceCategoryId) === data.parentId
          );
          setParentCategory(parent ?? null);
        } else {
          const root = flatCategories.find((c) => c.id == null);
          setParentCategory(root ?? null);
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
        parentId: parentCategory?.id ?? parentCategory?.serviceCategoryId ?? null,
        description: description.trim() || undefined,
      };

      if (id) {
        await ServiceCategoriesApi.update(id, data);
      } else {
        await ServiceCategoriesApi.create(data);
      }

      // После изменения категорий услуг сбрасываем кэш дерева
      clearCacheKey(TREE_CACHE_KEY);

      onSuccess();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ?? "Ошибка при сохранении"
      );
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

  const parentOptions = flatCategories.filter((cat) => {
    if (!id) return true;
    const catId = cat.id ?? cat.serviceCategoryId;
    if (catId == null) return true;
    if (catId === id) return false;
    const pathIds = (cat.pathItems ?? []).map((p) => p.id ?? p.serviceCategoryId);
    return !pathIds.includes(id);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={styles.header}>
        <Typography variant="h5" fontWeight={600}>
          {id ? "Редактирование" : "Создание"} категории услуг
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
          placeholder="Например: Металлообработка"
        />

        <TextField
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={styles.textField}
          placeholder="Необязательно"
        />

        <Autocomplete
          options={parentOptions}
          getOptionLabel={(option) =>
            option?.displayPath ?? option?.name ?? ""
          }
          value={parentCategory}
          onChange={(_, newValue) => {
            setParentCategory(newValue);
            setError(null);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Родительская категория услуг"
              sx={styles.textField}
              helperText="Выберите родительскую категорию услуг или «Корневой уровень»"
            />
          )}
          fullWidth
          noOptionsText="Категории услуг не найдены"
          isOptionEqualToValue={(option, value) =>
            (option?.id ?? option?.serviceCategoryId) ===
            (value?.id ?? value?.serviceCategoryId)
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
