import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { styles } from "./styles/ProductPageHeader.styles";

export const ProductPageHeader = ({ total }) => {
  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        Товары
      </Typography>
      <Chip label={total} size="small" sx={styles.chip} />
    </Box>
  );
};
