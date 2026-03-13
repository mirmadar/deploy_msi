// Стили для DeleteConfirmDialog
export const styles = {
  dialogPaper: {
    borderRadius: 3,
    minWidth: 400,
  },
  dialogTitle: {
    pb: 2,
    pt: 3,
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },
  title: {
    fontWeight: 600,
    color: "text.primary",
  },
  dialogContent: {
    pt: 1,
    pb: 2,
  },
  message: {
    color: "text.primary",
    mb: 2,
  },
  nameBox: {
    bgcolor: "grey.50",
    borderRadius: 2,
    p: 1.5,
    mb: 2,
    border: "1px solid",
    borderColor: "divider",
  },
  nameText: {
    fontWeight: 600,
    color: "text.primary",
    fontSize: "1rem",
  },
  warningAlert: {
    borderRadius: 2,
    "& .MuiAlert-icon": {
      color: "warning.main",
    },
  },
  warningText: {
    color: "text.secondary",
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  dialogActions: {
    px: 3,
    pb: 3,
    pt: 2,
    gap: 1.5,
  },
  cancelButton: {
    textTransform: "none",
    minWidth: 100,
  },
  deleteButton: {
    textTransform: "none",
    minWidth: 120,
    fontWeight: 500,
  },
};


