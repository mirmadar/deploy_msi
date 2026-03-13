import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import { Image as ImageIcon } from "@mui/icons-material";
import { TableActions } from "../../../components/common/TableActions";
import { styles } from "./styles/CategoryTableRow.styles";

export const CategoryTableRow = ({ item, onEdit, onDelete }) => {
  const name = item.name;
  const id = item.categoryId || item.id;
  const imageUrl = item.imageUrl;
  // Путь категории - получаем из path или строим из pathItems
  const path = item.path
    ? item.path.map((p) => p.name).join(" / ")
    : item.pathItems
    ? item.pathItems.map((p) => p.name).join(" / ")
    : "";

  return (
    <TableRow hover sx={styles.tableRow}>
      <TableCell sx={styles.idCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.idText}>
            #{id}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.nameCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.nameText}>
            {name}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.pathCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.pathText}>
            {path || "—"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.imageCell}>
        <Box sx={styles.cellContent}>
          {imageUrl ? (
            <Avatar
              src={imageUrl}
              sx={styles.imageAvatar}
              variant="rounded"
            >
              <ImageIcon />
            </Avatar>
          ) : (
            <Box sx={styles.imagePlaceholder}>
              <ImageIcon sx={styles.imageIcon} />
            </Box>
          )}
        </Box>
      </TableCell>
      <TableCell sx={styles.actionsCell}>
        <Box sx={styles.cellContent}>
          <TableActions onEdit={onEdit} onDelete={onDelete} />
        </Box>
      </TableCell>
    </TableRow>
  );
};

