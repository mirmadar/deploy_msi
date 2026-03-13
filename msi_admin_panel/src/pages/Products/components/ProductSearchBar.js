import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  SelectAll as SelectAllIcon,
} from "@mui/icons-material";
import { styles } from "./styles/ProductSearchBar.styles";

export const ProductSearchBar = ({
  search,
  onSearchChange,
  onAddNew,
  onFiltersClick,
  total,
  onSelectAllByFilters,
  hasActiveFilters,
}) => {
  // Локальное состояние для быстрого ввода без блокировки UI
  const [localSearch, setLocalSearch] = useState(search);

  // Синхронизируем локальное состояние с внешним при изменении извне
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Обновляем родительское состояние через debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [localSearch, search, onSearchChange]);

  return (
    <Box sx={styles.container}>
      <Box sx={styles.searchContainer}>
        <TextField
          placeholder="Поиск товаров..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          size="small"
          sx={styles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={styles.searchIcon} />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title="Фильтры" arrow>
          <IconButton onClick={onFiltersClick} sx={styles.filterButton}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        {hasActiveFilters && onSelectAllByFilters && (
          <Tooltip title="Выбрать все по фильтрам" arrow>
            <IconButton onClick={onSelectAllByFilters} sx={styles.selectAllButton}>
              <SelectAllIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onAddNew}
        sx={styles.addButton}
      >
        Новый товар
      </Button>
    </Box>
  );
};
