// Стили для CategoryTreeNode
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
    width: level * 32, // 32px на каждый уровень вложенности
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
  categoryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    flexShrink: 0,
  },
  imagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: "grey.50",
    flexShrink: 0,
  },
  imageIcon: {
    color: "text.disabled",
    fontSize: "1.125rem",
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
  filtersButton: {
    color: "secondary.main",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "scale(1.1)",
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
  emptyChildren: {
    py: 1,
    pl: 4,
  },
};

