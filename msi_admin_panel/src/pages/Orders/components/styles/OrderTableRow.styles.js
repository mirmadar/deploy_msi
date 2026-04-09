// Стили для OrderTableRow
import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  tableRow: sharedStyles.tableRow,
  orderNumberCell: {
    textAlign: "center",
    padding: "12px 16px",
  },
  clientNameCell: {
    textAlign: "center",
    padding: "12px 16px",
  },
  contactCell: {
    textAlign: "center",
    padding: "12px 16px",
  },
  statusCell: {
    textAlign: "center",
    padding: "12px 16px",
  },
  bitrixLeadCell: {
    textAlign: "center",
    padding: "12px 16px",
  },
  dateCell: {
    textAlign: "center",
    padding: "12px 16px",
  },
  actionsCell: {
    textAlign: "center",
    padding: "12px 16px",
  },
  cellContent: {
    ...sharedStyles.tableCellContent,
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    alignItems: "center",
  },
  orderNumberText: {
    fontWeight: 600,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  clientNameText: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  contactText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  phoneText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  bitrixLeadText: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  dateText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  statusContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    alignItems: "center",
  },
  statusChip: {
    fontSize: "0.7rem",
    height: "22px",
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
  },
  actionLink: (isSent) => ({
    fontSize: "0.875rem",
    cursor: "pointer",
    textDecoration: "none",
    color: isSent ? "text.secondary" : "primary.main",
    transition: "all 0.2s ease",
    "&:hover": {
      textDecoration: "underline",
      color: isSent ? "text.secondary" : "primary.dark",
    },
  }),
};

