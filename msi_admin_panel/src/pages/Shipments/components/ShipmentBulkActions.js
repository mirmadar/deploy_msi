import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  DeleteForever as DeleteForeverIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
} from "@mui/icons-material";
import { styles } from "./styles/ShipmentBulkActions.styles";

export const ShipmentBulkActions = ({
  selectedCount,
  onBulkDelete,
  onBulkPublish,
  onBulkUnpublish,
}) => {
  if (selectedCount === 0) return null;

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.container}>
        <Typography sx={styles.text}>
          Выбрано постов отгрузок: <strong>{selectedCount}</strong>
        </Typography>
        <Box sx={styles.actions}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PublishIcon />}
            onClick={onBulkPublish}
            sx={styles.button}
          >
            Опубликовать
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<UnpublishedIcon />}
            onClick={onBulkUnpublish}
            sx={styles.button}
          >
            Снять с публикации
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={onBulkDelete}
            sx={styles.button}
          >
            Удалить
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};







