import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  TextField,
  FormHelperText,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { CategoriesApi } from "../../api/categories.api";
import { ProductsApi } from "../../api/products.api";
import { styles } from "./styles/BulkUpdateModal.styles";
import { http } from "../../api/http";
import { PRODUCT_UNITS_OPTIONS } from "../../utils/productUnits";
import { convertFiltersToBackendFormat } from "./utils/filterUtils";

export const BulkUpdateModal = ({
  open,
  onClose,
  selectedProducts,
  onSuccess,
  isSelectionByFilters = false,
  filters = null,
  confirmCount = null,
}) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [status, setStatus] = useState("");
  const [isNew, setIsNew] = useState("");
  const [unitOfMeasurement, setUnitOfMeasurement] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Преобразуем дерево категорий в плоский список (как в ProductEdit)
  const flattenCategories = (nodes) =>
    nodes.flatMap((n) =>
      n.children?.length
        ? flattenCategories(n.children)
        : [
            {
              id: n.categoryId,
              name: n.name,
              path: [...(n.pathItems || []), { id: n.categoryId, name: n.name }],
            },
          ]
    );

  // Загружаем категории при открытии модалки
  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        setError("");
        const res = await CategoriesApi.getTree();
        const catArray = res?.data || res || [];
        const flattened = flattenCategories(catArray);
        setCategories(flattened);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
        setError("Не удалось загрузить категории");
      }
    };

    fetchCategories();
  }, [open]);

  // Сброс формы при закрытии
  useEffect(() => {
    if (!open) {
      setSelectedCategory(null);
      setStatus("");
      setIsNew("");
      setUnitOfMeasurement("");
      setImageUrl("");
      setError("");
    }
  }, [open]);

  const handleApply = async () => {
    // Проверяем, что хотя бы одно поле заполнено
    if (
      !selectedCategory &&
      !status &&
      isNew === "" &&
      (!unitOfMeasurement || unitOfMeasurement === "") &&
      !imageUrl.trim()
    ) {
      setError("Заполните хотя бы одно поле для обновления");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // Собираем объект только с заполненными полями для обновления
      const updateData = {};

      // categoryId: отправляем только если выбрана категория (как число)
      if (selectedCategory) {
        const categoryIdNum = Number(selectedCategory.id);
        if (!isNaN(categoryIdNum)) {
          updateData.categoryId = categoryIdNum;
        }
      }

      // status: отправляем только если выбрано значение
      if (status && status !== "") {
        updateData.status = status;
      }

      // isNew: отправляем только если выбрано значение (boolean)
      if (isNew !== "") {
        updateData.isNew = isNew === "true";
      }

      // unit: отправляем только если выбрано значение
      if (unitOfMeasurement && unitOfMeasurement !== "") {
        updateData.unit = unitOfMeasurement;
      }

      // imageUrl: отправляем только если не пустая строка
      const trimmedImageUrl = imageUrl.trim();
      if (trimmedImageUrl) {
        updateData.imageUrl = trimmedImageUrl;
      }

      if (isSelectionByFilters && filters) {
        // Обновление по фильтрам
        const backendFilters = convertFiltersToBackendFormat(filters);
        await ProductsApi.bulkUpdateByFilters({
          filters: backendFilters,
          ...updateData,
          confirmCount: confirmCount,
        });
      } else {
        // Обычное обновление по ID
        const productIds = selectedProducts.map((id) => {
          const num = Number(id);
          if (isNaN(num)) {
            throw new Error(`Неверный ID товара: ${id}`);
          }
          return num;
        });

        await ProductsApi.bulkUpdate({
          productIds,
          ...updateData,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      // Пытаемся получить детальное сообщение об ошибке
      const errorMessage = 
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (Array.isArray(err?.response?.data?.message) 
          ? err.response.data.message.join(", ")
          : "Ошибка при массовом обновлении товаров");
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        "Ошибка при загрузке изображения. Попробуйте другой файл.";
      setError(errorMessage);
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setStatus("");
    setIsNew("");
    setUnitOfMeasurement("");
    setImageUrl("");
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
          {isSelectionByFilters ? "Обновить товары по фильтрам" : "Обновить выбранные товары"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={styles.subtitle}>
          {isSelectionByFilters ? (
            <>Будет обновлено товаров: <strong>{confirmCount?.toLocaleString("ru-RU") || 0}</strong></>
          ) : (
            <>Выбрано товаров: <strong>{selectedProducts.length}</strong></>
          )}
        </Typography>

        <Box sx={styles.formContainer}>
          <FormControl fullWidth sx={styles.field}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setError("");
              }}
              label="Статус"
            >
              <MenuItem value="">Не изменять</MenuItem>
              <MenuItem value="IN_STOCK">В наличии</MenuItem>
              <MenuItem value="OUT_OF_STOCK">Не в наличии</MenuItem>
              <MenuItem value="ARCHIVE">Архив</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={styles.field}>
            <InputLabel>Новинка</InputLabel>
            <Select
              value={isNew}
              onChange={(e) => {
                setIsNew(e.target.value);
                setError("");
              }}
              label="Новинка"
            >
              <MenuItem value="">Не изменять</MenuItem>
              <MenuItem value="true">Отметить как новинку</MenuItem>
              <MenuItem value="false">Снять отметку новинки</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={styles.field}>
            <InputLabel>Единица измерения</InputLabel>
            <Select
              value={unitOfMeasurement}
              onChange={(e) => {
                setUnitOfMeasurement(e.target.value);
                setError("");
              }}
              label="Единица измерения"
            >
              <MenuItem value="">Не изменять</MenuItem>
              {PRODUCT_UNITS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            options={categories}
            getOptionLabel={(option) =>
              option.path?.map((p) => p.name).join(" / ") || option.name
            }
            value={selectedCategory}
            onChange={(_, newValue) => {
              setSelectedCategory(newValue);
              setError("");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Категория"
                placeholder="Не изменять"
              />
            )}
            fullWidth
            noOptionsText="Категории не найдены"
            sx={styles.autocompleteField}
          />

          <TextField
            label="Изображение"
            placeholder="Не изменять"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setError("");
            }}
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
            helperText="Оставьте пустым, чтобы не изменять; вставьте URL или используйте загрузку справа"
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
          >
            {loading ? "Обновление..." : "Применить"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

