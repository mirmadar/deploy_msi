// Стили для CityTable
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
  mobileTitle: {
    fontWeight: 600,
    fontSize: "0.85rem",
    lineHeight: 1.3,
    mb: 0.25,
  },
  mobileMeta: {
    color: "text.secondary",
    fontSize: "0.75rem",
    mb: 0.15,
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
};







