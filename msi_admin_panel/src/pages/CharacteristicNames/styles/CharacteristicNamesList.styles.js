// Стили для CharacteristicNamesList
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
  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  searchField: {
    width: { xs: "100%", sm: 300 },
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
  },
  searchIcon: {
    color: "text.secondary",
  },
  refreshButton: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
      borderColor: "primary.main",
      transform: "rotate(180deg)",
    },
  },
  addButton: sharedStyles.primaryButton,
  errorAlert: sharedStyles.errorAlert,
  loadingBox: sharedStyles.centeredBox,
  emptyBox: sharedStyles.centeredBox,
  tableContainer: {
    ...sharedStyles.borderedContainer,
    overflowX: "auto",
  },
  dialogPaper: sharedStyles.dialogPaper,
  dialogContent: sharedStyles.dialogContent,
};

