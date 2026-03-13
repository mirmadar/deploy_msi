import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { ServiceTableHeader } from "./ServiceTableHeader";
import { ServiceTableRow } from "./ServiceTableRow";
import { styles } from "./styles/ServiceTable.styles";

const getCategoryId = (s) =>
  s.serviceCategoryId ?? s.category?.id ?? s.category?.serviceCategoryId;

export const ServiceTable = ({
  services,
  loading,
  onEdit,
  onDelete,
  onOpenConstructor,
  onMoveUp,
  onMoveDown,
  isMovingOrder = false,
  showOrderButtons = false,
  page = 0,
  rowsPerPage = 25,
  total = 0,
  selectedServices = [],
  onSelect,
  onSelectAll,
}) => {
  const visibleServiceIds = services.map((s) => s.id ?? s.serviceId);
  if (loading && services.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (services.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body1" color="text.secondary">
          Услуги не найдены
        </Typography>
      </Box>
    );
  }

  const getSiblingInfo = (service) => {
    const catId = getCategoryId(service);
    const siblings = services.filter((s) => getCategoryId(s) === catId);
    const idx = siblings.findIndex(
      (s) => (s.id ?? s.serviceId) === (service.id ?? service.serviceId)
    );
    const indexInSiblings = idx >= 0 ? idx : 0;
    const siblingsCount = siblings.length;
    const globalIndex = page * rowsPerPage + indexInSiblings;
    return {
      serviceCategoryId: catId,
      indexInSiblings,
      siblingsCount,
      globalIndex,
      totalInCategory: showOrderButtons ? total : siblingsCount,
    };
  };

  return (
    <Table sx={styles.table}>
      <ServiceTableHeader
        selectedServices={selectedServices}
        visibleServiceIds={visibleServiceIds}
        onSelectAll={onSelectAll}
      />
      <TableBody>
        {services.map((service) => {
          const id = service.id ?? service.serviceId;
          const { serviceCategoryId, indexInSiblings, siblingsCount, globalIndex, totalInCategory } =
            getSiblingInfo(service);
          return (
            <ServiceTableRow
              key={id}
              service={service}
              onEdit={() => onEdit(id)}
              onDelete={() => onDelete(id)}
              onOpenConstructor={onOpenConstructor}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              showOrderButtons={showOrderButtons}
              serviceCategoryId={serviceCategoryId}
              indexInSiblings={indexInSiblings}
              siblingsCount={siblingsCount}
              globalIndex={globalIndex}
              totalInCategory={totalInCategory}
              isMovingOrder={isMovingOrder}
              selected={selectedServices.includes(id)}
              onSelect={onSelect}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};
