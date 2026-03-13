// Стили для ArticleTableRow
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
    width: "30%",
  },
  authorCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "15%",
  },
  createdCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "17%",
  },
  publishedCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "17%",
  },
  actionsCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "15%",
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
  authorText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  createdText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
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
    ml: 1,
    fontSize: "0.7rem",
    height: "20px",
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
};

