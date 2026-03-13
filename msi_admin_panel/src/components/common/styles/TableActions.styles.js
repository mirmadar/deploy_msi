// Стили для TableActions
export const styles = {
  container: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
  },
  editButton: {
    color: "primary.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "primary.50",
      transform: "scale(1.1)",
    },
  },
  deleteButton: {
    color: "error.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "error.50",
      transform: "scale(1.1)",
    },
  },
};


