import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { TableActions } from "../../../components/common/TableActions";
import { styles } from "./styles/CityTableRow.styles";

export const CityTableRow = ({
  city,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isMovingOrder = false,
  index = 0,
  total = 1,
}) => {
  const canMoveUp = index > 0 && !isMovingOrder;
  const canMoveDown = index < total - 1 && !isMovingOrder;

  return (
    <TableRow hover sx={styles.tableRow}>
      <TableCell sx={styles.idCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.idText}>
            #{city.cityId}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.nameCell}>
        <Box sx={styles.nameCellWrapper}>
          <Typography variant="body2" sx={styles.nameText}>
            {city.name}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.slugCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.slugText}>
            {city.slug}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.phoneCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.phoneText}>
            {city.phone}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.workHoursCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.workHoursText}>
            {city.workHours || "-"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.actionsCell}>
        <Box sx={styles.cellContent}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
            {onMoveUp && (
              <Tooltip title="Выше в списке" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onMoveUp(city.cityId)}
                    disabled={!canMoveUp}
                    sx={{ minWidth: 32 }}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {onMoveDown && (
              <Tooltip title="Ниже в списке" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onMoveDown(city.cityId)}
                    disabled={!canMoveDown}
                    sx={{ minWidth: 32 }}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <TableActions onEdit={onEdit} onDelete={onDelete} />
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};







