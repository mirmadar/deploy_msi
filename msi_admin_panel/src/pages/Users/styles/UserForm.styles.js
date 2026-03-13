export const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
  },
  errorAlert: {
    mb: 2,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  textField: {
    mb: 0,
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
    py: 4,
  },
};

