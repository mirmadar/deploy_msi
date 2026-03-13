import React from "react";
import { TableHead, TableRow, TableCell, Typography } from "@mui/material";
import { styles } from "./styles/CategoryTableHeader.styles";

export const CategoryTableHeader = () => {
  return (
    <TableHead>
      <TableRow sx={styles.tableRow}>
        <TableCell sx={styles.idHeaderCell}>
          <Typography variant="subtitle2">ID</Typography>
        </TableCell>
        <TableCell sx={styles.nameHeaderCell}>
          <Typography variant="subtitle2">Название</Typography>
        </TableCell>
        <TableCell sx={styles.pathHeaderCell}>
          <Typography variant="subtitle2">Путь</Typography>
        </TableCell>
        <TableCell sx={styles.imageHeaderCell}>
          <Typography variant="subtitle2">Изображение</Typography>
        </TableCell>
        <TableCell sx={styles.actionsHeaderCell}>
          <Typography variant="subtitle2">Действия</Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

