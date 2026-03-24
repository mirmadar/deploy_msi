// Стили для CharacteristicTable
export const styles = {
  table: {
    width: "100%",
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
    gap: 1,
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
    mb: 0.5,
  },
  mobileName: {
    fontWeight: 600,
    fontSize: "0.85rem",
    lineHeight: 1.3,
  },
  mobileType: {
    color: "text.secondary",
    fontSize: "0.75rem",
  },
};

