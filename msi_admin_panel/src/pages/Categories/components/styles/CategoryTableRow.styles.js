// Стили для CategoryTableRow
import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  tableRow: sharedStyles.tableRow,
  cellContent: sharedStyles.tableCellContent,
  // Стили для ячейки ID
  idCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "9%",
  },
  // Стили для ячейки "Название"
  nameCell: {
    textAlign: "left",
    padding: "12px 16px",
    width: "25%",
  },
  // Стили для ячейки "Путь"
  pathCell: {
    textAlign: "left",
    padding: "12px 16px",
    width: "30%",
  },
  // Стили для ячейки "Изображение"
  imageCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "15%",
  },
  // Стили для ячейки "Действия"
  actionsCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "15%",
  },
  // Стили текста
  idText: sharedStyles.tableIdText,
  nameText: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  pathText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.secondary",
  },
  // Стили для изображения
  imageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
  },
  imagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: "grey.50",
  },
  imageIcon: {
    color: "text.disabled",
    fontSize: "1.25rem",
  },
};

