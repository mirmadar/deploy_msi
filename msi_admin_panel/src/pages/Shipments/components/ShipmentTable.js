import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { ShipmentTableHeader } from "./ShipmentTableHeader";
import { ShipmentTableRow } from "./ShipmentTableRow";
import { TableActions } from "../../../components/common/TableActions";
import { formatDateTime } from "../../../utils/dateFormat";
import { styles } from "./styles/ShipmentTable.styles";

export const ShipmentTable = ({
  shipments,
  loading,
  page = 0,
  rowsPerPage = 25,
  totalShipments = 0,
  selectedShipments,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onMoveUp,
  onMoveDown,
  isMovingOrder,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (loading && shipments.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (shipments.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body1" color="text.secondary">
          Посты отгрузок не найдены
        </Typography>
      </Box>
    );
  }

  const shipmentIds = shipments.map((shipment) => shipment.shipmentPostId);
  const allSelected = shipmentIds.length > 0 && shipmentIds.every((id) => selectedShipments.includes(id));
  const someSelected = selectedShipments.some((id) => shipmentIds.includes(id)) && !allSelected;

  const handleSelectAll = (checked) => {
    onSelectAll(shipmentIds, checked);
  };

  if (isMobile) {
    return (
      <Box sx={styles.mobileList}>
        <Box sx={styles.mobileSelectAllRow}>
          <Typography sx={styles.mobileSelectAllLabel}>Выбрать все на странице</Typography>
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            size="small"
          />
        </Box>
        {shipments.map((shipment, index) => {
          const globalIndex = page * rowsPerPage + index;
          const canMoveUp = globalIndex > 0 && !isMovingOrder;
          const canMoveDown = globalIndex < totalShipments - 1 && !isMovingOrder;
          const isPublished = !!shipment.publishedAt;
          const isDraft = !shipment.publishedAt;

          return (
            <Box key={shipment.shipmentPostId} sx={styles.mobileCard}>
              <Box sx={styles.mobileTopRow}>
                <Checkbox
                  checked={selectedShipments.includes(shipment.shipmentPostId)}
                  onChange={(e) => onSelect(shipment.shipmentPostId, e.target.checked)}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  #{shipment.shipmentPostId}
                </Typography>
              </Box>

              <Typography variant="body2" sx={styles.mobileTitle}>
                {shipment.title}
              </Typography>
              <Typography sx={styles.mobileMetaText}>
                {shipment.category?.name || "—"}
              </Typography>
              <Typography sx={styles.mobileMetaText}>
                Создано: {formatDateTime(shipment.createdAt)}
              </Typography>

              <Box sx={styles.mobileStatusRow}>
                {isDraft ? (
                  <Chip label="Черновик" size="small" color="default" />
                ) : (
                  <Chip label="Опубликовано" size="small" color="success" />
                )}
                {isPublished && (
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(shipment.publishedAt)}
                  </Typography>
                )}
              </Box>

              <Box sx={styles.mobileActions}>
                <Tooltip title="Выше в списке" arrow>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onMoveUp?.(shipment.shipmentPostId)}
                      disabled={!canMoveUp}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Ниже в списке" arrow>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onMoveDown?.(shipment.shipmentPostId)}
                      disabled={!canMoveDown}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                {isDraft && onPublish && (
                  <IconButton
                    size="small"
                    onClick={() => onPublish(shipment.shipmentPostId)}
                  >
                    <PublishIcon fontSize="small" />
                  </IconButton>
                )}
                {isPublished && onUnpublish && (
                  <IconButton
                    size="small"
                    onClick={() => onUnpublish(shipment.shipmentPostId)}
                  >
                    <UnpublishedIcon fontSize="small" />
                  </IconButton>
                )}
                <TableActions
                  onEdit={() => onEdit(shipment.shipmentPostId)}
                  onDelete={() => onDelete(shipment.shipmentPostId)}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Table sx={styles.table}>
      <ShipmentTableHeader
        allSelected={allSelected}
        someSelected={someSelected}
        onSelectAll={handleSelectAll}
        hasShipments={shipments.length > 0}
      />
      <TableBody>
        {shipments.map((shipment, index) => {
          const globalIndex = page * rowsPerPage + index;
          return (
            <ShipmentTableRow
              key={shipment.shipmentPostId}
              shipment={shipment}
              isSelected={selectedShipments.includes(shipment.shipmentPostId)}
              onSelect={(checked) => onSelect(shipment.shipmentPostId, checked)}
              onEdit={() => onEdit(shipment.shipmentPostId)}
              onDelete={() => onDelete(shipment.shipmentPostId)}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isMovingOrder={isMovingOrder}
              globalIndex={globalIndex}
              total={totalShipments}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};







