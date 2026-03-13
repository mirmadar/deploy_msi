import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import Autocomplete from "@mui/material/Autocomplete";

import { ProductsApi } from "../../api/products.api";
import { CharacteristicNamesApi } from "../../api/characteristic-names.api";
import { CategoriesApi } from "../../api/categories.api";
import { styles } from "./styles/ProductEdit.styles";
import { http } from "../../api/http";
import { PRODUCT_UNITS_OPTIONS } from "../../utils/productUnits";

export const ProductEdit = ({ productId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState("IN_STOCK");
  const [imageUrl, setImageUrl] = useState("");

  const [characteristics, setCharacteristics] = useState([]);
  const [allCharacteristicNames, setAllCharacteristicNames] = useState([]);
  const [newCharName, setNewCharName] = useState("");
  const [newCharValue, setNewCharValue] = useState("");

  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // =======================
  // Загрузка данных
  // =======================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (productId) {
          const res = await ProductsApi.get(productId);
          const data = res.data;
          setName(data.name);
          setPrice(data.price);
          setUnit(data.unit || "");
          setIsNew(data.isNew);
          setStatus(data.status || "IN_STOCK");
          setImageUrl(data.imageUrl || "");
          setCharacteristics(
            data.characteristics.map((c) => ({
              id: c.id,
              name: c.name,
              value: c.value,
              valueType: c.valueType,
              isNew: false,
            }))
          );
          setSelectedCategory(data.categoryId || null);
        }

        // Загружаем категории
        const catRes = await CategoriesApi.getTree();
        const catArray = catRes?.data || catRes || [];
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
        setAllCategories(flattenCategories(catArray));

        // Загружаем имена характеристик (используем новый эндпоинт для получения полного списка)
        const namesRes = await CharacteristicNamesApi.getAllList({ sortOrder: 'asc' });
        // API возвращает массив характеристик
        const namesData = namesRes?.data || namesRes || [];
        setAllCharacteristicNames(
          (Array.isArray(namesData) ? namesData : []).map((n) => ({
            name: n.name,
            valueType: n.valueType,
          }))
        );
      } catch (err) {
        setError("Не удалось загрузить данные");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // =======================
  // Управление характеристиками
  // =======================
  const handleCharChange = (id, value) =>
    setCharacteristics((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value } : c))
    );

  const handleCharDelete = (id, isNew) =>
    setCharacteristics((prev) =>
      prev
        .filter((c) => (isNew ? c.id !== id : true))
        .map((c) => (c.id === id ? { ...c, _delete: !isNew } : c))
    );

  const handleAddNewChar = () => {
    if (!newCharName || !newCharValue) return;

    const charInfo = allCharacteristicNames.find((c) => c.name === newCharName);
    setCharacteristics([
      ...characteristics,
      {
        id: Date.now(),
        name: newCharName,
        value: newCharValue,
        valueType: charInfo?.valueType || "text",
        isNew: true,
      },
    ]);

    setNewCharName("");
    setNewCharValue("");
  };

  // =======================
  // Сохранение формы
  // =======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const characteristicsDto = {
        add: characteristics
          .filter((c) => c.isNew && !c._delete)
          .map((c) => ({ name: c.name, value: c.value })),
        update: characteristics
          .filter((c) => !c.isNew && !c._delete)
          .map((c) => ({ id: c.id, value: c.value })),
        delete: characteristics.filter((c) => c._delete).map((c) => c.id),
      };

      if (productId) {
        await ProductsApi.update(productId, {
          name,
          price: Number(price),
          unit: unit || null,
          isNew,
          status,
          imageUrl,
          categoryId: selectedCategory,
          characteristics: characteristicsDto,
        });
      } else {
        await ProductsApi.create({
          name,
          price: Number(price),
          unit: unit || null, // исправлено здесь!
          isNew,
          status,
          imageUrl,
          categoryId: selectedCategory,
          characteristics: characteristicsDto.add,
        });
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка при сохранении");
      console.error(err);
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
      // чтобы можно было выбрать тот же файл повторно
      event.target.value = "";
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );

  return (
    <form onSubmit={handleSubmit}>
      {/* Заголовок */}
      <Box sx={styles.header}>
        <Typography variant="h5" fontWeight="bold">
          {productId ? "Редактирование товара" : "Создание нового товара"}
        </Typography>
        <Button onClick={onClose}>
          <CloseIcon />
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      {/* Основная информация */}
      <Box sx={styles.section}>
        <Typography sx={styles.sectionTitle}>Основная информация</Typography>

        <TextField
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={styles.textField}
        />

        <TextField
          label="Цена, ₽"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          fullWidth
          required
          sx={styles.textField}
        />

        <FormControl fullWidth sx={styles.textField}>
          <InputLabel>Единица измерения</InputLabel>
          <Select
            value={unit}
            label="Единица измерения"
            onChange={(e) => setUnit(e.target.value)}
            >
            <MenuItem value="">Не указано</MenuItem>
            {PRODUCT_UNITS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          options={allCategories}
          getOptionLabel={(option) =>
            option.path?.map((p) => p.name).join(" / ") || option.name
          }
          value={allCategories.find((c) => c.id === selectedCategory) || null}
          onChange={(_, newVal) => setSelectedCategory(newVal?.id || null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Категория"
              placeholder="Начните вводить название категории"
              sx={styles.textField}
            />
          )}
          fullWidth
          noOptionsText="Категории не найдены"
        />

        <FormControl fullWidth sx={styles.textField}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={status}
            label="Статус"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="IN_STOCK">В наличии</MenuItem>
            <MenuItem value="OUT_OF_STOCK">Не в наличии</MenuItem>
            <MenuItem value="ARCHIVE">Архив</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Изображение"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          fullWidth
          placeholder="Вставьте URL изображения или загрузите файл"
          sx={styles.textField}
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
          helperText="Вставьте прямую ссылку на изображение или нажмите на иконку справа, чтобы загрузить файл"
        />

        <Box sx={styles.priceRow}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                color="success"
              />
            }
            label={
              <Chip
                label={isNew ? "Новинка" : "Новинка"}
                color={isNew ? "success" : "default"}
                size="small"
              />
            }
          />
        </Box>
      </Box>

      {/* Характеристики */}
      <Box sx={styles.section}>
        <Typography sx={styles.sectionTitle}>
          Характеристики ({characteristics.filter((c) => !c._delete).length})
        </Typography>

        {/* Список существующих характеристик */}
        {characteristics.filter((c) => !c._delete).length > 0 && (
          <Box sx={styles.characteristicsList}>
            {characteristics
              .filter((c) => !c._delete)
              .map((c) => (
                <Box key={c.id} sx={styles.characteristicItem}>
                  <TextField
                    label={c.name}
                    value={c.value}
                    onChange={(e) => handleCharChange(c.id, e.target.value)}
                    placeholder="Введите значение"
                    fullWidth
                    type={c.valueType === "number" ? "number" : "text"}
                    sx={styles.characteristicInput}
                  />
                  <Button
                    color="error"
                    size="small"
                    onClick={() => handleCharDelete(c.id, c.isNew)}
                    sx={styles.charDeleteButton}
                  >
                    Удалить
                  </Button>
                </Box>
              ))}
          </Box>
        )}

        {/* Форма добавления новой характеристики */}
        <Box sx={styles.addCharacteristicSection}>
          <Box sx={styles.addCharForm}>
            <Autocomplete
              options={allCharacteristicNames}
              getOptionLabel={(option) => option.name || ""}
              value={
                allCharacteristicNames.find((c) => c.name === newCharName) ||
                null
              }
              onChange={(_, newValue) => setNewCharName(newValue?.name || "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Выберите характеристику"
                  sx={styles.charSelect}
                />
              )}
              fullWidth
              noOptionsText="Характеристики не найдены"
            />
            <TextField
              value={newCharValue}
              onChange={(e) => setNewCharValue(e.target.value)}
              placeholder="Значение"
              fullWidth
              type={
                allCharacteristicNames.find((c) => c.name === newCharName)
                  ?.valueType === "number"
                  ? "number"
                  : "text"
              }
              sx={styles.charValueInput}
            />
            <Box sx={styles.addButtonRow}>
              <Button
                variant="contained"
                size="small"
                onClick={handleAddNewChar}
                disabled={!newCharName || !newCharValue}
                startIcon={<AddIcon />}
                sx={styles.addButton}
              >
                Добавить
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Действия */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={saving || !name || !price}
        >
          Сохранить
        </Button>
      </Box>
    </form>
  );
};
