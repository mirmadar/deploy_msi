import React from "react";
import { Box, Typography, Button, Paper, IconButton, Tooltip } from "@mui/material";
import { DeleteForever as DeleteForeverIcon, Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";
import { styles } from "./styles/ProductBulkActions.styles";

export const ProductBulkActions = ({
  selectedCount,
  isSelectionByFilters = false,
  onBulkUpdate,
  onDelete,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.container}>
        <Box sx={styles.textContainer}>
          <Typography sx={styles.text}>
            {isSelectionByFilters ? (
              <>Выбрано товаров по фильтрам: <strong>{selectedCount.toLocaleString("ru-RU")}</strong></>
            ) : (
              <>Выбрано товаров: <strong>{selectedCount}</strong></>
            )}
          </Typography>
          {isSelectionByFilters && onClearSelection && (
            <Tooltip title="Снять выбор по фильтрам">
              <IconButton size="small" onClick={onClearSelection} sx={styles.closeButton}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={onBulkUpdate}
            sx={styles.button}
          >
            {isSelectionByFilters ? "Обновить все по фильтрам" : "Обновить выбранные"}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={onDelete}
            sx={styles.button}
          >
            {isSelectionByFilters ? "Удалить все по фильтрам" : "Удалить выбранные"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
