// Стили для ProductBulkActions
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
  textContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  text: {
    fontWeight: 500,
    color: "primary.dark",
  },
  actions: {
    display: "flex",
    gap: 1.5,
    flexWrap: "wrap",
    width: { xs: "100%", sm: "auto" },
  },
  closeButton: {
    color: "text.secondary",
    "&:hover": {
      bgcolor: "action.hover",
    },
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

