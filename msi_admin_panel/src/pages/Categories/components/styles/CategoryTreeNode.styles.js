// Стили для CategoryTreeNode
export const styles = {
  nodeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    py: { xs: 0.9, sm: 1.25 },
    px: { xs: 1, sm: 2 },
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
    gap: { xs: 0.6, sm: 1.5 },
    flex: 1,
    width: "100%",
    minWidth: 0,
  },
  checkbox: {
    padding: 0.5,
  },
  idCell: {
    minWidth: { xs: 42, sm: 80 },
    display: "flex",
    alignItems: "center",
  },
  idText: {
    color: "text.secondary",
    fontWeight: 500,
    fontSize: { xs: "0.72rem", sm: "0.875rem" },
  },
  indent: (level) => ({
    width: { xs: Math.min(level, 2) * 12, sm: level * 32 },
    flexShrink: 0,
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
    width: { xs: 30, sm: 36 },
    height: { xs: 30, sm: 36 },
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    flexShrink: 0,
  },
  imagePlaceholder: {
    width: { xs: 30, sm: 36 },
    height: { xs: 30, sm: 36 },
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
    fontSize: { xs: "0.9rem", sm: "0.9375rem" },
    color: "text.primary",
    flex: 1,
    minWidth: 0,
    lineHeight: 1.35,
    wordBreak: "break-word",
    ml: { xs: -0.15, sm: 0 },
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: 1,
  },
  mobileIdText: {
    color: "text.secondary",
    fontSize: "0.68rem",
    lineHeight: 1.2,
    mt: 0.15,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: { xs: 0.25, sm: 0.5 },
    width: "auto",
    justifyContent: "flex-end",
    mt: 0,
    pt: 0,
    borderTop: "none",
    borderColor: "divider",
    "& .MuiIconButton-root": {
      p: { xs: 0.5, sm: 1 },
    },
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

