// Стили для AppNavigation
const DRAWER_WIDTH = 220;
const PADDING = 2;

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
    bgcolor: "background.paper",
    borderRight: "1px solid",
    borderColor: "divider",
    boxShadow: "none",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    p: PADDING,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  title: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "text.primary",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    p: PADDING,
    gap: 0.5,
  },
  menuItem: (isSelected) => ({
    fontSize: "0.9375rem",
    fontWeight: isSelected ? 600 : 400,
    color: isSelected ? "primary.main" : "text.primary",
    py: 1,
    px: 0,
    textAlign: "left",
    userSelect: "none", // Навигация - UI элемент, не нужно копировать
    cursor: "default",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "primary.main",
    },
  }),
  footer: {
    mt: "auto",
    p: PADDING,
    borderTop: "1px solid",
    borderColor: "divider",
  },
  divider: {
    mb: 2,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    width: "100%",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    width: "100%",
  },
  userName: {
    fontWeight: 600,
    fontSize: "0.875rem",
    lineHeight: 1.3,
    wordBreak: "break-word",
    color: "text.primary",
  },
  userEmail: {
    color: "text.secondary",
    fontSize: "0.75rem",
    lineHeight: 1.3,
    wordBreak: "break-word",
  },
  rolesContainer: {
    display: "flex",
    gap: 0.5,
    flexWrap: "wrap",
    mt: 0.5,
  },
  roleChip: {
    fontSize: "0.65rem",
    height: 20,
    "& .MuiChip-label": {
      px: 0.75,
    },
  },
  userActions: {
    display: "flex",
    flexDirection: "column",
    gap: 0.75,
    width: "100%",
  },
  changePasswordButton: {
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    width: "100%",
    minHeight: 36,
    justifyContent: "flex-start",
    px: 1.5,
    py: 0.875,
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    "& .MuiButton-startIcon": {
      marginRight: 0.5,
      marginLeft: 0,
    },
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: 2,
    },
  },
  logoutButton: {
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    width: "100%",
    minHeight: 36,
    px: 1.5,
    py: 0.875,
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: 2,
    },
  },
};
