// Стили для ProductTableHeader
export const styles = {
  tableRow: {
    bgcolor: "grey.50",
    "& .MuiTableCell-root": {
      fontWeight: 600,
      fontSize: "0.875rem",
      color: "text.primary",
      borderBottom: "2px solid",
      borderColor: "divider",
    },
  },
  headerCell: {
    textAlign: "center",
  },
  sortableHeader: {
    cursor: "pointer",
    userSelect: "none",
    "&:hover": {
      bgcolor: "action.hover",
    },
  },
  activeSortHeader: {
    bgcolor: "primary.50",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
  },
  sortIcon: {
    fontSize: "1rem",
    color: "primary.main",
  },
  sortIconInactive: {
    fontSize: "1rem",
    color: "text.disabled",
    opacity: 0.5,
  },
  idHeaderCell: {
    textAlign: "center",
    width: "9%",
  },
  nameHeaderCell: {
    textAlign: "center",
    width: "22%",
  },
  unitHeaderCell: {
    textAlign: "center",
    width: "10%",
  },
  priceHeaderCell: {
    textAlign: "center",
    width: "10%",
  },
  statusHeaderCell: {
    textAlign: "center",
    width: "12%",
  },
  categoryHeaderCell: {
    textAlign: "center",
    width: "20%",
  },
  isNewHeaderCell: {
    textAlign: "center",
    width: "10%",
  },
  actionsHeaderCell: {
    textAlign: "center",
    width: "9%",
  },
};
