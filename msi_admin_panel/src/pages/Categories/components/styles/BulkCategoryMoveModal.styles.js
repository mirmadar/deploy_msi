// Стили для BulkCategoryMoveModal
import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  dialogPaper: sharedStyles.dialogPaper,
  dialogContent: sharedStyles.dialogContent,
  title: {
    variant: "h6",
    fontWeight: 600,
    mb: 1,
  },
  subtitle: {
    mb: 3,
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    mb: 2,
  },
  autocompleteField: {
    mb: 0,
    "& .MuiAutocomplete-root": {
      "& .MuiOutlinedInput-root": {
        height: "56px",
        "& .MuiInputBase-input": {
          height: "56px",
          display: "flex",
          alignItems: "center",
        },
      },
    },
  },
  errorText: {
    mt: 1,
    mb: 2,
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
    mt: 2,
  },
};
