// Стили для ShipmentTableRow
import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  tableRow: sharedStyles.tableRow,
  idCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "7%",
  },
  cellContent: {
    ...sharedStyles.tableCellContent,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 0.5,
  },
  titleCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "22%",
  },
  imageCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "12%",
  },
  categoryCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "14%",
  },
  createdCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "15%",
  },
  publishedCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "15%",
  },
  actionsCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "15%",
  },
  actionsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
  },
  publishButton: {
    color: "success.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "success.50",
      transform: "scale(1.1)",
    },
  },
  unpublishButton: {
    color: "warning.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "warning.50",
      transform: "scale(1.1)",
    },
  },
  publishedText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  publishedChip: {
    ml: 1,
    fontSize: "0.7rem",
    height: "20px",
  },
  draftChip: {
    fontSize: "0.7rem",
    height: "20px",
  },
  titleCellWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  idText: sharedStyles.tableIdText,
  titleText: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  categoryText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  createdText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 1,
  },
  noImageText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.secondary",
    fontStyle: "italic",
  },
};







