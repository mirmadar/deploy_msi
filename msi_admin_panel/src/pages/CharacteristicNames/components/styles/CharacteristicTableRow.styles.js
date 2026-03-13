// Стили для CharacteristicTableRow
import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  tableRow: sharedStyles.tableRow,
  // Стили для ячейки ID
  idCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "10%",
  },
  cellContent: sharedStyles.tableCellContent,
  // Стили для ячейки "Название"
  nameCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "35%",
  },
  // Стили для ячейки "Тип значения"
  typeCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "35%",
  },
  // Стили для ячейки "Действия"
  actionsCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "20%",
  },
  nameCellWrapper: {
    width: "100%",
  },
  // Стили текста
  idText: sharedStyles.tableIdText,
  nameText: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  // Стили текста типа значения
  typeText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
};
