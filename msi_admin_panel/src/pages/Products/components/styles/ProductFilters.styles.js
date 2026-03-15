// Стили для ProductFilters
import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  container: {
    bgcolor: "transparent",
    border: "none",
    overflow: "visible",
  },
  header: {
    display: "none", // Скрываем заголовок, так как он в Drawer
  },
  expandButton: {
    p: 0.5,
    "&:hover": {
      bgcolor: "transparent",
    },
  },
  title: {
    fontWeight: 600,
    fontSize: "1rem",
    color: "text.primary",
    flex: 1,
  },
  content: {
    px: 0,
    pb: 0,
    pt: 0,
  },
  emptyMessage: {
    p: 2,
    textAlign: "center",
  },
  sectionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    mb: 2,
  },
  section: {
    width: "100%",
  },
  filterSectionTitle: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "text.primary",
    mb: 1.5,
  },
  categoryAutocomplete: {
    width: "100%",
    mt: 1,
  },
  filterCheckbox: {
    mb: 1,
    marginLeft: 0,
    marginRight: 0,
    alignItems: "center",
    "& .MuiFormControlLabel-label": {
      fontWeight: 500,
      fontSize: "0.875rem",
      color: "text.primary",
      marginLeft: "8px",
    },
    "& .MuiCheckbox-root": {
      padding: "4px",
    },
  },
  filterLabel: {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
  },
  filterIcon: {
    fontSize: "1rem",
    color: "text.secondary",
  },
  filterContent: {
    mt: 0,
    pl: 0,
  },
  sectionTitle: {
    mb: 1.5,
    fontWeight: 600,
  },
  checkbox: {
    display: "flex",
    mb: 1,
  },
  treeViewContainer: {
    width: "100%",
    maxHeight: 300,
    overflow: "hidden",
    mt: 1,
  },
  treeView: {
    width: "100%",
    minHeight: 0,
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    width: "100%",
    cursor: "pointer",
    "&:hover": {
      bgcolor: "action.hover",
    },
    "& input[type='checkbox']": {
      width: "16px",
      height: "16px",
      cursor: "pointer",
    },
    "& span": {
      fontSize: "0.875rem",
      userSelect: "none",
    },
  },
  categorySearchField: {
    mb: 1.5,
    "& .MuiOutlinedInput-root": {
      "& .MuiOutlinedInput-input": {
        padding: "8px 12px",
        fontSize: "0.875rem",
      },
    },
  },
  searchIcon: {
    color: "text.secondary",
  },
  categoriesList: {
    maxHeight: 420,
    overflowY: "auto",
    overflowX: "hidden",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
    p: 1,
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(0,0,0,0.2)",
      borderRadius: "3px",
    },
  },
  noResults: {
    p: 2,
    textAlign: "center",
  },
  treeNodeRow: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    py: 0.25,
    px: 0.5,
    borderRadius: 1,
    cursor: "pointer",
    "&:hover": {
      bgcolor: "action.hover",
    },
  },
  categoryItem: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    py: 0.5,
    px: 1,
    borderRadius: 1,
    cursor: "pointer",
    "&:hover": {
      bgcolor: "action.hover",
    },
    "& .MuiCheckbox-root": {
      padding: "4px",
    },
  },
  categoryLabel: {
    flex: 1,
    userSelect: "none",
  },
  categoryCount: {
    ml: 0.5,
    color: "text.secondary",
  },
  priceInputsContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 2,
  },
  priceInput: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      "& .MuiOutlinedInput-input": {
        padding: "8px 12px",
        fontSize: "0.875rem",
      },
    },
  },
  priceSeparator: {
    mx: 0.5,
    color: "text.secondary",
  },
  priceRangeHint: {
    mt: 1,
    display: "block",
    color: "text.secondary",
    fontSize: "0.75rem",
  },
  slider: {
    mt: 1.5,
    mb: 1,
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    gap: 1,
    mt: 2,
  },
  applyButton: {
    ...sharedStyles.primaryButton,
  },
  resetButton: {
    ...sharedStyles.secondaryButton,
  },
  errorMessage: {
    fontSize: "0.875rem",
  },
  loadingMessage: {
    textAlign: "center",
    py: 2,
  },
};

