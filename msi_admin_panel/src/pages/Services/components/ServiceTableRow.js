import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Checkbox,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DashboardCustomize as ConstructorIcon,
} from "@mui/icons-material";
import { styles } from "./styles/ServiceTableRow.styles";

export const ServiceTableRow = ({
  service,
  onEdit,
  onDelete,
  onOpenConstructor,
  onMoveUp,
  onMoveDown,
  showOrderButtons = false,
  serviceCategoryId,
  indexInSiblings = 0,
  siblingsCount = 1,
  globalIndex = 0,
  totalInCategory = 1,
  isMovingOrder = false,
  selected = false,
  onSelect,
}) => {
  const id = service.id ?? service.serviceId;
  const categoryName =
    service.category?.name ??
    service.categoryName ??
    "—";
  const canMoveUp = (showOrderButtons ? globalIndex > 0 : indexInSiblings > 0) && !isMovingOrder;
  const canMoveDown = (showOrderButtons ? globalIndex < totalInCategory - 1 : indexInSiblings < siblingsCount - 1) && !isMovingOrder;

  return (
    <TableRow hover sx={styles.tableRow}>
      {onSelect != null && (
        <TableCell sx={styles.checkboxCell} padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={(e) => onSelect(id, e.target.checked)}
            size="small"
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
      )}
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
            {service.name}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.categoryCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.categoryText}>
            {categoryName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.actionsCell}>
        <Box sx={styles.actions}>
          {showOrderButtons && (
            <>
              <Tooltip title="Выше в списке" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onMoveUp?.(id)}
                    disabled={!canMoveUp}
                    sx={styles.moveButton}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Ниже в списке" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onMoveDown?.(id)}
                    disabled={!canMoveDown}
                    sx={styles.moveButton}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
          <Tooltip title="Конструктор страницы" arrow>
            <IconButton
              size="small"
              onClick={() => onOpenConstructor?.(id)}
              sx={styles.constructorButton}
            >
              <ConstructorIcon fontSize="small" />
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
      </TableCell>
    </TableRow>
  );
};
