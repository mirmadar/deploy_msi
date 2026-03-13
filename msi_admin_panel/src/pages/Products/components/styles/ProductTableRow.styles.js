// Стили для ProductTableRow
export const styles = {
  // Стиль строки таблицы
  tableRow: {
    transition: "all 0.2s ease",
    "&.Mui-selected": {
      bgcolor: "primary.50",
      "&:hover": {
        bgcolor: "primary.100",
      },
    },
    "&:hover": {
      bgcolor: "action.hover",
    },
  },

  // Строка для архивных товаров
  archiveRow: {
    bgcolor: "grey.100",
    "&:hover": {
      bgcolor: "grey.200",
    },
    "& .MuiTableCell-root": {
      color: "text.disabled",
    },
  },

  cellContent: {
    textAlign: "left",
    display: "inline-block",
  },

  // Стили для ячейки ID
  idCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "9%",
  },

  // Стили для ячейки "Название"
  nameCell: {
    textAlign: "left",
    width: "22%",
    padding: "12px 16px",
  },
  
  // Стили для ячейки "Единица измерения"
  unitCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "10%",
  },
  
  // Стили для ячейки "Цена"
  priceCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "10%",
  },
  
  // Стили для ячейки "Статус"
  statusCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "12%",
  },
  
  // Стили для ячейки "Категория"
  categoryCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "20%",
  },
  
  // Стили для ячейки "Новинка"
  isNewCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "10%",
  },
  
  // Стили для ячейки "Действия"
  actionsCell: {
    textAlign: "center",
    padding: "12px 16px",
    width: "9%",
  },
  nameCellWrapper: {
    width: "100%",
    padding: "0 30px",
  },
  nameBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 2,
  },

  // Стили текста
  idText: {
    color: "text.secondary",
    fontWeight: 500,
    fontSize: "0.875rem",
  },
  nameText: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  unitText: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "text.primary",
  },
  priceText: {
    fontWeight: 600,
    color: "text.primary",
    fontSize: "0.875rem",
  },

  // Стили аватара
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 1.5,
    border: "1px solid",
    borderColor: "divider",
    flexShrink: 0,
  },

  // Стили чипов
  statusChip: {
    fontWeight: 500,
    fontSize: "0.75rem",
    height: 24,
  },
  isNewChip: {
    fontWeight: 500,
    fontSize: "0.75rem",
    height: 24,
  },
  statusText: {
    fontSize: "0.875rem",
    color: "text.primary",
    fontWeight: 400,
  },
  categoryText: {
    fontSize: "0.875rem",
    color: "text.primary",
    fontWeight: 400,
  },

  // Стили для раскрывающейся секции
  collapseRow: {
    "&:hover": {
      bgcolor: "transparent",
    },
  },
  collapseCell: {
    p: 0,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  collapseContent: {
    p: 2,
  },
};
