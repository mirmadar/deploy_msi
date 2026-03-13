// Стили для UsersList
import { sharedStyles } from "../../../styles/shared.styles";

export const styles = {
  paper: sharedStyles.pagePaper,
  headerContainer: {
    mb: 3,
  },
  header: sharedStyles.sectionHeader,
  title: sharedStyles.pageTitle,
  chip: sharedStyles.countChip,
  actionsContainer: sharedStyles.actionsContainer,
  actionsLeft: {
    flex: 1,
  },
  addButton: sharedStyles.primaryButton,
  errorAlert: sharedStyles.errorAlert,
  loadingBox: sharedStyles.centeredBox,
  emptyBox: sharedStyles.centeredBox,
  tableContainer: {
    ...sharedStyles.borderedContainer,
    overflowX: "auto",
  },
  tableHeaderRow: {
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
    padding: "12px 16px",
  },
  idHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "10%",
  },
  actionsHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "15%",
  },
  tableRow: {
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
    },
  },
  idCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "10%",
  },
  dataCell: {
    textAlign: "center",
    padding: "12px 16px",
  },
  actionsCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "15%",
  },
  cellContent: {
    textAlign: "left",
    display: "inline-block",
  },
  idText: {
    color: "text.secondary",
    fontWeight: 500,
    fontSize: "0.875rem",
  },
  dataText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  rolesContainer: {
    display: "flex",
    gap: 1,
    flexWrap: "wrap",
  },
  roleChip: {
    fontSize: "0.75rem",
  },
  actionButton: {
    ml: 1,
  },
  editButton: {
    color: "primary.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "primary.50",
      transform: "scale(1.1)",
    },
  },
  deleteButton: {
    color: "error.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "error.50",
      transform: "scale(1.1)",
    },
  },
  dialogPaper: sharedStyles.dialogPaper,
  dialogContent: sharedStyles.dialogContent,
  deleteDialogContent: {
    padding: 3,
  },
  deleteDialogTitle: {
    mb: 2,
    fontWeight: 600,
  },
  deleteDialogText: {
    mb: 3,
  },
  deleteDialogActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
  },
};

