import React, { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { CategoryFiltersApi } from "../../../api/category-filters.api";
import { CharacteristicNamesApi } from "../../../api/characteristic-names.api";
import { styles } from "./styles/CategoryFiltersModal.styles";

export const CategoryFiltersModal = ({ open, onClose, categoryId, categoryName }) => {
  const [filters, setFilters] = useState([]);
  const [initialFilters, setInitialFilters] = useState([]);
  const [characteristics, setCharacteristics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCharacteristic, setSelectedCharacteristic] = useState(null);
  const [loadingCharacteristics, setLoadingCharacteristics] = useState(false);
  const [tempIdCounter, setTempIdCounter] = useState(0);

  // Загружаем список характеристик
  useEffect(() => {
    const fetchCharacteristics = async () => {
      setLoadingCharacteristics(true);
      try {
        const res = await CharacteristicNamesApi.getAllList({ sortOrder: "asc" });
        const data = res?.data || res || [];
        setCharacteristics(data);
      } catch (err) {
        console.error("Не удалось загрузить характеристики", err);
        setError("Не удалось загрузить список характеристик");
      } finally {
        setLoadingCharacteristics(false);
      }
    };

    if (open) {
      fetchCharacteristics();
    }
  }, [open]);

  // Загружаем фильтры категории
  useEffect(() => {
    const fetchFilters = async () => {
      if (!categoryId || !open) return;

      setLoading(true);
      setError(null);
      try {
        const res = await CategoryFiltersApi.getCategoryFilters(categoryId);
        const data = res?.data || res || [];
        setFilters(data);
        setInitialFilters(JSON.parse(JSON.stringify(data))); // Глубокая копия для сравнения
      } catch (err) {
        console.error(err);
        const errorMessage =
          err?.response?.data?.message || "Не удалось загрузить фильтры";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [categoryId, open]);

  // Очищаем состояние при закрытии
  useEffect(() => {
    if (!open) {
      setFilters([]);
      setInitialFilters([]);
      setError(null);
      setSelectedCharacteristic(null);
      setTempIdCounter(0);
    }
  }, [open]);

  const handleAddFilter = () => {
    if (!selectedCharacteristic) {
      setError("Выберите характеристику");
      return;
    }

    // Проверяем, не добавлена ли уже эта характеристика
    const exists = filters.some(
      (f) => f.characteristicName.characteristicNameId === selectedCharacteristic.characteristicNameId
    );

    if (exists) {
      setError("Эта характеристика уже добавлена как фильтр");
      return;
    }

    setError(null);

    // Добавляем фильтр локально с временным ID
    const maxOrder = filters.length > 0 
      ? Math.max(...filters.map(f => f.displayOrder || 0))
      : 0;
    
    const newFilter = {
      categoryFilterId: `temp_${tempIdCounter}`,
      categoryId,
      characteristicName: {
        characteristicNameId: selectedCharacteristic.characteristicNameId,
        name: selectedCharacteristic.name,
      },
      displayOrder: maxOrder + 1,
      _isNew: true, // Флаг для отслеживания новых фильтров
    };

    setFilters([...filters, newFilter]);
    setTempIdCounter(prev => prev + 1);
    setSelectedCharacteristic(null);
  };

  const handleMoveUp = (filterId, currentOrder) => {
    if (currentOrder <= 1) return;

    setError(null);
    setFilters(prevFilters => {
      const newFilters = [...prevFilters];
      const currentIndex = newFilters.findIndex(f => f.categoryFilterId === filterId);
      
      if (currentIndex > 0) {
        // Меняем местами с предыдущим
        const temp = newFilters[currentIndex];
        newFilters[currentIndex] = newFilters[currentIndex - 1];
        newFilters[currentIndex - 1] = temp;
        
        // Обновляем порядок
        newFilters.forEach((f, idx) => {
          f.displayOrder = idx + 1;
        });
      }
      
      return newFilters;
    });
  };

  const handleMoveDown = (filterId, currentOrder) => {
    if (currentOrder >= filters.length) return;

    setError(null);
    setFilters(prevFilters => {
      const newFilters = [...prevFilters];
      const currentIndex = newFilters.findIndex(f => f.categoryFilterId === filterId);
      
      if (currentIndex < newFilters.length - 1) {
        // Меняем местами со следующим
        const temp = newFilters[currentIndex];
        newFilters[currentIndex] = newFilters[currentIndex + 1];
        newFilters[currentIndex + 1] = temp;
        
        // Обновляем порядок
        newFilters.forEach((f, idx) => {
          f.displayOrder = idx + 1;
        });
      }
      
      return newFilters;
    });
  };

  const handleDeleteFilter = (filterId) => {
    setError(null);
    setFilters(prevFilters => {
      const newFilters = prevFilters.filter(f => f.categoryFilterId !== filterId);
      // Обновляем порядок
      newFilters.forEach((f, idx) => {
        f.displayOrder = idx + 1;
      });
      return newFilters;
    });
  };

  // Получаем доступные характеристики (исключая уже добавленные)
  const availableCharacteristics = characteristics.filter(
    (char) =>
      !filters.some(
        (f) => f.characteristicName.characteristicNameId === char.characteristicNameId
      )
  );

  // Проверяем, есть ли изменения
  const hasChanges = () => {
    if (filters.length !== initialFilters.length) return true;
    
    // Проверяем новые фильтры
    const hasNewFilters = filters.some(f => f._isNew);
    if (hasNewFilters) return true;
    
    // Проверяем удаленные фильтры
    const deletedFilters = initialFilters.filter(initial => 
      !filters.some(f => f.categoryFilterId === initial.categoryFilterId)
    );
    if (deletedFilters.length > 0) return true;
    
    // Проверяем изменение порядка
    for (let i = 0; i < filters.length; i++) {
      const current = filters[i];
      const initial = initialFilters.find(f => f.categoryFilterId === current.categoryFilterId);
      if (!initial || initial.displayOrder !== current.displayOrder) {
        return true;
      }
    }
    
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Определяем, что нужно сделать
      const newFilters = filters.filter(f => f._isNew);
      const deletedFilters = initialFilters.filter(initial => 
        !filters.some(f => f.categoryFilterId === initial.categoryFilterId)
      );
      
      // Проверяем изменение порядка для существующих фильтров
      const orderUpdates = filters
        .filter(f => !f._isNew)
        .filter(f => {
          const initial = initialFilters.find(init => init.categoryFilterId === f.categoryFilterId);
          return initial && initial.displayOrder !== f.displayOrder;
        });

      // Подготавливаем данные для массового обновления
      const bulkData = {
        categoryId,
      };

      // Добавляем создание фильтров
      if (newFilters.length > 0) {
        bulkData.create = newFilters.map(filter => ({
          characteristicNameId: filter.characteristicName.characteristicNameId,
          ...(filter.displayOrder && { displayOrder: filter.displayOrder }),
        }));
      }

      // Добавляем удаление фильтров
      if (deletedFilters.length > 0) {
        bulkData.delete = deletedFilters.map(filter => filter.categoryFilterId);
      }

      // Добавляем обновление порядка
      if (orderUpdates.length > 0) {
        bulkData.update = orderUpdates.map(filter => ({
          filterId: filter.categoryFilterId,
          displayOrder: filter.displayOrder,
        }));
      }

      // Используем новый бэкенд-эндпоинт для массового обновления
      await CategoryFiltersApi.bulkUpdateFilters(bulkData);

      // Обновляем список фильтров с сервера
      const res = await CategoryFiltersApi.getCategoryFilters(categoryId);
      const data = res?.data || res || [];
      setFilters(data);
      setInitialFilters(JSON.parse(JSON.stringify(data)));
      
      // Закрываем модальное окно после успешного сохранения
      onClose();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || "Не удалось сохранить изменения";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: styles.dialogPaper,
      }}
    >
      <Box sx={styles.dialogContent}>
        {/* Заголовок */}
        <Box sx={styles.header}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Фильтры категории товаров
            </Typography>
            {categoryName && (
              <Typography variant="body2" color="text.secondary" sx={styles.categoryName}>
                {categoryName}
              </Typography>
            )}
          </Box>
          <Button onClick={onClose}>
            <CloseIcon />
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={styles.errorAlert} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Форма добавления фильтра */}
        <Box sx={styles.addFilterSection}>
          <Typography variant="subtitle2" sx={styles.sectionTitle}>
            Добавить фильтр
          </Typography>
          <Box sx={styles.addFilterRow}>
            <Autocomplete
              options={availableCharacteristics}
              getOptionLabel={(option) => option.name}
              value={selectedCharacteristic}
              onChange={(_, newValue) => {
                setSelectedCharacteristic(newValue);
                setError(null);
              }}
              loading={loadingCharacteristics}
              disabled={saving || loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Выберите характеристику"
                  placeholder="Начните вводить название..."
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Typography variant="body2">{option.name}</Typography>
                </Box>
              )}
              sx={styles.characteristicSelect}
              noOptionsText="Все характеристики уже добавлены"
              isOptionEqualToValue={(option, value) =>
                option.characteristicNameId === value?.characteristicNameId
              }
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddFilter}
              disabled={!selectedCharacteristic || loading}
              sx={styles.addButton}
            >
              Добавить
            </Button>
          </Box>
        </Box>

        {/* Список фильтров */}
        <Box sx={styles.filtersSection}>
          <Typography variant="subtitle2" sx={styles.sectionTitle}>
            Фильтры категории товаров ({filters.length})
          </Typography>

          {loading ? (
            <Box sx={styles.loadingBox}>
              <CircularProgress />
            </Box>
          ) : filters.length === 0 ? (
            <Box sx={styles.emptyBox}>
              <Typography variant="body2" color="text.secondary">
                Фильтры не настроены. Добавьте характеристики, которые будут отображаться как
                фильтры для этой категории товаров.
              </Typography>
            </Box>
          ) : (
            <List sx={styles.filtersList}>
              {filters.map((filter, index) => (
                <ListItem key={filter.categoryFilterId} sx={styles.filterItem}>
                  <Box sx={styles.filterOrder}>
                    <Typography variant="body2" sx={styles.filterOrderText}>
                      {filter.displayOrder}
                    </Typography>
                  </Box>
                  <ListItemText
                    primary={filter.characteristicName.name}
                  />
                  <ListItemSecondaryAction sx={styles.filterActions}>
                    <Tooltip title="Переместить вверх" arrow>
                      <span>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleMoveUp(filter.categoryFilterId, filter.displayOrder)}
                          disabled={filter.displayOrder <= 1 || loading}
                          sx={styles.actionButton}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Переместить вниз" arrow>
                      <span>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() =>
                            handleMoveDown(filter.categoryFilterId, filter.displayOrder)
                          }
                          disabled={filter.displayOrder >= filters.length || loading}
                          sx={styles.actionButton}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleDeleteFilter(filter.categoryFilterId)}
                      disabled={loading}
                      sx={styles.deleteButton}
                    >
                      Удалить
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Действия */}
        <Box sx={styles.actions}>
          <Button variant="outlined" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || !hasChanges()}
          >
            Сохранить
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

