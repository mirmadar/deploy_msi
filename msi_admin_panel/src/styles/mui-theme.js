import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#f50057" },
    background: { default: "#f5f5f5", paper: "#fff" },
    success: { main: "#4caf50" },
    warning: { main: "#ff9800" },
    info: { main: "#0288d1" },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
    body1: { fontSize: "1rem" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#fff",
          cursor: "default",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          marginRight: 8,
          cursor: "default",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 16px",
          cursor: "default",
          // Разрешаем выделение в таблицах - пользователь может захотеть скопировать данные
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#f1f1f1" },
          cursor: "default", // Обычный курсор при наведении, но текст можно выделять
          // Разрешаем выделение в таблицах - пользователь может скопировать данные
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            userSelect: "none", // Заголовки таблиц - UI элементы, не нужно копировать
            cursor: "default",
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          userSelect: "none", // Чипы - UI элементы, не нужно копировать
          cursor: "default",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          cursor: "default",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          cursor: "default",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 4,
          cursor: "default",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: "8px 12px",
          cursor: "default",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          cursor: "default",
          "& input": {
            cursor: "text", // В полях ввода нужен text курсор
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          cursor: "default",
          "& input": {
            cursor: "text", // В полях ввода нужен text курсор
          },
        },
      },
    },
    // Typography не запрещаем глобально - пользователь может захотеть скопировать текст
    // Запрещаем только в конкретных местах (навигация, заголовки)
  },
  layout: {
    contentWidth: 1200, // базовая ширина контента
    modalWidth: 900, // модалки редактирования
  },
});
