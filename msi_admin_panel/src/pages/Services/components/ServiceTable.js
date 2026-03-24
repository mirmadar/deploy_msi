import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  DashboardCustomize as ConstructorIcon,
} from "@mui/icons-material";
import { TableActions } from "../../../components/common/TableActions";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const allSelected =
    visibleServiceIds.length > 0 &&
    visibleServiceIds.every((id) => selectedServices.includes(id));
  const someSelected =
    selectedServices.some((id) => visibleServiceIds.includes(id)) && !allSelected;

  if (isMobile) {
    return (
      <Box sx={styles.mobileList}>
        {onSelectAll && (
          <Box sx={styles.mobileSelectAllRow}>
            <Typography sx={styles.mobileSelectAllLabel}>Выбрать все на странице</Typography>
            <Checkbox
              indeterminate={someSelected}
              checked={allSelected}
              onChange={(e) => onSelectAll(visibleServiceIds, e.target.checked)}
              size="small"
            />
          </Box>
        )}

        {services.map((service) => {
          const id = service.id ?? service.serviceId;
          const categoryName =
            service.category?.name ?? service.categoryName ?? "—";
          const { indexInSiblings, siblingsCount, globalIndex, totalInCategory } =
            getSiblingInfo(service);
          const canMoveUp =
            (showOrderButtons ? globalIndex > 0 : indexInSiblings > 0) && !isMovingOrder;
          const canMoveDown =
            (showOrderButtons ? globalIndex < totalInCategory - 1 : indexInSiblings < siblingsCount - 1) &&
            !isMovingOrder;

          return (
            <Box key={id} sx={styles.mobileCard}>
              <Box sx={styles.mobileTopRow}>
                {onSelect && (
                  <Checkbox
                    checked={selectedServices.includes(id)}
                    onChange={(e) => onSelect(id, e.target.checked)}
                    size="small"
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  #{id}
                </Typography>
              </Box>
              <Typography sx={styles.mobileName}>{service.name}</Typography>
              <Typography sx={styles.mobileMeta}>{categoryName}</Typography>
              <Box sx={styles.mobileActions}>
                {showOrderButtons && (
                  <>
                    <Tooltip title="Выше в списке" arrow>
                      <span>
                        <IconButton size="small" onClick={() => onMoveUp?.(id)} disabled={!canMoveUp}>
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Ниже в списке" arrow>
                      <span>
                        <IconButton size="small" onClick={() => onMoveDown?.(id)} disabled={!canMoveDown}>
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                )}
                <Tooltip title="Конструктор страницы" arrow>
                  <IconButton size="small" onClick={() => onOpenConstructor?.(id)}>
                    <ConstructorIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
