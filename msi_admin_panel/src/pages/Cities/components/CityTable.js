import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { TableActions } from "../../../components/common/TableActions";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  if (isMobile) {
    return (
      <Box sx={styles.mobileList}>
        {cities.map((city, index) => {
          const canMoveUp = index > 0 && !isMovingOrder;
          const canMoveDown = index < cities.length - 1 && !isMovingOrder;
          return (
            <Box key={city.cityId} sx={styles.mobileCard}>
              <Typography sx={styles.mobileTitle}>
                {city.name} <Typography component="span" variant="caption" color="text.secondary">#{city.cityId}</Typography>
              </Typography>
              <Typography sx={styles.mobileMeta}>/{city.slug}</Typography>
              <Typography sx={styles.mobileMeta}>{city.phone}</Typography>
              <Typography sx={styles.mobileMeta}>{city.workHours || "-"}</Typography>
              <Box sx={styles.mobileActions}>
                <Tooltip title="Выше в списке" arrow>
                  <span>
                    <IconButton size="small" onClick={() => onMoveUp?.(city.cityId)} disabled={!canMoveUp}>
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Ниже в списке" arrow>
                  <span>
                    <IconButton size="small" onClick={() => onMoveDown?.(city.cityId)} disabled={!canMoveDown}>
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <TableActions onEdit={() => onEdit(city.cityId)} onDelete={() => onDelete(city.cityId)} />
              </Box>
            </Box>
          );
        })}
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

