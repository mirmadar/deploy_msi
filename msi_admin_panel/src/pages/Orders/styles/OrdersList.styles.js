// Стили для OrdersList
import { sharedStyles } from "../../../styles/shared.styles";

export const styles = {
  paper: sharedStyles.pagePaper,
  errorAlert: sharedStyles.errorAlert,
  loadingBox: sharedStyles.centeredBox,
  emptyBox: sharedStyles.centeredBox,
  tableContainer: {
    ...sharedStyles.borderedContainer,
    overflowX: "auto",
  },
};

