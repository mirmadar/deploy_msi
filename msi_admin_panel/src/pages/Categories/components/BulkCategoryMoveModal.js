import React, { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  Autocomplete,
  TextField,
  FormHelperText,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CategoriesApi } from "../../../api/categories.api";
import { styles } from "./styles/BulkCategoryMoveModal.styles";

export const BulkCategoryMoveModal = ({
  open,
  onClose,
  selectedCategories,
  onSuccess,
}) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Преобразуем дерево категорий в плоский список
  const flattenCategories = (nodes, excludeIds = []) => {
    return nodes.flatMap((n) => {
      // Исключаем выбранные категории и их дочерние
      if (excludeIds.includes(n.categoryId)) {
        return [];
      }
      
      const categoryItem = {
        id: n.categoryId,
        name: n.name,
        path: [...(n.pathItems || []), { id: n.categoryId, name: n.name }],
      };
      
      // Возвращаем текущую категорию и рекурсивно все дочерние
      const children = n.children?.length
        ? flattenCategories(n.children, excludeIds)
        : [];
      
      return [categoryItem, ...children];
    });
  };

  // Загружаем категории при открытии модалки
  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await CategoriesApi.getTree();
        const catArray = res?.data || res || [];
        // Исключаем выбранные категории и их дочерние
        const flattened = flattenCategories(catArray, selectedCategories);
        // Добавляем опцию "Корневой уровень" в начало списка
        const categoriesWithRoot = [
          { id: null, name: "Корневой уровень", path: [{ id: null, name: "Корневой уровень" }] },
          ...flattened,
        ];
        setCategories(categoriesWithRoot);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
        setError("Не удалось загрузить категории товаров");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [open, selectedCategories]);

  const handleApply = async () => {
    // Нельзя переносить в саму себя (если категория выбрана и не является корневым уровнем)
    if (
      selectedCategory &&
      selectedCategory.id !== null &&
      selectedCategories.includes(selectedCategory.id)
    ) {
      setError("Нельзя перенести категорию товаров в саму себя");
      return;
    }

    try {
      setError("");
      setLoading(true);
      // Используем новый бэкенд-эндпоинт для массового перемещения
      // selectedCategory.id может быть null для перемещения в корневой уровень
      await CategoriesApi.bulkMove({
        categoryIds: selectedCategories,
        newParentId: selectedCategory?.id ?? null,
      });
      onSuccess();
      onClose();
      setSelectedCategory(null);
    } catch (err) {
      console.error("Ошибка при переносе категорий:", err);
      setError(
        err?.response?.data?.message || "Ошибка при переносе категорий товаров"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setError("");
    onClose();
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
          Перенести выбранные категории товаров
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={styles.subtitle}>
          Выбрано категорий товаров: <strong>{selectedCategories.length}</strong>
        </Typography>

        <Box sx={styles.formContainer}>
          <Autocomplete
            options={categories}
            getOptionLabel={(option) =>
              option.id === null
                ? "Корневой уровень"
                : option.path?.map((p) => p.name).join(" / ") || option.name
            }
            value={selectedCategory}
            onChange={(_, newValue) => {
              setSelectedCategory(newValue);
              setError("");
            }}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Категория назначения (товаров)"
                placeholder="Начните вводить название категории товаров или выберите 'Корневой уровень'"
                helperText="Выберите категорию товаров для переноса или «Корневой уровень» для перемещения в корень"
              />
            )}
            fullWidth
            noOptionsText="Категории товаров не найдены"
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            sx={styles.autocompleteField}
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
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Перенос..." : "Перенести"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

