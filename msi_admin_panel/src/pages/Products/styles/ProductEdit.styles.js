// Стили для ProductEdit
export const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
  },
  errorAlert: {
    mb: 3,
    borderRadius: 2,
  },
  section: {
    mb: 4,
    "&:last-of-type": {
      mb: 0,
    },
  },
  textField: {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      height: "56px",
    },
    "& .MuiInputBase-root": {
      height: "56px",
    },
    "& .MuiSelect-select": {
      height: "56px !important",
      minHeight: "56px !important",
      display: "flex",
      alignItems: "center",
      padding: "16.5px 14px",
    },
  },
  priceRow: {
    display: "flex",
    gap: 2,
    mb: 2,
  },
  categoryBox: {
    mb: 0,
  },
  sectionTitle: {
    variant: "subtitle1",
    fontWeight: "bold",
    mb: 2,
  },
  // Список характеристик
  characteristicsList: {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    mb: 2.5,
  },
  characteristicItem: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },
  characteristicInput: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      bgcolor: "transparent",
    },
  },
  charDeleteButton: {
    flexShrink: 0,
    minWidth: "auto",
    px: 1.5,
    alignSelf: "center",
  },
  // Секция добавления новой характеристики
  addCharacteristicSection: {
    pt: 2,
    mt: 1.5,
  },
  addCharForm: {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
  },
  charSelect: {
    "& .MuiOutlinedInput-root": {
      bgcolor: "transparent",
    },
  },
  charValueInput: {
    width: "100%",
    bgcolor: "transparent",
  },
  addButtonRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  addButton: {
    flexShrink: 0,
  },
};
