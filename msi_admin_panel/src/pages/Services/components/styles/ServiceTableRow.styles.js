import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  tableRow: sharedStyles.tableRow,
  checkboxCell: {
    padding: "8px",
    width: 48,
  },
  idCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "8%",
  },
  cellContent: sharedStyles.tableCellContent,
  nameCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "28%",
  },
  categoryCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "36%",
  },
  actionsCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "20%",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
  },
  moveButton: {
    color: "text.secondary",
    transition: "all 0.2s ease",
    "&:hover:not(:disabled)": {
      bgcolor: "action.hover",
      color: "primary.main",
      transform: "scale(1.1)",
    },
  },
  constructorButton: {
    color: "secondary.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "scale(1.1)",
    },
  },
  editButton: {
    color: "primary.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "scale(1.1)",
    },
  },
  deleteButton: {
    color: "error.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "scale(1.1)",
    },
  },
  idText: sharedStyles.tableIdText,
  nameText: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  categoryText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.secondary",
  },
};
