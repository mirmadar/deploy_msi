import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
} from "@mui/material";
import { TableActions } from "../../../components/common/TableActions";
import { styles } from "./styles/CharacteristicTableRow.styles";

export const CharacteristicTableRow = ({ item, onEdit, onDelete }) => {
  const name = item.name;
  const valueType = item.valueType || "text";
  const id = item.characteristicNameId || item.id || item.name;

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
        <Box sx={styles.nameCellWrapper}>
          <Typography variant="body2" sx={styles.nameText}>
            {name}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.typeCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.typeText}>
            {valueType === "number" ? "Число" : "Текст"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.actionsCell}>
        <Box sx={styles.cellContent}>
          <TableActions
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Box>
      </TableCell>
    </TableRow>
  );
};

