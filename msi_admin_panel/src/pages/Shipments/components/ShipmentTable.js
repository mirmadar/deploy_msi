import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { ShipmentTableHeader } from "./ShipmentTableHeader";
import { ShipmentTableRow } from "./ShipmentTableRow";
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







