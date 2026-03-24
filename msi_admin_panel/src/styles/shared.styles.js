// Общие стили для всех страниц
export const sharedStyles = {
  // Основной контейнер страницы
  pagePaper: {
    p: { xs: 1.5, sm: 2, md: 2.5 },
    borderRadius: { xs: 0, sm: 3 },
    bgcolor: "background.paper",
    width: "100%",
    boxShadow: { xs: "none", sm: "0 2px 8px rgba(0,0,0,0.08)" },
  },

  // Заголовок страницы
  pageTitle: {
    fontWeight: 600,
    color: "text.primary",
    userSelect: "none", // Заголовки - UI элементы, не нужно копировать
  },

  // Chip для количества
  countChip: {
    bgcolor: "primary.main",
    color: "white",
    fontWeight: 600,
    height: 24,
  },

  // Кнопка добавления (primary action)
  primaryButton: {
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 500,
    px: 3,
    boxShadow: 2,
    "&:hover": {
      boxShadow: 4,
    },
  },

  // Alert для ошибок
  errorAlert: {
    mb: 3,
    borderRadius: 2,
  },

  // Контейнер с рамкой (для таблиц, списков)
  borderedContainer: {
    borderRadius: { xs: 0, sm: 2 },
    border: { xs: "none", sm: "1px solid" },
    borderColor: { xs: "transparent", sm: "grey.300" },
  },

  // Диалог (модальное окно)
  dialogPaper: {
    borderRadius: 3,
    width: { xs: "100%", sm: "90vw", md: "70vw", lg: "30vw" },
    maxWidth: { xs: "100%", sm: "90vw", md: "70vw", lg: "30vw" },
    m: { xs: 1, sm: 2 },
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  // Контент диалога со скроллбаром
  dialogContent: {
    p: 3,
    overflowY: "auto",
    overflowX: "hidden",
    flex: 1,
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#bdbdbd",
      borderRadius: "4px",
      "&:hover": {
        background: "#9e9e9e",
      },
    },
  },

  // Заголовок секции (header)
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    mb: 3,
  },

  // Контейнер для действий (actions)
  actionsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
    flexWrap: "wrap",
    gap: 2,
  },

  // Состояния загрузки/пустоты
  centeredBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    py: 6,
  },

  // Общие стили для таблиц
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
  tableRow: {
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
    },
  },
  tableHeaderCell: {
    textAlign: "center",
    padding: "12px 16px",
  },
  tableCellContent: {
    textAlign: "left",
    display: "inline-block",
  },
  tableIdText: {
    color: "text.secondary",
    fontWeight: 500,
    fontSize: "0.875rem",
  },
};

