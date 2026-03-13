export const styles = {
  previewCard: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    overflow: "hidden",
    mb: 2,
    bgcolor: "background.paper",
  },
  previewCardToolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 1.5,
    py: 0.75,
    bgcolor: "action.hover",
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  previewCardContent: {
    px: 2,
    py: 2,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    py: 1.25,
    px: 2,
    borderBottom: "1px solid",
    borderColor: "divider",
    "&:hover": { bgcolor: "action.hover" },
  },
  cellOrder: {
    width: 40,
    flexShrink: 0,
  },
  cellType: {
    width: 140,
    flexShrink: 0,
  },
  cellPreview: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    flexShrink: 0,
  },
  moveBtn: {
    color: "text.secondary",
    "&:hover:not(:disabled)": { color: "primary.main" },
  },
  editBtn: {
    color: "primary.main",
    "&:hover": { bgcolor: "action.hover" },
  },
  deleteBtn: {
    color: "error.main",
    "&:hover": { bgcolor: "action.hover" },
  },
  inlineEditRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 2,
    py: 2,
    px: 2,
    borderBottom: "1px solid",
    borderColor: "divider",
    bgcolor: "action.hover",
  },
  inlineEditOrder: {
    width: 40,
    flexShrink: 0,
    pt: 0.5,
  },
  inlineEditForm: {
    flex: 1,
    minWidth: 0,
  },
  inlineEditActions: {
    flexShrink: 0,
    pt: 0.5,
  },
  doneBtn: {
    bgcolor: "primary.main",
    color: "primary.contrastText",
    "&:hover": { bgcolor: "primary.dark" },
  },
};
