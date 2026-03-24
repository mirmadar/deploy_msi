import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { TableActions } from "../../../components/common/TableActions";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  if (isMobile) {
    return (
      <Box sx={styles.mobileList}>
        {characteristics.map((item) => {
          const id = item.characteristicNameId || item.id || item.name;
          const valueType = item.valueType === "number" ? "Число" : "Текст";
          return (
            <Box key={id} sx={styles.mobileCard}>
              <Box sx={styles.mobileTopRow}>
                <Typography sx={styles.mobileName}>{item.name}</Typography>
                <Typography variant="caption" color="text.secondary">#{id}</Typography>
              </Box>
              <Typography sx={styles.mobileType}>{valueType}</Typography>
              <Box sx={{ mt: 0.5 }}>
                <TableActions onEdit={() => onEdit(id)} onDelete={() => onDelete(id)} />
              </Box>
            </Box>
          );
        })}
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

