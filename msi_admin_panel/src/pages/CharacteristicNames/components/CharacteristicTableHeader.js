import React from "react";
import { TableHead, TableRow, TableCell, Typography, Box } from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { styles } from "./styles/CharacteristicTableHeader.styles";

export const CharacteristicTableHeader = ({ sortOrder, onSort }) => {
  return (
    <TableHead>
      <TableRow sx={styles.tableRow}>
        <TableCell sx={styles.idHeaderCell}>
          <Typography variant="subtitle2">ID</Typography>
        </TableCell>
        <TableCell 
          sx={[
            styles.nameHeaderCell,
            styles.sortableHeader,
          ]}
          onClick={() => onSort()}
        >
          <Box sx={styles.headerContent}>
            <Typography variant="subtitle2">Название</Typography>
            {sortOrder === 'asc' ? (
              <ArrowUpwardIcon sx={styles.sortIcon} />
            ) : (
              <ArrowDownwardIcon sx={styles.sortIcon} />
            )}
          </Box>
        </TableCell>
        <TableCell sx={styles.typeHeaderCell}>
          <Typography variant="subtitle2">Тип значения</Typography>
        </TableCell>
        <TableCell sx={styles.actionsHeaderCell}>
          <Typography variant="subtitle2">Действия</Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
