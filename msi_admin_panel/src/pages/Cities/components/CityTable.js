import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { CityTableHeader } from "./CityTableHeader";
import { CityTableRow } from "./CityTableRow";
import { styles } from "./styles/CityTable.styles";

export const CityTable = ({
  cities,
  loading,
  onEdit,
  onDelete,
  sortOrder,
  onSort,
  onMoveUp,
  onMoveDown,
  isMovingOrder,
}) => {
  if (loading && cities.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (cities.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body1" color="text.secondary">
          Города не найдены
        </Typography>
      </Box>
    );
  }

  return (
    <Table sx={styles.table}>
      <CityTableHeader sortOrder={sortOrder} onSort={onSort} />
      <TableBody>
        {cities.map((city, index) => (
          <CityTableRow
            key={city.cityId}
            city={city}
            onEdit={() => onEdit(city.cityId)}
            onDelete={() => onDelete(city.cityId)}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isMovingOrder={isMovingOrder}
            index={index}
            total={cities.length}
          />
        ))}
      </TableBody>
    </Table>
  );
};

