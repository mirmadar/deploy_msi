// Стили для ProductFiltersDrawer
const DRAWER_WIDTH = 420;

export const styles = {
  drawer: {
    width: DRAWER_WIDTH,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: DRAWER_WIDTH,
      boxSizing: "border-box",
    },
  },
  drawerPaper: {
    width: DRAWER_WIDTH,
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    p: 2,
    minHeight: 64,
  },
  title: {
    fontWeight: 600,
    fontSize: "1.125rem",
    color: "text.primary",
  },
  closeButton: {
    color: "text.secondary",
    "&:hover": {
      bgcolor: "action.hover",
    },
  },
  content: {
    flex: 1,
    overflowY: "auto",
    p: 2,
  },
};




