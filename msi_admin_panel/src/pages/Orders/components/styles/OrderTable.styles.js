// Стили для OrderTable
export const styles = {
  table: {
    width: "100%",
    minWidth: { xs: 640, md: 920 },
    tableLayout: "fixed",
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
  mobileHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 1,
    mb: 0.75,
  },
  mobileOrderNumber: {
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  mobileClientName: {
    fontWeight: 500,
    fontSize: "0.85rem",
    mb: 0.5,
  },
  mobileContactText: {
    color: "text.secondary",
    fontSize: "0.75rem",
    mb: 0.25,
  },
  mobileStatusRow: {
    display: "flex",
    gap: 0.5,
    flexWrap: "wrap",
    my: 0.75,
  },
  mobileActions: {
    display: "flex",
    flexDirection: "column",
    gap: 0.25,
    mt: 0.5,
  },
};

