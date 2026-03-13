import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { CharacteristicTableHeader } from "./CharacteristicTableHeader";
import { CharacteristicTableRow } from "./CharacteristicTableRow";
import { styles } from "./styles/CharacteristicTable.styles";

export const CharacteristicTable = ({
  characteristics,
  loading,
  onEdit,
  onDelete,
  sortOrder,
  onSort,
}) => {
  if (loading && characteristics.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (characteristics.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body1" color="text.secondary">
          Характеристики не найдены
        </Typography>
      </Box>
    );
  }

  return (
    <Table sx={styles.table}>
      <CharacteristicTableHeader sortOrder={sortOrder} onSort={onSort} />
      <TableBody>
        {characteristics.map((item) => {
          const id = item.characteristicNameId || item.id || item.name;
          return (
            <CharacteristicTableRow
              key={id}
              item={item}
              onEdit={() => onEdit(id)}
              onDelete={() => onDelete(id)}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};

