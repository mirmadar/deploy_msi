import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { styles } from "./styles/ProductTableActions.styles";

export const ProductTableActions = ({
  isExpanded,
  onExpand,
  onEdit,
  onDelete,
}) => {
  return (
    <Box sx={styles.container}>
      <Tooltip title="Быстрый просмотр" arrow>
        <IconButton size="small" onClick={onExpand} sx={styles.expandButton}>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Редактировать" arrow>
        <IconButton size="small" onClick={onEdit} sx={styles.editButton}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Удалить" arrow>
        <IconButton size="small" onClick={onDelete} sx={styles.deleteButton}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
