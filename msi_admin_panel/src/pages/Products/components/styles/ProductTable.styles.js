// Стили для ProductTable
export const styles = {
  table: {
    width: "100%",
    minWidth: { xs: 640, md: 900 },
    "& .MuiTableCell-root": {
      borderColor: "divider",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  mobileList: {
    display: "flex",
    flexDirection: "column",
    gap: 1.25,
    p: 1,
  },
  mobileCard: {
    p: 1,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  mobileTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
    mb: 1,
  },
  mobileNameRow: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 1,
  },
  mobileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 1.5,
    border: "1px solid",
    borderColor: "divider",
    flexShrink: 0,
  },
  mobileNameText: {
    fontWeight: 600,
    fontSize: "0.85rem",
    lineHeight: 1.3,
  },
  mobileMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 1,
    mb: 0.75,
  },
  mobilePriceText: {
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  mobileCategoryText: {
    color: "text.secondary",
    fontSize: "0.75rem",
  },
  mobileActionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 0.25,
    mt: 0.5,
    "& .MuiIconButton-root": {
      p: 0.5,
    },
  },
  mobileCollapse: {
    mt: 1,
    pt: 1,
    borderTop: "1px dashed",
    borderColor: "divider",
  },
  mobileSelectAllRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 1,
    py: 0.5,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  mobileSelectAllLabel: {
    fontSize: "0.875rem",
    color: "text.secondary",
  },
};
