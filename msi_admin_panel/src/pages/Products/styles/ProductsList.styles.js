// Стили для ProductsList
import { sharedStyles } from "../../../styles/shared.styles";

export const styles = {
  paper: sharedStyles.pagePaper,
  errorAlert: sharedStyles.errorAlert,
  tableContainer: {
    ...sharedStyles.borderedContainer,
    overflowX: "auto",
  },
  dialogPaper: sharedStyles.dialogPaper,
  dialogContent: sharedStyles.dialogContent,
};
