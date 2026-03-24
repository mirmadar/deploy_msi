import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Image as ImageIcon } from "@mui/icons-material";
import { TableActions } from "../../../components/common/TableActions";
import { CategoryTableHeader } from "./CategoryTableHeader";
import { CategoryTableRow } from "./CategoryTableRow";
import { styles } from "./styles/CategoryTable.styles";

export const CategoryTable = ({
  categories,
  loading,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  if (isMobile) {
    return (
      <Box sx={styles.mobileList}>
        {categories.map((item) => {
          const id = item.categoryId || item.id;
          const path = item.path
            ? item.path.map((p) => p.name).join(" / ")
            : item.pathItems
            ? item.pathItems.map((p) => p.name).join(" / ")
            : "";
          return (
            <Box key={id} sx={styles.mobileCard}>
              <Box sx={styles.mobileTopRow}>
                <Typography sx={styles.mobileName}>{item.name}</Typography>
                <Typography variant="caption" color="text.secondary">#{id}</Typography>
              </Box>
              <Typography sx={styles.mobilePath}>{path || "—"}</Typography>
              <Box sx={styles.mobileActions}>
                {item.imageUrl ? (
                  <Avatar src={item.imageUrl} variant="rounded" sx={{ width: 36, height: 36 }} />
                ) : (
                  <ImageIcon fontSize="small" color="disabled" />
                )}
                <TableActions onEdit={() => onEdit(id)} onDelete={() => onDelete(id)} />
              </Box>
            </Box>
          );
        })}
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

