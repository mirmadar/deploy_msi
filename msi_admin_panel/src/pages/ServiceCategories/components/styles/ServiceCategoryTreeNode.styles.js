// Стили для ServiceCategoryTreeNode (без фильтров и без изображения)
export const styles = {
  nodeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    py: 1.25,
    px: 2,
    borderBottom: "1px solid",
    borderColor: "divider",
    transition: "background-color 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
    },
  },
  nodeContent: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    flex: 1,
  },
  checkbox: {
    padding: 0.5,
  },
  idCell: {
    minWidth: 80,
    display: "flex",
    alignItems: "center",
  },
  idText: {
    color: "text.secondary",
    fontWeight: 500,
    fontSize: "0.875rem",
  },
  indent: (level) => ({
    width: level * 32,
  }),
  expandButton: {
    padding: 0.5,
    color: "text.secondary",
    "&:hover": {
      bgcolor: "action.hover",
    },
  },
  expandPlaceholder: {
    width: 24,
  },
  categoryName: {
    fontWeight: 500,
    fontSize: "0.9375rem",
    color: "text.primary",
    flex: 1,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  },
  moveButton: {
    color: "text.secondary",
    transition: "all 0.2s ease",
    "&:hover:not(:disabled)": {
      bgcolor: "action.hover",
      color: "primary.main",
    },
  },
  editButton: {
    color: "primary.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "scale(1.1)",
    },
  },
  deleteButton: {
    color: "error.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "scale(1.1)",
    },
  },
  childrenContainer: {
    ml: 0,
  },
  loadingChildren: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    py: 2,
    pl: 4,
  },
};
