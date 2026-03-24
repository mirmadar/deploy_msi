// Стили для ShipmentsList
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
  addButton: {
    ...sharedStyles.primaryButton,
    width: { xs: "100%", sm: "auto" },
  },
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







