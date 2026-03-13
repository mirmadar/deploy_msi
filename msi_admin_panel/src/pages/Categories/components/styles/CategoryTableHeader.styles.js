// Стили для CategoryTableHeader
import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  tableRow: sharedStyles.tableHeaderRow,
  idHeaderCell: {
    ...sharedStyles.tableHeaderCell,
    width: "9%",
  },
  nameHeaderCell: {
    ...sharedStyles.tableHeaderCell,
    width: "25%",
  },
  pathHeaderCell: {
    ...sharedStyles.tableHeaderCell,
    width: "30%",
  },
  imageHeaderCell: {
    ...sharedStyles.tableHeaderCell,
    width: "15%",
  },
  actionsHeaderCell: {
    ...sharedStyles.tableHeaderCell,
    width: "15%",
  },
};

