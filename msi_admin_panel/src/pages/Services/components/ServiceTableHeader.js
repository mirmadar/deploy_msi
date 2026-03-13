import React from "react";
import { TableHead, TableRow, TableCell, Typography, Checkbox } from "@mui/material";
import { styles } from "./styles/ServiceTableHeader.styles";

export const ServiceTableHeader = ({
  selectedServices = [],
  visibleServiceIds = [],
  onSelectAll,
}) => {
  const allSelected = visibleServiceIds.length > 0 && visibleServiceIds.every((id) => selectedServices.includes(id));
  const someSelected = visibleServiceIds.some((id) => selectedServices.includes(id)) && !allSelected;

  return (
    <TableHead>
      <TableRow sx={styles.tableRow}>
        {onSelectAll != null && (
          <TableCell sx={styles.checkboxHeaderCell} padding="checkbox">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={(e) => onSelectAll(visibleServiceIds, e.target.checked)}
              size="small"
            />
          </TableCell>
        )}
        <TableCell sx={styles.idHeaderCell}>
          <Typography variant="subtitle2">ID</Typography>
        </TableCell>
        <TableCell sx={styles.nameHeaderCell}>
          <Typography variant="subtitle2">Название</Typography>
        </TableCell>
        <TableCell sx={styles.categoryHeaderCell}>
          <Typography variant="subtitle2">Категория</Typography>
        </TableCell>
        <TableCell sx={styles.actionsHeaderCell}>
          <Typography variant="subtitle2">Действия</Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
