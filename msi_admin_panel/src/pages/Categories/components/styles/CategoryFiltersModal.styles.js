export const styles = {
  dialogPaper: {
    borderRadius: 3,
    maxWidth: "900px",
    width: "90vw",
    m: 2,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  dialogContent: {
    p: 3,
    overflowY: "auto",
    overflowX: "hidden",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#bdbdbd",
      borderRadius: "4px",
      "&:hover": {
        background: "#9e9e9e",
      },
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
  },
  categoryName: {
    fontSize: "0.875rem",
    mt: 0.5,
  },
  errorAlert: {
    mb: 3,
    borderRadius: 2,
  },
  addFilterSection: {
    mb: 4,
  },
  sectionTitle: {
    variant: "subtitle1",
    fontWeight: "bold",
    mb: 2,
  },
  addFilterRow: {
    display: "flex",
    gap: 1.5,
    alignItems: "flex-start",
  },
  characteristicSelect: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      height: "56px",
    },
    "& .MuiInputBase-root": {
      height: "56px",
    },
  },
  addButton: {
    flexShrink: 0,
    height: "56px",
  },
  filtersSection: {
    mb: 4,
    "&:last-of-type": {
      mb: 0,
    },
  },
  loadingBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    py: 6,
  },
  emptyBox: {
    py: 3,
    textAlign: "center",
    backgroundColor: "action.hover",
    borderRadius: 1,
  },
  filtersList: {
    padding: 0,
  },
  filterItem: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
    mb: 1.5,
    padding: "12px 16px",
    "&:last-child": {
      marginBottom: 0,
    },
  },
  filterOrder: {
    minWidth: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
    padding: "4px 8px",
    backgroundColor: "transparent",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
  },
  filterOrderText: {
    color: "text.secondary",
    fontWeight: 500,
    fontSize: "0.875rem",
  },
  filterActions: {
    display: "flex",
    gap: 1.5,
    alignItems: "center",
  },
  actionButton: {
    padding: "4px",
  },
  deleteButton: {
    flexShrink: 0,
    minWidth: "auto",
    px: 1.5,
    alignSelf: "center",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
    mt: 3,
  },
};

