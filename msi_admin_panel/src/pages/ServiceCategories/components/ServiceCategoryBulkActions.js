import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  DriveFileMove as DriveFileMoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { styles } from "./styles/ServiceCategoryBulkActions.styles";

export const ServiceCategoryBulkActions = ({
  selectedCount,
  onMove,
  onDelete,
}) => {
  if (selectedCount === 0) return null;

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.container}>
        <Typography sx={styles.text}>
          Выбрано категорий услуг: <strong>{selectedCount}</strong>
        </Typography>
        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DriveFileMoveIcon />}
            onClick={onMove}
            sx={styles.button}
          >
            Перенести в категорию
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            sx={styles.button}
          >
            Удалить выбранные
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
