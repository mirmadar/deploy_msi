// src/pages/Products/components/ProductFilters/ProductFilters.js
import { useState, useEffect } from "react";
import { getFilters } from "../../../api/search.api";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { styles } from "./styles/ProductFilters.styles";
import { PRODUCT_UNITS_OPTIONS } from "../../../utils/productUnits";

export default function ProductFilters({ onChange, appliedFilters }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [initialPriceRange, setInitialPriceRange] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Значения фильтров
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState("");
  const [unit, setUnit] = useState("");
  
  // Поиск по категориям
  const [categorySearch, setCategorySearch] = useState("");

  // Синхронизация с примененными фильтрами
  useEffect(() => {
    if (appliedFilters && initialPriceRange[0] !== 0 && initialPriceRange[1] !== 0) {
      if (appliedFilters.categories && appliedFilters.categories.length > 0) {
        setSelectedCategories(appliedFilters.categories);
      } else {
        setSelectedCategories([]);
      }
      
      // Проверяем, что цена установлена и отличается от начального диапазона или [0, 0]
      if (appliedFilters.price && 
          Array.isArray(appliedFilters.price) && 
          appliedFilters.price.length === 2) {
        const [min, max] = appliedFilters.price;
        // Если цена не [0, 0] и отличается от начального диапазона
        if ((min !== 0 || max !== 0) && 
            (min !== initialPriceRange[0] || max !== initialPriceRange[1])) {
          setPriceRange([min, max]);
          setMinPriceInput(min.toString());
          setMaxPriceInput(max.toString());
        } else {
          // Сбрасываем фильтр цены
          setPriceRange(initialPriceRange);
          setMinPriceInput(initialPriceRange[0].toString());
          setMaxPriceInput(initialPriceRange[1].toString());
        }
      } else {
        // Если price === null или undefined, сбрасываем
        setPriceRange(initialPriceRange);
        setMinPriceInput(initialPriceRange[0].toString());
        setMaxPriceInput(initialPriceRange[1].toString());
      }
      
      // Синхронизация фильтров isNew и status
      if (appliedFilters.isNew !== undefined) {
        setIsNew(appliedFilters.isNew);
      } else {
        setIsNew(false);
      }
      
      if (appliedFilters.status) {
        setStatus(appliedFilters.status);
      } else {
        setStatus("");
      }
      
      if (appliedFilters.unit) {
        setUnit(appliedFilters.unit);
      } else {
        setUnit("");
      }
    }
  }, [appliedFilters, initialPriceRange]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        // Загружаем фильтры (категории и ценовой диапазон) из одного endpoint
        const filtersData = await getFilters();
        const filtersResponse = filtersData?.data || filtersData || {};
        
        // Категории теперь в формате дерева с label и children
        const categoriesData = filtersResponse?.categories || [];
        console.log("Загруженные категории:", categoriesData);
        console.log("Количество категорий:", categoriesData.length);
        setCategories(categoriesData);
        
        // Ценовой диапазон (бекенд возвращает priceRange, но может быть и price для обратной совместимости)
        const priceInfo = filtersResponse?.priceRange || filtersResponse?.price || { min: 0, max: 0 };
        const initialPrice = [
          typeof priceInfo.min === 'number' && priceInfo.min !== null ? priceInfo.min : 0,
          typeof priceInfo.max === 'number' && priceInfo.max !== null ? priceInfo.max : 0,
        ];
        
        console.log("Загруженный ценовой диапазон:", priceInfo, "→", initialPrice);
        
        setInitialPriceRange(initialPrice);
        setPriceRange((prev) => {
          if (prev[0] === 0 && prev[1] === 0) {
            setMinPriceInput(initialPrice[0].toString());
            setMaxPriceInput(initialPrice[1].toString());
            return initialPrice;
          }
          return prev;
        });
      } catch (err) {
        let errorMessage = "Не удалось загрузить фильтры.";
        if (err.response) {
          const status = err.response.status;
          const statusText = err.response.statusText || '';
          
          if (status === 404) {
            errorMessage = `Эндпоинт не найден (404). Проверьте на бэкенде:\n1. Зарегистрирован ли SearchModule в AppModule\n2. Есть ли глобальный префикс API (например, /api)\n3. Доступен ли маршрут GET /search/filters`;
          } else {
            errorMessage = `Ошибка сервера ${status}${statusText ? ': ' + statusText : ''}. Проверьте, что эндпоинт /search/filters доступен.`;
          }
        } else if (err.request) {
          errorMessage = "Сервер не отвечает. Проверьте: запущен ли сервер на http://localhost:3000, нет ли проблем с CORS, доступен ли эндпоинт /search/filters";
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setCategories([]);
        setInitialPriceRange([0, 0]);
        setPriceRange([0, 0]);
        setMinPriceInput("0");
        setMaxPriceInput("0");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleMinPriceInputChange = (e) => {
    const value = e.target.value;
    setMinPriceInput(value);
    
    if (value === "") {
      return; // Позволяем пустое значение для ввода
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return;
    }
    
    const clampedMin = Math.max(initialPriceRange[0], Math.min(numValue, priceRange[1]));
    const newRange = [clampedMin, priceRange[1]];
    setPriceRange(newRange);
    setMinPriceInput(clampedMin.toString());
  };

  const handleMaxPriceInputChange = (e) => {
    const value = e.target.value;
    setMaxPriceInput(value);
    
    if (value === "") {
      return; // Позволяем пустое значение для ввода
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return;
    }
    
    const clampedMax = Math.min(initialPriceRange[1], Math.max(numValue, priceRange[0]));
    const newRange = [priceRange[0], clampedMax];
    setPriceRange(newRange);
    setMaxPriceInput(clampedMax.toString());
  };

  const handleMinPriceBlur = () => {
    if (minPriceInput === "" || isNaN(parseFloat(minPriceInput))) {
      setMinPriceInput(priceRange[0].toString());
    }
  };

  const handleMaxPriceBlur = () => {
    if (maxPriceInput === "" || isNaN(parseFloat(maxPriceInput))) {
      setMaxPriceInput(priceRange[1].toString());
    }
  };

  const handleCategoryToggle = (categoryName) => {
    if (!categoryName) {
      console.warn("Попытка переключить категорию без названия");
      return;
    }
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(categoryName);
      const newSelection = isSelected
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName];
      console.log("Выбранные категории:", newSelection);
      return newSelection;
    });
  };

  const applyFilters = () => {
    const filters = {
      categories: [],
      price: null,
      isNew: undefined,
      status: undefined,
      unit: undefined,
    };
    
    // Применяем категории если выбраны категории
    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories;
    }
    
    // Применяем фильтр цены если он отличается от начального диапазона
    const isPriceChanged = 
      priceRange[0] !== initialPriceRange[0] || 
      priceRange[1] !== initialPriceRange[1];
    
    if (isPriceChanged) {
      filters.price = priceRange;
    }
    
    // Применяем фильтр по новинке
    if (isNew) {
      filters.isNew = true;
    }
    
    // Применяем фильтр по статусу
    if (status && status !== "") {
      filters.status = status;
    }
    
    // Применяем фильтр по единице измерения
    if (unit && unit !== "") {
      filters.unit = unit;
    }
    
    onChange(filters);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange(initialPriceRange);
    setMinPriceInput(initialPriceRange[0].toString());
    setMaxPriceInput(initialPriceRange[1].toString());
    setIsNew(false);
    setStatus("");
    setUnit("");
    onChange({ categories: [], price: null, isNew: undefined, status: undefined, unit: undefined });
  };

  if (loading) {
    return (
      <Box sx={styles.container}>
        <Box sx={styles.content}>
          <Box sx={styles.loadingMessage}>
            <CircularProgress size={20} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Загрузка фильтров...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={styles.container}>
        <Box sx={styles.content}>
          <Alert severity="warning" sx={styles.errorMessage}>
            <Typography variant="body2" component="div">
              {error}
            </Typography>
            <Typography variant="caption" component="div" sx={{ mt: 1 }}>
              Фильтры временно недоступны. Вы можете использовать поиск.
            </Typography>
          </Alert>
        </Box>
      </Box>
    );
  }

  const canUsePriceSlider = initialPriceRange[0] < initialPriceRange[1];
  const hasCategories = categories && categories.length > 0;
  const hasAnyFilters = hasCategories || canUsePriceSlider || true; // Всегда показываем фильтры по новинке и статусу

  // Фильтрация и сортировка категорий
  const sortedAndFilteredCategories = categories
    .filter((category) => {
      const categoryLabel = category.label || category.name || "";
      if (!categoryLabel) return false;
      // Фильтрация по поисковому запросу
      if (categorySearch.trim()) {
        return categoryLabel.toLowerCase().includes(categorySearch.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      const aLabel = (a.label || a.name || "").toLowerCase();
      const bLabel = (b.label || b.name || "").toLowerCase();
      const aIsSelected = selectedCategories.includes(a.label || a.name || "");
      const bIsSelected = selectedCategories.includes(b.label || b.name || "");
      
      // Сначала выбранные категории
      if (aIsSelected && !bIsSelected) return -1;
      if (!aIsSelected && bIsSelected) return 1;
      
      // Затем по алфавиту
      return aLabel.localeCompare(bLabel, 'ru', { sensitivity: 'base' });
    });

  return (
    <Box sx={styles.container}>
      <Box sx={styles.content}>
        {!hasAnyFilters ? (
          <Box sx={styles.emptyMessage}>
            <Typography variant="body2" color="text.secondary">
              Нет доступных фильтров. Данные будут доступны после добавления товаров.
            </Typography>
          </Box>
        ) : (
            <Box sx={styles.sectionsContainer}>
              {/* Фильтр по категориям */}
              {hasCategories && (
                <Box sx={styles.section}>
                  <Typography variant="subtitle2" sx={styles.sectionTitle}>
                    Категории
                  </Typography>
                  <Box sx={styles.filterContent}>
                    {categories && categories.length > 0 ? (
                      <>
                        <TextField
                          placeholder="Поиск категории..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          size="small"
                          fullWidth
                          sx={styles.categorySearchField}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={styles.searchIcon} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Box sx={styles.categoriesList}>
                          {sortedAndFilteredCategories.length > 0 ? (
                            sortedAndFilteredCategories.map((category, index) => {
                              const categoryLabel = category.label || category.name;
                              if (!categoryLabel) return null;
                              const isSelected = selectedCategories.includes(categoryLabel);
                              return (
                                <Box
                                  key={categoryLabel}
                                  sx={styles.categoryItem}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleCategoryToggle(categoryLabel);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    size="small"
                                  />
                                  <Typography 
                                    variant="body2" 
                                    sx={styles.categoryLabel}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCategoryToggle(categoryLabel);
                                    }}
                                  >
                                    {categoryLabel}
                                    {category.count && (
                                      <Typography component="span" variant="caption" sx={styles.categoryCount}>
                                        ({category.count})
                                      </Typography>
                                    )}
                                  </Typography>
                                </Box>
                              );
                            })
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={styles.noResults}>
                              Категории не найдены
                            </Typography>
                          )}
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Категории загружаются...
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Фильтр по цене */}
              {canUsePriceSlider && (
                <Box sx={styles.section}>
                  <Typography variant="subtitle2" sx={styles.sectionTitle}>
                    Цена
                  </Typography>
                  <Box sx={styles.filterContent}>
                    <Box sx={styles.priceInputsContainer}>
                      <TextField
                        label="От"
                        type="number"
                        size="small"
                        value={minPriceInput}
                        onChange={handleMinPriceInputChange}
                        onBlur={handleMinPriceBlur}
                        inputProps={{
                          min: initialPriceRange[0],
                          max: priceRange[1],
                          step: 1,
                        }}
                        sx={styles.priceInput}
                      />
                      <Typography sx={styles.priceSeparator}>–</Typography>
                      <TextField
                        label="До"
                        type="number"
                        size="small"
                        value={maxPriceInput}
                        onChange={handleMaxPriceInputChange}
                        onBlur={handleMaxPriceBlur}
                        inputProps={{
                          min: priceRange[0],
                          max: initialPriceRange[1],
                          step: 1,
                        }}
                        sx={styles.priceInput}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Фильтр по новинке */}
              <Box sx={styles.section}>
                <Typography variant="subtitle2" sx={styles.sectionTitle}>
                  Новинки
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Только новинки"
                  sx={styles.checkbox}
                />
              </Box>

              {/* Фильтр по статусу */}
              <Box sx={styles.section}>
                <Typography variant="subtitle2" sx={styles.sectionTitle}>
                  Статус
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Статус товара</InputLabel>
                  <Select
                    value={status}
                    label="Статус товара"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="">Все</MenuItem>
                    <MenuItem value="IN_STOCK">В наличии</MenuItem>
                    <MenuItem value="OUT_OF_STOCK">Не в наличии</MenuItem>
                    <MenuItem value="ARCHIVE">Архив</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Фильтр по единице измерения */}
              <Box sx={styles.section}>
                <Typography variant="subtitle2" sx={styles.sectionTitle}>
                  Единица измерения
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Единица измерения</InputLabel>
                  <Select
                    value={unit}
                    label="Единица измерения"
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <MenuItem value="">Все</MenuItem>
                    {PRODUCT_UNITS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}

          {/* Кнопки */}
          {hasAnyFilters && (
            <Box sx={styles.buttonsContainer}>
              <Button
                variant="contained"
                onClick={applyFilters}
                fullWidth
                sx={styles.applyButton}
                size="small"
              >
                Применить
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilters}
                fullWidth
                sx={styles.resetButton}
                size="small"
              >
                Сбросить
              </Button>
            </Box>
          )}
      </Box>
    </Box>
  );
}
