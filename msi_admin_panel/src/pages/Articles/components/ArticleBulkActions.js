import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  DeleteForever as DeleteForeverIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
} from "@mui/icons-material";
import { styles } from "./styles/ArticleBulkActions.styles";

export const ArticleBulkActions = ({
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
          Выбрано статей: <strong>{selectedCount}</strong>
        </Typography>
        <Box display="flex" gap={1.5}>
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


