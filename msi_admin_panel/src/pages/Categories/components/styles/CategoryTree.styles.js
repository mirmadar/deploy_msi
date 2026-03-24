// Стили для CategoryTree
export const styles = {
  treeContainer: {
    width: "100%",
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
  selectAllRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    py: { xs: 0.5, sm: 1 },
    px: { xs: 1, sm: 2 },
    borderBottom: "1px solid",
    borderColor: "divider",
    bgcolor: { xs: "transparent", sm: "grey.50" },
  },
  selectAllCheckbox: {
    padding: 0.5,
  },
  selectAllText: {
    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
    fontWeight: 500,
    color: "text.primary",
  },
};

