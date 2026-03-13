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
import { ServicesApi } from "../../api/services.api";
import { ServiceCategoriesApi } from "../../api/service-categories.api";
import { getFromCache, setToCache } from "../../utils/cache";
import { styles } from "./styles/ServiceForm.styles";

// Все категории услуг (любая категория: корень и подкатегории)
const flattenCategories = (tree, parentPath = "") => {
  const result = [];
  (tree || []).forEach((node) => {
    const id = node.id ?? node.serviceCategoryId;
    const path = parentPath ? `${parentPath} / ${node.name}` : node.name;
    result.push({ ...node, id, displayPath: path });
    if (node.children?.length) {
      result.push(...flattenCategories(node.children, path));
    }
  });
  return result;
};

export const ServiceForm = ({ id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const TREE_CACHE_KEY = "serviceCategoriesTree";
  const TREE_TTL_MS = 60_000; // 1 минута

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const cached = getFromCache(TREE_CACHE_KEY);
        if (cached) {
          const flatCached = flattenCategories(cached);
          setCategoryOptions(flatCached);
          return;
        }

        const res = await ServiceCategoriesApi.getTree();
        const tree = res?.data ?? res ?? [];
        const flat = flattenCategories(tree);
        setCategoryOptions(flat);
        setToCache(TREE_CACHE_KEY, tree, TREE_TTL_MS);
      } catch (err) {
        console.error("Не удалось загрузить категории услуг", err);
      }
    };
    fetchTree();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await ServicesApi.get(id);
        const data = res?.data ?? res;
        setName(data.name ?? "");
        const catId = data.serviceCategoryId;
        if (catId != null && categoryOptions.length > 0) {
          const cat = categoryOptions.find(
            (c) => (c.id ?? c.serviceCategoryId) === catId
          );
          setCategory(cat ?? null);
        } else {
          setCategory(null);
        }
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, categoryOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Название обязательно");
      return;
    }
    if (!category) {
      setError("Выберите категорию услуг");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const categoryId = category.id ?? category.serviceCategoryId;
      const data = {
        name: name.trim(),
        serviceCategoryId: categoryId,
      };

      if (id) {
        await ServicesApi.update(id, data);
      } else {
        await ServicesApi.create(data);
      }

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

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={styles.header}>
        <Typography variant="h5" fontWeight={600}>
          {id ? "Редактирование" : "Создание"} услуги
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
          placeholder="Например: Токарные работы"
        />

        <Autocomplete
          options={categoryOptions}
          getOptionLabel={(option) =>
            option?.displayPath ?? option?.name ?? ""
          }
          value={category}
          onChange={(_, newValue) => {
            setCategory(newValue);
            setError(null);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Категория услуг"
              required
              sx={styles.textField}
              helperText="Выберите категорию услуг"
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
          disabled={saving || !name.trim() || !category}
        >
          Сохранить
        </Button>
      </Box>
    </form>
  );
};
