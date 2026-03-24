// Стили для CategoryBulkActions
export const styles = {
  paper: {
    mb: 3,
    p: 2,
    bgcolor: "primary.50",
    border: "1px solid",
    borderColor: "primary.200",
    borderRadius: 2,
    animation: "slideDown 0.3s ease",
    "@keyframes slideDown": {
      from: {
        opacity: 0,
        transform: "translateY(-10px)",
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
  },
  text: {
    fontWeight: 500,
    color: "primary.dark",
  },
  button: {
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 500,
    width: { xs: "100%", sm: "auto" },
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: 2,
    },
  },
};

