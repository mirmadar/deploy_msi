import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { styles } from "./styles/ProductTableHeader.styles";

export const ProductTableHeader = ({
  allSelected,
  someSelected,
  onSelectAll,
  hasProducts,
  sortBy,
  sortOrder,
  onSort,
}) => {
  return (
    <TableHead>
      <TableRow sx={styles.tableRow}>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected && hasProducts}
            onChange={(e) => onSelectAll(e.target.checked)}
            size="small"
          />
        </TableCell>
        <TableCell 
          sx={[
            styles.idHeaderCell,
            styles.sortableHeader,
            sortBy === 'productId' && styles.activeSortHeader,
          ]}
          onClick={() => onSort('productId')}
        >
          <Box sx={styles.headerContent}>
            <Typography variant="subtitle2">ID</Typography>
            {sortBy === 'productId' ? (
              sortOrder === 'asc' ? <ArrowUpwardIcon sx={styles.sortIcon} /> : <ArrowDownwardIcon sx={styles.sortIcon} />
            ) : (
              <ArrowUpwardIcon sx={styles.sortIconInactive} />
            )}
          </Box>
        </TableCell>
        <TableCell sx={styles.nameHeaderCell}>
          <Typography variant="subtitle2">Название</Typography>
        </TableCell>
        <TableCell sx={{ ...styles.unitHeaderCell, display: { xs: "none", md: "table-cell" } }}>
          <Typography variant="subtitle2">Ед. изм.</Typography>
        </TableCell>
        <TableCell 
          sx={[
            styles.priceHeaderCell,
            styles.sortableHeader,
            sortBy === 'price' && styles.activeSortHeader,
          ]}
          onClick={() => onSort('price')}
        >
          <Box sx={styles.headerContent}>
            <Typography variant="subtitle2">Цена</Typography>
            {sortBy === 'price' ? (
              sortOrder === 'asc' ? <ArrowUpwardIcon sx={styles.sortIcon} /> : <ArrowDownwardIcon sx={styles.sortIcon} />
            ) : (
              <ArrowUpwardIcon sx={styles.sortIconInactive} />
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ ...styles.statusHeaderCell, display: { xs: "none", md: "table-cell" } }}>
          <Typography variant="subtitle2">Статус</Typography>
        </TableCell>
        <TableCell sx={{ ...styles.categoryHeaderCell, display: { xs: "none", lg: "table-cell" } }}>
          <Typography variant="subtitle2">Категория</Typography>
        </TableCell>
        <TableCell sx={{ ...styles.isNewHeaderCell, display: { xs: "none", md: "table-cell" } }}>
          <Typography variant="subtitle2">Новинка</Typography>
        </TableCell>
        <TableCell sx={styles.actionsHeaderCell}>
          <Typography variant="subtitle2">Действия</Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
