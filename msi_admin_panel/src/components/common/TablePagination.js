import React from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Button,
  ButtonGroup,
} from "@mui/material";
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { styles } from "./styles/TablePagination.styles";

/**
 * Универсальный компонент пагинации для таблиц
 * @param {Object} props
 * @param {number} props.total - Общее количество элементов
 * @param {number} props.page - Текущая страница (0-based)
 * @param {number} props.rowsPerPage - Количество строк на странице
 * @param {number} props.itemsCount - Количество элементов на текущей странице
 * @param {string} props.itemLabel - Название элемента в единственном числе (например, "товар", "категория")
 * @param {string} props.itemLabelPlural - Название элемента во множественном числе (например, "товаров", "категорий")
 * @param {Function} props.onPageChange - Обработчик изменения страницы (event, page) => void
 * @param {Function} props.onRowsPerPageChange - Обработчик изменения количества строк (event) => void
 * @param {number[]} [props.rowsPerPageOptions] - Варианты количества строк на странице (по умолчанию [10, 25, 50, 100])
 */
export const TablePagination = ({
  total,
  page,
  rowsPerPage,
  itemsCount,
  itemLabel = "элемент",
  itemLabelPlural = "элементов",
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
}) => {
  const totalPages = Math.ceil(total / rowsPerPage) || 1;
  const currentPage = page + 1; // Преобразуем из 0-based в 1-based для отображения
  const startItem = page * rowsPerPage + 1;
  const endItem = Math.min(page * rowsPerPage + itemsCount, total);

  const handleFirstPage = () => {
    onPageChange(null, 0);
  };

  const handlePreviousPage = () => {
    onPageChange(null, Math.max(0, page - 1));
  };

  const handleNextPage = () => {
    onPageChange(null, Math.min(totalPages - 1, page + 1));
  };

  const handleLastPage = () => {
    onPageChange(null, totalPages - 1);
  };

  const handlePageClick = (pageNumber) => {
    onPageChange(null, pageNumber - 1); // Преобразуем из 1-based в 0-based
  };

  // Генерируем номера страниц для отображения
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Максимальное количество видимых номеров страниц

    if (totalPages <= maxVisiblePages) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Если страниц много, показываем с эллипсами
      if (currentPage <= 4) {
        // В начале списка
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // В конце списка
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // В середине списка
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Box sx={styles.container}>
      <Box sx={styles.infoSection}>
        <Typography variant="body2" sx={styles.infoText}>
          Показано {startItem}–{endItem} из {total} {itemLabelPlural}
        </Typography>
        {/* <Typography variant="body2" sx={styles.rangeText}>
          {startItem}–{endItem} of {total}
        </Typography> */}
      </Box>

      <Box sx={styles.paginationSection}>
        <Box sx={styles.controlsGroup}>
          <Box sx={styles.rowsPerPageControl}>
            <Typography variant="body2" sx={styles.rowsPerPageLabel}>
              Строк на странице:
            </Typography>
            <FormControl size="small">
              <Select
                value={rowsPerPage}
                onChange={(e) => {
                  // Преобразуем в формат, который ожидает MUI TablePagination
                  onRowsPerPageChange({ target: { value: e.target.value } });
                }}
                sx={styles.select}
              >
                {rowsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={styles.pageNavigation}>
            <IconButton
              onClick={handleFirstPage}
              disabled={page === 0}
              size="small"
              sx={styles.navButton}
            >
              <FirstPageIcon />
            </IconButton>
            <IconButton
              onClick={handlePreviousPage}
              disabled={page === 0}
              size="small"
              sx={styles.navButton}
            >
              <ChevronLeftIcon />
            </IconButton>

            <ButtonGroup variant="outlined" size="small" sx={styles.pageButtons}>
              {pageNumbers.map((pageNum, index) => {
                if (pageNum === "ellipsis") {
                  return (
                    <Button key={`ellipsis-${index}`} disabled sx={styles.ellipsisButton}>
                      ...
                    </Button>
                  );
                }
                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    variant={pageNum === currentPage ? "contained" : "outlined"}
                    sx={styles.pageButton}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </ButtonGroup>

            <IconButton
              onClick={handleNextPage}
              disabled={page >= totalPages - 1}
              size="small"
              sx={styles.navButton}
            >
              <ChevronRightIcon />
            </IconButton>
            <IconButton
              onClick={handleLastPage}
              disabled={page >= totalPages - 1}
              size="small"
              sx={styles.navButton}
            >
              <LastPageIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={styles.pageInfo}>
            Страница {currentPage} из {totalPages}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
