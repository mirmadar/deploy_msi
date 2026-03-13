// Стили для ShipmentForm
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
  form: {
    mb: 3,
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
  /** Как в форме статей — только отступ, без фиксированной высоты */
  textFieldMultiline: {
    mb: 2,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
    mt: 3,
  },
  loadingBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    py: 6,
  },
  infoAlert: {
    mb: 2,
    borderRadius: 2,
  },
  optionContent: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    width: "100%",
  },
  optionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 1,
    flexShrink: 0,
  },
};

