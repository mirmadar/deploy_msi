// Стили для OrderSearchBar
export const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
    flexWrap: "wrap",
    gap: 2,
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  searchField: {
    width: { xs: "100%", sm: 300 },
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
  },
  refreshButton: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
      borderColor: "primary.main",
      transform: "rotate(180deg)",
    },
  },
  filterButton: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
      borderColor: "primary.main",
    },
  },
  filterButtonActive: {
    borderColor: "primary.main",
    bgcolor: "primary.50",
    color: "primary.main",
  },
  searchIcon: {
    color: "text.secondary",
  },
};

