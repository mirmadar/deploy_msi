// Стили для CharacteristicTableHeader
import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  tableRow: sharedStyles.tableHeaderRow,
  headerCell: sharedStyles.tableHeaderCell,
  idHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "10%",
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
  nameHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "35%",
  },
  typeHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "35%",
  },
  actionsHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "20%",
  },
};
