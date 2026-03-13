import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { styles } from "./styles/TableActions.styles";

export const TableActions = ({ onEdit, onDelete }) => {
  return (
    <Box sx={styles.container}>
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


