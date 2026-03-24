import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Checkbox,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { TableActions } from "../../../components/common/TableActions";
import { formatDateTime } from "../../../utils/dateFormat";
import { styles } from "./styles/ShipmentTableRow.styles";

export const ShipmentTableRow = ({
  shipment,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onMoveUp,
  onMoveDown,
  isMovingOrder = false,
  globalIndex = 0,
  total = 1,
}) => {
  const canMoveUp = globalIndex > 0 && !isMovingOrder;
  const canMoveDown = globalIndex < total - 1 && !isMovingOrder;
  const isPublished = !!shipment.publishedAt;
  const isDraft = !shipment.publishedAt;
  const publishedDateFormatted = shipment.publishedAt
    ? formatDateTime(shipment.publishedAt)
    : null;

  return (
    <TableRow hover selected={isSelected} sx={styles.tableRow}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          size="small"
        />
      </TableCell>
      <TableCell sx={styles.idCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.idText}>
            #{shipment.shipmentPostId}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.titleCell}>
        <Box sx={styles.titleCellWrapper}>
          <Typography variant="body2" sx={styles.titleText}>
            {shipment.title}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ ...styles.imageCell, display: { xs: "none", md: "table-cell" } }}>
        <Box sx={styles.cellContent}>
          {shipment.imageUrl ? (
            <Avatar
              src={shipment.imageUrl}
              alt={shipment.title}
              variant="rounded"
              sx={styles.image}
            />
          ) : (
            <Typography variant="body2" sx={styles.noImageText}>
              Нет изображения
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell sx={{ ...styles.categoryCell, display: { xs: "none", lg: "table-cell" } }}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.categoryText}>
            {shipment.category?.name || "—"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ ...styles.createdCell, display: { xs: "none", md: "table-cell" } }}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.createdText}>
            {formatDateTime(shipment.createdAt)}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.publishedCell}>
        <Box sx={styles.cellContent}>
          {isDraft ? (
            <Chip
              label="Черновик"
              size="small"
              color="default"
              sx={styles.draftChip}
            />
          ) : (
            <>
              {publishedDateFormatted && (
                <Typography variant="body2" sx={styles.publishedText}>
                  {publishedDateFormatted}
                </Typography>
              )}
              <Chip
                label="Опубликовано"
                size="small"
                color="success"
                sx={styles.publishedChip}
              />
            </>
          )}
        </Box>
      </TableCell>
      <TableCell sx={styles.actionsCell}>
        <Box sx={styles.cellContent}>
          <Box sx={styles.actionsContainer}>
            {onMoveUp && (
              <Tooltip title="Выше в списке" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onMoveUp(shipment.shipmentPostId)}
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
                    onClick={() => onMoveDown(shipment.shipmentPostId)}
                    disabled={!canMoveDown}
                    sx={{ minWidth: 32 }}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {isDraft && onPublish && (
              <Tooltip title="Опубликовать" arrow>
                <IconButton
                  size="small"
                  onClick={() => onPublish(shipment.shipmentPostId)}
                  sx={styles.publishButton}
                >
                  <PublishIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isPublished && onUnpublish && (
              <Tooltip title="Снять с публикации" arrow>
                <IconButton
                  size="small"
                  onClick={() => onUnpublish(shipment.shipmentPostId)}
                  sx={styles.unpublishButton}
                >
                  <UnpublishedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <TableActions
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};







