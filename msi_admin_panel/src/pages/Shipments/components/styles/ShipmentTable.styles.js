// Стили для ShipmentTable
export const styles = {
  table: {
    width: "100%",
    minWidth: { xs: 640, md: 920 },
    "& .MuiTableCell-root": {
      borderColor: "divider",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  mobileList: {
    display: "flex",
    flexDirection: "column",
    gap: 1.25,
    p: 1,
  },
  mobileCard: {
    p: 0.875,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  mobileTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
    mb: 0.75,
  },
  mobileTitle: {
    fontWeight: 600,
    fontSize: "0.85rem",
    lineHeight: 1.3,
    mb: 0.5,
  },
  mobileMetaText: {
    color: "text.secondary",
    fontSize: "0.75rem",
  },
  mobileStatusRow: {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    my: 0.75,
  },
  mobileActions: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 0.25,
    mt: 0.5,
    "& .MuiIconButton-root": {
      p: 0.5,
    },
  },
  mobileSelectAllRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 1,
    py: 0.5,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  mobileSelectAllLabel: {
    fontSize: "0.875rem",
    color: "text.secondary",
  },
};







