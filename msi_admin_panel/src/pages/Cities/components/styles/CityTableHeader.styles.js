// Стили для CityTableHeader
import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  tableRow: sharedStyles.tableHeaderRow,
  idHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "8%",
  },
  nameHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "20%",
  },
  sortableHeader: {
    cursor: "pointer",
    userSelect: "none",
    "&:hover": {
      bgcolor: "action.hover",
    },
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
  slugHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "18%",
  },
  phoneHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "20%",
  },
  workHoursHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "24%",
  },
  actionsHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "10%",
  },
};

