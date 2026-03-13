import React from "react";
import { Drawer, Box, IconButton, Typography, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ProductFilters from "./ProductFilters";
import { styles } from "./styles/ProductFiltersDrawer.styles";

export const ProductFiltersDrawer = ({ open, onClose, filters, onFiltersChange }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={styles.drawer}
      PaperProps={{
        sx: styles.drawerPaper,
      }}
    >
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Typography variant="h6" sx={styles.title}>
            Фильтры
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={styles.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={styles.content}>
          <ProductFilters
            onChange={onFiltersChange}
            appliedFilters={filters}
          />
        </Box>
      </Box>
    </Drawer>
  );
};




