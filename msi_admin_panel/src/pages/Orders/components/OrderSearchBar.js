import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { styles } from "./styles/OrderSearchBar.styles";

export const OrderSearchBar = ({
  search,
  onSearchChange,
  onFiltersClick,
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
          placeholder="Поиск заказов..."
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
        <Tooltip title={hasActiveFilters ? "Фильтры активны" : "Фильтры"} arrow>
          <IconButton 
            onClick={onFiltersClick} 
            sx={{
              ...styles.filterButton,
              ...(hasActiveFilters && styles.filterButtonActive),
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

