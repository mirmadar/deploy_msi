import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  DriveFileMove as DriveFileMoveIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { styles } from "./styles/CategoryBulkActions.styles";

export const CategoryBulkActions = ({
  selectedCount,
  onMoveCategories,
  onSetImageUrl,
}) => {
  if (selectedCount === 0) return null;

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.container}>
        <Typography sx={styles.text}>
          Выбрано категорий товаров: <strong>{selectedCount}</strong>
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ImageIcon />}
            onClick={onSetImageUrl}
            sx={styles.button}
          >
            Назначить URL изображения
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DriveFileMoveIcon />}
            onClick={onMoveCategories}
            sx={styles.button}
          >
            Перенести в категорию товаров
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

