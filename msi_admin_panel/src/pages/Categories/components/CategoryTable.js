import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { CategoryTableHeader } from "./CategoryTableHeader";
import { CategoryTableRow } from "./CategoryTableRow";
import { styles } from "./styles/CategoryTable.styles";

export const CategoryTable = ({
  categories,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading && categories.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (categories.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body1" color="text.secondary">
          Категории товаров не найдены
        </Typography>
      </Box>
    );
  }

  return (
    <Table sx={styles.table}>
      <CategoryTableHeader />
      <TableBody>
        {categories.map((item) => {
          const id = item.categoryId || item.id;
          return (
            <CategoryTableRow
              key={id}
              item={item}
              onEdit={() => onEdit(id)}
              onDelete={() => onDelete(id)}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};

