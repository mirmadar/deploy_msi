// Стили для универсального компонента пагинации
export const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    mt: 3,
    pt: 2,
    borderTop: "1px solid",
    borderColor: "divider",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
  },
  infoText: {
    color: "text.secondary",
    fontSize: "0.875rem",
  },
  rangeText: {
    color: "text.secondary",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  paginationSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
  },
  controlsGroup: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    flexWrap: "wrap",
  },
  rowsPerPageControl: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  select: {
    minWidth: 80,
    "& .MuiOutlinedInput-input": {
      padding: "6px 32px 6px 12px",
      fontSize: "0.875rem",
    },
  },
  rowsPerPageLabel: {
    color: "text.secondary",
    fontSize: "0.875rem",
    whiteSpace: "nowrap",
  },
  pageNavigation: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  navButton: {
    padding: "4px",
    "&:disabled": {
      opacity: 0.3,
    },
  },
  pageButtons: {
    "& .MuiButton-root": {
      minWidth: "36px",
      padding: "4px 8px",
    },
  },
  pageButton: {
    fontSize: "0.875rem",
    "&.MuiButton-contained": {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      "&:hover": {
        bgcolor: "primary.dark",
      },
    },
  },
  ellipsisButton: {
    minWidth: "36px",
    padding: "4px 8px",
    fontSize: "0.875rem",
    cursor: "default",
  },
  pageInfo: {
    color: "text.secondary",
    fontSize: "0.875rem",
    whiteSpace: "nowrap",
  },
};
