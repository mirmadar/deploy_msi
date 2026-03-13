import { sharedStyles } from "../../../../styles/shared.styles";

export const styles = {
  paper: sharedStyles.pagePaper,
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    mb: 2,
    color: "primary.main",
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
  header: {
    mb: 3,
  },
  title: sharedStyles.pageTitle,
  sectionTitle: {
    fontWeight: 600,
    fontSize: "1rem",
    mb: 2,
  },
  typePanel: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 1,
    mb: 2,
  },
  typePanelLabel: {
    flex: "0 0 auto",
    mr: 0.5,
  },
  typeButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
  },
  typeButton: {
    textTransform: "none",
  },
  blocksContainer: {
    overflowX: "auto",
  },
  loadingBox: sharedStyles.centeredBox,
  errorAlert: sharedStyles.errorAlert,
};
