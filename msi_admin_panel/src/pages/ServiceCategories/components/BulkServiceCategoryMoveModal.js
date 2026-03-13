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
import { ServiceCategoriesApi } from "../../../api/service-categories.api";
import { styles } from "./styles/BulkServiceCategoryMoveModal.styles";

const getNodeId = (n) => n.id ?? n.serviceCategoryId;

const flattenTree = (nodes, excludeIds = [], parentPath = "") => {
  return nodes.flatMap((n) => {
    const id = getNodeId(n);
    if (excludeIds.includes(id)) return [];
    const displayPath = parentPath ? `${parentPath} / ${n.name}` : n.name;
    const item = { id, name: n.name, displayPath };
    const children = n.children?.length
      ? flattenTree(n.children, excludeIds, displayPath)
      : [];
    return [item, ...children];
  });
};

export const BulkServiceCategoryMoveModal = ({
  open,
  onClose,
  selectedCategories,
  onSuccess,
}) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchTree = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await ServiceCategoriesApi.getTree();
        const tree = res?.data ?? res ?? [];
        const flattened = flattenTree(tree, selectedCategories);
        const withRoot = [
          { id: null, name: "Корневой уровень", displayPath: "Корневой уровень" },
          ...flattened,
        ];
        setCategories(withRoot);
      } catch (err) {
        console.error("Ошибка загрузки категорий услуг:", err);
        setError("Не удалось загрузить категории услуг");
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [open, selectedCategories]);

  const handleApply = async () => {
    if (
      selectedCategory &&
      selectedCategory.id !== null &&
      selectedCategories.includes(selectedCategory.id)
    ) {
      setError("Нельзя перенести категорию услуг в саму себя");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await ServiceCategoriesApi.bulkMove({
        serviceCategoryIds: selectedCategories,
        newParentId: selectedCategory?.id ?? null,
      });
      onSuccess();
      onClose();
      setSelectedCategory(null);
    } catch (err) {
      console.error("Ошибка при переносе категорий услуг:", err);
      setError(
        err?.response?.data?.message ?? "Ошибка при переносе категорий услуг"
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
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: styles.dialogPaper }}>
      <Box sx={styles.dialogContent}>
        <Typography sx={styles.title}>
          Перенести выбранные категории услуг
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={styles.subtitle}>
          Выбрано категорий услуг: <strong>{selectedCategories.length}</strong>
        </Typography>

        <Box sx={styles.formContainer}>
          <Autocomplete
            options={categories}
            getOptionLabel={(option) =>
              option.id === null ? "Корневой уровень" : option.displayPath ?? option.name
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
                label="Категория назначения"
                placeholder="Выберите категорию или «Корневой уровень»"
                helperText="Выберите категорию услуг для переноса или «Корневой уровень» для перемещения в корень"
              />
            )}
            fullWidth
            noOptionsText="Категории услуг не найдены"
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
