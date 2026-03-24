// src/pages/Products/components/ProductFilters/ProductFilters.js
import { useState, useEffect, useMemo } from "react";
import { getFilters } from "../../../api/search.api";
import { CategoriesApi } from "../../../api/categories.api";
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
  Collapse,
  IconButton,
} from "@mui/material";
import { Search as SearchIcon, ExpandMore, ChevronRight } from "@mui/icons-material";
import { styles } from "./styles/ProductFilters.styles";
import { useProductUnits } from "../../../hooks/useProductUnits";

function CategoryTreeNode({ node, level, selectedIds, expandedIds, search, onToggle, onExpand }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.categoryId);
  const isSelected = selectedIds.includes(node.categoryId);
  const nameMatch = !search || node.name.toLowerCase().includes(search.toLowerCase());

  const childrenMatch = useMemo(() => {
    if (!search || !hasChildren) return true;
    const check = (n) =>
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      (n.children && n.children.some(check));
    return node.children.some(check);
  }, [search, hasChildren, node.children]);

  const visible = nameMatch || childrenMatch;
  if (!visible) return null;

  return (
    <Box key={node.categoryId} sx={{ pl: level * 2 }}>
      <Box sx={styles.treeNodeRow}>
        <IconButton
          size="small"
          onClick={() => onExpand(node.categoryId)}
          sx={{ p: 0.25, visibility: hasChildren ? "visible" : "hidden" }}
        >
          {isExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
        </IconButton>
        <Checkbox
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(node.categoryId);
          }}
          onClick={(e) => e.stopPropagation()}
          size="small"
          sx={{ py: 0, px: 0.5 }}
        />
        <Typography
          variant="body2"
          sx={styles.categoryLabel}
          onClick={() => onToggle(node.categoryId)}
        >
          {node.name}
          {node.branchProductCount != null && (
            <Typography component="span" variant="caption" sx={styles.categoryCount}>
              {" "}({node.branchProductCount})
            </Typography>
          )}
        </Typography>
      </Box>
      {hasChildren && (
        <Collapse in={isExpanded} unmountOnExit>
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.categoryId}
              node={child}
              level={level + 1}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              search={search}
              onToggle={onToggle}
              onExpand={onExpand}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export default function ProductFilters({ onChange, appliedFilters }) {
  const productUnits = useProductUnits();
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [initialPriceRange, setInitialPriceRange] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState("");
  const [unit, setUnit] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    if (!appliedFilters) return;
    if (appliedFilters.categoryIds && appliedFilters.categoryIds.length > 0) {
      setSelectedCategoryIds(appliedFilters.categoryIds);
    } else {
      setSelectedCategoryIds([]);
    }
    if (appliedFilters.isNew !== undefined) setIsNew(appliedFilters.isNew);
    else setIsNew(false);
    if (appliedFilters.status) setStatus(appliedFilters.status);
    else setStatus("");
    if (appliedFilters.unit) setUnit(appliedFilters.unit);
    else setUnit("");
    if (initialPriceRange[0] !== 0 || initialPriceRange[1] !== 0) {
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
    }
  }, [appliedFilters, initialPriceRange]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        const [filtersRes, treeRes] = await Promise.all([
          getFilters(),
          CategoriesApi.getTreeForFilters().catch(() => ({ data: [] })),
        ]);
        const filtersResponse = filtersRes?.data || filtersRes || {};
        const treeData = treeRes?.data ?? [];
        setCategoryTree(Array.isArray(treeData) ? treeData : []);

        const priceInfo = filtersResponse?.priceRange || filtersResponse?.price || { min: 0, max: 0 };
        const initialPrice = [
          typeof priceInfo.min === "number" && priceInfo.min !== null ? priceInfo.min : 0,
          typeof priceInfo.max === "number" && priceInfo.max !== null ? priceInfo.max : 0,
        ];
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
          const statusText = err.response.statusText || "";
          if (status === 404) {
            errorMessage = "Эндпоинт не найден (404). Проверьте бэкенд и маршруты.";
          } else {
            errorMessage = `Ошибка сервера ${status}${statusText ? ": " + statusText : ""}.`;
          }
        } else if (err.request) {
          errorMessage = "Сервер не отвечает. Проверьте запуск бэкенда и CORS.";
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setCategoryTree([]);
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

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategoryIds((prev) => {
      const isSelected = prev.includes(categoryId);
      return isSelected ? prev.filter((id) => id !== categoryId) : [...prev, categoryId];
    });
  };

  const handleExpand = (categoryId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const applyFilters = () => {
    const filters = {
      categoryIds: [],
      price: null,
      isNew: undefined,
      status: undefined,
      unit: undefined,
    };

    if (selectedCategoryIds.length > 0) {
      filters.categoryIds = selectedCategoryIds;
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
    setSelectedCategoryIds([]);
    setPriceRange(initialPriceRange);
    setMinPriceInput(initialPriceRange[0].toString());
    setMaxPriceInput(initialPriceRange[1].toString());
    setIsNew(false);
    setStatus("");
    setUnit("");
    onChange({ categoryIds: [], price: null, isNew: undefined, status: undefined, unit: undefined });
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
  const hasCategories = categoryTree && categoryTree.length > 0;
  const hasAnyFilters = hasCategories || canUsePriceSlider || true;

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
                      <Box sx={styles.treeView}>
                        {categoryTree.map((node) => (
                          <CategoryTreeNode
                            key={node.categoryId}
                            node={node}
                            level={0}
                            selectedIds={selectedCategoryIds}
                            expandedIds={expandedIds}
                            search={categorySearch.trim()}
                            onToggle={handleCategoryToggle}
                            onExpand={handleExpand}
                          />
                        ))}
                      </Box>
                    </Box>
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
                    {productUnits.map((option) => (
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
