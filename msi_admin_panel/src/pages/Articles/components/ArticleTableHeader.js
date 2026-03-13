import React from "react";
import { TableHead, TableRow, TableCell, Typography, Checkbox } from "@mui/material";
import { styles } from "./styles/ArticleTableHeader.styles";

export const ArticleTableHeader = ({
  allSelected,
  someSelected,
  onSelectAll,
  hasArticles,
}) => {
  return (
    <TableHead>
      <TableRow sx={styles.tableRow}>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected && hasArticles}
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
        <TableCell sx={styles.authorHeaderCell}>
          <Typography variant="subtitle2">Автор</Typography>
        </TableCell>
        <TableCell sx={styles.createdHeaderCell}>
          <Typography variant="subtitle2">Дата создания</Typography>
        </TableCell>
        <TableCell sx={styles.publishedHeaderCell}>
          <Typography variant="subtitle2">Дата публикации</Typography>
        </TableCell>
        <TableCell sx={styles.actionsHeaderCell}>
          <Typography variant="subtitle2">Действия</Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

