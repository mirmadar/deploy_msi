import React from "react";
import { TableHead, TableRow, TableCell, Typography, Checkbox } from "@mui/material";
import { styles } from "./styles/ShipmentTableHeader.styles";

export const ShipmentTableHeader = ({
  allSelected,
  someSelected,
  onSelectAll,
  hasShipments,
}) => {
  return (
    <TableHead>
      <TableRow sx={styles.tableRow}>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected && hasShipments}
            onChange={(e) => onSelectAll(e.target.checked)}
            size="small"
          />
        </TableCell>
        <TableCell sx={styles.idHeaderCell}>
          <Typography variant="subtitle2">ID</Typography>
        </TableCell>
        <TableCell sx={styles.titleHeaderCell}>
          <Typography variant="subtitle2">Название</Typography>
        </TableCell>
        <TableCell sx={{ ...styles.imageHeaderCell, display: { xs: "none", md: "table-cell" } }}>
          <Typography variant="subtitle2">Изображение</Typography>
        </TableCell>
        <TableCell sx={{ ...styles.categoryHeaderCell, display: { xs: "none", lg: "table-cell" } }}>
          <Typography variant="subtitle2">Категория</Typography>
        </TableCell>
        <TableCell sx={{ ...styles.createdHeaderCell, display: { xs: "none", md: "table-cell" } }}>
          <Typography variant="subtitle2">Дата и время</Typography>
        </TableCell>
        <TableCell sx={styles.publishedHeaderCell}>
          <Typography variant="subtitle2">Публикация</Typography>
        </TableCell>
        <TableCell sx={styles.actionsHeaderCell}>
          <Typography variant="subtitle2">Действия</Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};







